import { createRateLimiter } from "@/lib/rateLimit";
import fs from "fs";
import path from "path";

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
});

const ANALYTICS_FILE = path.join(process.cwd(), "data", "analytics.json");

function ensureAnalyticsFile() {
  const dir = path.dirname(ANALYTICS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(ANALYTICS_FILE)) {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify({ views: 0, downloads: {}, shares: {} }));
  }
}

function readAnalytics() {
  ensureAnalyticsFile();
  try {
    const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { views: 0, downloads: {}, shares: {} };
  }
}

function writeAnalytics(data) {
  ensureAnalyticsFile();
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await rateLimiter(req, res);

    const { event, data: eventData } = req.body;

    if (!event) {
      return res.status(400).json({ error: "Event type required" });
    }

    const analytics = readAnalytics();

    switch (event) {
      case "view":
        analytics.views = (analytics.views || 0) + 1;
        break;
      case "download":
        const format = eventData?.format || "unknown";
        analytics.downloads[format] = (analytics.downloads[format] || 0) + 1;
        break;
      case "share":
        const platform = eventData?.platform || "unknown";
        analytics.shares[platform] = (analytics.shares[platform] || 0) + 1;
        break;
      default:
        return res.status(400).json({ error: "Invalid event type" });
    }

    writeAnalytics(analytics);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return res.status(500).json({ error: "Failed to track analytics" });
  }
}

