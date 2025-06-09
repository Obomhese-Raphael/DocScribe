import Document from "../models/documentModel.js";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import {
  summarizeText,
  summarizeLongText,
} from "../services/aiSummarization.js";

// Upload file - Fixed version
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalName = req.file.originalname;
    const fileName =
      req.file.filename ||
      `file_${Date.now()}_${originalName.replace(/\s+/g, "_")}`;
    const mimetype = req.file.mimetype;
    const size = req.file.size;
    const fileBuffer = req.file.buffer;

    const document = new Document({
      originalName: originalName,
      fileName: fileName,
      fileType: mimetype,
      fileSize: size,
      isProcessed: false,
    });

    let extractedText = "";

    // Process file from buffer
    if (mimetype === "text/plain") {
      try {
        extractedText = fileBuffer.toString("utf8");
        document.content = extractedText;
      } catch (error) {
        console.error("Error reading text file:", error);
        extractedText = "";
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
        extractedText = "";
      }
    } else if (mimetype === "application/pdf") {
      try {
        const data = await pdfParse(fileBuffer);
        extractedText = data.text;
        document.content = extractedText;
      } catch (error) {
        console.error("Error reading PDF file:", error);
        extractedText = "";
      }
    }

    // Generate summary if we have content
    if (extractedText && extractedText.trim().length > 0) {
      try {
        let summary = "";

        // For larger documents, use the long text handler
        if (extractedText.length > 10000) {
          summary = await summarizeLongText(extractedText, {
            maxLength: 500,
            minLength: 150,
            doSample: true,
            temperature: 1.0,
            repetitionPenalty: 1.2,
          });
        } else {
          // For shorter texts, use regular summarizer
          const textForSummary = extractedText.slice(0, 10000);

          // FIXED: Define options properly
          const options = {
            maxLength: 400,
            minLength: 200,
            doSample: true,
            numBeams: 4,
            temperature: 1.0,
          };

          summary = await summarizeText(textForSummary, options);
        }

        // Save the summary to the document
        if (summary && summary.trim()) {
          document.summary = summary;
          document.isProcessed = true;
        } else {
          console.log("No summary generated or empty summary received");
          document.summary = "Summary generation failed.";
          document.isProcessed = false;
        }
      } catch (error) {
        console.log("Error generating summary:", error);
        document.summary = "Error occurred while generating summary.";
        document.isProcessed = false;
      }
    } else {
      document.summary = "No text content available to summarize.";
      document.isProcessed = false;
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

// Upload text - Fixed version
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
    });

    // Generate summary for the text
    try {
      let summary = "";

      // For longer texts, use the long text handler
      if (text.length > 10000) {
        summary = await summarizeLongText(text, {
          maxLength: 600,
          minLength: 300,
          doSample: true,
          temperature: 1.0,
        });
      } else {
        // For shorter texts, use standard summarizer
        const textForSummary = text.slice(0, 10000);

        // FIXED: Define options properly
        const options = {
          maxLength: 400,
          minLength: 200,
          doSample: true,
          temperature: 1.0,
        };

        summary = await summarizeText(textForSummary, options);
      }

      // Save the summary to the document
      if (summary && summary.trim()) {
        document.summary = summary;
        document.isProcessed = true;
      } else {
        console.log("Summary generation returned empty result");
        document.summary = "Summary generation failed.";
        document.isProcessed = false;
      }
    } catch (summaryError) {
      console.error("Error generating summary:", summaryError);
      document.summary = "Error occurred while generating summary.";
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

// Summarize file by ID - Updated with better error handling
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

    // Default options for detailed summaries
    const defaultOptions = {
      maxLength: 400,
      minLength: 100,
      doSample: true,
      temperature: 1.0,
      numBeams: 4,
      repetitionPenalty: 1.2,
    };

    const options = { ...defaultOptions, ...(summaryOptions || {}) };

    try {
      let summary;
      if (text.length > 10000) {
        summary = await summarizeLongText(text, options);
      } else {
        summary = await summarizeText(text, options);
      }

      if (summary && summary.trim()) {
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
          success: false,
          error: "Failed to generate summary",
          isProcessed: false,
        });
      }
    } catch (apiError) {
      console.error("Summarization API error:", apiError);
      return res.status(500).json({
        success: false,
        error: "Summarization service unavailable",
        details: apiError.message,
        isProcessed: false,
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

// Get file summary by ID
export const getFileSummaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }
    if (document.summary) {
      return res.status(200).json({ summary: document.summary });
    } else {
      return res.status(404).json({ error: "Summary not found" });
    }
  } catch (error) {
    console.error("Error fetching file summary:", error);
    res.status(500).json({ error: "Failed to fetch file summary" });
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

// Delete all files - Modified for serverless environment
export const deleteAllFiles = async (req, res) => {
  try {
    // Perform deletion of all documents
    const result = await Document.deleteMany({});

    // Return success response with count
    return res.status(200).json({
      success: true,
      message: "All files deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all files:", error);
    return res.status(500).json({
      error: "Failed to delete all files",
      details: error.message,
    });
  }
};
