import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Clerk user ID
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    image: String,
    clerkData: {
      // Store complete Clerk data for reference
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    // Disable automatic _id generation since we use Clerk's ID
    _id: false,
  }
);

// Check if model already exists (important for serverless environments)
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
