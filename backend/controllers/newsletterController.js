import Newsletter from "../models/newsletterModel.js";

export const submitNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed",
      });
    }
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    return res.status(201).json({
      success: true,
      message: "Thanks for subscribing!",
    });
  } catch (error) {
    console.error("Error Submitting newsletter", error);
    return res.status(501).json({
      success: false,
      message: "Error Submitting Form",
    });
  }
};
