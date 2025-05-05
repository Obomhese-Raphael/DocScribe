// backend/routes/users.js
import express from "express";
import { addUser } from "../controllers/userController.js";

const userRouter = express.Router();
userRouter.post("/sync", addUser);

export default userRouter;
