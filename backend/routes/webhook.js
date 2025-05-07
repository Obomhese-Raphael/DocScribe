import express from "express";
import { clerkWebhookHandler } from "../controllers/webhookController.js";

const webhookRouter = express.Router();

webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler
);

export default webhookRouter;
