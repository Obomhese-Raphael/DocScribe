import express from "express";
import { uploadFile, uploadText } from "../controllers/uploadController.js";
import { upload } from "../middleware/multerConfig.js";

const uploadRouter = express.Router();

// Use multer middleware for file uploads
uploadRouter.post("/upload/file", upload.single("file"), uploadFile);
uploadRouter.post("/upload/text", uploadText);

export default uploadRouter;
