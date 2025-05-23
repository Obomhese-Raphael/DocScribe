import express from "express";
import {
  deleteDocument,
  downloadSummary,
  generateShareLink,
  getAllDocuments,
  getDocumentById,
  getSharedSummary,
  getSummariesHistory,
  updateDocumentSummary,
} from "../controllers/summaryController.js";
const summaryRoute = express.Router();

// Get all summaries for history page
summaryRoute.get("/history", getSummariesHistory);
summaryRoute.get("/documents", getAllDocuments);
summaryRoute.get("/documents/:id", getDocumentById);
summaryRoute.get("/documents/:id/summary", updateDocumentSummary);
summaryRoute.get("/:id/download", downloadSummary);
summaryRoute.post("/:id/share", generateShareLink);
summaryRoute.get("/shared/:id", getSharedSummary);
summaryRoute.delete("/:id", deleteDocument);

export default summaryRoute;