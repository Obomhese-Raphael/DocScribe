// models/UserModel.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      // This will be the Clerk user ID
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    // Additional fields you might want to track
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Disable the automatic _id creation since we're using Clerk ID
    _id: false,
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
