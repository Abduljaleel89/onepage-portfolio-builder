import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import Logo from "@/components/logo";
import { sanitizeUrl, validateUrl, validateEmail, validatePhone, calculateExperienceYears } from "@/lib/sanitize";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import AutoSaveIndicator from "@/components/AutoSaveIndicator";
import { processImageForPDF } from "@/lib/pdfImageFix";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProfileSection from "@/components/sections/ProfileSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ResponsibilitiesSection from "@/components/sections/ResponsibilitiesSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import EducationSection from "@/components/sections/EducationSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import { apiClient } from "@/lib/apiClient";
import TemplateSelector from "@/components/TemplateSelector";
import { DEFAULT_TEMPLATE } from "@/lib/templates";
import SocialShare from "@/components/SocialShare";
import CustomSection from "@/components/sections/CustomSection";
import LanguageSelector from "@/components/LanguageSelector";
import { t, getLanguage, setLanguage } from "@/lib/i18n";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

// Lazy load heavy components for better performance
const PreviewSection = lazy(() => import("@/components/sections/PreviewSection"));

const STORAGE_KEY = "portfolio-builder-data-v1";
const STATUS_CLEAR_DELAY = 2000;

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const createEmptyProfile = () => ({ name: "", headline: "", bio: "", avatar: "" });
const createEmptySocial = () => ({ github: "", linkedin: "", twitter: "", website: "", email: "" });
const createEmptyContact = () => ({ email: "", phone: "", location: "" });

const createSkill = (partial = {}) => ({
  id: partial.id || createId(),
  name: typeof partial === "string" ? partial : partial.name || "",
  level: partial.level || "intermediate",
});

const createProject = (partial = {}) => ({
  id: partial.id || createId(),
  title: partial.title || "",
  description: partial.description || "",
  image: partial.image || "",
  link: partial.link || "",
  tags: Array.isArray(partial.tags) ? partial.tags.filter(Boolean) : [],
});

const createExperience = (partial = {}) => ({
  id: partial.id || createId(),
  company: partial.company || "",
  role: partial.role || "",
  period: partial.period || "",
  description: partial.description || "",
  location: partial.location || "",
});

const createEducation = (partial = {}) => ({
  id: partial.id || createId(),
  institution: partial.institution || "",
  degree: partial.degree || "",
  period: partial.period || "",
  description: partial.description || "",
});

const createCustomSection = (partial = {}) => ({
  id: partial.id || createId(),
  title: partial.title || "",
  content: partial.content || "",
});

const createEmptyPortfolio = () => ({
  profile: createEmptyProfile(),
  social: createEmptySocial(),
  contact: createEmptyContact(),
  projects: [],
  skills: [],
  experience: [],
  education: [],
  responsibilities: [],
  customSections: [],
  profession: "",
  customProfession: "",
});

const normalizePortfolio = (input) => {
  const base = createEmptyPortfolio();
  const source = { ...base, ...(input || {}) };

  return {
    ...source,
    profile: { ...base.profile, ...(source.profile || {}) },
    social: { ...base.social, ...(source.social || {}) },
    contact: { ...base.contact, ...(source.contact || {}) },
    profession: typeof source.profession === "string" ? source.profession : "",
    customProfession: typeof source.customProfession === "string" ? source.customProfession : "",
    responsibilities: Array.isArray(source.responsibilities)
      ? source.responsibilities.map((item) => (typeof item === "string" ? item : "")).filter(Boolean)
      : [],
    skills: Array.isArray(source.skills)
      ? source.skills.map((item) => createSkill(item))
      : [],
    projects: Array.isArray(source.projects)
      ? source.projects.map((item) => createProject(item))
      : [],
    experience: Array.isArray(source.experience)
      ? source.experience.map((item) => createExperience(item))
      : [],
    education: Array.isArray(source.education)
      ? source.education.map((item) => createEducation(item))
      : [],
    customSections: Array.isArray(source.customSections)
      ? source.customSections.map((item) => createCustomSection(item))
      : [],
  };
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
  const { theme, setTheme } = useTheme();
  const resolvedTheme = theme === "system" ? undefined : theme;
  
  // Initialize language state to prevent hydration mismatch
  const [currentLang, setCurrentLang] = useState("en");
  const [isClient, setIsClient] = useState(false);

  const [portfolio, setPortfolio] = useState(() => createEmptyPortfolio());
  const [occupations, setOccupations] = useState([]);
  const [professionSearch, setProfessionSearch] = useState("");
  const [debouncedProfessionSearch, setDebouncedProfessionSearch] = useState("");

  const [showProjects, setShowProjects] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [showSkills, setShowSkills] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showResponsibilities, setShowResponsibilities] = useState(true);
  const [showCustomSections, setShowCustomSections] = useState(true);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TEMPLATE;
    try {
      return window.localStorage.getItem("portfolio-template") || DEFAULT_TEMPLATE;
    } catch {
      return DEFAULT_TEMPLATE;
    }
  });

  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiLoading, setAiLoading] = useState({});
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved", "saving", "error"

  const persistTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const themeTransitionTimeoutRef = useRef(null);
  const aiHandlersRef = useRef({});

  const applyThemeTransition = useCallback(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("theme-transition");
    if (themeTransitionTimeoutRef.current) {
      clearTimeout(themeTransitionTimeoutRef.current);
    }
    themeTransitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove("theme-transition");
      themeTransitionTimeoutRef.current = null;
    }, 400);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = resolvedTheme || "light";
    const nextTheme = current === "light" ? "dark" : "light";
    applyThemeTransition();
    setTheme(nextTheme);
  }, [applyThemeTransition, resolvedTheme, setTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsClient(true);
    // Initialize language from localStorage only on client
    const lang = getLanguage();
    setCurrentLang(lang);
    setLanguage(lang);
    
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPortfolio(normalizePortfolio(parsed));
      } else {
        setPortfolio(createEmptyPortfolio());
      }
    } catch (err) {
      console.error("Failed to load stored portfolio:", err);
      setPortfolio(createEmptyPortfolio());
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch("/api/occupations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setOccupations(data);
      })
      .catch((err) => console.error("Failed to load occupations:", err));
  }, []);

  // Debounce profession search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProfessionSearch(professionSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [professionSearch]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    setSaveStatus("saving");
    persistTimeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to persist portfolio:", err);
        setSaveStatus("error");
      }
    }, 250);
    return () => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, [portfolio, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("portfolio-template", selectedTemplate);
    } catch (err) {
      console.error("Failed to save template preference:", err);
    }
  }, [selectedTemplate]);

  useEffect(
    () => () => {
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
      if (themeTransitionTimeoutRef.current) clearTimeout(themeTransitionTimeoutRef.current);
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("theme-transition");
      }
    },
    []
  );

  const setStatusMessage = useCallback((message, duration = STATUS_CLEAR_DELAY) => {
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    setStatus(message);
    if (message && duration) {
      statusTimeoutRef.current = setTimeout(() => setStatus(""), duration);
    }
  }, []);

  const updateProfileField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  }, []);

  const updateSocialField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  }, []);

  const updateContactField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  }, []);

  const addSkill = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      skills: [...prev.skills, createSkill()],
    }));
  }, []);

  const updateSkill = useCallback((id, value) => {
    setPortfolio((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, name: value } : skill)),
    }));
  }, []);

  const removeSkill = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  }, []);

  const addResponsibility = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""],
    }));
  }, []);

  const updateResponsibility = useCallback((index, value) => {
    setPortfolio((prev) => {
      const next = [...prev.responsibilities];
      next[index] = value;
      return { ...prev, responsibilities: next };
    });
  }, []);

  const removeResponsibility = useCallback((index) => {
    setPortfolio((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  }, []);

  const addProject = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      projects: [...prev.projects, createProject()],
    }));
  }, []);

  const updateProject = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    }));
  }, []);

  const removeProject = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  }, []);

  const addCustomSection = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), createCustomSection()],
    }));
  }, []);

  const updateCustomSection = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((section) =>
        section.id === id ? { ...section, [field]: value } : section
      ),
    }));
  }, []);

  const removeCustomSection = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((section) => section.id !== id),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      experience: [...prev.experience, createExperience()],
    }));
  }, []);

  const updateExperience = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeExperience = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      education: [...prev.education, createEducation()],
    }));
  }, []);

  const updateEducation = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeEducation = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  }, []);

  const handleSelectProfession = useCallback((slug) => {
    setPortfolio((prev) => ({
      ...prev,
      profession: slug,
      customProfession: slug ? "" : prev.customProfession,
    }));
  }, []);

  const handleProfessionSelect = useCallback((occ) => {
    handleSelectProfession(occ.slug);
    setProfessionSearch("");
  }, [handleSelectProfession]);

  const handleCustomProfessionChange = useCallback((value) => {
    setPortfolio((prev) => ({
      ...prev,
      customProfession: value,
      profession: value ? "" : prev.profession,
    }));
  }, []);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setStatusMessage("No file selected");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please select an image file");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage("File must be smaller than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      // Use upload API instead of base64 to avoid localStorage size issues
      const formData = new FormData();
      formData.append("file", file);
      
      const data = await apiClient.upload("/api/uploads", formData, {
        retries: 2,
      });
      const avatarUrl = data.url;
      
      setPortfolio((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatar: avatarUrl },
      }));
      setStatusMessage("Photo updated ✓");
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setStatusMessage(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetAll = async () => {
    setShowResetConfirm(false);
    const empty = createEmptyPortfolio();
    setPortfolio(empty);
    setStatusMessage("Reset ✓");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    try {
      await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empty),
      });
    } catch (err) {
      console.error("Failed to reset on server:", err);
    }
  };

  const save = async () => {
    const snapshot = normalizePortfolio(portfolio);
    setStatus("Saving...");
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      }
      await apiClient.post("/api/me/profile", snapshot, { retries: 2 });
      setStatusMessage("Saved ✓");
    } catch (err) {
      console.error("Failed to save portfolio:", err);
      setStatusMessage("Saved locally (offline)");
    }
  };

  const runAiTask = useCallback(
    async (loadingKey, payload) => {
      setAiLoading((prev) => ({ ...prev, [loadingKey]: true }));
      try {
      const data = await apiClient.post("/api/ai/generate", payload, { retries: 2 });
      return data.result ?? null;
      } catch (err) {
        console.error("AI generation error:", err);
        setStatusMessage("AI generation failed");
        return null;
      } finally {
        setAiLoading((prev) => {
          const next = { ...prev };
          delete next[loadingKey];
          return next;
        });
      }
    },
    [setStatusMessage]
  );

  const handleAIBio = async () => {
    const { profile, skills, experience, profession, customProfession } = portfolio;
    const selectedProfession = occupations.find((occ) => occ.slug === profession);
    const result = await runAiTask("bio", {
      type: "bio",
      input: {
        name: profile.name,
        headline: profile.headline,
        experience,
        skills: skills.map((skill) => skill.name),
        profession: profession || customProfession,
      },
      context: { professionData: selectedProfession },
    });
    if (result) {
      updateProfileField("bio", result);
      setStatusMessage("Bio updated ✓");
    }
  };

  const handleAIHeadline = async () => {
    const { profile, skills, experience, profession, customProfession } = portfolio;
    const selectedProfession = occupations.find((occ) => occ.slug === profession);
    const result = await runAiTask("headline", {
      type: "headline",
      input: {
        role: profile.headline,
        skills: skills.map((skill) => skill.name),
        experience: experience.length,
        profession: profession || customProfession,
        name: profile.name,
      },
      context: { professionData: selectedProfession },
    });
    if (result) {
      updateProfileField("headline", result);
      setStatusMessage("Headline updated ✓");
    }
  };

  const handleAISkillSuggestions = async () => {
    const { experience, education, skills, profession, customProfession } = portfolio;
    const selectedProfession = occupations.find((occ) => occ.slug === profession);
    const result = await runAiTask("skills", {
      type: "skills",
      input: {
        experience,
        education,
        existingSkills: skills,
        profession: profession || customProfession,
      },
      context: { professionData: selectedProfession },
    });
    if (Array.isArray(result) && result.length) {
      const existingNames = new Set(skills.map((skill) => skill.name.toLowerCase()));
      const additions = result
        .map((name) => name.trim())
        .filter((name) => name && !existingNames.has(name.toLowerCase()))
        .map((name) => createSkill({ name }));
      if (additions.length) {
        setPortfolio((prev) => ({
          ...prev,
          skills: [...prev.skills, ...additions],
        }));
        setStatusMessage(`Added ${additions.length} skills ✓`);
      } else {
        setStatusMessage("All suggested skills already added");
      }
    }
  };

  const handleAIResponsibilities = async () => {
    const { profession, customProfession } = portfolio;
    if (!profession && !customProfession) {
      setStatusMessage("Select a profession first");
      return;
    }
    const selectedProfession = occupations.find((occ) => occ.slug === profession);
    const result = await runAiTask("responsibilities", {
      type: "responsibilities",
      input: { profession: profession || customProfession },
      context: { professionData: selectedProfession },
    });
    if (Array.isArray(result) && result.length) {
      setPortfolio((prev) => ({
        ...prev,
        responsibilities: result.filter(Boolean),
      }));
      setStatusMessage(`Generated ${result.length} responsibilities ✓`);
    }
  };

  const handleAIProjectDescription = async (project) => {
    const result = await runAiTask(`project-${project.id}`, {
      type: "project-description",
      input: {
        title: project.title,
        technologies: project.tags,
        problem: project.description,
      },
    });
    if (result) {
      updateProject(project.id, "description", result);
      setStatusMessage("Project description updated ✓");
    }
  };

  const handleAIOptimize = async (type, content, identifier) => {
    const result = await runAiTask(`optimize-${type}-${identifier ?? "general"}`, {
      type: "optimize",
      input: { content, type },
    });
    if (!result) return;
    if (type === "bio") {
      updateProfileField("bio", result);
      setStatusMessage("Bio optimized ✓");
    } else if (type === "project-description" && identifier) {
      updateProject(identifier, "description", result);
      setStatusMessage("Project optimized ✓");
    }
  };

  const prepareExportData = useCallback(async () => {
    const { profile, customProfession, profession } = portfolio;
    const selectedProfession = occupations.find((occ) => occ.slug === profession);
    const professionTitle =
      customProfession?.trim() || selectedProfession?.title || profession || "Professional";
    const skillNames = portfolio.skills.map((skill) => skill.name.trim()).filter(Boolean);
    const contactEntries = [
      { label: "Email", value: portfolio.contact.email?.trim() },
      { label: "Phone", value: portfolio.contact.phone?.trim() },
      { label: "Location", value: portfolio.contact.location?.trim() },
    ].filter((item) => item.value);
    const socialLinks = [
      { label: "GitHub", value: portfolio.social.github },
      { label: "LinkedIn", value: portfolio.social.linkedin },
      { label: "Twitter", value: portfolio.social.twitter },
      { label: "Website", value: portfolio.social.website },
    ]
      .map((item) => ({ ...item, value: item.value?.trim() }))
      .filter((item) => item.value);

    const safeName = profile.name?.trim() || "Your Name";
    const safeHeadline =
      profile.headline?.trim() || `${professionTitle} | Building Innovative Solutions`;
    const experienceYears = calculateExperienceYears(
      portfolio.experience.filter((item) => item.role || item.company || item.description)
    );
    const experienceSummary = experienceYears
      ? `${experienceYears} ${experienceYears === 1 ? "year" : "years"}`
      : "";
    const formattedBio = formatTemplate(profile.bio, {
      title: professionTitle,
      skills: skillNames.join(", "),
      name: safeName,
      headline: safeHeadline,
      experience: experienceSummary,
    }).trim();
    const displayBio =
      formattedBio ||
      `I am ${safeName} specializing in ${professionTitle}. My expertise includes ${
        skillNames.join(", ") || "various technologies"
      }.`;

    return {
      safeName,
      safeHeadline,
      professionTitle,
      displayBio,
      contactEntries,
      socialLinks,
      responsibilities: portfolio.responsibilities.filter((item) => item.trim()),
      skills: skillNames,
      experience: portfolio.experience,
      education: portfolio.education,
      projects: portfolio.projects,
      profile,
      template: selectedTemplate,
    };
  }, [portfolio, occupations, selectedTemplate]);

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
      const exportData = await prepareExportData();
      
      // Process avatar image to fix orientation issues in PDF
      let processedAvatar = exportData.profile.avatar;
      if (processedAvatar && typeof processedAvatar === "string") {
        try {
          processedAvatar = await processImageForPDF(processedAvatar);
        } catch (err) {
          console.warn("Failed to process image for PDF:", err);
        }
      }
      
      const pdfData = {
        ...exportData,
        profile: {
          ...exportData.profile,
          avatar: processedAvatar,
        },
      };

      const response = await fetch("/api/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName =
        (exportData.profile.name || exportData.professionTitle || "portfolio").replace(/\s+/g, "-").toLowerCase() +
        "-cv.pdf";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("PDF downloaded ✓");
      
      // Track download
      try {
        await apiClient.post("/api/analytics/track", {
          event: "download",
          data: { format: "pdf" },
        });
      } catch (err) {
        // Silent fail for analytics
      }
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setStatusMessage("Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      setDownloadingPdf(true);
      const exportData = await prepareExportData();

      const response = await fetch("/api/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DOCX");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName =
        (exportData.profile.name || exportData.professionTitle || "portfolio").replace(/\s+/g, "-").toLowerCase() +
        "-cv.docx";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("DOCX downloaded ✓");
      
      // Track download
      try {
        await apiClient.post("/api/analytics/track", {
          event: "download",
          data: { format: "docx" },
        });
      } catch (err) {
        // Silent fail for analytics
      }
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      setStatusMessage("Failed to generate DOCX");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadHTML = async () => {
    try {
      setDownloadingPdf(true);
      const exportData = await prepareExportData();

      const response = await fetch("/api/export/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate HTML");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName =
        (exportData.profile.name || exportData.professionTitle || "portfolio").replace(/\s+/g, "-").toLowerCase() +
        "-portfolio.html";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("HTML downloaded ✓");
      
      // Track download
      try {
        await apiClient.post("/api/analytics/track", {
          event: "download",
          data: { format: "html" },
        });
      } catch (err) {
        // Silent fail for analytics
      }
    } catch (err) {
      console.error("Failed to generate HTML:", err);
      setStatusMessage("Failed to generate HTML");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const {
    profile,
    social,
    contact,
    projects,
    skills,
    experience,
    education,
    responsibilities,
    customSections,
    profession,
    customProfession,
  } = portfolio;

  const selectedProfession = occupations.find((occ) => occ.slug === profession);
  const professionTitle =
    customProfession?.trim() || selectedProfession?.title || profession || "Professional";
  const safeName = profile.name?.trim() || "Your Name";
  const safeHeadline =
    profile.headline?.trim() || `${professionTitle} | Building Innovative Solutions`;
  const skillNames = skills.map((skill) => skill.name.trim()).filter(Boolean);
  // Calculate actual years of experience from period strings
  const experienceYears = calculateExperienceYears(
    experience.filter((item) => item.role || item.company || item.description)
  );
  const experienceSummary = experienceYears
    ? `${experienceYears} ${experienceYears === 1 ? "year" : "years"}`
    : "";
  const formattedBio = formatTemplate(profile.bio, {
    title: professionTitle,
    skills: skillNames.join(", "),
    name: safeName,
    headline: safeHeadline,
    experience: experienceSummary,
  }).trim();
  const displayBio =
    formattedBio ||
    `I am ${safeName} specializing in ${professionTitle}. My expertise includes ${
      skillNames.join(", ") || "various technologies"
    }.`;

  const socialLinks = [
    { label: "GitHub", value: social.github },
    { label: "LinkedIn", value: social.linkedin },
    { label: "Twitter", value: social.twitter },
    { label: "Website", value: social.website },
  ]
    .map((link) => ({ ...link, value: link.value?.trim() }))
    .filter((link) => {
      if (!link.value) return false;
      // Validate URL before including
      return validateUrl(link.value);
    })
    .map((link) => ({ ...link, value: sanitizeUrl(link.value) }));

  const contactEntries = [
    { label: "Email", value: contact.email?.trim() },
    { label: "Phone", value: contact.phone?.trim() },
    { label: "Location", value: contact.location?.trim() },
  ].filter((item) => !!item.value);

  const responsibilitiesToShow = responsibilities.filter((item) => item && item.trim());
  const projectsToShow = projects.filter((project) => project.title || project.description);
  const experienceToShow = experience.filter((item) => item.role || item.company || item.description);
  const educationToShow = education.filter((item) => item.degree || item.institution || item.description);

  const filteredProfessions = useMemo(() => {
    if (!Array.isArray(occupations)) return [];
    const term = debouncedProfessionSearch.trim().toLowerCase();
    if (!term) return occupations;
    const matches = occupations.filter((occ) => {
      const title = occ.title || "";
      const slug = occ.slug || "";
      return title.toLowerCase().includes(term) || slug.toLowerCase().includes(term);
    });
    if (selectedProfession && !matches.some((occ) => occ.slug === selectedProfession.slug)) {
      return [selectedProfession, ...matches];
    }
    return matches;
  }, [occupations, debouncedProfessionSearch, selectedProfession]);

  const hasProfessionMatches = useMemo(() => {
    if (!debouncedProfessionSearch.trim()) return true;
    const term = debouncedProfessionSearch.trim().toLowerCase();
    return occupations.some((occ) => {
      const title = occ.title || "";
      const slug = occ.slug || "";
      return title.toLowerCase().includes(term) || slug.toLowerCase().includes(term);
    });
  }, [occupations, debouncedProfessionSearch]);

  // Store AI handlers in ref so event listener always has latest versions
  useEffect(() => {
    aiHandlersRef.current = {
      handleAIBio,
      handleAIHeadline,
      handleAISkillSuggestions,
      handleAIResponsibilities,
    };
  }, [handleAIBio, handleAIHeadline, handleAISkillSuggestions, handleAIResponsibilities]);

  // Listen for chatbot suggestions from global chatbot
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleChatbotSuggestion = (event) => {
      const { type } = event.detail;
      const handlers = aiHandlersRef.current;
      if (type === "bio") {
        handlers.handleAIBio?.();
      } else if (type === "headline") {
        handlers.handleAIHeadline?.();
      } else if (type === "skills") {
        handlers.handleAISkillSuggestions?.();
      } else if (type === "responsibilities") {
        handlers.handleAIResponsibilities?.();
      }
    };

    window.addEventListener("chatbot-suggestion", handleChatbotSuggestion);
    return () => {
      window.removeEventListener("chatbot-suggestion", handleChatbotSuggestion);
    };
  }, []);

  // Track preview view
  useEffect(() => {
    if (previewMode && typeof window !== "undefined") {
      apiClient.post("/api/analytics/track", {
        event: "view",
        data: {},
      }).catch(() => {
        // Silent fail for analytics
      });
    }
  }, [previewMode]);

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 print:bg-white animate-fade-in overflow-x-hidden">
        <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b no-print glass-effect shadow-lg">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Logo size={24} className="sm:w-8 sm:h-8" />
              <h2 className="font-bold text-base sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional CV Preview
              </h2>
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex gap-2 flex-1 sm:flex-initial">
                <Button 
                  className="premium-button cinematic-glow-hover text-xs sm:text-sm" 
                  disabled={downloadingPdf} 
                  onClick={handleDownloadPDF}
                  aria-label="Download portfolio as PDF"
                  aria-busy={downloadingPdf}
                >
                  {downloadingPdf ? "Generating..." : "⬇️ PDF"}
                </Button>
                <Button 
                  className="premium-button cinematic-glow-hover text-xs sm:text-sm" 
                  disabled={downloadingPdf} 
                  onClick={async () => {
                    await handleDownloadDOCX();
                    try {
                      await apiClient.post("/api/analytics/track", {
                        event: "download",
                        data: { format: "docx" },
                      });
                    } catch (err) {}
                  }}
                  aria-label="Download portfolio as DOCX"
                >
                  📄 DOCX
                </Button>
                <Button 
                  className="premium-button cinematic-glow-hover text-xs sm:text-sm" 
                  disabled={downloadingPdf} 
                  onClick={async () => {
                    await handleDownloadHTML();
                    try {
                      await apiClient.post("/api/analytics/track", {
                        event: "download",
                        data: { format: "html" },
                      });
                    } catch (err) {}
                  }}
                  aria-label="Download portfolio as HTML"
                >
                  🌐 HTML
                </Button>
              </div>
              <Button
                variant="outline"
                className="premium-button cinematic-glow text-xs sm:text-sm flex-1 sm:flex-initial"
                onClick={() => setPreviewMode(false)}
                aria-label="Return to edit mode"
              >
                Edit Portfolio
              </Button>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <PreviewSection
            safeName={safeName}
            safeHeadline={safeHeadline}
            profile={profile}
            contactEntries={contactEntries}
            socialLinks={socialLinks}
            displayBio={displayBio}
            responsibilitiesToShow={responsibilitiesToShow}
            skillNames={skillNames}
            experienceToShow={experienceToShow}
            experienceSummary={experienceSummary}
            professionTitle={professionTitle}
            educationToShow={educationToShow}
            projectsToShow={projectsToShow}
            template={selectedTemplate}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 animate-fade-in">
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b glass-effect shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" suppressHydrationWarning>
              {isClient ? t("portfolio.title", "Portfolio Builder") : "Portfolio Builder"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme} 
              className="premium-button"
              aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {resolvedTheme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <main id="content" className="max-w-4xl mx-auto mt-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Portfolio Setup
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="premium-button cinematic-glow-hover" onClick={() => setPreviewMode(true)}>
              Preview
            </Button>
            <Button variant="destructive" className="premium-button" onClick={() => setShowResetConfirm(true)}>
              Reset All
            </Button>
            <div className="flex items-center gap-2">
              <Button onClick={save} className="premium-button cinematic-glow">
                {status || "Save"}
              </Button>
              <AutoSaveIndicator status={saveStatus} />
            </div>
          </div>
        </div>

        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
          showTemplates={showTemplates}
          setShowTemplates={setShowTemplates}
        />

        <ProfileSection
          profile={profile}
          updateProfileField={updateProfileField}
          social={social}
          updateSocialField={updateSocialField}
          contact={contact}
          updateContactField={updateContactField}
          handleAvatarUpload={handleAvatarUpload}
          uploading={uploading}
          fileInputRef={fileInputRef}
          handleAIHeadline={handleAIHeadline}
          handleAIBio={handleAIBio}
          handleAIOptimize={handleAIOptimize}
          aiLoading={aiLoading}
          profession={profession}
          customProfession={customProfession}
          handleCustomProfessionChange={handleCustomProfessionChange}
          professionSearch={professionSearch}
          setProfessionSearch={setProfessionSearch}
          filteredProfessions={filteredProfessions}
          selectedProfession={selectedProfession}
          handleProfessionSelect={handleProfessionSelect}
          hasProfessionMatches={hasProfessionMatches}
          occupations={occupations}
          showSocial={showSocial}
          setShowSocial={setShowSocial}
          showContact={showContact}
          setShowContact={setShowContact}
        />

        <ResponsibilitiesSection
          responsibilities={responsibilities}
          addResponsibility={addResponsibility}
          updateResponsibility={updateResponsibility}
          removeResponsibility={removeResponsibility}
          showResponsibilities={showResponsibilities}
          setShowResponsibilities={setShowResponsibilities}
          handleAIResponsibilities={handleAIResponsibilities}
          aiLoading={aiLoading}
          profession={profession}
          customProfession={customProfession}
        />

        <SkillsSection
          skills={skills}
          addSkill={addSkill}
          updateSkill={updateSkill}
          removeSkill={removeSkill}
          showSkills={showSkills}
          setShowSkills={setShowSkills}
          handleAISkillSuggestions={handleAISkillSuggestions}
          aiLoading={aiLoading}
          profession={profession}
          customProfession={customProfession}
        />

        <ExperienceSection
          experience={experience}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          showExperience={showExperience}
          setShowExperience={setShowExperience}
        />

        <EducationSection
          education={education}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          showEducation={showEducation}
          setShowEducation={setShowEducation}
        />

        <ProjectsSection
          projects={projects}
          addProject={addProject}
          updateProject={updateProject}
          removeProject={removeProject}
          showProjects={showProjects}
          setShowProjects={setShowProjects}
          handleAIProjectDescription={handleAIProjectDescription}
          aiLoading={aiLoading}
        />

        <CustomSection
          customSections={customSections || []}
          addCustomSection={addCustomSection}
          updateCustomSection={updateCustomSection}
          removeCustomSection={removeCustomSection}
          showCustomSections={showCustomSections}
          setShowCustomSections={setShowCustomSections}
        />

        <SocialShare
          portfolioUrl={typeof window !== "undefined" ? window.location.href : ""}
          portfolioTitle={profile.name || "My Portfolio"}
          portfolioSummary={displayBio || ""}
          showSocialShare={showSocialShare}
          setShowSocialShare={setShowSocialShare}
        />

        <AnalyticsDashboard
          showAnalytics={showAnalytics}
          setShowAnalytics={setShowAnalytics}
        />
      </main>

      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetAll}
        title="Reset All Data"
        message="Are you sure you want to reset all portfolio data? This action cannot be undone."
        confirmText="Reset All"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
