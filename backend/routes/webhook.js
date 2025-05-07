import express from "express";
import { clerkWebhookHandler } from "../controllers/webhookController.js";

const webhookRouter = express.Router();

// Use express.raw for the webhook endpoint to properly handle verification
// The type: "application/json" ensures only JSON payloads are treated as raw
webhookRouter.post(
  "/", // This will be accessible at /api/webhooks/
  express.raw({ type: "application/json" }),
  clerkWebhookHandler
);

export default webhookRouter;