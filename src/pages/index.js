import { useState, useEffect, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

export default function Home() {
  const [profile, setProfile] = useState({ name: "", headline: "", bio: "", avatar: "" });
  const [projects, setProjects] = useState([]);
  const [social, setSocial] = useState({ github: "", linkedin: "", twitter: "", website: "", email: "" });
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [contact, setContact] = useState({ email: "", phone: "", location: "" });
  const [profession, setProfession] = useState("");
  const [customProfession, setCustomProfession] = useState("");
  const [responsibilities, setResponsibilities] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [showProjects, setShowProjects] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showResponsibilities, setShowResponsibilities] = useState(true);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const fileInputRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const resolvedTheme = theme === "system" ? undefined : theme;

  useEffect(() => {
    // Load occupations
    fetch("/api/occupations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setOccupations(data);
      })
      .catch((err) => console.error("Failed to load occupations:", err));

    // Load profile data
    fetch("/api/me/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          if (d.profile) setProfile(d.profile);
          if (d.projects) setProjects(d.projects || []);
          if (d.social) setSocial(d.social || {});
          if (d.skills) setSkills(d.skills || []);
          if (d.experience) setExperience(d.experience || []);
          if (d.education) setEducation(d.education || []);
          if (d.contact) setContact(d.contact || {});
          if (d.profession) setProfession(d.profession || "");
          if (d.customProfession) setCustomProfession(d.customProfession || "");
          if (d.responsibilities) setResponsibilities(d.responsibilities || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setStatus("Failed to load profile");
        setTimeout(() => setStatus(""), 2000);
      });
  }, []);

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));
  const updateSocial = (k, v) => setSocial((s) => ({ ...s, [k]: v }));
  const updateContact = (k, v) => setContact((c) => ({ ...c, [k]: v }));
  const updateProj = (i, k, v) =>
    setProjects((p) => {
      const copy = [...p];
      copy[i] = { ...copy[i], [k]: v };
      return copy;
    });
  const updateExp = (i, k, v) =>
    setExperience((e) => {
      const copy = [...e];
      copy[i] = { ...copy[i], [k]: v };
      return copy;
    });
  const updateEdu = (i, k, v) =>
    setEducation((e) => {
      const copy = [...e];
      copy[i] = { ...copy[i], [k]: v };
      return copy;
    });

  const handleAvatarUpload = async (e) => {
    console.log("handleAvatarUpload called", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      setStatus("No file selected");
      setTimeout(() => setStatus(""), 2000);
      return;
    }
    console.log("File selected:", file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setStatus("Please select an image file");
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setStatus("File size must be less than 5MB");
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errorData.error || "Upload failed");
      }
      
      const data = await res.json();
      if (data.url) {
        update("avatar", data.url);
        setStatus("Avatar uploaded ✓");
        setTimeout(() => setStatus(""), 2000);
      } else {
        throw new Error(data.error || "No URL returned");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setStatus(`Upload failed: ${err.message || "Unknown error"}`);
      setTimeout(() => setStatus(""), 3000);
    } finally {
      setUploading(false);
      // Reset file input to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addSkill = (e) => {
    if (e) e.preventDefault();
    const skill = prompt("Enter skill name:");
    if (skill) setSkills([...skills, { id: Date.now(), name: skill, level: "intermediate" }]);
  };
  const removeSkill = (id) => setSkills(skills.filter((s) => s.id !== id));

  // AI Generation Functions
  const generateWithAI = async (type, input, context = {}, skipLoading = false) => {
    if (!skipLoading) {
      setAiLoading({ ...aiLoading, [type]: true });
    }
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, input, context }),
      });
      const data = await res.json();
      if (data.result) {
        return data.result;
      }
    } catch (err) {
      console.error("AI generation error:", err);
      setStatus("AI generation failed");
      setTimeout(() => setStatus(""), 2000);
    } finally {
      if (!skipLoading) {
        setAiLoading({ ...aiLoading, [type]: false });
      }
    }
    return null;
  };

  const handleAIBio = async () => {
    const selectedProfession = occupations.find(occ => occ.slug === profession);
    const result = await generateWithAI("bio", {
      name: profile.name,
      headline: profile.headline,
      experience,
      skills: skills.map(s => s.name),
      profession: profession || customProfession,
    }, { professionData: selectedProfession });
    if (result) update("bio", result);
  };

  const handleAIHeadline = async () => {
    const selectedProfession = occupations.find(occ => occ.slug === profession);
    const result = await generateWithAI("headline", {
      role: profile.headline,
      skills: skills.map(s => s.name),
      experience: experience.length,
      profession: profession || customProfession,
      name: profile.name,
    }, { professionData: selectedProfession });
    if (result) update("headline", result);
  };

  const handleAIProjectDescription = async (projectIndex) => {
    const project = projects[projectIndex];
    const loadingKey = `project-${projectIndex}`;
    setAiLoading({ ...aiLoading, [loadingKey]: true });
    try {
      const result = await generateWithAI("project-description", {
        title: project.title,
        technologies: project.tags || [],
        problem: project.description,
      }, { type: "web application" }, true);
      if (result) updateProj(projectIndex, "description", result);
    } finally {
      setAiLoading({ ...aiLoading, [loadingKey]: false });
    }
  };

  const handleAISkillSuggestions = async () => {
    const selectedProfession = occupations.find(occ => occ.slug === profession);
    const result = await generateWithAI("skills", {
      experience,
      education,
      existingSkills: skills,
      profession: profession || customProfession,
    }, { professionData: selectedProfession });
    if (result && Array.isArray(result)) {
      const newSkills = [];
      result.forEach(skill => {
        if (!skills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
          newSkills.push({ id: Date.now() + Math.random(), name: skill, level: "intermediate" });
        }
      });
      if (newSkills.length > 0) {
        setSkills([...skills, ...newSkills]);
        setStatus(`Added ${newSkills.length} skills ✓`);
        setTimeout(() => setStatus(""), 2000);
      } else {
        setStatus("All suggested skills already added");
        setTimeout(() => setStatus(""), 2000);
      }
    }
  };

  const handleAIResponsibilities = async () => {
    const selectedProfession = occupations.find(occ => occ.slug === profession);
    const result = await generateWithAI("responsibilities", {
      profession: profession || customProfession,
    }, { professionData: selectedProfession });
    if (result && Array.isArray(result)) {
      setResponsibilities(result);
      setStatus(`Generated ${result.length} responsibilities ✓`);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const removeResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAIOptimize = async (type, content, index = null) => {
    const result = await generateWithAI("optimize", { content, type });
    if (result) {
      if (type === "bio") {
        update("bio", result);
      } else if (type === "project-description" && index !== null) {
        updateProj(index, "description", result);
      }
    }
  };

  const addProj = (e) => {
    if (e) e.preventDefault();
    setProjects([...projects, { id: Date.now(), title: "", description: "", image: "", link: "", tags: [] }]);
  };
  const removeProj = (id) => setProjects(projects.filter((p) => p.id !== id));

  const addExp = (e) => {
    if (e) e.preventDefault();
    setExperience([...experience, { id: Date.now(), company: "", role: "", period: "", description: "" }]);
  };
  const removeExp = (id) => setExperience(experience.filter((e) => e.id !== id));

  const addEdu = (e) => {
    if (e) e.preventDefault();
    setEducation([...education, { id: Date.now(), institution: "", degree: "", period: "", description: "" }]);
  };
  const removeEdu = (id) => setEducation(education.filter((e) => e.id !== id));

  const resetAll = async () => {
    if (!confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
      return;
    }
    setProfile({ name: "", headline: "", bio: "", avatar: "" });
    setProjects([]);
    setSocial({ github: "", linkedin: "", twitter: "", website: "", email: "" });
    setSkills([]);
    setExperience([]);
    setEducation([]);
    setContact({ email: "", phone: "", location: "" });
    setProfession("");
    setCustomProfession("");
    setResponsibilities([]);
    setStatus("Data reset ✓");
    setTimeout(() => setStatus(""), 2000);
    
    // Also clear from server
    try {
      await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profile: {}, 
          projects: [], 
          social: {}, 
          skills: [], 
          experience: [], 
          education: [], 
          contact: {},
          profession: "",
          customProfession: "",
          responsibilities: []
        }),
      });
    } catch (err) {
      console.error("Failed to reset on server:", err);
    }
  };

  const save = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, projects, social, skills, experience, education, contact, profession, customProfession, responsibilities }),
      });
      setStatus(res.ok ? "Saved ✓" : "Error");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setStatus("Error saving");
    }
    setTimeout(() => setStatus(""), 2000);
  };

  const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <Card className="mb-6 premium-card animate-fade-in-up">
      <div
        className="flex justify-between items-center px-6 py-4 border-b cursor-pointer select-none hover:bg-accent/50 transition-all duration-300 hover:shadow-lg"
        onClick={onToggle}
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-muted-foreground">{isOpen ? "▲ Hide" : "▼ Show"}</span>
      </div>
      {isOpen && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 print:bg-white animate-fade-in">
          {/* Header - Hidden on Print */}
          <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b no-print glass-effect shadow-lg">
            <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Logo size={32} />
                <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Professional CV Preview</h2>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="premium-button cinematic-glow-hover"
                  onClick={() => window.print()}
                >
                  🖨️ Print / Save as PDF
                </Button>
                <Button 
                  className="premium-button cinematic-glow"
                  onClick={() => setPreviewMode(false)}
                >
                  Edit Portfolio
                </Button>
              </div>
            </div>
          </div>

          {/* CV Container */}
          <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none my-8 print:my-0 rounded-lg overflow-hidden animate-fade-in-up cinematic-glow">
            <div className="p-8 print:p-6">
              {/* CV Header */}
              <div className="border-b-2 border-primary pb-6 mb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 -mx-8 px-8 py-6 print:bg-transparent">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 animate-slide-in-right">
                    <h1 className="text-4xl font-bold mb-2 text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{profile.name || "Your Name"}</h1>
                    <p className="text-xl text-gray-600 mb-3 font-medium">{profile.headline || "Your Professional Headline"}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {contact.email && <span>📧 {contact.email}</span>}
                      {contact.phone && <span>📱 {contact.phone}</span>}
                      {contact.location && <span>📍 {contact.location}</span>}
                    </div>
                    {(social.github || social.linkedin || social.twitter || social.website) && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">GitHub</a>}
                        {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">LinkedIn</a>}
                        {social.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Twitter</a>}
                        {social.website && <a href={social.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Website</a>}
                      </div>
                    )}
                  </div>
                  {profile.avatar && (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary print:w-20 print:h-20"
                    />
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {profile.bio && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </section>
              )}

              {/* Job Responsibilities */}
              {responsibilities.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Key Responsibilities
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {responsibilities.map((resp, i) => (
                      <li key={i} className="leading-relaxed">{resp}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Technical Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s.id} className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800 rounded-md text-sm border border-blue-200 font-medium">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Experience */}
              {experience.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Professional Experience
                  </h2>
                  <div className="space-y-5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{exp.role || "Role"}</h3>
                          <span className="text-sm text-gray-600 font-medium">{exp.period || "Period"}</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">{exp.company || "Company"}</p>
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Education
                  </h2>
                  <div className="space-y-4">
                    {education.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{edu.degree || "Degree"}</h3>
                          <span className="text-sm text-gray-600 font-medium">{edu.period || "Period"}</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-1">{edu.institution || "Institution"}</p>
                        {edu.description && (
                          <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {projects.map((p) => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 print:bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{p.title || "Project Title"}</h3>
                          {p.link && (
                            <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm print:text-gray-900">
                              View →
                            </a>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-gray-700 text-sm mb-2 leading-relaxed">{p.description}</p>
                        )}
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-center py-24 shadow-2xl overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient opacity-90"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer"></div>
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-in">
            <Logo size={60} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up gradient-text" style={{ animationDelay: '0.2s' }}>
            Portfolio Builder
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Create an impressive portfolio in minutes
          </p>
          <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="secondary"
              className="premium-button cinematic-glow-hover text-lg px-8 py-6"
              onClick={() => {
                const content = document.querySelector("#content");
                if (content) content.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              className="premium-button glass-effect border-white/30 text-white hover:bg-white/20 text-lg px-8 py-6" 
              onClick={() => setPreviewMode(true)}
            >
              Preview Portfolio
            </Button>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <Button 
            size="icon" 
            variant="ghost" 
            className="glass-effect hover:bg-white/10"
            onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")} 
            aria-label="Toggle theme"
          >
            {resolvedTheme === "light" ? <MoonIcon /> : <SunIcon />}
          </Button>
        </div>
      </div>

      <main id="content" className="max-w-4xl mx-auto mt-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Portfolio Setup
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              className="premium-button cinematic-glow-hover"
              onClick={() => setPreviewMode(true)}
            >
              Preview
            </Button>
            <Button 
              variant="destructive" 
              className="premium-button"
              onClick={resetAll}
            >
              Reset All
            </Button>
            <Button 
              onClick={save}
              className="premium-button cinematic-glow"
            >
              {status || "Save"}
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 premium-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardContent className="space-y-4 pt-6">
            <div>
              <div className="font-medium mb-2 block">Profile Photo</div>
              <div className="flex items-center gap-4">
                {profile.avatar && (
                  <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2" />
                )}
                <div className="relative inline-block">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    id="avatar-upload-input"
                    disabled={uploading}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      zIndex: 2,
                      fontSize: 0,
                      margin: 0,
                      padding: 0
                    }}
                  />
                  <Button
                    variant="outline"
                    disabled={uploading}
                    style={{ 
                      position: 'relative',
                      zIndex: 1,
                      pointerEvents: 'none'
                    }}
                  >
                    {uploading ? "Uploading..." : profile.avatar ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <label className="font-medium">Name</label>
              <Input value={profile.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" />
            </div>
            <div>
              <label className="font-medium">Profession</label>
              <select
                value={profession}
                onChange={(e) => {
                  setProfession(e.target.value);
                  if (e.target.value) setCustomProfession(""); // Clear custom when selecting from list
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                style={{ 
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  appearance: 'auto'
                }}
                size={occupations.length > 10 ? undefined : undefined}
              >
                <option value="" style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}>
                  Select a profession ({occupations.length} available)
                </option>
                {occupations.map((occ, index) => (
                  <option 
                    key={`${occ.slug}-${index}`} 
                    value={occ.slug}
                    style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                  >
                    {occ.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Scroll to see all {occupations.length} professions
              </p>
              <div className="mt-2">
                <label className="text-sm text-muted-foreground">Or enter a custom profession:</label>
                <Input 
                  value={customProfession}
                  onChange={(e) => {
                    setCustomProfession(e.target.value);
                    if (e.target.value) setProfession(""); // Clear dropdown when typing custom
                  }}
                  placeholder="e.g., Senior Product Designer"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Headline</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIHeadline}
                  disabled={aiLoading.headline}
                  className="text-xs premium-button cinematic-glow-hover"
                >
                  {aiLoading.headline ? "✨ Generating..." : "✨ AI Generate"}
                </Button>
              </div>
              <Input value={profile.headline} onChange={(e) => update("headline", e.target.value)} placeholder="Full Stack Developer" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Bio</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAIBio}
                    disabled={aiLoading.bio}
                    className="text-xs premium-button cinematic-glow-hover"
                  >
                    {aiLoading.bio ? "✨ Generating..." : "✨ AI Generate"}
                  </Button>
                  {profile.bio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIOptimize("bio", profile.bio)}
                      disabled={aiLoading.optimize}
                      className="text-xs"
                    >
                      {aiLoading.optimize ? "⚡ Optimizing..." : "⚡ Optimize"}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea rows={4} value={profile.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Tell us about yourself..." />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <CollapsibleSection title="Social Media Links" isOpen={showSocial} onToggle={() => setShowSocial(!showSocial)}>
          <div className="space-y-4">
            <div>
              <label className="font-medium">GitHub</label>
              <Input value={social.github} onChange={(e) => updateSocial("github", e.target.value)} placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="font-medium">LinkedIn</label>
              <Input value={social.linkedin} onChange={(e) => updateSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="font-medium">Twitter</label>
              <Input value={social.twitter} onChange={(e) => updateSocial("twitter", e.target.value)} placeholder="https://twitter.com/username" />
            </div>
            <div>
              <label className="font-medium">Website</label>
              <Input value={social.website} onChange={(e) => updateSocial("website", e.target.value)} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <label className="font-medium">Email</label>
              <Input type="email" value={social.email} onChange={(e) => updateSocial("email", e.target.value)} placeholder="your@email.com" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Job Responsibilities */}
        <CollapsibleSection title="Job Responsibilities" isOpen={showResponsibilities} onToggle={() => setShowResponsibilities(!showResponsibilities)}>
          <div className="space-y-2">
            {responsibilities.map((resp, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  value={resp}
                  onChange={(e) => {
                    const copy = [...responsibilities];
                    copy[i] = e.target.value;
                    setResponsibilities(copy);
                  }}
                  rows={2}
                  placeholder="Job responsibility..."
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeResponsibility(i)} className="mt-1">Remove</Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button
                onClick={() => setResponsibilities([...responsibilities, ""])}
                variant="outline"
              >
                + Add Responsibility
              </Button>
              <Button
                onClick={handleAIResponsibilities}
                disabled={aiLoading.responsibilities || (!profession && !customProfession)}
                variant="outline"
                className="border-primary/50 premium-button cinematic-glow-hover"
                title={!profession && !customProfession ? "Please select or enter a profession first" : ""}
              >
                {aiLoading.responsibilities ? "✨ Generating..." : "✨ AI Generate All"}
              </Button>
            </div>
            {!profession && !customProfession && (
              <p className="text-sm text-muted-foreground">Select or enter a profession above to use AI generation</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Skills */}
        <CollapsibleSection title="Skills & Technologies" isOpen={showSkills} onToggle={() => setShowSkills(!showSkills)}>
          <div className="space-y-2">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <Input value={s.name} onChange={(e) => {
                  const copy = [...skills];
                  copy[copy.findIndex(sk => sk.id === s.id)].name = e.target.value;
                  setSkills(copy);
                }} placeholder="Skill name" />
                <Button variant="ghost" size="sm" onClick={() => removeSkill(s.id)}>Remove</Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="button" onClick={addSkill} variant="outline">+ Add Skill</Button>
              <Button
                onClick={handleAISkillSuggestions}
                disabled={aiLoading.skills || (!profession && !customProfession)}
                variant="outline"
                className="border-primary/50 premium-button cinematic-glow-hover"
                title={!profession && !customProfession ? "Please select or enter a profession first" : ""}
              >
                {aiLoading.skills ? "✨ Generating..." : "✨ AI Generate All"}
              </Button>
            </div>
            {!profession && !customProfession && (
              <p className="text-sm text-muted-foreground">Select or enter a profession above to get profession-specific skill suggestions</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Experience */}
        <CollapsibleSection title="Work Experience" isOpen={showExperience} onToggle={() => setShowExperience(!showExperience)}>
          <div className="space-y-4">
            {experience.map((exp, i) => (
              <div key={exp.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience #{i + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeExp(exp.id)}>Remove</Button>
                </div>
                <Input value={exp.role} onChange={(e) => updateExp(i, "role", e.target.value)} placeholder="Job Title" />
                <Input value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} placeholder="Company Name" />
                <Input value={exp.period} onChange={(e) => updateExp(i, "period", e.target.value)} placeholder="Jan 2020 - Present" />
                <Textarea value={exp.description} onChange={(e) => updateExp(i, "description", e.target.value)} rows={3} placeholder="Job description..." />
              </div>
            ))}
            <Button type="button" onClick={addExp} variant="outline">+ Add Experience</Button>
          </div>
        </CollapsibleSection>

        {/* Education */}
        <CollapsibleSection title="Education" isOpen={showEducation} onToggle={() => setShowEducation(!showEducation)}>
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={edu.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Education #{i + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeEdu(edu.id)}>Remove</Button>
                </div>
                <Input value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} placeholder="Degree" />
                <Input value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} placeholder="Institution" />
                <Input value={edu.period} onChange={(e) => updateEdu(i, "period", e.target.value)} placeholder="2018 - 2022" />
                <Textarea value={edu.description} onChange={(e) => updateEdu(i, "description", e.target.value)} rows={2} placeholder="Additional details..." />
              </div>
            ))}
            <Button type="button" onClick={addEdu} variant="outline">+ Add Education</Button>
          </div>
        </CollapsibleSection>

        {/* Projects */}
        <CollapsibleSection title="Projects" isOpen={showProjects} onToggle={() => setShowProjects(!showProjects)}>
          <div className="space-y-4">
            {projects.map((p, i) => (
              <div key={p.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Project #{i + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeProj(p.id)}>Remove</Button>
                </div>
                <Input value={p.title} onChange={(e) => updateProj(i, "title", e.target.value)} placeholder="Project Title" />
                <div className="relative">
                  <Textarea value={p.description} onChange={(e) => updateProj(i, "description", e.target.value)} rows={2} placeholder="Project description..." />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {p.title && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIProjectDescription(i)}
                        disabled={aiLoading[`project-${i}`]}
                        className="text-xs h-6 px-2"
                        title="Generate description with AI"
                      >
                        {aiLoading[`project-${i}`] ? "✨" : "✨"}
                      </Button>
                    )}
                    {p.description && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAIOptimize("project-description", p.description, i)}
                        disabled={aiLoading.optimize}
                        className="text-xs h-6 px-2"
                        title="Optimize description"
                      >
                        {aiLoading.optimize ? "⚡" : "⚡"}
                      </Button>
                    )}
                  </div>
                </div>
                <Input value={p.image || ""} onChange={(e) => updateProj(i, "image", e.target.value)} placeholder="Image URL" />
                <Input value={p.link || ""} onChange={(e) => updateProj(i, "link", e.target.value)} placeholder="Project URL" />
                <Input value={(p.tags || []).join(", ")} onChange={(e) => updateProj(i, "tags", e.target.value.split(",").map(t => t.trim()).filter(t => t))} placeholder="Tags (comma separated)" />
              </div>
            ))}
            <Button type="button" onClick={addProj} variant="outline">+ Add Project</Button>
          </div>
        </CollapsibleSection>

        {/* Contact */}
        <CollapsibleSection title="Contact Information" isOpen={showContact} onToggle={() => setShowContact(!showContact)}>
          <div className="space-y-4">
            <div>
              <label className="font-medium">Email</label>
              <Input type="email" value={contact.email} onChange={(e) => updateContact("email", e.target.value)} placeholder="your@email.com" />
            </div>
            <div>
              <label className="font-medium">Phone</label>
              <Input value={contact.phone} onChange={(e) => updateContact("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
            </div>
            <div>
              <label className="font-medium">Location</label>
              <Input value={contact.location} onChange={(e) => updateContact("location", e.target.value)} placeholder="City, Country" />
            </div>
          </div>
        </CollapsibleSection>
      </main>
    </div>
  );
}
