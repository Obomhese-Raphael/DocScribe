import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const adminAuthMiddleware = (req, res, next) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied",
        message: "Authentication token is required",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "Authentication token is required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user has admin role
    if (!decoded.isAdmin) {
      return res.status(403).json({
        error: "Access denied",
        message: "Admin privileges required",
      });
    }

    // Add the user to the request
    req.user = decoded;

    // Continue to the protected route
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "Authentication token is invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "Authentication token has expired",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

/**
 * Simplified admin check for development/testing purposes
 * Only use this in development, not in production!
 */
export const simpleAdminCheck = (req, res, next) => {
  try {
    // Get the admin API key from header
    const adminKey = req.headers["x-admin-key"];

    // Check if the key matches the one in environment variables
    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({
        error: "Access denied",
        message: "Admin privileges required",
      });
    }

    // Continue to the protected route
    next();
  } catch (error) {
    console.error("Simple admin check error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      message: "An error occurred during authentication",
    });
  }
};

// Export both middleware options
export default {
  adminAuthMiddleware,
  simpleAdminCheck,
};
