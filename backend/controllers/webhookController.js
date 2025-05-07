import User from "../models/UserModel.js";
import { Webhook } from "svix";

export const clerkWebhookHandler = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Get headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return res.status(400).json({ error: "Missing headers" });
  }

  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  // Log incoming webhook data
  console.log("Webhook received - headers:", {
    id: svix_id,
    timestamp: svix_timestamp,
    signature: svix_signature?.substring(0, 20) + "...",
  });

  // Get raw body - req.body should already be a Buffer when using express.raw
  let payload = req.body;
  if (!Buffer.isBuffer(payload)) {
    console.error("Payload is not a buffer", typeof payload);
    return res.status(400).json({ error: "Invalid payload format" });
  }

  // Convert Buffer to string
  const payloadString = payload.toString("utf8");

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payloadString, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: "Verification failed" });
  }

  const { type, data } = evt;
  console.log(`Processing Clerk event: ${type}`);

  try {
    switch (type) {
      case "user.created":
      case "user.updated":
        // Find primary email
        const primaryEmail = data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.warn("No primary email found for user:", data.id);
        }

        console.log("User data:", {
          id: data.id,
          email: primaryEmail,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        });

        const userData = {
          _id: data.id,
          email: primaryEmail || "no-email@example.com", // Fallback value
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          image: data.image_url || "",
          clerkData: data, // Store complete Clerk data
        };

        await User.findOneAndUpdate({ _id: data.id }, userData, {
          upsert: true,
          new: true,
          runValidators: true,
        });

        console.log(`User ${data.id} upserted successfully`);
        break;

      case "user.deleted":
        console.log(`Deleting user ${data.id}`);
        await User.deleteOne({ _id: data.id });
        console.log(`User ${data.id} deleted successfully`);
        break;

      default:
        console.log(`Ignoring event type: ${type}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error processing ${type}:`, error);
    return res.status(500).json({ error: error.message });
  }
};