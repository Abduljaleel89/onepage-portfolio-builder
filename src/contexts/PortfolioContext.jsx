import { createContext, useContext, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const PortfolioContext = createContext(null);

const STORAGE_KEY = "portfolio-builder-data-v1";

const createEmptyProfile = () => ({ name: "", headline: "", bio: "", avatar: "" });
const createEmptySocial = () => ({ github: "", linkedin: "", twitter: "", website: "", email: "" });
const createEmptyContact = () => ({ email: "", phone: "", location: "" });

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

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

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useLocalStorage(STORAGE_KEY, createEmptyPortfolio());

  const normalizedPortfolio = useMemo(() => normalizePortfolio(portfolio), [portfolio]);

  const updateProfileField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  }, [setPortfolio]);

  const updateSocialField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  }, [setPortfolio]);

  const updateContactField = useCallback((field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  }, [setPortfolio]);

  const addSkill = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      skills: [...prev.skills, createSkill()],
    }));
  }, [setPortfolio]);

  const updateSkill = useCallback((id, value) => {
    setPortfolio((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, name: value } : skill)),
    }));
  }, [setPortfolio]);

  const removeSkill = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  }, [setPortfolio]);

  const addProject = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      projects: [...prev.projects, createProject()],
    }));
  }, [setPortfolio]);

  const updateProject = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    }));
  }, [setPortfolio]);

  const removeProject = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  }, [setPortfolio]);

  const addExperience = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      experience: [...prev.experience, createExperience()],
    }));
  }, [setPortfolio]);

  const updateExperience = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, [setPortfolio]);

  const removeExperience = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  }, [setPortfolio]);

  const addEducation = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      education: [...prev.education, createEducation()],
    }));
  }, [setPortfolio]);

  const updateEducation = useCallback((id, field, value) => {
    setPortfolio((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, [setPortfolio]);

  const removeEducation = useCallback((id) => {
    setPortfolio((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  }, [setPortfolio]);

  const addResponsibility = useCallback(() => {
    setPortfolio((prev) => ({
      ...prev,
      responsibilities: [...prev.responsibilities, ""],
    }));
  }, [setPortfolio]);

  const updateResponsibility = useCallback((index, value) => {
    setPortfolio((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.map((resp, i) => (i === index ? value : resp)),
    }));
  }, [setPortfolio]);

  const removeResponsibility = useCallback((index) => {
    setPortfolio((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  }, [setPortfolio]);

  const resetPortfolio = useCallback(() => {
    setPortfolio(createEmptyPortfolio());
  }, [setPortfolio]);

  const value = useMemo(
    () => ({
      portfolio: normalizedPortfolio,
      setPortfolio,
      updateProfileField,
      updateSocialField,
      updateContactField,
      addSkill,
      updateSkill,
      removeSkill,
      addProject,
      updateProject,
      removeProject,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addResponsibility,
      updateResponsibility,
      removeResponsibility,
      resetPortfolio,
    }),
    [
      normalizedPortfolio,
      setPortfolio,
      updateProfileField,
      updateSocialField,
      updateContactField,
      addSkill,
      updateSkill,
      removeSkill,
      addProject,
      updateProject,
      removeProject,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addResponsibility,
      updateResponsibility,
      removeResponsibility,
      resetPortfolio,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}

