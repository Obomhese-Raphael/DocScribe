import express from "express";
import {
  deleteFile,
  getAllFiles,
  getFileById,
  getFileContentById,
  uploadFile,
  uploadText,
} from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";

const uploadRouter = express.Router();

// Use multer middleware for file uploads
uploadRouter.post("/file", upload.single("file"), uploadFile);
uploadRouter.post("/text", uploadText);
uploadRouter.delete("/file/:id", deleteFile);
uploadRouter.get("/get-all", getAllFiles);
uploadRouter.get("/get-file/:id", getFileById);
uploadRouter.get("/get-content/:id", getFileContentById);

export default uploadRouter;
