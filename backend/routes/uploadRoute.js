import express from "express";
import { uploadFile, uploadText } from "../controllers/uploadController";

const uploadRouter = express.Router();
uploadRouter.post("/upload/file", uploadFile);
uploadRouter.post("/upload/text", uploadText);

export default uploadRouter;
