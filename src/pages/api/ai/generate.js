// AI Generation API endpoint
// This can be integrated with OpenAI, Anthropic, or other AI services

import fs from "fs";
import path from "path";

function loadOccupations() {
  try {
    const candidates = [
      path.join(process.cwd(), "data", "occupations.json"),
      path.join(process.cwd(), "public", "data", "occupations.json"),
    ];
    
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, "utf-8"));
        return Array.isArray(data) ? data : (data.occupations || []);
      }
    }
    return [];
  } catch (err) {
    console.error("Error loading occupations:", err);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, input, context: contextInput } = req.body;
  const context = contextInput || {};

  try {
    // If profession data is not provided in context, try to load it
    if (!context.professionData && input.profession) {
      const occupations = loadOccupations();
      // Try to find by slug first
      let professionData = occupations.find(occ => occ.slug === input.profession);
      // If not found by slug, try to find by title (for custom professions)
      if (!professionData && typeof input.profession === 'string') {
        professionData = occupations.find(occ => 
          occ.title.toLowerCase() === input.profession.toLowerCase() ||
          occ.title.toLowerCase().includes(input.profession.toLowerCase()) ||
          input.profession.toLowerCase().includes(occ.title.toLowerCase())
        );
      }
      if (professionData) {
        context.professionData = professionData;
      }
    }

    let result = "";

    switch (type) {
      case "bio":
        result = generateBio(input, context);
        break;
      case "headline":
        result = generateHeadline(input, context);
        break;
      case "project-description":
        result = generateProjectDescription(input, context);
        break;
      case "skills":
        result = suggestSkills(input, context);
        break;
      case "optimize":
        result = optimizeContent(input, context);
        break;
      case "responsibilities":
        result = generateResponsibilities(input, context);
        break;
      default:
        return res.status(400).json({ error: "Invalid AI type" });
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.error("AI generation error:", err);
    return res.status(500).json({ error: "Failed to generate content" });
  }
}

// AI Generation Functions
// Note: These are template-based generators. For production, integrate with OpenAI API:
// const response = await fetch('https://api.openai.com/v1/chat/completions', {
//   method: 'POST',
//   headers: {
//     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     model: 'gpt-4',
//     messages: [{ role: 'user', content: prompt }]
//   })
// });

function generateBio(input, context) {
  const { name, headline, experience, skills, profession } = input || {};
  const professionData = context?.professionData;
  
  // If profession data exists, use profession-specific bio
  if (professionData && professionData.bio) {
    let bio = professionData.bio;
    if (name) {
      bio = bio.replace(/\{name\}/g, name);
    }
    if (headline) {
      bio = bio.replace(/\{headline\}/g, headline);
    }
    if (experience?.length > 0) {
      bio = bio.replace(/\{experience\}/g, `${experience.length} ${experience.length === 1 ? 'year' : 'years'}`);
    }
    if (skills?.length > 0) {
      const skillList = skills.slice(0, 5).join(", ");
      bio = bio.replace(/\{skills\}/g, skillList);
    }
    return bio;
  }
  
  if (!name && !headline) {
    return "I'm a passionate professional dedicated to creating innovative solutions and delivering exceptional results. With a strong background in technology and a commitment to continuous learning, I thrive in dynamic environments where I can contribute to meaningful projects.";
  }

  const skillList = skills?.length > 0 ? skills.slice(0, 5).join(", ") : "various technologies";
  const expText = experience?.length > 0 
    ? `With ${experience.length} ${experience.length === 1 ? 'year' : 'years'} of professional experience, ` 
    : "";

  const professionTitle = professionData?.title || profession || "my field";
  return `${expText}I am ${name || "a professional"} specializing in ${professionTitle}. My expertise includes ${skillList}, and I'm passionate about creating innovative solutions. I bring a unique blend of technical skills and creative problem-solving to every project, always striving for excellence and continuous improvement.`;
}

function generateHeadline(input, context) {
  const { role, skills, experience, profession, name } = input || {};
  const professionData = context?.professionData;
  
  // If profession data exists, use profession-specific headline
  if (professionData && professionData.headline) {
    let headline = professionData.headline;
    if (name) {
      headline = headline.replace(/\{name\}/g, name);
    }
    if (role) {
      headline = headline.replace(/\{role\}/g, role);
    }
    if (experience) {
      headline = headline.replace(/\{experience\}/g, `${experience} ${experience === 1 ? 'Year' : 'Years'}`);
    }
    if (skills?.length > 0) {
      const topSkills = skills.slice(0, 3).join(", ");
      headline = headline.replace(/\{skills\}/g, topSkills);
    }
    return headline;
  }
  
  // Fallback to profession title if available
  if (professionData?.title) {
    return `${professionData.title} | Building Innovative Solutions`;
  }
  
  if (role) {
    return `${role} | Building Innovative Solutions`;
  }
  
  if (skills?.length > 0) {
    const topSkills = skills.slice(0, 3).join(", ");
    return `Expert in ${topSkills} | ${experience ? `${experience} Years Experience` : "Professional"}`;
  }
  
  return profession || "Professional | Problem Solver | Tech Enthusiast";
}

function generateProjectDescription(input, context) {
  const { title, technologies, problem } = input || {};
  
  if (!title) {
    return "A comprehensive solution designed to address real-world challenges through innovative technology and user-centered design.";
  }

  const techStack = technologies?.length > 0 ? technologies.join(", ") : "modern technologies";
  const problemText = problem || "addressing key challenges";
  
  return `${title} is a ${context?.type || "web application"} built with ${techStack} that focuses on ${problemText}. The project demonstrates ${context?.highlights || "best practices in software development, user experience design, and scalable architecture"}. Key features include responsive design, intuitive user interface, and robust functionality that delivers value to end users.`;
}

function suggestSkills(input, context) {
  const { experience, education, existingSkills, profession } = input || {};
  
  // If profession is provided, use profession-specific skills
  if (profession && context.professionData) {
    const profSkills = context.professionData.skills || [];
    const existing = (existingSkills || []).map(s => s.name || s).map(s => s.toLowerCase());
    // Return ALL profession-specific skills, not just 10
    return profSkills.filter(skill => !existing.includes(skill.toLowerCase()));
  }
  
  // Common tech skills based on context
  const commonSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java",
    "HTML/CSS", "Git", "SQL", "MongoDB", "AWS", "Docker", "Kubernetes",
    "REST APIs", "GraphQL", "CI/CD", "Agile", "Scrum", "UI/UX Design"
  ];
  
  // Filter out existing skills
  const existing = (existingSkills || []).map(s => s.name || s).map(s => s.toLowerCase());
  const suggestions = commonSkills
    .filter(skill => !existing.includes(skill.toLowerCase()));
  
  return suggestions;
}

function generateResponsibilities(input, context) {
  const { profession } = input || {};
  
  if (profession && context.professionData) {
    return context.professionData.responsibilities || [];
  }
  
  // Default responsibilities
  return [
    "Collaborate with cross-functional teams to deliver high-quality solutions",
    "Participate in code reviews and maintain coding standards",
    "Troubleshoot and debug applications",
    "Document technical specifications and processes",
    "Stay updated with industry best practices and emerging technologies"
  ];
}

function optimizeContent(input, context) {
  const { content, type } = input || {};
  
  if (!content) return "";
  
  // Simple optimization: improve clarity and professionalism
  let optimized = content.trim();
  
  // Remove excessive whitespace
  optimized = optimized.replace(/\s+/g, " ");
  
  // Ensure proper capitalization for sentences
  if (type === "bio" || type === "description") {
    optimized = optimized.charAt(0).toUpperCase() + optimized.slice(1);
    if (!optimized.endsWith(".") && !optimized.endsWith("!") && !optimized.endsWith("?")) {
      optimized += ".";
    }
  }
  
  // Add action verbs and make it more engaging
  if (type === "project-description") {
    optimized = optimized.replace(/I (built|made|created)/gi, "Developed");
    optimized = optimized.replace(/I (worked|did)/gi, "Implemented");
  }
  
  return optimized;
}

