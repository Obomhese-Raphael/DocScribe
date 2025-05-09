import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/clerk", express.raw({ type: "application/json" }));
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
