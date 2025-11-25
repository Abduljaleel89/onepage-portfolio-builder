import { createRateLimiter } from "@/lib/rateLimit";
import fs from "fs";
import path from "path";

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
});

const ANALYTICS_FILE = path.join(process.cwd(), "data", "analytics.json");

function readAnalytics() {
  try {
    if (!fs.existsSync(ANALYTICS_FILE)) {
      return { views: 0, downloads: {}, shares: {} };
    }
    const data = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { views: 0, downloads: {}, shares: {} };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await rateLimiter(req, res);

    const analytics = readAnalytics();

    const totalDownloads = Object.values(analytics.downloads || {}).reduce(
      (sum, count) => sum + count,
      0
    );
    const totalShares = Object.values(analytics.shares || {}).reduce(
      (sum, count) => sum + count,
      0
    );

    return res.status(200).json({
      views: analytics.views || 0,
      downloads: {
        total: totalDownloads,
        byFormat: analytics.downloads || {},
      },
      shares: {
        total: totalShares,
        byPlatform: analytics.shares || {},
      },
    });
  } catch (error) {
    console.error("Analytics stats error:", error);
    return res.status(500).json({ error: "Failed to get analytics" });
  }
}

