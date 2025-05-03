// backend/models/UserModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Clerk user ID (like "user_abc123")
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: String,
    image: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
