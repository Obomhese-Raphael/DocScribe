import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
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
    content: {
      type: String,
      default: null,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    summary: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
