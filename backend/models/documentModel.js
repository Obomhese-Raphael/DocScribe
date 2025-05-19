import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  // filePath is optional now since we're not storing files on disk in serverless environments
  filePath: {
    type: String,
    required: false,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  // Store the content directly in the document for serverless environments
  content: {
    type: String,
    required: false,
  },
  summary: {
    type: String,
    required: false,
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;
