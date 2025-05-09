import path from "path";
import fs from "fs";
import Document from "../models/documentModel";

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const { originalName, fileName, path: filePath, mimetype, size } = req.file;

    const document = new Document({
      originalName: originalName,
      fileName: fileName,
      filePath: filePath,
      fileType: mimetype,
      fileSize: size,
      isProcessed: false,
    });

    // If it's a text file or pasted text (text/plain), extract content directly
    if (mimetype === "text/plain") {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        document.content = content;
      } catch (error) {
        console.error("Error reading text file:", error);
      }
    }

    // Save document to the database
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
    console.log("Error uploading File: ", error);
    res.status(500).json({
      error: "File upload failed",
      details: error.message,
    });
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
      error: "Text upoload failed",
      details: error.message,
    });
  }
};
