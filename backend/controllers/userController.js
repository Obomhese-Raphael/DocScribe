import User from "../models/UserModel.js";

export const addUser = async (req, res) => {
  const { clerkId, email, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ _id: clerkId }); // Changed query to use _id

    if (!existingUser) {
      const newUser = new User({
        _id: clerkId, // Using clerkId as _id to match webhook logic
        email,
        name: `${firstName} ${lastName}`.trim(),
        // You might need to adjust how 'image' is handled if this route is used for initial creation
      });
      await newUser.save();
      console.log("New user saved via /sync:", newUser);
    } else {
      existingUser.email = email;
      existingUser.name = `${firstName} ${lastName}`.trim();
      await existingUser.save();
      console.log("Existing user updated via /sync:", existingUser);
    }

    res.status(200).json({ message: "User data synced successfully" });
  } catch (error) {
    console.error("Error syncing user data:", error);
    res.status(500).json({ message: "Failed to sync user data" });
  }
};
