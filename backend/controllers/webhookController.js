// controllers/webhookController.js
import User from "../models/UserModel.js";
import { Webhook } from "svix";
import connectDB from "../config/mongodb.js";

export const clerkWebhookHandler = async (req, res) => {

  try {
    // Ensure database connection
    await connectDB();

    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Webhook secret not configured",
      });
    }

    // Create a Svix instance with the Clerk webhook secret
    const wh = new Webhook(webhookSecret);

    // Get the headers
    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    // Verify required headers are present
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers");
      return res.status(400).json({
        success: false,
        message: "Missing required headers",
      });
    }

    let evt;

    try {
      // Verify the webhook payload
      evt = wh.verify(req.body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      return res.status(400).json({
        success: false,
        message: "Webhook verification failed",
      });
    }

    // Extract data and event type
    const { data, type: eventType } = evt;

    // Handle different event types
    switch (eventType) {
      case "user.created": {
        try {
          // Check if user already exists to prevent duplicates
          const existingUser = await User.findById(data.id);

          if (existingUser) {
            console.log(`User ${data.id} already exists, skipping creation`);
            return res
              .status(200)
              .json({ success: true, message: "User already exists" });
          }

          const userData = {
            _id: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            name:
              `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
              "Unknown User",
            image: data.image_url || "",
          };

          const newUser = await User.create(userData);
          console.log(`User created successfully: ${newUser._id}`);

          return res.status(200).json({
            success: true,
            message: "User created successfully",
            userId: newUser._id,
          });
        } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to create user",
          });
        }
      }

      case "user.updated": {
        try {
          const userData = {
            email: data.email_addresses?.[0]?.email_address || "",
            name:
              `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
              "Unknown User",
            image: data.image_url || "",
          };

          const updatedUser = await User.findOneAndUpdate(data.id, userData, {
            new: true,
            runValidators: true,
          });

          if (!updatedUser) {
            console.log(`User ${data.id} not found for update`);
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          console.log(`User updated successfully: ${updatedUser._id}`);

          return res.status(200).json({
            success: true,
            message: "User updated successfully",
            userId: updatedUser._id,
          });
        } catch (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to update user",
          });
        }
      }

      case "user.deleted": {
        try {
          const deletedUser = await User.findByIdAndDelete(data.id);

          if (!deletedUser) {
            console.log(`User ${data.id} not found for deletion`);
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          console.log(`User deleted successfully: ${data.id}`);

          return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            userId: data.id,
          });
        } catch (error) {
          console.error("Error deleting user:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to delete user",
          });
        }
      }

      default: {
        console.log(`Unhandled event type: ${eventType}`);
        return res.status(200).json({
          success: true,
          message: `Event ${eventType} received but not processed`,
        });
      }
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
