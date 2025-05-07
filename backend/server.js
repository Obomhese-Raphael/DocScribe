import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import webhookRouter from "./routes/webhook.js";
import contactRouter from "./routes/contactRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";
import userRouter from "./routes/userRoute.js";
import testRouter from "./routes/testRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());

// IMPORTANT: Don't use express.json() globally as it will interfere with webhook raw body parsing
// Instead, use it only for routes that need it

// Regular JSON parsing for most routes (EXCEPT webhooks)
app.use("/api/users", express.json(), userRouter);
app.use("/api/test", express.json(), testRouter);
app.use("/api/contact", express.json(), contactRouter);
app.use("/api/newsletter", express.json(), newsletterRouter);

// Webhook route with raw body parsing handled inside the route
app.use("/api/webhooks", webhookRouter);

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ error: "Something went wrong!", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});