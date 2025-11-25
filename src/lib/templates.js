/**
 * Portfolio Templates
 * Different layout and styling templates for portfolios
 */

export const TEMPLATES = {
  modern: {
    id: "modern",
    name: "Modern",
    description: "Clean, minimalist design with bold typography",
    preview: "/templates/modern-preview.png",
    styles: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#ec4899",
      fontFamily: "Inter, sans-serif",
      layout: "single-column",
    },
  },
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout with elegant styling",
    preview: "/templates/classic-preview.png",
    styles: {
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      accentColor: "#60a5fa",
      fontFamily: "Georgia, serif",
      layout: "two-column",
    },
  },
  creative: {
    id: "creative",
    name: "Creative",
    description: "Bold, colorful design perfect for designers and artists",
    preview: "/templates/creative-preview.png",
    styles: {
      primaryColor: "#f59e0b",
      secondaryColor: "#ef4444",
      accentColor: "#8b5cf6",
      fontFamily: "Poppins, sans-serif",
      layout: "creative",
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Ultra-minimal design focusing on content",
    preview: "/templates/minimal-preview.png",
    styles: {
      primaryColor: "#000000",
      secondaryColor: "#4b5563",
      accentColor: "#9ca3af",
      fontFamily: "Helvetica, sans-serif",
      layout: "minimal",
    },
  },
  tech: {
    id: "tech",
    name: "Tech",
    description: "Modern tech-focused design with code-inspired elements",
    preview: "/templates/tech-preview.png",
    styles: {
      primaryColor: "#10b981",
      secondaryColor: "#3b82f6",
      accentColor: "#f59e0b",
      fontFamily: "Monaco, monospace",
      layout: "tech",
    },
  },
};

export const DEFAULT_TEMPLATE = "modern";

export function getTemplate(id) {
  return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function getAllTemplates() {
  return Object.values(TEMPLATES);
}

