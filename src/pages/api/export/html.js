import { createRateLimiter } from "@/lib/rateLimit";

const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
});

function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function generateHTML(portfolioData) {
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
  } = portfolioData;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(safeName)} - Portfolio</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #6366f1;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .headline {
            font-size: 1.3em;
            color: #666;
            margin-bottom: 15px;
        }
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
            font-size: 0.9em;
        }
        .social-links {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 10px;
        }
        .social-links a {
            color: #6366f1;
            text-decoration: none;
        }
        .social-links a:hover {
            text-decoration: underline;
        }
        section {
            margin-bottom: 30px;
        }
        h2 {
            color: #6366f1;
            font-size: 1.8em;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .bio {
            font-size: 1.1em;
            line-height: 1.8;
        }
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill-tag {
            background: #e0e7ff;
            color: #4338ca;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
        }
        .responsibilities ul, .experience-item, .education-item, .project-item {
            margin-bottom: 20px;
        }
        .responsibilities ul {
            list-style: none;
            padding-left: 0;
        }
        .responsibilities li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        .responsibilities li:before {
            content: "•";
            color: #6366f1;
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        .experience-header, .education-header, .project-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 5px;
        }
        .role, .degree, .project-title {
            font-weight: bold;
            font-size: 1.1em;
            color: #333;
        }
        .company, .institution {
            color: #666;
            font-size: 1em;
        }
        .period {
            color: #999;
            font-size: 0.9em;
            font-style: italic;
        }
        .description {
            margin-top: 10px;
            color: #555;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${escapeHtml(safeName)}</h1>
            ${safeHeadline ? `<div class="headline">${escapeHtml(safeHeadline)}</div>` : ""}
            ${contactEntries && contactEntries.length > 0
              ? `<div class="contact-info">${contactEntries
                  .map((e) => `<span>${escapeHtml(e.label)}: ${escapeHtml(e.value)}</span>`)
                  .join("")}</div>`
              : ""}
            ${socialLinks && socialLinks.length > 0
              ? `<div class="social-links">${socialLinks
                  .map((l) => `<a href="${escapeHtml(l.value)}" target="_blank">${escapeHtml(l.label)}</a>`)
                  .join("")}</div>`
              : ""}
        </div>

        ${displayBio
          ? `<section class="bio-section">
            <h2>Professional Summary</h2>
            <div class="bio">${escapeHtml(displayBio)}</div>
        </section>`
          : ""}

        ${responsibilities && responsibilities.length > 0
          ? `<section class="responsibilities">
            <h2>Key Responsibilities</h2>
            <ul>
                ${responsibilities.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
            </ul>
        </section>`
          : ""}

        ${skills && skills.length > 0
          ? `<section class="skills-section">
            <h2>Technical Skills</h2>
            <div class="skills">
                ${skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join("")}
            </div>
        </section>`
          : ""}

        ${experience && experience.length > 0
          ? `<section class="experience-section">
            <h2>Professional Experience</h2>
            ${experience
              .map(
                (exp) => `
                <div class="experience-item">
                    <div class="experience-header">
                        <div>
                            <div class="role">${escapeHtml(exp.role || "Role")}</div>
                            <div class="company">${escapeHtml(exp.company || "")}</div>
                        </div>
                        <div class="period">${escapeHtml(exp.period || "")}</div>
                    </div>
                    ${exp.description ? `<div class="description">${escapeHtml(exp.description)}</div>` : ""}
                </div>
            `
              )
              .join("")}
        </section>`
          : ""}

        ${education && education.length > 0
          ? `<section class="education-section">
            <h2>Education</h2>
            ${education
              .map(
                (edu) => `
                <div class="education-item">
                    <div class="education-header">
                        <div>
                            <div class="degree">${escapeHtml(edu.degree || "Degree")}</div>
                            <div class="institution">${escapeHtml(edu.institution || "")}</div>
                        </div>
                        <div class="period">${escapeHtml(edu.period || "")}</div>
                    </div>
                    ${edu.description ? `<div class="description">${escapeHtml(edu.description)}</div>` : ""}
                </div>
            `
              )
              .join("")}
        </section>`
          : ""}

        ${projects && projects.length > 0
          ? `<section class="projects-section">
            <h2>Projects</h2>
            ${projects
              .map(
                (project) => `
                <div class="project-item">
                    <div class="project-header">
                        <div class="project-title">${escapeHtml(project.title || "Project")}</div>
                        ${project.link ? `<a href="${escapeHtml(project.link)}" target="_blank">View →</a>` : ""}
                    </div>
                    ${project.description ? `<div class="description">${escapeHtml(project.description)}</div>` : ""}
                    ${project.tags && project.tags.length > 0
                      ? `<div class="skills" style="margin-top: 10px;">
                            ${project.tags.map((t) => `<span class="skill-tag">${escapeHtml(t)}</span>`).join("")}
                        </div>`
                      : ""}
                </div>
            `
              )
              .join("")}
        </section>`
          : ""}
    </div>
</body>
</html>`;

  return html;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await rateLimiter(req, res);

    const portfolioData = req.body;

    if (!portfolioData.safeName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const html = generateHTML(portfolioData);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(portfolioData.safeName || "portfolio").replace(/\s+/g, "-").toLowerCase()}-portfolio.html"`
    );

    res.send(html);
  } catch (error) {
    console.error("HTML generation error:", error);
    res.status(500).json({ error: "Failed to generate HTML", details: error.message });
  }
}

