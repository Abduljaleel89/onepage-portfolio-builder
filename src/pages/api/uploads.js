// src/pages/api/uploads.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// configure multer disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + "-" + (file.originalname || "upload");
    cb(null, safe);
  }
});
const upload = multer({ storage });

// small helper to run middleware (multer) in Next.js route
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // run multer single-file middleware
      await runMiddleware(req, res, upload.single("file"));

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Basic file type validation (images only)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.mimetype)) {
        // Delete the uploaded file if it's not an image
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "Only image files are allowed" });
      }

      // File size validation (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: "File size exceeds 5MB limit" });
      }

      // return the public URL path
      const url = `/uploads/${file.filename}`;
      return res.status(200).json({ url });
    } catch (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: String(err.message || err) });
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
