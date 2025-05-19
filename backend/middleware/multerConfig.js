import multer from "multer";

// Configure multer for memory storage instead of disk storage
const memoryStorage = multer.memoryStorage();

// Create upload middleware with memory storage
export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

// Export the middleware
export default upload;
