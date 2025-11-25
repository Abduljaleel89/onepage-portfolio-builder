// src/pages/api/uploads.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { createRateLimiter } from "@/lib/rateLimit";

// Store uploads outside public directory for security
// Use environment variable or default to ./uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const publicUploadDir = path.join(process.cwd(), "public", "uploads");

// Ensure both directories exist
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(publicUploadDir, { recursive: true });

// Allowed file types
const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const maxSize = 5 * 1024 * 1024; // 5MB

// Configure multer disk storage with validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename to prevent path traversal
    const sanitized = (file.originalname || "upload")
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 100); // Limit filename length
    const safe = Date.now() + "-" + sanitized;
    cb(null, safe);
  }
});

// File filter - validate BEFORE upload
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
    files: 1
  }
});

// small helper to run middleware (multer) in Next.js route
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const rateLimiter = createRateLimiter({ windowMs: 60000, max: 5 });

export default async function handler(req, res) {
  rateLimiter(req, res, () => {
    handleRequest(req, res);
  });
}

async function handleRequest(req, res) {
  if (req.method === "POST") {
    try {
      // Run multer single-file middleware (validation happens in fileFilter)
      await runMiddleware(req, res, upload.single("file"));

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Additional validation (fileFilter already checked, but double-check for security)
      if (!allowedTypes.includes(file.mimetype)) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ error: "Invalid file type" });
      }

      if (file.size > maxSize) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(400).json({ error: "File size exceeds 5MB limit" });
      }

      // Copy file to public directory for serving (or use signed URLs in production)
      const publicPath = path.join(publicUploadDir, file.filename);
      fs.copyFileSync(file.path, publicPath);
      
      // In production, you should:
      // 1. Store files in cloud storage (S3, Cloudinary, etc.)
      // 2. Use signed URLs with expiration
      // 3. Implement proper access control
      
      // Return the public URL path
      const url = `/uploads/${file.filename}`;
      return res.status(200).json({ url });
    } catch (err) {
      // Clean up file if error occurred
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          // Ignore cleanup errors
        }
      }
      console.error("Upload error:", err);
      return res.status(500).json({ error: "Upload failed. Please try again." });
    }
  }

  // For other methods, respond with 405
  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

// Next.js: disable default body parser for this route (required for multer)
export const config = {
  api: {
    bodyParser: false
  }
};
