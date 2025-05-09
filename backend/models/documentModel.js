const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
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
  content: {
    type: String, 
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
});

const Document = mongoose.model("Document", documentSchema);

export default Document;