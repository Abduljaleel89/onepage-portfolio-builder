import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function readDb(){
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch(e){
    return {};
  }
}

function writeDb(obj){
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(obj, null, 2), "utf8");
}

export default function handler(req, res){
  if (req.method === "GET") {
    const db = readDb();
    return res.status(200).json({ 
      profile: db.profile || null, 
      projects: db.projects || [],
      social: db.social || {},
      skills: db.skills || [],
      experience: db.experience || [],
      education: db.education || [],
      contact: db.contact || {},
      profession: db.profession || "",
      customProfession: db.customProfession || "",
      responsibilities: db.responsibilities || []
    });
  }

  if (req.method === "POST") {
    try {
      const { profile, projects, social, skills, experience, education, contact, profession, customProfession, responsibilities } = req.body;
      const db = readDb();
      if (profile !== undefined) db.profile = profile || {};
      if (projects !== undefined) db.projects = projects || [];
      if (social !== undefined) db.social = social || {};
      if (skills !== undefined) db.skills = skills || [];
      if (experience !== undefined) db.experience = experience || [];
      if (education !== undefined) db.education = education || [];
      if (contact !== undefined) db.contact = contact || {};
      if (profession !== undefined) db.profession = profession || "";
      if (customProfession !== undefined) db.customProfession = customProfession || "";
      if (responsibilities !== undefined) db.responsibilities = responsibilities || [];
      writeDb(db);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("Error saving profile:", err);
      return res.status(500).json({ error: "Failed to save profile" });
    }
  }

  res.setHeader("Allow", ["GET","POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
