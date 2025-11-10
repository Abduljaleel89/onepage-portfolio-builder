const fs = require('fs');
const path = require('path');

const occupationsPath = path.join(process.cwd(), 'public', 'data', 'occupations.json');
const dataPath = path.join(process.cwd(), 'data', 'occupations.json');

// Read the existing occupations file
let occupations = [];
if (fs.existsSync(occupationsPath)) {
  occupations = JSON.parse(fs.readFileSync(occupationsPath, 'utf-8'));
} else if (fs.existsSync(dataPath)) {
  occupations = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

// Profession-specific content generators
function generateHeadline(title) {
  const lower = title.toLowerCase();
  
  // Technology roles
  if (lower.includes('developer') || lower.includes('engineer') || lower.includes('programmer')) {
    if (lower.includes('frontend')) return "Frontend Developer | Building Modern Web Experiences";
    if (lower.includes('backend')) return "Backend Developer | Scalable Systems Architect";
    if (lower.includes('full stack')) return "Full Stack Developer | End-to-End Solutions";
    if (lower.includes('mobile')) return "Mobile Developer | Native & Cross-Platform Apps";
    if (lower.includes('devops')) return "DevOps Engineer | Infrastructure & Automation";
    if (lower.includes('cloud')) return "Cloud Engineer | Scalable Cloud Solutions";
    if (lower.includes('ai') || lower.includes('machine learning')) return "AI Engineer | Intelligent Systems Builder";
    if (lower.includes('data')) return "Data Engineer | Big Data & Analytics";
    if (lower.includes('security') || lower.includes('cybersecurity')) return "Security Engineer | Protecting Digital Assets";
    return `${title} | Building Robust Software Solutions`;
  }
  
  // Design roles
  if (lower.includes('designer') || lower.includes('design')) {
    if (lower.includes('ui') || lower.includes('ux')) return "UI/UX Designer | User-Centered Design";
    if (lower.includes('graphic')) return "Graphic Designer | Visual Communication";
    if (lower.includes('product')) return "Product Designer | User Experience & Innovation";
    return `${title} | Creative Problem Solver`;
  }
  
  // Management roles
  if (lower.includes('manager') || lower.includes('director') || lower.includes('lead')) {
    if (lower.includes('product')) return "Product Manager | Strategy & Innovation";
    if (lower.includes('project')) return "Project Manager | Delivering Results";
    if (lower.includes('engineering')) return "Engineering Manager | Leading Technical Teams";
    return `${title} | Strategic Leadership & Execution`;
  }
  
  // Healthcare
  if (lower.includes('physician') || lower.includes('doctor') || lower.includes('nurse') || lower.includes('medical')) {
    return `${title} | Dedicated Healthcare Professional`;
  }
  
  // Finance
  if (lower.includes('accountant') || lower.includes('financial') || lower.includes('analyst') && lower.includes('financial')) {
    return `${title} | Financial Excellence & Analysis`;
  }
  
  // Education
  if (lower.includes('teacher') || lower.includes('professor') || lower.includes('educator')) {
    return `${title} | Inspiring Learning & Growth`;
  }
  
  // Marketing
  if (lower.includes('marketing') || lower.includes('marketer')) {
    return `${title} | Driving Growth & Engagement`;
  }
  
  // Sales
  if (lower.includes('sales') || lower.includes('account executive')) {
    return `${title} | Building Relationships & Revenue`;
  }
  
  // Legal
  if (lower.includes('lawyer') || lower.includes('attorney') || lower.includes('legal')) {
    return `${title} | Legal Expertise & Advocacy`;
  }
  
  // Engineering (non-software)
  if (lower.includes('engineer') && !lower.includes('software') && !lower.includes('developer')) {
    return `${title} | Engineering Excellence`;
  }
  
  // Default
  return `${title} | Professional Excellence`;
}

function generateBio(title) {
  const lower = title.toLowerCase();
  
  // Technology roles
  if (lower.includes('developer') || lower.includes('engineer') && lower.includes('software')) {
    return `Experienced {title} with a passion for creating innovative software solutions. Specialized in {skills}, I bring technical expertise and problem-solving skills to deliver high-quality applications. Committed to continuous learning and staying current with emerging technologies.`;
  }
  
  // Design roles
  if (lower.includes('designer')) {
    return `Creative {title} focused on delivering exceptional user experiences and visually compelling designs. With expertise in {skills}, I combine artistic vision with strategic thinking to create impactful solutions that resonate with users and drive business goals.`;
  }
  
  // Management roles
  if (lower.includes('manager') || lower.includes('director')) {
    return `Results-driven {title} with a proven track record of leading teams and delivering successful projects. Expertise in {skills} enables me to drive strategic initiatives, optimize processes, and foster collaborative environments that achieve organizational objectives.`;
  }
  
  // Healthcare
  if (lower.includes('physician') || lower.includes('doctor') || lower.includes('nurse')) {
    return `Dedicated {title} committed to providing exceptional patient care and improving health outcomes. With expertise in {skills}, I bring compassion, clinical excellence, and a patient-centered approach to every interaction.`;
  }
  
  // Finance
  if (lower.includes('accountant') || lower.includes('financial analyst')) {
    return `Detail-oriented {title} with expertise in financial analysis, reporting, and strategic planning. Proficient in {skills}, I help organizations make informed financial decisions and maintain fiscal integrity.`;
  }
  
  // Education
  if (lower.includes('teacher') || lower.includes('professor')) {
    return `Passionate {title} dedicated to fostering learning and academic excellence. With expertise in {skills}, I create engaging educational experiences that inspire students and promote critical thinking.`;
  }
  
  // Marketing
  if (lower.includes('marketing')) {
    return `Strategic {title} with expertise in {skills}, focused on building brand awareness and driving growth. I combine data-driven insights with creative thinking to develop campaigns that resonate with target audiences and deliver measurable results.`;
  }
  
  // Sales
  if (lower.includes('sales')) {
    return `Results-oriented {title} with a proven track record of building relationships and exceeding sales targets. Expertise in {skills} enables me to understand client needs and deliver solutions that drive value.`;
  }
  
  // Legal
  if (lower.includes('lawyer') || lower.includes('attorney')) {
    return `Experienced {title} with expertise in {skills}, providing comprehensive legal counsel and representation. Committed to upholding the highest standards of legal practice and achieving favorable outcomes for clients.`;
  }
  
  // Default
  return `Experienced {title} with expertise in {skills}. Committed to professional excellence, continuous improvement, and delivering high-quality results. I bring a combination of technical knowledge, problem-solving abilities, and collaborative skills to every project.`;
}

// Update each occupation
occupations = occupations.map(occ => {
  const updated = { ...occ };
  
  // Generate headline if not exists
  if (!updated.headline) {
    updated.headline = generateHeadline(occ.title);
  }
  
  // Generate bio if not exists
  if (!updated.bio) {
    updated.bio = generateBio(occ.title);
  }
  
  // Update skills to be more profession-specific
  if (occ.title.toLowerCase().includes('frontend') || occ.title.toLowerCase().includes('front-end')) {
    updated.skills = [
      "HTML5 / CSS3",
      "JavaScript / TypeScript",
      "React / Vue / Angular",
      "Next.js / Nuxt.js",
      "Responsive Design",
      "State Management (Redux, Zustand)",
      "Webpack / Vite",
      "Testing (Jest, React Testing Library)",
      "Accessibility (WCAG)",
      "Performance Optimization"
    ];
  } else if (occ.title.toLowerCase().includes('backend') || occ.title.toLowerCase().includes('back-end')) {
    updated.skills = [
      "Node.js / Python / Java",
      "RESTful APIs",
      "GraphQL",
      "Database Design (SQL, NoSQL)",
      "Microservices Architecture",
      "Authentication & Authorization",
      "Caching Strategies",
      "Message Queues (RabbitMQ, Kafka)",
      "API Security",
      "System Design"
    ];
  } else if (occ.title.toLowerCase().includes('full stack')) {
    updated.skills = [
      "Frontend & Backend Development",
      "JavaScript / TypeScript",
      "React / Node.js",
      "Database Management",
      "RESTful APIs",
      "Cloud Services (AWS, Azure, GCP)",
      "DevOps & CI/CD",
      "Version Control (Git)",
      "Agile Methodologies",
      "Full-Stack Architecture"
    ];
  } else if (occ.title.toLowerCase().includes('ui') || occ.title.toLowerCase().includes('ux') || occ.title.toLowerCase().includes('user experience')) {
    updated.skills = [
      "User Research",
      "Wireframing & Prototyping",
      "Figma / Sketch / Adobe XD",
      "Design Systems",
      "Usability Testing",
      "Information Architecture",
      "Interaction Design",
      "Visual Design",
      "User Journey Mapping",
      "Accessibility Design"
    ];
  } else if (occ.title.toLowerCase().includes('product manager')) {
    updated.skills = [
      "Product Strategy",
      "Roadmap Planning",
      "Stakeholder Management",
      "Agile / Scrum",
      "Data Analysis",
      "User Research",
      "Market Research",
      "Cross-functional Collaboration",
      "Product Metrics (KPIs)",
      "Prioritization Frameworks"
    ];
  } else if (occ.title.toLowerCase().includes('data scientist') || occ.title.toLowerCase().includes('data analyst')) {
    updated.skills = [
      "Python / R",
      "SQL",
      "Machine Learning",
      "Statistical Analysis",
      "Data Visualization",
      "Pandas / NumPy",
      "Jupyter Notebooks",
      "Tableau / Power BI",
      "A/B Testing",
      "Big Data Tools"
    ];
  } else if (occ.title.toLowerCase().includes('devops')) {
    updated.skills = [
      "CI/CD Pipelines",
      "Docker / Kubernetes",
      "Cloud Platforms (AWS, Azure, GCP)",
      "Infrastructure as Code",
      "Monitoring & Logging",
      "Linux Administration",
      "Scripting (Bash, Python)",
      "Git / Version Control",
      "Container Orchestration",
      "Security Best Practices"
    ];
  } else if (occ.title.toLowerCase().includes('marketing')) {
    updated.skills = [
      "Digital Marketing",
      "SEO / SEM",
      "Content Marketing",
      "Social Media Marketing",
      "Email Marketing",
      "Analytics (Google Analytics)",
      "Marketing Automation",
      "Campaign Management",
      "Brand Management",
      "Market Research"
    ];
  } else if (occ.title.toLowerCase().includes('sales')) {
    updated.skills = [
      "Relationship Building",
      "Sales Strategy",
      "CRM Systems",
      "Negotiation",
      "Lead Generation",
      "Account Management",
      "Presentation Skills",
      "Pipeline Management",
      "Customer Success",
      "Market Analysis"
    ];
  } else if (occ.title.toLowerCase().includes('accountant')) {
    updated.skills = [
      "Financial Accounting",
      "GAAP / IFRS",
      "Tax Preparation",
      "Financial Reporting",
      "QuickBooks / SAP",
      "Auditing",
      "Budgeting & Forecasting",
      "Excel / Financial Modeling",
      "Compliance",
      "Financial Analysis"
    ];
  } else if (occ.title.toLowerCase().includes('teacher') || occ.title.toLowerCase().includes('educator')) {
    updated.skills = [
      "Curriculum Development",
      "Classroom Management",
      "Lesson Planning",
      "Student Assessment",
      "Educational Technology",
      "Differentiated Instruction",
      "Parent Communication",
      "Special Education",
      "Student Engagement",
      "Professional Development"
    ];
  } else if (occ.title.toLowerCase().includes('nurse')) {
    updated.skills = [
      "Patient Care",
      "Clinical Assessment",
      "Medication Administration",
      "Electronic Health Records",
      "Critical Thinking",
      "Patient Education",
      "Care Planning",
      "Medical Terminology",
      "Infection Control",
      "Emergency Response"
    ];
  } else if (occ.title.toLowerCase().includes('lawyer') || occ.title.toLowerCase().includes('attorney')) {
    updated.skills = [
      "Legal Research",
      "Contract Drafting",
      "Litigation",
      "Client Counseling",
      "Legal Writing",
      "Case Management",
      "Negotiation",
      "Compliance",
      "Legal Analysis",
      "Court Procedures"
    ];
  } else {
    // Keep generic skills but make them more relevant
    updated.skills = [
      "Communication Skills",
      "Problem Solving",
      "Team Collaboration",
      "Time Management",
      "Project Management",
      "Analytical Thinking",
      "Attention to Detail",
      "Adaptability",
      "Continuous Learning",
      "Professional Development"
    ];
  }
  
  // Update responsibilities to be more profession-specific
  if (updated.responsibilities && updated.responsibilities.length > 0) {
    const titleLower = occ.title.toLowerCase();
    if (titleLower.includes('developer') || titleLower.includes('engineer') && titleLower.includes('software')) {
      updated.responsibilities = [
        `Develop and maintain ${occ.title.toLowerCase()} solutions`,
        "Write clean, maintainable, and well-documented code",
        "Collaborate with cross-functional teams to deliver features",
        "Participate in code reviews and maintain coding standards",
        "Troubleshoot and debug applications",
        "Stay updated with industry best practices and emerging technologies",
        "Contribute to technical documentation and knowledge sharing"
      ];
    } else if (titleLower.includes('designer')) {
      updated.responsibilities = [
        `Create user-centered designs as a ${occ.title}`,
        "Conduct user research and usability testing",
        "Develop wireframes, prototypes, and design systems",
        "Collaborate with developers to ensure design implementation",
        "Present design concepts to stakeholders",
        "Stay current with design trends and best practices",
        "Maintain brand consistency across all design deliverables"
      ];
    } else if (titleLower.includes('manager')) {
      updated.responsibilities = [
        `Lead and manage teams as a ${occ.title}`,
        "Develop and execute strategic plans and initiatives",
        "Monitor and report on key performance indicators",
        "Foster collaboration and team development",
        "Manage budgets and resources effectively",
        "Build relationships with stakeholders and partners",
        "Ensure compliance with organizational policies and regulations"
      ];
    } else {
      // Keep generic but profession-aware
      updated.responsibilities = [
        `Execute ${occ.title.toLowerCase()} responsibilities with precision and professionalism`,
        "Collaborate effectively with team members and stakeholders",
        "Maintain high standards of quality and performance",
        "Stay updated with industry trends and best practices",
        "Document processes and maintain accurate records",
        "Contribute to team goals and organizational objectives",
        "Ensure compliance with relevant regulations and standards"
      ];
    }
  }
  
  return updated;
});

// Write updated data to both locations
fs.writeFileSync(occupationsPath, JSON.stringify(occupations, null, 2), 'utf-8');
if (fs.existsSync(path.dirname(dataPath))) {
  fs.writeFileSync(dataPath, JSON.stringify(occupations, null, 2), 'utf-8');
}

console.log(`Updated ${occupations.length} occupations with headlines, bios, and profession-specific skills/responsibilities`);

