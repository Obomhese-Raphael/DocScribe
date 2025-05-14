import express from "express";
const router = express.Router();
import fs from "fs";
import path from "path";
import { parseDocument } from "../utils/documentParser.js";
import { generateSummary } from "../utils/aiService.js";

router.post("/", async (req, res) => {
  try {
    const { filename } = req.body; // Change from filePath to filename

    if (!filename) {
      return res.status(400).json({ error: "Missing file information" });
    }

    // Construct the full path to the uploaded file
    const filePath = path.join(process.cwd(), "uploads", filename);
    console.log("File path:", filePath);

    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ error: "File not found" });
    }

    // Determine file type from extension
    const ext = path.extname(filename).toLowerCase();
    let fileType;

    switch (ext) {
      case ".pdf":
        fileType = "application/pdf";
        break;
      case ".doc":
        fileType = "application/msword";
        break;
      case ".docx":
        fileType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        break;
      case ".txt":
        fileType = "text/plain";
        break;
      default:
        return res.status(400).json({ error: "Unsupported file type" });
    }

    // 1. Parse the document to extract text
    const extractedText = await parseDocument(filePath, fileType);

    if (!extractedText || extractedText.trim() === "") {
      return res
        .status(400)
        .json({ error: "Could not extract text from document" });
    }

    // 2. Generate summary using AI
    const summary = await generateSummary(extractedText);

    // 3. Save results (optional)
    const analysisResults = {
      originalFile: filename,
      summaryDate: new Date(),
      summary: summary,
    };

    // Return results
    res.status(200).json({
      success: true,
      results: analysisResults,
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    res.status(500).json({ error: "Failed to analyze document" });
  }
});

export default router;
