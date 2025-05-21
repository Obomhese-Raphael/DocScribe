import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const adminRouter = express.Router();

/**
 * Admin login endpoint
 * Validates admin credentials and returns a JWT token
 */
adminRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if credentials are provided
    if (!username || !password) {
      return res.status(400).json({
        error: "Missing credentials",
        message: "Username and password are required",
      });
    }

    // Validate against environment variables
    // NOTE: This is a simple implementation. In production, use a proper user database.
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Generate JWT token with admin privileges
      const token = jwt.sign(
        {
          username,
          isAdmin: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" } // Token expires in 24 hours
      );

      // Return success with token
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token,
      });
    } else {
      // Invalid credentials
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      error: "Login failed",
      message: "An error occurred during login",
    });
  }
});

/**
 * Validate token endpoint
 * Checks if a provided token is valid
 */
adminRouter.post("/validate-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "Missing token",
        message: "Token is required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has admin role
    if (!decoded.isAdmin) {
      return res.status(403).json({
        error: "Not admin",
        message: "Token is valid but doesn't have admin privileges",
      });
    }

    // Return success with decoded token data
    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        username: decoded.username,
        isAdmin: decoded.isAdmin,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Token is invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Token has expired",
      });
    }

    console.error("Token validation error:", error);
    return res.status(500).json({
      error: "Validation failed",
      message: "An error occurred during token validation",
    });
  }
});

export default adminRouter;
