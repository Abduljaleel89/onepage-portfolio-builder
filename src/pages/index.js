import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";

const mergeObjects = (prev = {}, next = {}, respectExisting = false) => {
  if (!next || typeof next !== "object" || Array.isArray(next)) {
    return prev || {};
  }

  let changed = false;
  const result = { ...(prev || {}) };

  Object.entries(next).forEach(([key, value]) => {
    const shouldReplace =
      !respectExisting || result[key] === undefined || result[key] === null || result[key] === "";

    if (shouldReplace && result[key] !== value) {
      result[key] = value;
      changed = true;
    }
  });

  return changed ? result : prev || {};
};

const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (typeof left === "object" || typeof right === "object") {
      if (JSON.stringify(left) !== JSON.stringify(right)) {
        return false;
      }
    } else if (left !== right) {
      return false;
    }
  }
  return true;
};

const mergeArrays = (prev = [], next = [], respectExisting = false) => {
  if (!Array.isArray(next)) return prev || [];
  if (respectExisting && Array.isArray(prev) && prev.length) return prev || [];
  if (arraysEqual(prev, next)) return prev || [];
  return next;
};

const withFocusGuard = (callback) => {
  if (typeof document === "undefined") {
    callback();
    return;
  }

  const activeElement = document.activeElement;
  const focusKey = activeElement?.dataset?.focusKey;
  const selection =
    activeElement && "selectionStart" in activeElement
      ? {
          start: activeElement.selectionStart,
          end: activeElement.selectionEnd,
          direction: activeElement.selectionDirection,
        }
      : null;
  const previousScroll = typeof window !== "undefined"
    ? { x: window.scrollX, y: window.scrollY }
    : null;

  callback();

  requestAnimationFrame(() => {
    try {
      if (focusKey) {
        const target = document.querySelector(`[data-focus-key="${focusKey}"]`);
        if (target instanceof HTMLElement) {
          target.focus({ preventScroll: true });
          if (selection && "setSelectionRange" in target) {
            const { start, end, direction } = selection;
            if (start != null && end != null) {
              target.setSelectionRange(start, end, direction || "none");
            }
          }
          if (previousScroll) {
            window.scrollTo({ left: previousScroll.x, top: previousScroll.y, behavior: "auto" });
          }
          return;
        }
      }

      if (activeElement instanceof HTMLElement) {
        if (document.contains(activeElement)) {
          activeElement.focus({ preventScroll: true });
        } else if (typeof activeElement.focus === "function") {
          activeElement.focus();
        }
      }
      if (previousScroll) {
        window.scrollTo({ left: previousScroll.x, top: previousScroll.y, behavior: "auto" });
      }
    } catch (err) {
      console.warn("Failed to restore focus", err);
    }
  });
};

const formatTemplate = (template, replacements = {}) => {
  if (!template) return "";
  let output = template;
  Object.entries(replacements).forEach(([key, value]) => {
    const safeValue = value == null ? "" : String(value);
    output = output.replace(new RegExp(`\\{${key}\\}`, "gi"), safeValue);
  });
  return output.replace(/\{[^}]+\}/g, "");
};

export default function Home() {
  const STORAGE_KEY = "portfolio-builder-data-v1";
  const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
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
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const fileInputRef = useRef(null);
  const hasMountedRef = useRef(false);
  const hasUserInteractedRef = useRef(false);
  const persistTimeoutRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const resolvedTheme = theme === "system" ? undefined : theme;

  const markInteracted = () => {
    if (!hasUserInteractedRef.current) {
      hasUserInteractedRef.current = true;
    }
  };

  const applyData = (data = {}, options = {}) => {
    if (!data || typeof data !== "object") return;

    const { overwrite = false } = options;
    const respectExisting = !overwrite;

    if (data.profile) {
      withFocusGuard(() => setProfile((prev) => mergeObjects(prev, data.profile, respectExisting)));
    }
    if (data.social) {
      withFocusGuard(() => setSocial((prev) => mergeObjects(prev, data.social, respectExisting)));
    }
    if (data.contact) {
      withFocusGuard(() => setContact((prev) => mergeObjects(prev, data.contact, respectExisting)));
    }
    if (data.projects) {
      withFocusGuard(() => setProjects((prev) => mergeArrays(prev, data.projects, respectExisting)));
    }
    if (data.skills) {
      withFocusGuard(() => setSkills((prev) => mergeArrays(prev, data.skills, respectExisting)));
    }
    if (data.experience) {
      withFocusGuard(() => setExperience((prev) => mergeArrays(prev, data.experience, respectExisting)));
    }
    if (data.education) {
      withFocusGuard(() => setEducation((prev) => mergeArrays(prev, data.education, respectExisting)));
    }
    if (data.responsibilities) {
      withFocusGuard(() => setResponsibilities((prev) => mergeArrays(prev, data.responsibilities, respectExisting)));
    }
    if (typeof data.profession === "string") {
      withFocusGuard(() => {
        setProfession((prev) => {
          if (respectExisting && prev) return prev;
          const nextValue = data.profession || "";
          return prev === nextValue ? prev : nextValue;
        });
      });
    }
    if (typeof data.customProfession === "string") {
      withFocusGuard(() => {
        setCustomProfession((prev) => {
          if (respectExisting && prev) return prev;
          const nextValue = data.customProfession || "";
          return prev === nextValue ? prev : nextValue;
        });
      });
    }
  };

  const buildSnapshot = (overrides = {}) => ({
    profile: overrides.profile ?? profile,
    projects: overrides.projects ?? projects,
    social: overrides.social ?? social,
    skills: overrides.skills ?? skills,
    experience: overrides.experience ?? experience,
    education: overrides.education ?? education,
    contact: overrides.contact ?? contact,
    profession: overrides.profession ?? profession,
    customProfession: overrides.customProfession ?? customProfession,
    responsibilities: overrides.responsibilities ?? responsibilities,
  });

  const persistLocally = (data) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to persist portfolio data locally:", err);
    }
  };

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        applyData(parsed, { overwrite: true });
      }
    } catch (err) {
      console.error("Failed to load portfolio data from local storage:", err);
    }
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (persistTimeoutRef.current) {
      clearTimeout(persistTimeoutRef.current);
    }
    persistTimeoutRef.current = setTimeout(() => {
      persistLocally(buildSnapshot());
    }, 200);

    return () => {
      if (persistTimeoutRef.current) {
        clearTimeout(persistTimeoutRef.current);
      }
    };
  }, [
    profile,
    projects,
    social,
    skills,
    experience,
    education,
    contact,
    profession,
    customProfession,
    responsibilities,
  ]);

  useEffect(() => {
    fetch("/api/occupations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setOccupations(data);
      })
      .catch((err) => console.error("Failed to load occupations:", err));
  }, []);

  const selectedProfession = occupations.find((occ) => occ.slug === profession);
  const professionTitle = (customProfession && customProfession.trim()) || selectedProfession?.title || profession || "Professional";
  const safeName = profile.name && profile.name.trim() ? profile.name.trim() : "Your Name";
  const safeHeadline = profile.headline && profile.headline.trim() ? profile.headline.trim() : `${professionTitle} | Building Innovative Solutions`;
  const experienceSummary = experience.length ? `${experience.length} ${experience.length === 1 ? "year" : "years"}` : "";
  const skillNames = skills.map((s) => (s?.name || "").trim()).filter(Boolean);
  const skillSummary = skillNames.length ? skillNames.join(", ") : "various technologies";
  const formattedBio = formatTemplate(profile.bio, {
    title: professionTitle,
    skills: skillSummary,
    name: safeName,
    headline: safeHeadline,
    experience: experienceSummary,
  }).trim();
  const displayBio = formattedBio || `I am ${safeName} specializing in ${professionTitle}. My expertise includes ${skillSummary}.`;
  const socialLinks = [
    { label: "GitHub", value: social.github },
    { label: "LinkedIn", value: social.linkedin },
    { label: "Twitter", value: social.twitter },
    { label: "Website", value: social.website },
  ]
    .map((link) => ({ ...link, value: link.value?.trim() }))
    .filter((link) => !!link.value);

  const contactEntries = [
    { label: "Email", value: contact.email?.trim() },
    { label: "Phone", value: contact.phone?.trim() },
    { label: "Location", value: contact.location?.trim() },
  ].filter((item) => !!item.value);

  const responsibilitiesToShow = responsibilities.filter((item) => item && item.trim());
  const projectsToShow = projects.filter((project) => project.title || project.description);
  const experienceToShow = experience.filter((item) => item.role || item.company || item.description);
  const educationToShow = education.filter((item) => item.degree || item.institution || item.description);

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
                  className="premium-button cinematic-glow-hover"
                  disabled={downloadingPdf}
                  onClick={handleDownloadPDF}
                >
                  {downloadingPdf ? "Generating..." : "⬇️ Download PDF"}
                </Button>
                <Button 
                  variant="outline" 
                  className="premium-button cinematic-glow"
                  onClick={() => setPreviewMode(false)}
                >
                  Edit Portfolio
                </Button>
              </div>
            </div>
          </div>

          {/* CV Container */}
          <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none my-8 print:my-0 rounded-lg overflow-hidden animate-fade-in-up cinematic-glow cv-container">
            <div className="p-8 print:p-6">
              {/* CV Header */}
              <div className="border-b-2 border-primary pb-6 mb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 -mx-8 px-8 py-6 print:bg-transparent">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 animate-slide-in-right">
                    <h1 className="cv-name text-4xl font-bold mb-2">
                      {safeName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-3 font-medium print:text-gray-900">{safeHeadline}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 cv-header-meta">
                      {contactEntries.map((entry) => (
                        <span key={entry.label}>{entry.label}: {entry.value}</span>
                      ))}
                    </div>
                    {socialLinks.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3 cv-header-links">
                        {socialLinks.map((link) => (
                          <a key={link.label} href={link.value.startsWith("http") ? link.value : `https://${link.value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                            {link.label}
                          </a>
                        ))}
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
              {displayBio && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Professional Summary
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{displayBio}</p>
                </section>
              )}

              {/* Job Responsibilities */}
              {responsibilitiesToShow.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Key Responsibilities
                  </h2>
                  <ul className="space-y-1 text-gray-700">
                    {responsibilitiesToShow.map((resp, i) => (
                      <li key={i} className="leading-relaxed cv-list-item">{resp}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Skills */}
              {skillNames.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Technical Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skillNames.map((name) => (
                      <span key={name} className="cv-chip">
                        {name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Experience */}
              {experienceToShow.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Professional Experience
                  </h2>
                  <div className="cv-timeline">
                    {experienceToShow.map((exp) => (
                      <div key={exp.id} className="cv-timeline-item">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{exp.role || "Role"}</h3>
                          <span className="text-sm text-gray-600 font-medium">{exp.period || experienceSummary || "Timeline"}</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">{exp.company || professionTitle}</p>
                        {exp.description && (
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {educationToShow.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Education
                  </h2>
                  <div className="cv-timeline">
                    {educationToShow.map((edu) => (
                      <div key={edu.id} className="cv-timeline-item">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-lg text-gray-900">{edu.degree || "Degree"}</h3>
                          <span className="text-sm text-gray-600 font-medium">{edu.period || "Timeline"}</span>
                        </div>
                        <p className="text-gray-700 font-medium mb-1">{edu.institution || professionTitle}</p>
                        {edu.description && (
                          <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {projectsToShow.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Projects
                  </h2>
                  <div className="space-y-4">
                    {projectsToShow.map((p) => (
                      <div key={p.id} className="p-4 cv-project-card">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{p.title || "Project Title"}</h3>
                          {p.link && (
                            <a href={p.link.startsWith("http") ? p.link : `https://${p.link}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm print:text-gray-900">
                              View →
                            </a>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-gray-700 text-sm mb-2 leading-relaxed">{p.description}</p>
                        )}
                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
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

              {/* Contact */}
              {contactEntries.length > 0 && (
                <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded"></span>
                    Contact Information
                  </h2>
                  <ul className="space-y-1 text-gray-700 cv-contact-list">
                    {contactEntries.map((entry) => (
                      <li key={entry.label} className="cv-contact-item"><strong>{entry.label}:</strong> {entry.value}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
    );
  }

  const update = (k, v) => {
    markInteracted();
    withFocusGuard(() => setProfile((p) => ({ ...p, [k]: v })));
  };
  const updateSocial = (k, v) => {
    markInteracted();
    withFocusGuard(() => setSocial((s) => ({ ...s, [k]: v })));
  };
  const updateContact = (k, v) => {
    markInteracted();
    withFocusGuard(() => setContact((c) => ({ ...c, [k]: v })));
  };
  const updateProj = (i, k, v) => {
    markInteracted();
    withFocusGuard(() =>
      setProjects((p) => {
        const copy = [...p];
        copy[i] = { ...copy[i], [k]: v };
        return copy;
      })
    );
  };
  const updateExp = (i, k, v) => {
    markInteracted();
    withFocusGuard(() =>
      setExperience((e) => {
        const copy = [...e];
        copy[i] = { ...copy[i], [k]: v };
        return copy;
      })
    );
  };
  const updateEdu = (i, k, v) => {
    markInteracted();
    withFocusGuard(() =>
      setEducation((e) => {
        const copy = [...e];
        copy[i] = { ...copy[i], [k]: v };
        return copy;
      })
    );
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setStatus("No file selected");
      setTimeout(() => setStatus(""), 2000);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file");
      setTimeout(() => setStatus(""), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("File size must be less than 5MB");
      setTimeout(() => setStatus(""), 2000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const nextProfile = { ...profile, avatar: dataUrl };
      markInteracted();
      withFocusGuard(() => setProfile(nextProfile));
      persistLocally(buildSnapshot({ profile: nextProfile }));
      setStatus("Photo updated");
    } catch (err) {
      console.error("Failed to read avatar:", err);
      setStatus("Failed to load image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const addSkill = (e) => {
    if (e) e.preventDefault();
    const skill = prompt("Enter skill name:");
    if (skill) {
      markInteracted();
      withFocusGuard(() => setSkills([...skills, { id: createId(), name: skill, level: "intermediate" }]));
    }
  };
  const removeSkill = (id) => {
    markInteracted();
    withFocusGuard(() => setSkills(skills.filter((s) => s.id !== id)));
  };

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
      markInteracted();
      const newSkills = [];
      result.forEach(skill => {
        if (!skills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
          newSkills.push({ id: createId(), name: skill, level: "intermediate" });
        }
      });
      if (newSkills.length > 0) {
        withFocusGuard(() => setSkills([...skills, ...newSkills]));
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
      markInteracted();
      withFocusGuard(() => setResponsibilities(result));
      setStatus(`Generated ${result.length} responsibilities ✓`);
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const removeResponsibility = (index) => {
    markInteracted();
    withFocusGuard(() => setResponsibilities(responsibilities.filter((_, i) => i !== index)));
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
    markInteracted();
    withFocusGuard(() => setProjects([...projects, { id: createId(), title: "", description: "", image: "", link: "", tags: [] }]));
  };
  const removeProj = (id) => {
    markInteracted();
    withFocusGuard(() => setProjects(projects.filter((p) => p.id !== id)));
  };

  const addExp = (e) => {
    if (e) e.preventDefault();
    markInteracted();
    withFocusGuard(() => setExperience([...experience, { id: createId(), company: "", role: "", period: "", description: "" }]));
  };
  const removeExp = (id) => {
    markInteracted();
    withFocusGuard(() => setExperience(experience.filter((e) => e.id !== id)));
  };

  const addEdu = (e) => {
    if (e) e.preventDefault();
    markInteracted();
    withFocusGuard(() => setEducation([...education, { id: createId(), institution: "", degree: "", period: "", description: "" }]));
  };
  const removeEdu = (id) => {
    markInteracted();
    withFocusGuard(() => setEducation(education.filter((e) => e.id !== id)));
  };

  const resetAll = async () => {
    hasUserInteractedRef.current = false;
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
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
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
    const snapshot = buildSnapshot();
    persistLocally(snapshot);
    setStatus("Saving...");
    try {
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      setStatus("Saved ✓");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setStatus("Saved locally (offline)");
    }
    setTimeout(() => setStatus(""), 2000);
  };

  const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
    <Card className="mb-6 premium-card">
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

  async function handleDownloadPDF() {
    try {
      setDownloadingPdf(true);
      const element = document.querySelector('.cv-container');
      if (!element) {
        setStatus("Open preview before downloading.");
        setDownloadingPdf(false);
        return;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      element.classList.add("pdf-capture");

      const devicePixelRatio = window.devicePixelRatio || 1;
      const renderScale = Math.min(4, Math.max(2, devicePixelRatio * 2));

      const canvas = await html2canvas(element, {
        scale: renderScale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      const margin = 36;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pageWidth / canvasWidth;
      const imgHeight = canvasHeight * ratio;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, pageWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > -pageHeight) {
        if (heightLeft <= 0) {
          break;
        }
        pdf.addPage();
        position = margin - heightLeft;
        pdf.addImage(imgData, "PNG", margin, position, pageWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const fileName = `${(profile.name || customProfession || professionTitle).replace(/\s+/g, "-") || "portfolio"}-cv.pdf`;
      await pdf.save(fileName, { returnPromise: true });
      setStatus("PDF downloaded");
    } catch (err) {
      console.error("Failed to download PDF", err);
      setStatus("Failed to generate PDF");
    } finally {
      if (element && element.classList) {
        element.classList.remove("pdf-capture");
      }
      setDownloadingPdf(false);
    }
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
        <Card className="mb-6 premium-card">
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
              <label className="font-medium mb-2 block" htmlFor="profile-name">Name</label>
              <Input
                id="profile-name"
                data-focus-key="profile.name"
                value={profile.name}
                placeholder="John Doe"
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium mb-2 block" htmlFor="profession-select">Profession</label>
              <select
                id="profession-select"
                data-focus-key="profile.profession"
                value={profession}
                onChange={(e) => {
                  markInteracted();
                  const value = e.target.value;
                  setProfession(value);
                  if (value) {
                    withFocusGuard(() => setCustomProfession(""));
                  }
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
                  data-focus-key="profile.customProfession"
                  value={customProfession}
                  onChange={(e) => {
                    markInteracted();
                    const value = e.target.value;
                    setCustomProfession(value);
                    if (value) setProfession(""); // Clear dropdown when typing custom
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
              <Input
                data-focus-key="profile.headline"
                value={profile.headline}
                onChange={(e) => update("headline", e.target.value)}
                placeholder="Full Stack Developer"
              />
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
              <Textarea
                data-focus-key="profile.bio"
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <CollapsibleSection title="Social Media Links" isOpen={showSocial} onToggle={() => setShowSocial(!showSocial)}>
          <div className="space-y-4">
            <div>
              <label className="font-medium mb-1 block">GitHub</label>
              <Input
                data-focus-key="social.github"
                value={social.github}
                onChange={(e) => updateSocial("github", e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">LinkedIn</label>
              <Input
                data-focus-key="social.linkedin"
                value={social.linkedin}
                onChange={(e) => updateSocial("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Twitter</label>
              <Input
                data-focus-key="social.twitter"
                value={social.twitter}
                onChange={(e) => updateSocial("twitter", e.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Website</label>
              <Input
                data-focus-key="social.website"
                value={social.website}
                onChange={(e) => updateSocial("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Email</label>
              <Input
                type="email"
                data-focus-key="social.email"
                value={social.email}
                onChange={(e) => updateSocial("email", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Job Responsibilities */}
        <CollapsibleSection title="Job Responsibilities" isOpen={showResponsibilities} onToggle={() => setShowResponsibilities(!showResponsibilities)}>
          <div className="space-y-2">
            {responsibilities.map((resp, i) => (
              <div key={i} className="flex items-start gap-2">
                <Textarea
                  data-focus-key={`responsibilities.${i}`}
                  value={resp}
                  onChange={(e) => {
                    markInteracted();
                    const copy = [...responsibilities];
                    copy[i] = e.target.value;
                    withFocusGuard(() => setResponsibilities(copy));
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
                onClick={() => {
                  markInteracted();
                  withFocusGuard(() => setResponsibilities([...responsibilities, ""]));
                }}
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
                <Input
                  data-focus-key={`skills.${s.id}`}
                  value={s.name}
                  onChange={(e) => {
                    markInteracted();
                    const copy = [...skills];
                    const index = copy.findIndex((sk) => sk.id === s.id);
                    if (index !== -1) {
                      copy[index] = { ...copy[index], name: e.target.value };
                      withFocusGuard(() => setSkills(copy));
                    }
                  }}
                  placeholder="Skill name"
                />
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
                <Input
                  data-focus-key={`experience.${exp.id}.role`}
                  value={exp.role}
                  onChange={(e) => updateExp(i, "role", e.target.value)}
                  placeholder="Job Title"
                />
                <Input
                  data-focus-key={`experience.${exp.id}.company`}
                  value={exp.company}
                  onChange={(e) => updateExp(i, "company", e.target.value)}
                  placeholder="Company Name"
                />
                <Input
                  data-focus-key={`experience.${exp.id}.period`}
                  value={exp.period}
                  onChange={(e) => updateExp(i, "period", e.target.value)}
                  placeholder="Jan 2020 - Present"
                />
                <Textarea
                  data-focus-key={`experience.${exp.id}.description`}
                  value={exp.description}
                  onChange={(e) => updateExp(i, "description", e.target.value)}
                  rows={3}
                  placeholder="Job description..."
                />
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
                <Input
                  data-focus-key={`education.${edu.id}.degree`}
                  value={edu.degree}
                  onChange={(e) => updateEdu(i, "degree", e.target.value)}
                  placeholder="Degree"
                />
                <Input
                  data-focus-key={`education.${edu.id}.institution`}
                  value={edu.institution}
                  onChange={(e) => updateEdu(i, "institution", e.target.value)}
                  placeholder="Institution"
                />
                <Input
                  data-focus-key={`education.${edu.id}.period`}
                  value={edu.period}
                  onChange={(e) => updateEdu(i, "period", e.target.value)}
                  placeholder="2018 - 2022"
                />
                <Textarea
                  data-focus-key={`education.${edu.id}.description`}
                  value={edu.description}
                  onChange={(e) => updateEdu(i, "description", e.target.value)}
                  rows={2}
                  placeholder="Additional details..."
                />
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIOptimize("project-description", p.description || "", i)}
                      disabled={aiLoading[`project-${p.id}`]}
                      className="premium-button cinematic-glow-hover"
                    >
                      {aiLoading[`project-${p.id}`] ? "⚙️ Optimizing..." : "⚡ Optimize"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeProj(p.id)}>Remove</Button>
                  </div>
                </div>
                <Input
                  data-focus-key={`projects.${p.id}.title`}
                  value={p.title}
                  onChange={(e) => updateProj(i, "title", e.target.value)}
                  placeholder="Project Title"
                />
                <Textarea
                  data-focus-key={`projects.${p.id}.description`}
                  value={p.description}
                  onChange={(e) => updateProj(i, "description", e.target.value)}
                  rows={2}
                  placeholder="Project description..."
                />
                <Input
                  data-focus-key={`projects.${p.id}.image`}
                  value={p.image || ""}
                  onChange={(e) => updateProj(i, "image", e.target.value)}
                  placeholder="Image URL"
                />
                <Input
                  data-focus-key={`projects.${p.id}.link`}
                  value={p.link || ""}
                  onChange={(e) => updateProj(i, "link", e.target.value)}
                  placeholder="Project URL"
                />
                <Input
                  data-focus-key={`projects.${p.id}.tags`}
                  value={(p.tags || []).join(", ")}
                  onChange={(e) => updateProj(i, "tags", e.target.value.split(",").map((t) => t.trim()).filter((t) => t))}
                  placeholder="Tags (comma separated)"
                />
              </div>
            ))}
            <Button type="button" onClick={addProj} variant="outline">+ Add Project</Button>
          </div>
        </CollapsibleSection>

        {/* Contact */}
        <CollapsibleSection title="Contact Information" isOpen={showContact} onToggle={() => setShowContact(!showContact)}>
          <div className="grid gap-4">
            <div>
              <label className="font-medium mb-1 block">Email</label>
              <Input
                type="email"
                data-focus-key="contact.email"
                value={contact.email}
                onChange={(e) => updateContact("email", e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Phone</label>
              <Input
                data-focus-key="contact.phone"
                value={contact.phone}
                onChange={(e) => updateContact("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Location</label>
              <Input
                data-focus-key="contact.location"
                value={contact.location}
                onChange={(e) => updateContact("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        </CollapsibleSection>
      </main>
    </div>
  );
}
