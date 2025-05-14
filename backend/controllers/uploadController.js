import path from "path";
import fs from "fs";
import Document from "../models/documentModel.js";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload file
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const originalName = req.file.originalname;
    const fileName = req.file.filename;
    const filePath = req.file.path;
    const mimetype = req.file.mimetype;
    const size = req.file.size;

    const document = new Document({
      originalName: originalName,
      fileName: fileName,
      filePath: filePath,
      fileType: mimetype,
      fileSize: size,
      isProcessed: false,
    });

    if (mimetype === "text/plain") {
      try {
        document.content = fs.readFileSync(filePath, "utf8");
      } catch (error) {
        console.error("Error reading text file:", error);
      }
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const buffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer });
        document.content = result.value;
      } catch (error) {
        console.error("Error reading DOCX file:", error);
      }
    } else if (mimetype === "application/pdf") {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        // Use pdf-parse directly without the module self-test being triggered
        const data = await pdfParse(dataBuffer); 
        document.content = data.text;  
      } catch (error) {
        console.error("Error reading PDF file:", error);
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
      },
      path: filePath,
    });
  } catch (error) {
    console.error("Error uploading File: ", error);
    res
      .status(500)
      .json({ error: "File upload failed", details: error.message });
  }
};

// Upload text
export const uploadText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
    }

    // Define the upload directory
    const uploadDir = path.join(__dirname, "uploads");

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    // Create a temporary file to store the text
    const filename = `text_${Date.now()}.txt`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, text);

    const document = new Document({
      originalName: "pasted-text.txt",
      fileName: filename,
      filePath: filePath,
      fileType: "text/plain",
      fileSize: Buffer.byteLength(text, "utf8"),
      content: text,
      isProcessed: false,
    });

    await document.save();

    // Return success response
    res.status(201).json({
      success: true,
      document: {
        id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        uploadDate: document.uploadDate,
      },
      path: filePath,
    });
  } catch (error) {
    console.log("Error uploading text: ", error);
    res.status(500).json({
      error: "Text upload failed",
      details: error.message,
    });
  }
};

// Delete file by ID
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting document with ID:", id);

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ error: "File not found" });
    }

    // Delete the document from MongoDB
    await Document.findByIdAndDelete(id);

    // Optional: Delete the actual file from the server's file system
    if (document.filePath) {
      try {
        fs.unlinkSync(document.filePath);
        console.log("File deleted from:", document.filePath);
      } catch (fileDeleteError) {
        console.error("Error deleting file from file system:", fileDeleteError);
        // We don't want to fail the entire request if file deletion fails,
        // so we just log the error.
      }
    }

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res
      .status(500)
      .json({ error: "File deletion failed", details: error.message });
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
