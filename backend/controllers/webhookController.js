import User from "../models/UserModel.js";
import { Webhook } from "svix";

export const clerkWebhookHandler = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Get headers and raw body
  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };
  
  const payload = req.body.toString(); // Critical for Vercel deployments

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(payload, headers);
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
        const primaryEmail = data.email_addresses.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          throw new Error("No primary email found");
        }

        const userData = {
          _id: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          image: data.image_url,
          clerkData: data // Store complete Clerk data
        };

        await User.findOneAndUpdate(
          { _id: data.id },
          userData,
          { upsert: true, new: true }
        );
        break;

      case "user.deleted":
        await User.deleteOne({ _id: data.id });
        break;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error processing ${type}:`, error);
    return res.status(500).json({ error: error.message });
  }
};