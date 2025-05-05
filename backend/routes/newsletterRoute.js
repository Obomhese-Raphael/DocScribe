import express from "express";
import { submitNewsletter } from "../controllers/newsletterController.js";

const newsletterRouter = express.Router();
newsletterRouter.post("/subscribe", submitNewsletter);

export default newsletterRouter;
