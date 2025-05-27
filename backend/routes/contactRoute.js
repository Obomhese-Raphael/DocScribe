import express from "express";
import {
  deleteContactSubmission,
  getContactSubmissionById,
  getContactSubmissions,
  submitContactForm,
  updateContactSubmission,
} from "../controllers/contactController.js";
const contactRouter = express.Router();

contactRouter.post("/submit", submitContactForm);
contactRouter.get("/submissions", getContactSubmissions);
contactRouter.delete("/submissions/:id", deleteContactSubmission);
contactRouter.put("/submissions/:id", updateContactSubmission);
contactRouter.get("/submissions/:id", getContactSubmissionById);

export default contactRouter;
