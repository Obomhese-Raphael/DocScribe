import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import webhookRouter from "./routes/webhook.js";

const app = express();
connectDB();

// Middleware
app.use(cors());

// Regular routes should use JSON parsing
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use webhook router with raw body parsing specifically for webhook routes
app.use("/webhook", webhookRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
