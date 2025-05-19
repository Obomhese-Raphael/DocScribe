// Modified uploadController.js for Vercel deployment

import Document from "../models/documentModel.js";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import {
  summarizeText,
  summarizeLongText,
} from "../services/aiSummarization.js";

// Upload file - Modified for serverless environment
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalName = req.file.originalname;
    const fileName = req.file.filename;
    const mimetype = req.file.mimetype;
    const size = req.file.size;
    const fileBuffer = req.file.buffer; // Use the buffer directly instead of file path

    const document = new Document({
      originalName: originalName,
      fileName: fileName,
      fileType: mimetype,
      fileSize: size,
      isProcessed: false,
      // Don't save filePath for serverless environment
    });

    let extractedText = "";

    // Process file from buffer instead of file path
    if (mimetype === "text/plain") {
      try {
        extractedText = fileBuffer.toString("utf8");
        document.content = extractedText;
      } catch (error) {
        console.error("Error reading text file:", error);
      }
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
        document.content = extractedText;
      } catch (error) {
        console.error("Error reading DOCX file:", error);
      }
    } else if (mimetype === "application/pdf") {
      try {
        const data = await pdfParse(fileBuffer);
        extractedText = data.text;
        document.content = extractedText;
      } catch (error) {
        console.error("Error reading PDF file:", error);
      }
    }

    // Generate summary if we have content
    if (extractedText && extractedText.trim().length > 0) {
      try {
        // For larger documents, use the long text handler
        if (extractedText.length > 10000) {
          const summary = await summarizeLongText(extractedText, {
            maxLength: 500, // Get a substantial multi-paragraph summary
            minLength: 150, // Ensure it's not too short
            doSample: true, // Use sampling for natural language
            temperature: 1.0, // Standard creativity
            repetitionPenalty: 1.2, // Avoid repetition
          });

          if (summary) {
            document.summary = summary;
            document.isProcessed = true;
          } else {
            document.summary = "Summary generation failed";
            document.isProcessed = false;
          }
        } else {
          // For shorter texts, use regular summarizer with detailed options
          const textForSummary = extractedText.slice(0, 10000);
          const summary = await summarizeText(textForSummary, {
            maxLength: 400, // Get a detailed multi-paragraph summary
            minLength: 100, // Ensure substantive content
            doSample: true, // Use sampling for natural language
            numBeams: 4, // Use beam search for quality
            temperature: 1.0, // Standard creativity
          });

          if (summary) {
            document.summary = summary;
            document.isProcessed = true;
          } else {
            document.summary = "Summary generation failed";
            document.isProcessed = false;
          }
        }
      } catch (summaryError) {
        console.error("Error generating summary:", summaryError);
        document.summary = "Error during summarization";
        document.isProcessed = false;
      }
    }

    await document.save();

    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        uploadDate: document.uploadDate,
        summary: document.summary || null,
      },
    });
  } catch (error) {
    console.error("Error uploading File: ", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

// Upload text - Modified for serverless environment
export const uploadText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
    }

    const document = new Document({
      originalName: "pasted-text.txt",
      fileName: `text_${Date.now()}.txt`,
      fileType: "text/plain",
      fileSize: Buffer.byteLength(text, "utf8"),
      content: text,
      isProcessed: false,
      // Don't save filePath for serverless environment
    });

    // Generate summary for the text
    try {
      // For longer texts, use the long text handler
      if (text.length > 10000) {
        const summary = await summarizeLongText(text, {
          maxLength: 500,
          minLength: 150,
          doSample: true,
          temperature: 1.0,
        });

        if (summary) {
          document.summary = summary;
          document.isProcessed = true;
        } else {
          document.summary = "Summary generation failed";
          document.isProcessed = false;
        }
      } else {
        // For shorter texts, use standard summarizer
        const textForSummary = text.slice(0, 10000);
        const summary = await summarizeText(textForSummary, {
          maxLength: 400,
          minLength: 100,
          doSample: true,
          temperature: 1.0,
        });

        if (summary) {
          document.summary = summary;
          document.isProcessed = true;
        } else {
          document.summary = "Summary generation failed";
          document.isProcessed = false;
        }
      }
    } catch (summaryError) {
      console.error("Error generating summary:", summaryError);
      document.summary = "Error during summarization";
      document.isProcessed = false;
    }

    await document.save();

    // Return success response
    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        uploadDate: document.uploadDate,
        summary: document.summary || null,
      },
    });
  } catch (error) {
    console.log("Error uploading text: ", error);
    res.status(500).json({
      error: "Text upload failed",
      details: error.message,
    });
  }
};

// The rest of your controller methods need similar modifications to avoid file system operations
// Here's the updated summarizeFileById function:

export const summarizeFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const { summaryOptions } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }

    const text = document.content;
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No content to summarize" });
    }

    try {
      // Default options for detailed summaries
      const defaultOptions = {
        maxLength: 400,
        minLength: 100,
        doSample: true,
        temperature: 1.0,
        numBeams: 4,
        repetitionPenalty: 1.2,
      };

      // Merge default options with any provided from the request
      const options = { ...defaultOptions, ...(summaryOptions || {}) };

      // Use long text handler for longer documents
      let summary;
      if (text.length > 10000) {
        summary = await summarizeLongText(text, options);
      } else {
        summary = await summarizeText(text, options);
      }

      if (summary) {
        // Update the document with the new summary
        document.summary = summary;
        document.isProcessed = true;
        await document.save();

        return res.status(200).json({
          success: true,
          summary: summary,
          isProcessed: true,
        });
      } else {
        return res.status(500).json({
          error: "No summary generated",
          details: "The summarization API returned empty response",
        });
      }
    } catch (apiError) {
      console.error("Summarization API error:", apiError);
      return res.status(502).json({
        error: "Summarization service unavailable",
        details: apiError.message,
      });
    }
  } catch (error) {
    console.error("Error summarizing file content:", error);
    return res.status(500).json({
      error: "Failed to summarize file content",
      details: error.message,
    });
  }
};

// Get all files
export const getAllFiles = async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

// Get file by ID
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(200).json(document);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
};

// Get file content by ID
export const getFileContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }
    if (document.content) {
      return res.status(200).json({ content: document.content });
    } else {
      return res.status(404).json({ error: "Content not found" });
    }
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
};

// Delete file - Modified for serverless environment
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete the document from MongoDB
    await Document.findByIdAndDelete(id);

    // No file system operations needed

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res
      .status(500)
      .json({ error: "File deletion failed", details: error.message });
  }
};
