import express from "express";
import {
  deleteFile,
  getAllFiles,
  getFileById,
  getFileContentById,
  summarizeFileById,
  uploadFile,
  uploadText,
} from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";
import multer from "multer"; 
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRouter = express.Router();

// Use multer middleware for file uploads
uploadRouter.post("/file", upload.single("file"), uploadFile);
uploadRouter.post("/text", uploadText);
uploadRouter.delete("/file/:id", deleteFile);
uploadRouter.get("/get-all", getAllFiles);
uploadRouter.get("/get-file/:id", getFileById);
uploadRouter.get("/get-content/:id", getFileContentById);
uploadRouter.get("/summarize/:id", summarizeFileById);

export default uploadRouter;
