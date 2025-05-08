import { Webhook } from "svix";
import User from "../../models/UserModel.js";
import connectDB from "../../config/mongodb.js";

// Maintain connection state
let isConnected = false;

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  console.log("⚡ Webhook endpoint hit");

  // Connect to MongoDB if not already connected
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }

  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is missing");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Get the Svix headers for verification
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  // Debug header information
  console.log("Headers:", {
    "svix-id": svix_id ? "present" : "missing",
    "svix-timestamp": svix_timestamp ? "present" : "missing",
    "svix-signature": svix_signature ? "present" : "missing",
  });

  // Verify all required headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return res.status(400).json({ error: "Missing Svix headers" });
  }

  // Set up headers object for verification
  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  // Get the raw body as a string
  let payload;
  try {
    // In Vercel serverless functions, req.body should already be accessible
    payload = req.body;

    // If it's not a buffer or string, try to handle it
    if (!Buffer.isBuffer(payload) && typeof payload !== "string") {
      console.log("Payload is not a buffer or string, type:", typeof payload);

      // If it's JSON, stringify it
      if (typeof payload === "object") {
        payload = JSON.stringify(payload);
      } else {
        throw new Error(`Unexpected payload type: ${typeof payload}`);
      }
    }
  } catch (err) {
    console.error("Error processing payload:", err);
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Convert to string if it's a buffer
  const payloadString = Buffer.isBuffer(payload)
    ? payload.toString("utf8")
    : payload;

  // Log a small preview of the payload for debugging
  console.log("Payload preview:", payloadString.substring(0, 100) + "...");

  // Verify the webhook
  let evt;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(payloadString, headers);
    console.log("Webhook verified successfully");
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res
      .status(400)
      .json({ error: "Webhook verification failed", details: err.message });
  }

  // Extract event data
  const { type, data } = evt;
  console.log(`Processing Clerk event: ${type}`);

  try {
    // Process event based on type
    switch (type) {
      case "user.created": {
        console.log("⭐ New user created event received:", data.id);

        // Find primary email from the user data
        const primaryEmail = data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.warn("No primary email found for new user:", data.id);
        }

        // Log the user data we're about to save
        console.log("Creating user with data:", {
          id: data.id,
          email: primaryEmail || "no-email@example.com",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        });

        // Create a new user document
        const newUser = new User({
          _id: data.id,
          email: primaryEmail || "no-email@example.com",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          image: data.image_url || "",
          clerkData: data,
        });

        // Save to MongoDB
        await newUser.save();
        console.log(`✅ User ${data.id} created successfully in MongoDB`);
        break;
      }

      case "user.updated": {
        console.log("📝 User update event received:", data.id);

        // Find primary email from the user data
        const primaryEmail = data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id
        )?.email_address;

        if (!primaryEmail) {
          console.warn("No primary email found for updated user:", data.id);
        }

        // Prepare update data
        const updateData = {
          email: primaryEmail || "no-email@example.com",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          image: data.image_url || "",
          clerkData: data,
        };

        // Update user with upsert option (create if not exists)
        const result = await User.findOneAndUpdate(
          { _id: data.id },
          updateData,
          { new: true, upsert: true }
        );

        console.log(`✅ User ${data.id} updated successfully in MongoDB`);
        break;
      }

      case "user.deleted": {
        console.log(`🗑️ Deleting user ${data.id}`);

        // Delete user from MongoDB
        await User.deleteOne({ _id: data.id });

        console.log(`✅ User ${data.id} deleted successfully from MongoDB`);
        break;
      }

      default:
        console.log(`Ignoring event type: ${type}`);
    }

    // Respond with success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Error processing ${type} event:`, error);
    return res
      .status(500)
      .json({ error: `Error processing ${type} event: ${error.message}` });
  }
}

// Configure so Vercel doesn't parse the body
export const config = {
  api: {
    bodyParser: false,
  },
};
