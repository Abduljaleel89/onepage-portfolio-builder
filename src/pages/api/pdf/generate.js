import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import PortfolioPdf from "@/components/PortfolioPdf";
import { processImageForPDF } from "@/lib/pdfImageFix";
import { createRateLimiter } from "@/lib/rateLimit";

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Rate limiting
    await rateLimiter(req, res);

    const {
      safeName,
      safeHeadline,
      professionTitle,
      displayBio,
      contactEntries,
      socialLinks,
      responsibilities,
      skills,
      experience,
      education,
      projects,
      profile,
      template = "modern",
    } = req.body;

    if (!safeName || !safeHeadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process avatar image to fix orientation issues
    let processedAvatar = profile?.avatar;
    if (processedAvatar && typeof processedAvatar === "string") {
      try {
        processedAvatar = await processImageForPDF(processedAvatar);
      } catch (err) {
        console.warn("Failed to process image for PDF:", err);
        // Continue with original if processing fails
      }
    }

    const pdfData = {
      safeName,
      safeHeadline,
      professionTitle: professionTitle || "Professional",
      displayBio: displayBio || "",
      contactEntries: contactEntries || [],
      socialLinks: socialLinks || [],
      responsibilities: responsibilities || [],
      skills: skills || [],
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      profile: {
        ...profile,
        avatar: processedAvatar,
      },
      template,
    };

    // Generate PDF buffer
    const buffer = await renderToBuffer(React.createElement(PortfolioPdf, { data: pdfData }));

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(safeName || "portfolio").replace(/\s+/g, "-").toLowerCase()}-cv.pdf"`
    );
    res.setHeader("Content-Length", buffer.length);

    // Send PDF buffer
    res.send(buffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
}

