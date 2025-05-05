import express from "express";
import User from "../models/UserModel.js";

const testRouter = express.Router();

// Test endpoint to check users in DB
testRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default testRouter;
