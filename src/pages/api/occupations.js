// src/pages/api/occupations.js
import fs from "fs";
import path from "path";

function tryReadFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error parsing JSON at", filePath, err);
    return null;
  }
}

export default function handler(req, res) {
  try {
    // Look in two locations for convenience:
    // 1) repo root data/occupations.json (dev API route)
    // 2) public/data/occupations.json (served static copy)
    const candidates = [
      path.join(process.cwd(), "data", "occupations.json"),
      path.join(process.cwd(), "public", "data", "occupations.json"),
    ];

    let found = null;
    for (const p of candidates) {
      const data = tryReadFile(p);
      if (Array.isArray(data)) {
        found = data;
        break;
      } else if (data && data.length === undefined && typeof data === "object") {
        // If the file returned an object with a top-level property, attempt to extract an array
        if (Array.isArray(data.occupations)) {
          found = data.occupations;
          break;
        }
      }
    }

    if (!found) {
      // Return an empty array rather than 404 so the client doesn't crash.
      console.warn("occupations.json not found in expected locations:", candidates);
      return res.status(200).json([]);
    }

    return res.status(200).json(found);
  } catch (err) {
    console.error("Error in /api/occupations:", err);
    return res.status(500).json({ error: "Failed to load occupations" });
  }
}
