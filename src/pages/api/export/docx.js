import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { createRateLimiter } from "@/lib/rateLimit";

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
    } = req.body;

    if (!safeName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header
            new Paragraph({
              text: safeName,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: safeHeadline || professionTitle || "",
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),

            // Contact Information
            ...(contactEntries.length > 0
              ? [
                  new Paragraph({
                    text: contactEntries.map((e) => `${e.label}: ${e.value}`).join(" | "),
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Social Links
            ...(socialLinks.length > 0
              ? [
                  new Paragraph({
                    text: socialLinks.map((l) => `${l.label}: ${l.value}`).join(" | "),
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                  }),
                ]
              : []),

            // Professional Summary
            ...(displayBio
              ? [
                  new Paragraph({
                    text: "Professional Summary",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  new Paragraph({
                    text: displayBio,
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Key Responsibilities
            ...(responsibilities && responsibilities.length > 0
              ? [
                  new Paragraph({
                    text: "Key Responsibilities",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...responsibilities.map(
                    (resp) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "• ",
                            bold: true,
                          }),
                          new TextRun({
                            text: resp,
                          }),
                        ],
                        spacing: { after: 100 },
                      })
                  ),
                ]
              : []),

            // Technical Skills
            ...(skills && skills.length > 0
              ? [
                  new Paragraph({
                    text: "Technical Skills",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  new Paragraph({
                    text: skills.join(", "),
                    spacing: { after: 400 },
                  }),
                ]
              : []),

            // Professional Experience
            ...(experience && experience.length > 0
              ? [
                  new Paragraph({
                    text: "Professional Experience",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...experience.map(
                    (exp) =>
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${exp.role || "Role"}${exp.company ? ` at ${exp.company}` : ""}`,
                            bold: true,
                            size: 24,
                          }),
                        ],
                        spacing: { after: 100 },
                      }),
                    new Paragraph({
                      text: exp.period || "",
                      italics: true,
                      spacing: { after: 100 },
                    }),
                    ...(exp.description
                      ? [
                          new Paragraph({
                            text: exp.description,
                            spacing: { after: 200 },
                          }),
                        ]
                      : [])
                  ),
                ]
              : []),

            // Education
            ...(education && education.length > 0
              ? [
                  new Paragraph({
                    text: "Education",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...education.flatMap((edu) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${edu.degree || "Degree"}${edu.institution ? ` - ${edu.institution}` : ""}`,
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    new Paragraph({
                      text: edu.period || "",
                      italics: true,
                      spacing: { after: 100 },
                    }),
                    ...(edu.description
                      ? [
                          new Paragraph({
                            text: edu.description,
                            spacing: { after: 200 },
                          }),
                        ]
                      : []),
                  ]),
                ]
              : []),

            // Projects
            ...(projects && projects.length > 0
              ? [
                  new Paragraph({
                    text: "Projects",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                  }),
                  ...projects.flatMap((project) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: project.title || "Project",
                          bold: true,
                        }),
                      ],
                      spacing: { after: 100 },
                    }),
                    ...(project.description
                      ? [
                          new Paragraph({
                            text: project.description,
                            spacing: { after: 200 },
                          }),
                        ]
                      : []),
                  ]),
                ]
              : []),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(safeName || "portfolio").replace(/\s+/g, "-").toLowerCase()}-cv.docx"`
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("DOCX generation error:", error);
    res.status(500).json({ error: "Failed to generate DOCX", details: error.message });
  }
}

