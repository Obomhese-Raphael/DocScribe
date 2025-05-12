import path from "path";
import fs from "fs";
import Document from "../models/documentModel.js";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import * as pdfjs from "pdf-extraction"; // Import as namespace

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Correctly extract file information from req.file
    // Note: The property names vary based on multer configuration
    const originalName = req.file.originalname; // Not originalName
    const fileName = req.file.filename;
    const filePath = req.file.path;
    const mimetype = req.file.mimetype;
    const size = req.file.size;

    // Debug log
    console.log("File information:", {
      originalName,
      fileName,
      filePath,
      mimetype,
      size,
    });

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
        // Properly use the pdf-extraction library
        const data = await pdfjs.extract(dataBuffer);
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

export const uploadText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text provided" });
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
