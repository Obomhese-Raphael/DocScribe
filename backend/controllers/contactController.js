import Contact from "../models/contactFormModel.js";

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newSubmission = new Contact({
      name,
      email,
      message,
    });

    await newSubmission.save();
    res.status(201).json({
      success: true,
      message: "Form Submitted Sucessfully",
    });
  } catch (error) {
    console.error("Error submitting Form ❌: ", error);
    res.status(501).json({
      success: false,
      message: "Error Submitting Form",
    });
  }
};
