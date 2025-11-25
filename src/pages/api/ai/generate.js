// AI Generation API endpoint
// Integrated with OpenAI API for real AI generation

import fs from "fs";
import path from "path";
import { createRateLimiter } from "@/lib/rateLimit";

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

const rateLimiter = createRateLimiter({ windowMs: 60000, max: 10 });

export default async function handler(req, res) {
  rateLimiter(req, res, () => {
    handleRequest(req, res);
  });
}

async function handleRequest(req, res) {
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

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const useOpenAI = openaiApiKey && openaiApiKey.trim() !== "";

    let result = "";

    if (useOpenAI) {
      // Use OpenAI API for real AI generation
      try {
        result = await generateWithOpenAI(type, input, context);
      } catch (openaiError) {
        console.error("OpenAI API error, falling back to template:", openaiError);
        // Fallback to template-based generation if OpenAI fails
        result = generateWithTemplate(type, input, context);
      }
    } else {
      // Use template-based generation if OpenAI is not configured
      result = generateWithTemplate(type, input, context);
    }

    return res.status(200).json({ result });
  } catch (err) {
    console.error("AI generation error:", err);
    return res.status(500).json({ error: "Failed to generate content", details: err.message });
  }
}

async function generateWithOpenAI(type, input, context) {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

  let prompt = "";
  let systemPrompt = "";

  switch (type) {
    case "bio":
      systemPrompt = "You are a professional resume writer. Generate a compelling professional bio that is concise, engaging, and highlights the person's expertise and achievements.";
      prompt = buildBioPrompt(input, context);
      break;
    case "headline":
      systemPrompt = "You are a professional resume writer. Generate a compelling professional headline that is concise and impactful.";
      prompt = buildHeadlinePrompt(input, context);
      break;
    case "project-description":
      systemPrompt = "You are a technical writer. Generate a professional project description that highlights the project's value, technologies used, and key achievements.";
      prompt = buildProjectDescriptionPrompt(input, context);
      break;
    case "skills":
      systemPrompt = "You are a career advisor. Generate a relevant list of technical and professional skills for the given profession. Return ONLY a JSON array of skill names, no other text.";
      prompt = buildSkillsPrompt(input, context);
      break;
    case "optimize":
      systemPrompt = "You are a professional editor. Optimize the given content to be more professional, clear, and impactful while maintaining its original meaning.";
      prompt = `Optimize the following ${input.type || "content"}:\n\n${input.content}`;
      break;
    case "responsibilities":
      systemPrompt = "You are a career advisor. Generate professional job responsibilities for the given profession. Return ONLY a JSON array of responsibility strings, no other text.";
      prompt = buildResponsibilitiesPrompt(input, context);
      break;
    default:
      throw new Error(`Invalid AI type: ${type}`);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: type === "headline" ? 100 : type === "optimize" ? 500 : 300,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const generatedText = data.choices?.[0]?.message?.content?.trim();

  if (!generatedText) {
    throw new Error("No content generated from OpenAI");
  }

  // For skills and responsibilities, parse JSON array
  if (type === "skills" || type === "responsibilities") {
    try {
      // Try to extract JSON array from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      // If no JSON found, try to parse the whole response
      const parsed = JSON.parse(generatedText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (parseError) {
      // If JSON parsing fails, try to extract list items
      const lines = generatedText.split('\n').map(line => line.trim()).filter(line => line);
      const items = lines
        .map(line => {
          // Remove numbering (1., 2., etc.)
          line = line.replace(/^\d+[\.\)]\s*/, '');
          // Remove bullet points
          line = line.replace(/^[-*•]\s*/, '');
          // Remove quotes
          line = line.replace(/^["']|["']$/g, '');
          return line.trim();
        })
        .filter(line => line && line.length > 5);
      
      if (items.length > 0) {
        return items;
      }
      
      // Last resort: return as single-item array
      return [generatedText];
    }
  }

  return generatedText;
}

function buildBioPrompt(input, context) {
  const { name, headline, experience, skills, profession } = input || {};
  const professionData = context?.professionData;

  let prompt = `Generate a professional bio (2-3 sentences) for `;
  
  if (name) {
    prompt += `${name}`;
  } else {
    prompt += `a professional`;
  }

  if (professionData?.title || profession) {
    prompt += ` who is a ${professionData?.title || profession}`;
  }

  if (experience?.length > 0) {
    prompt += ` with ${experience.length} ${experience.length === 1 ? 'year' : 'years'} of experience`;
  }

  if (skills?.length > 0) {
    prompt += `. Key skills include: ${skills.slice(0, 5).join(", ")}`;
  }

  if (headline) {
    prompt += `. Professional focus: ${headline}`;
  }

  prompt += `. Make it engaging, professional, and highlight their expertise and value proposition.`;

  return prompt;
}

function buildHeadlinePrompt(input, context) {
  const { role, skills, experience, profession, name } = input || {};
  const professionData = context?.professionData;

  let prompt = `Generate a professional headline (one line, max 80 characters) for `;
  
  if (name) {
    prompt += `${name}, `;
  }

  if (role) {
    prompt += `a ${role}`;
  } else if (professionData?.title || profession) {
    prompt += `a ${professionData?.title || profession}`;
  } else {
    prompt += `a professional`;
  }

  if (experience) {
    prompt += ` with ${experience} ${experience === 1 ? 'year' : 'years'} of experience`;
  }

  if (skills?.length > 0) {
    prompt += ` specializing in ${skills.slice(0, 3).join(", ")}`;
  }

  prompt += `. Make it compelling and professional.`;

  return prompt;
}

function buildProjectDescriptionPrompt(input, context) {
  const { title, technologies, problem } = input || {};

  let prompt = `Generate a professional project description (2-3 sentences) for a project called "${title || "this project"}"`;

  if (technologies?.length > 0) {
    prompt += ` built with ${technologies.join(", ")}`;
  }

  if (problem) {
    prompt += `. The project addresses: ${problem}`;
  }

  prompt += `. Highlight the project's value, key features, and impact. Make it professional and engaging.`;

  return prompt;
}

function buildSkillsPrompt(input, context) {
  const { experience, education, existingSkills, profession } = input || {};
  const professionData = context?.professionData;

  let prompt = `Generate a comprehensive list of relevant skills for a ${professionData?.title || profession || "professional"}`;

  if (experience?.length > 0) {
    prompt += ` with ${experience.length} ${experience.length === 1 ? 'year' : 'years'} of experience`;
  }

  if (education?.length > 0) {
    prompt += ` with ${education.length} ${education.length === 1 ? 'degree' : 'degrees'}`;
  }

  if (existingSkills?.length > 0) {
    const existing = existingSkills.map(s => s.name || s).join(", ");
    prompt += `. Do NOT include these existing skills: ${existing}`;
  }

  prompt += `. Return a JSON array of skill names only, like: ["Skill 1", "Skill 2", "Skill 3"]. Include technical skills, soft skills, and tools relevant to this profession. Generate 10-15 skills.`;

  return prompt;
}

function buildResponsibilitiesPrompt(input, context) {
  const { profession } = input || {};
  const professionData = context?.professionData;

  let prompt = `Generate 5-7 professional job responsibilities for a ${professionData?.title || profession || "professional"}`;

  if (professionData?.description) {
    prompt += `. Context: ${professionData.description}`;
  }

  prompt += `. Each responsibility should be a clear, action-oriented statement starting with a verb. Return a JSON array of responsibility strings only, like: ["Responsibility 1", "Responsibility 2"]. Make them specific, professional, and relevant to this role.`;

  return prompt;
}

function generateWithTemplate(type, input, context) {
  switch (type) {
    case "bio":
      return generateBio(input, context);
    case "headline":
      return generateHeadline(input, context);
    case "project-description":
      return generateProjectDescription(input, context);
    case "skills":
      return suggestSkills(input, context);
    case "optimize":
      return optimizeContent(input, context);
    case "responsibilities":
      return generateResponsibilities(input, context);
    default:
      throw new Error(`Invalid AI type: ${type}`);
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

