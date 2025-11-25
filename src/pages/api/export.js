// Export API endpoint for JSON export
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
}

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const db = readDb();
      const portfolio = {
        profile: db.profile || {},
        social: db.social || {},
        contact: db.contact || {},
        projects: db.projects || [],
        skills: db.skills || [],
        experience: db.experience || [],
        education: db.education || [],
        responsibilities: db.responsibilities || [],
        profession: db.profession || "",
        customProfession: db.customProfession || "",
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", 'attachment; filename="portfolio.json"');
      return res.status(200).json(portfolio);
    } catch (err) {
      console.error("Export error:", err);
      return res.status(500).json({ error: "Failed to export portfolio" });
    }
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

