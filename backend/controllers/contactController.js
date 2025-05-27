import Contact from "../models/contactFormModel.js";

// Submit a contact form submission
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

// Get all contact form submissions
export const getContactSubmissions = async (req, res) => {
  try {
    const submissions = await Contact.find({});
    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching contact submissions ❌: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submissions",
    });
  }
};

// Delete a contact form submission by ID
export const deleteContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Contact.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact submission ❌: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact submission",
    });
  }
};

// Update a contact form submission by ID
export const updateContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;

    const updatedSubmission = await Contact.findByIdAndUpdate(
      id,
      { name, email, message },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error updating contact submission ❌: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact submission",
    });
  }
};

// Get a contact form submission by ID
export const getContactSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Contact.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }
    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching contact submission ❌: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contact submission",
    });
  }
};
