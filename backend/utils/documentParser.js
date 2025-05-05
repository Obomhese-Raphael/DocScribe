import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

async function parseDocument(filePath, fileType) {
  try {
    let text = "";

    if (fileType === "application/pdf") {
      // Handle PDF
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Handle DOC/DOCX
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (fileType === "text/plain") {
      // Handle TXT
      text = fs.readFileSync(filePath, "utf8");
    }

    return text;
  } catch (error) {
    console.error("Error parsing document:", error);
    throw new Error("Failed to parse document");
  }
}

export { parseDocument };
