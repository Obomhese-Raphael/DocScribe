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
connectDB();

// Middleware
app.use(cors());

// Regular routes should use JSON parsing
app.use(express.json());

// Define routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/api/webhooks", webhookRouter);
app.use("/api/users", userRouter);
app.use("/api/test", testRouter);
app.use("/api/contact", contactRouter);
app.use("/api/newsletter", newsletterRouter);

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
