import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import contactRouter from "./routes/contactRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());

app.use("/api/contact", express.json(), contactRouter);
app.use("/api/newsletter", express.json(), newsletterRouter);

// Basic route 
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 