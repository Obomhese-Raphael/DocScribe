import express from "express";
import {
  deleteAllFiles,
  deleteFile,
  getAllFiles,
  getFileById,
  getFileContentById,
  getFileSummaryById,
  summarizeFileById,
  updateFileName,
  uploadFile,
  uploadText,
} from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";
import path from "path";
import { fileURLToPath } from "url";
import { adminAuthMiddleware } from "../middleware/adminMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRouter = express.Router();

// Use multer middleware for file uploads
uploadRouter.post("/file", upload.single("file"), uploadFile);
uploadRouter.post("/text", uploadText);
uploadRouter.delete("/delete-file/:id", deleteFile);
uploadRouter.get("/get-all", getAllFiles);
uploadRouter.get("/get-file/:id", getFileById);
uploadRouter.patch("/documents/:id/rename", updateFileName);
uploadRouter.get("/get-content/:id", getFileContentById);
uploadRouter.get("/summarize/:id", summarizeFileById);
uploadRouter.delete("/delete-all", adminAuthMiddleware, deleteAllFiles);
uploadRouter.get("/get-summary/:id", getFileSummaryById);

export default uploadRouter;
