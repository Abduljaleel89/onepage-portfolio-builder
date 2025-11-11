import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import Logo from "@/components/logo";
import PortfolioPdf from "@/components/PortfolioPdf";

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

const createEmptyPortfolio = () => ({
  profile: createEmptyProfile(),
  social: createEmptySocial(),
  contact: createEmptyContact(),
  projects: [],
  skills: [],
  experience: [],
  education: [],
  responsibilities: [],
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

export default function Home() {
  const { theme, setTheme } = useTheme();
  const resolvedTheme = theme === "system" ? undefined : theme;

  const [portfolio, setPortfolio] = useState(() => createEmptyPortfolio());
  const [occupations, setOccupations] = useState([]);
  const [professionSearch, setProfessionSearch] = useState("");

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
  const [hydrated, setHydrated] = useState(false);

  const persistTimeoutRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const themeTransitionTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
      } catch (err) {
        console.error("Failed to persist portfolio:", err);
      }
    }, 250);
    return () => {
      if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    };
  }, [portfolio, hydrated]);

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
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setPortfolio((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatar: dataUrl },
      }));
      setStatusMessage("Photo updated ✓");
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setStatusMessage("Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const resetAll = async () => {
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
      const res = await fetch("/api/me/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
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
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
        const data = await res.json();
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

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPdf(true);
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
      const experienceCount = portfolio.experience.filter(
        (item) => item.role || item.company || item.description
      ).length;
      const experienceSummary = experienceCount
        ? `${experienceCount} ${experienceCount === 1 ? "year" : "years"}`
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

      const pdfData = {
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
      };

      const blob = await pdf(<PortfolioPdf data={pdfData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const fileName =
        (profile.name || professionTitle || "portfolio").replace(/\s+/g, "-").toLowerCase() +
        "-cv.pdf";
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("PDF downloaded ✓");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setStatusMessage("Failed to generate PDF");
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
  const experienceCount = experience.filter(
    (item) => item.role || item.company || item.description
  ).length;
  const experienceSummary = experienceCount
    ? `${experienceCount} ${experienceCount === 1 ? "year" : "years"}`
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

  const filteredProfessions = useMemo(() => {
    if (!Array.isArray(occupations)) return [];
    const term = professionSearch.trim().toLowerCase();
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
  }, [occupations, professionSearch, selectedProfession]);

  const hasProfessionMatches = useMemo(() => {
    if (!professionSearch.trim()) return true;
    const term = professionSearch.trim().toLowerCase();
    return occupations.some((occ) => {
      const title = occ.title || "";
      const slug = occ.slug || "";
      return title.toLowerCase().includes(term) || slug.toLowerCase().includes(term);
    });
  }, [occupations, professionSearch]);

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 print:bg-white animate-fade-in">
        <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b no-print glass-effect shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Professional CV Preview
              </h2>
            </div>
            <div className="flex gap-2">
              <Button className="premium-button cinematic-glow-hover" disabled={downloadingPdf} onClick={handleDownloadPDF}>
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

        <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none my-8 print:my-0 rounded-lg overflow-hidden animate-fade-in-up cinematic-glow cv-container">
          <div className="p-8 print:p-6">
            <div className="border-b-2 border-primary pb-6 mb-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 -mx-8 px-8 py-6 print:bg-transparent">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 animate-slide-in-right">
                  <h1 className="cv-name text-4xl font-bold mb-2">{safeName}</h1>
                  <p className="text-xl text-gray-600 mb-3 font-medium print:text-gray-900">{safeHeadline}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 cv-header-meta">
                    {contactEntries.map((entry) => (
                      <span key={entry.label}>
                        {entry.label}: {entry.value}
                      </span>
                    ))}
                  </div>
                  {socialLinks.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3 cv-header-links">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.value.startsWith("http") ? link.value : `https://${link.value}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
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

            {displayBio && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">{displayBio}</p>
              </section>
            )}

            {responsibilitiesToShow.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
                  Key Responsibilities
                </h2>
                <ul className="space-y-1 text-gray-700">
                  {responsibilitiesToShow.map((resp, index) => (
                    <li key={index} className="leading-relaxed cv-list-item">
                      {resp}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {skillNames.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
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

            {experienceToShow.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
                  Professional Experience
                </h2>
                <div className="cv-timeline">
                  {experienceToShow.map((exp) => (
                    <div key={exp.id} className="cv-timeline-item">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{exp.role || "Role"}</h3>
                        <span className="text-sm text-gray-600 font-medium">
                          {exp.period || experienceSummary || "Timeline"}
                        </span>
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

            {educationToShow.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
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

            {projectsToShow.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                <h2 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
                  Projects
                </h2>
                <div className="space-y-4">
                  {projectsToShow.map((project) => (
                    <div key={project.id} className="p-4 cv-project-card">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{project.title || "Project Title"}</h3>
                        {project.link && (
                          <a
                            href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm print:text-gray-900"
                          >
                            View →
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-gray-700 text-sm mb-2 leading-relaxed">{project.description}</p>
                      )}
                      {Array.isArray(project.tags) && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.tags.map((tag) => (
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

            {contactEntries.length > 0 && (
              <section className="mb-6 cv-section animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
                <h2 className="text-xl font-bold mb-3 text-gray-900 border-b-2 border-primary pb-2 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
                  Contact Information
                </h2>
                <ul className="space-y-1 text-gray-700 cv-contact-list">
                  {contactEntries.map((entry) => (
                    <li key={entry.label} className="cv-contact-item">
                      <strong>{entry.label}:</strong> {entry.value}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-center py-24 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient opacity-90" />
        <div className="absolute inset-0 animate-shimmer" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6 animate-fade-in">
            <Logo size={60} />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up gradient-text" style={{ animationDelay: "0.2s" }}>
            Portfolio Builder
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            Create an impressive portfolio in minutes
          </p>
          <div className="flex gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
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

        <div className="absolute top-6 right-6 z-20">
          <Button
            size="icon"
            variant="ghost"
            className="glass-effect hover:bg-white/10"
            onClick={toggleTheme}
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
            <Button variant="outline" className="premium-button cinematic-glow-hover" onClick={() => setPreviewMode(true)}>
              Preview
            </Button>
            <Button variant="destructive" className="premium-button" onClick={resetAll}>
              Reset All
            </Button>
            <Button onClick={save} className="premium-button cinematic-glow">
              {status || "Save"}
            </Button>
          </div>
        </div>

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
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleAvatarUpload}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: uploading ? "not-allowed" : "pointer",
                      zIndex: 2,
                      fontSize: 0,
                      margin: 0,
                      padding: 0,
                    }}
                  />
                  <Button variant="outline" disabled={uploading} style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
                    {uploading ? "Uploading..." : profile.avatar ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="font-medium mb-2 block" htmlFor="profile-name">
                Name
              </label>
              <Input
                id="profile-name"
                value={profile.name}
                onChange={(event) => updateProfileField("name", event.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="font-medium mb-2 block" htmlFor="profession-select">
                Profession
              </label>
              <div className="space-y-2">
                <Input
                  id="profession-search"
                  value={professionSearch}
                  onChange={(event) => setProfessionSearch(event.target.value)}
                  placeholder="Search professions..."
                />
                <select
                  id="profession-select"
                  value={profession}
                  onChange={(event) => {
                    handleSelectProfession(event.target.value);
                    setProfessionSearch("");
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  style={{ backgroundColor: "hsl(var(--background))", color: "hsl(var(--foreground))", appearance: "auto" }}
                >
                  <option value="">Select a profession ({occupations.length} available)</option>
                  {filteredProfessions.map((occ) => (
                    <option key={occ.slug} value={occ.slug}>
                      {occ.title}
                    </option>
                  ))}
                  {!filteredProfessions.length && <option disabled>No professions found</option>}
                </select>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing {filteredProfessions.length} of {occupations.length} professions
                  </span>
                  {professionSearch && !hasProfessionMatches && <span className="text-destructive">No matches</span>}
                </div>
              </div>
              <div className="mt-3">
                <label className="text-sm text-muted-foreground">Or enter a custom profession:</label>
                <Input
                  value={customProfession}
                  onChange={(event) => handleCustomProfessionChange(event.target.value)}
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
                  disabled={Boolean(aiLoading.headline)}
                  className="text-xs premium-button cinematic-glow-hover"
                >
                  {aiLoading.headline ? "✨ Generating..." : "✨ AI Generate"}
                </Button>
              </div>
              <Input
                value={profile.headline}
                onChange={(event) => updateProfileField("headline", event.target.value)}
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
                    disabled={Boolean(aiLoading.bio)}
                    className="text-xs premium-button cinematic-glow-hover"
                  >
                    {aiLoading.bio ? "✨ Generating..." : "✨ AI Generate"}
                  </Button>
                  {profile.bio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIOptimize("bio", profile.bio)}
                      disabled={Boolean(aiLoading["optimize-bio-general"])}
                      className="text-xs"
                    >
                      {aiLoading["optimize-bio-general"] ? "⚡ Optimizing..." : "⚡ Optimize"}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={profile.bio}
                onChange={(event) => updateProfileField("bio", event.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        <CollapsibleSection title="Social Media Links" isOpen={showSocial} onToggle={() => setShowSocial((value) => !value)}>
          <div className="space-y-4">
            <div>
              <label className="font-medium mb-1 block">GitHub</label>
              <Input
                value={social.github}
                onChange={(event) => updateSocialField("github", event.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">LinkedIn</label>
              <Input
                value={social.linkedin}
                onChange={(event) => updateSocialField("linkedin", event.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Twitter</label>
              <Input
                value={social.twitter}
                onChange={(event) => updateSocialField("twitter", event.target.value)}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Website</label>
              <Input
                value={social.website}
                onChange={(event) => updateSocialField("website", event.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={social.email}
                onChange={(event) => updateSocialField("email", event.target.value)}
                placeholder="your@email.com"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Job Responsibilities" isOpen={showResponsibilities} onToggle={() => setShowResponsibilities((value) => !value)}>
          <div className="space-y-2">
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex items-start gap-2">
                <Textarea
                  value={resp}
                  onChange={(event) => updateResponsibility(index, event.target.value)}
                  rows={2}
                  placeholder="Job responsibility..."
                  className="flex-1"
                />
                <Button variant="ghost" size="sm" onClick={() => removeResponsibility(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={addResponsibility}>
                + Add Responsibility
              </Button>
              <Button
                variant="outline"
                className="border-primary/50 premium-button cinematic-glow-hover"
                onClick={handleAIResponsibilities}
                disabled={Boolean(aiLoading.responsibilities) || (!profession && !customProfession)}
                title={!profession && !customProfession ? "Select or enter a profession first" : ""}
              >
                {aiLoading.responsibilities ? "✨ Generating..." : "✨ AI Generate All"}
              </Button>
            </div>
            {!profession && !customProfession && (
              <p className="text-sm text-muted-foreground">Select or enter a profession above to use AI generation</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Skills & Technologies" isOpen={showSkills} onToggle={() => setShowSkills((value) => !value)}>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-2">
                <Input
                  value={skill.name}
                  onChange={(event) => updateSkill(skill.id, event.target.value)}
                  placeholder="Skill name"
                />
                <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)}>
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={addSkill}>
                + Add Skill
              </Button>
              <Button
                variant="outline"
                className="border-primary/50 premium-button cinematic-glow-hover"
                onClick={handleAISkillSuggestions}
                disabled={Boolean(aiLoading.skills) || (!profession && !customProfession)}
                title={!profession && !customProfession ? "Select or enter a profession first" : ""}
              >
                {aiLoading.skills ? "✨ Generating..." : "✨ AI Generate All"}
              </Button>
            </div>
            {!profession && !customProfession && (
              <p className="text-sm text-muted-foreground">Select or enter a profession above to get profession-specific skill suggestions</p>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Work Experience" isOpen={showExperience} onToggle={() => setShowExperience((value) => !value)}>
          <div className="space-y-4">
            {experience.map((exp, index) => (
              <div key={exp.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Experience #{index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                    Remove
                  </Button>
                </div>
                <Input
                  value={exp.role}
                  onChange={(event) => updateExperience(exp.id, "role", event.target.value)}
                  placeholder="Role"
                />
                <Input
                  value={exp.company}
                  onChange={(event) => updateExperience(exp.id, "company", event.target.value)}
                  placeholder="Company"
                />
                <Input
                  value={exp.period}
                  onChange={(event) => updateExperience(exp.id, "period", event.target.value)}
                  placeholder="Jan 2020 - Present"
                />
                <Textarea
                  value={exp.description}
                  onChange={(event) => updateExperience(exp.id, "description", event.target.value)}
                  rows={3}
                  placeholder="Job description..."
                />
              </div>
            ))}
            <Button variant="outline" onClick={addExperience}>
              + Add Experience
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Education" isOpen={showEducation} onToggle={() => setShowEducation((value) => !value)}>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={edu.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Education #{index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                    Remove
                  </Button>
                </div>
                <Input
                  value={edu.degree}
                  onChange={(event) => updateEducation(edu.id, "degree", event.target.value)}
                  placeholder="Degree"
                />
                <Input
                  value={edu.institution}
                  onChange={(event) => updateEducation(edu.id, "institution", event.target.value)}
                  placeholder="Institution"
                />
                <Input
                  value={edu.period}
                  onChange={(event) => updateEducation(edu.id, "period", event.target.value)}
                  placeholder="2018 - 2022"
                />
                <Textarea
                  value={edu.description}
                  onChange={(event) => updateEducation(edu.id, "description", event.target.value)}
                  rows={2}
                  placeholder="Additional details..."
                />
              </div>
            ))}
            <Button variant="outline" onClick={addEducation}>
              + Add Education
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Projects" isOpen={showProjects} onToggle={() => setShowProjects((value) => !value)}>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={project.id} className="border-b pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAIProjectDescription(project)}
                      disabled={Boolean(aiLoading[`project-${project.id}`])}
                      className="premium-button cinematic-glow-hover"
                    >
                      {aiLoading[`project-${project.id}`] ? "✨ Generating..." : "✨ AI Describe"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                <Input
                  value={project.title}
                  onChange={(event) => updateProject(project.id, "title", event.target.value)}
                  placeholder="Project Title"
                />
                <Textarea
                  value={project.description}
                  onChange={(event) => updateProject(project.id, "description", event.target.value)}
                  rows={2}
                  placeholder="Project description..."
                />
                <Input
                  value={project.image}
                  onChange={(event) => updateProject(project.id, "image", event.target.value)}
                  placeholder="Image URL"
                />
                <Input
                  value={project.link}
                  onChange={(event) => updateProject(project.id, "link", event.target.value)}
                  placeholder="Project URL"
                />
                <Input
                  value={(project.tags || []).join(", ")}
                  onChange={(event) =>
                    updateProject(
                      project.id,
                      "tags",
                      event.target.value.split(",").map((t) => t.trim()).filter((t) => t)
                    )
                  }
                  placeholder="Tags (comma separated)"
                />
              </div>
            ))}
            <Button variant="outline" onClick={addProject}>
              + Add Project
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Contact" isOpen={showContact} onToggle={() => setShowContact((value) => !value)}>
          <div className="grid gap-4">
            <div>
              <label className="font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={contact.email}
                onChange={(event) => updateContactField("email", event.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Phone</label>
              <Input
                value={contact.phone}
                onChange={(event) => updateContactField("phone", event.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="font-medium mb-1 block">Location</label>
              <Input
                value={contact.location}
                onChange={(event) => updateContactField("location", event.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>
        </CollapsibleSection>
      </main>
    </div>
  );
}
