// backend/controllers/webhookController.js
import User from "../models/UserModel.js";
import { Webhook } from "svix";

export const clerkWebhookHandler = async (req, res) => {
  try {
    // Get the webhook signature from the headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // Ensure all required headers are present
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing required Svix headers");
      return res.status(400).json({
        success: false,
        message: "Missing required Svix headers",
      });
    }

    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Parse the raw body before verification
    const payload = req.body;
    const bodyString =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    // Create a Svix webhook instance
    const wh = new Webhook(webhookSecret);

    // Verify the webhook payload
    let evt;
    try {
      evt = wh.verify(bodyString, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (error) {
      console.error("Webhook verification failed:", error.message);
      return res.status(400).json({
        success: false,
        message: "Webhook verification failed",
      });
    }

    // Extract the event type and data
    const { type, data } = evt;
    console.log(`Webhook received: ${type}`);

    // Process the event based on its type
    switch (type) {
      case "user.created": {
        try {
          const existingUser = await User.findById(data.id);
          if (existingUser) {
            console.log(`User ${data.id} already exists in database`);
            return res
              .status(200)
              .json({ success: true, message: "User already exists" });
          }

          // Safely extract user data
          const email =
            data.email_addresses && data.email_addresses[0]?.email_address;
          const firstName = data.first_name || "";
          const lastName = data.last_name || "";

          if (!email) {
            console.error("Missing email address in user data");
            return res.status(400).json({
              success: false,
              message: "Missing required user data",
            });
          }

          const userData = {
            _id: data.id,
            email: email,
            name: `${firstName} ${lastName}`.trim(),
            image: data.image_url || "",
          };

          const newUser = await User.create(userData);
          console.log(`User created in database: ${newUser._id}`);

          return res.status(200).json({
            success: true,
            message: "User created successfully",
          });
        } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({
            success: false,
            message: `Error creating user: ${error.message}`,
          });
        }
      }

      case "user.updated": {
        try {
          // Safely extract user data
          const email =
            data.email_addresses && data.email_addresses[0]?.email_address;
          const firstName = data.first_name || "";
          const lastName = data.last_name || "";

          if (!email) {
            return res.status(400).json({
              success: false,
              message: "Missing required user data",
            });
          }

          const userData = {
            email: email,
            name: `${firstName} ${lastName}`.trim(),
            image: data.image_url || "",
          };

          const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
            new: true,
            runValidators: true,
          });

          if (!updatedUser) {
            return res.status(404).json({
              success: false,
              message: "User not found for update",
            });
          }

          return res.status(200).json({
            success: true,
            message: "User updated successfully",
          });
        } catch (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({
            success: false,
            message: `Error updating user: ${error.message}`,
          });
        }
      }

      case "user.deleted": {
        try {
          const deletedUser = await User.findByIdAndDelete(data.id);

          if (!deletedUser) {
            return res.status(404).json({
              success: false,
              message: "User not found for deletion",
            });
          }

          return res.status(200).json({
            success: true,
            message: "User deleted successfully",
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          return res.status(500).json({
            success: false,
            message: `Error deleting user: ${error.message}`,
          });
        }
      }

      default:
        // For any unhandled event types
        return res.status(200).json({
          success: true,
          message: `Event type ${type} not handled`,
        });
    }
  } catch (error) {
    console.error("Webhook controller error:", error);
    return res.status(500).json({
      success: false,
      message: `Webhook Error: ${error.message}`,
    });
  }
};
