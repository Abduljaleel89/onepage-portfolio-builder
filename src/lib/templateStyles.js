/**
 * Template-specific styling utilities
 * Applies different visual styles based on selected template
 */

import { getTemplate } from "./templates";

/**
 * Get template-specific CSS classes for preview
 */
export function getTemplateClasses(templateId) {
  if (!templateId) templateId = "modern";
  const baseClasses = "max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none my-4 sm:my-8 print:my-0 rounded-lg overflow-hidden animate-fade-in-up cinematic-glow cv-container px-2 sm:px-0 w-full";
  
  const templateClassMap = {
    modern: {
      container: `${baseClasses} border-l-4 border-indigo-600`,
      header: "border-b-2 pb-4 sm:pb-6 mb-4 sm:mb-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-6 print:bg-transparent",
      name: "text-2xl sm:text-4xl font-bold mb-3 sm:mb-2 break-words text-indigo-600",
      headline: "text-lg sm:text-xl text-gray-600 mb-4 sm:mb-3 font-medium print:text-gray-900 break-words",
      sectionHeading: "text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 border-b-2 border-indigo-600 pb-2 flex items-center gap-2",
      sectionLine: "w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded",
      chip: "bg-indigo-100 text-indigo-800 border border-indigo-300",
    },
    classic: {
      container: `${baseClasses} border-l-4 border-blue-800`,
      header: "border-b-2 pb-4 sm:pb-6 mb-4 sm:mb-6 bg-gradient-to-r from-blue-50/50 to-blue-100/50 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-6 print:bg-transparent",
      name: "text-2xl sm:text-4xl font-bold mb-3 sm:mb-2 break-words text-blue-800",
      headline: "text-lg sm:text-xl text-gray-700 mb-4 sm:mb-3 font-medium print:text-gray-900 break-words italic",
      sectionHeading: "text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 border-b-2 border-blue-800 pb-2 flex items-center gap-2",
      sectionLine: "w-1 h-6 bg-gradient-to-b from-blue-800 to-blue-600 rounded",
      chip: "bg-blue-100 text-blue-900 border border-blue-300",
    },
    creative: {
      container: `${baseClasses} border-l-4 border-orange-500`,
      header: "border-b-2 pb-4 sm:pb-6 mb-4 sm:mb-6 bg-gradient-to-r from-orange-50/50 via-red-50/50 to-purple-50/50 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-6 print:bg-transparent",
      name: "text-2xl sm:text-4xl font-bold mb-3 sm:mb-2 break-words text-orange-600",
      headline: "text-lg sm:text-xl text-gray-700 mb-4 sm:mb-3 font-medium print:text-gray-900 break-words",
      sectionHeading: "text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 border-b-2 border-orange-500 pb-2 flex items-center gap-2",
      sectionLine: "w-1 h-6 bg-gradient-to-b from-orange-500 via-red-500 to-purple-500 rounded",
      chip: "bg-orange-100 text-orange-900 border border-orange-300",
    },
    minimal: {
      container: `${baseClasses} border-l-2 border-gray-400`,
      header: "border-b pb-4 sm:pb-6 mb-4 sm:mb-6 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-6 print:bg-transparent",
      name: "text-2xl sm:text-4xl font-light mb-3 sm:mb-2 break-words text-black",
      headline: "text-lg sm:text-xl text-gray-600 mb-4 sm:mb-3 font-light print:text-gray-900 break-words",
      sectionHeading: "text-lg sm:text-xl font-normal mb-2 sm:mb-3 text-gray-900 border-b border-gray-400 pb-2 flex items-center gap-2",
      sectionLine: "w-1 h-6 bg-gray-400 rounded",
      chip: "bg-gray-100 text-gray-800 border border-gray-300",
    },
    tech: {
      container: `${baseClasses} border-l-4 border-green-500`,
      header: "border-b-2 pb-4 sm:pb-6 mb-4 sm:mb-6 bg-gradient-to-r from-green-50/50 to-blue-50/50 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 sm:py-6 print:bg-transparent",
      name: "text-2xl sm:text-4xl font-bold mb-3 sm:mb-2 break-words text-green-600 font-mono",
      headline: "text-lg sm:text-xl text-gray-700 mb-4 sm:mb-3 font-medium print:text-gray-900 break-words font-mono",
      sectionHeading: "text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 border-b-2 border-green-500 pb-2 flex items-center gap-2 font-mono",
      sectionLine: "w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded",
      chip: "bg-green-100 text-green-900 border border-green-300 font-mono text-xs",
    },
  };

  return templateClassMap[templateId] || templateClassMap.modern;
}

/**
 * Get template-specific styles for PDF generation
 */
export function getTemplatePdfStyles(templateId) {
  const template = getTemplate(templateId);
  
  const styleMap = {
    modern: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      accentColor: "#ec4899",
      borderColor: "#6366f1",
      nameColor: "#6366f1",
    },
    classic: {
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      accentColor: "#60a5fa",
      borderColor: "#1e40af",
      nameColor: "#1e40af",
    },
    creative: {
      primaryColor: "#f59e0b",
      secondaryColor: "#ef4444",
      accentColor: "#8b5cf6",
      borderColor: "#f59e0b",
      nameColor: "#f59e0b",
    },
    minimal: {
      primaryColor: "#000000",
      secondaryColor: "#4b5563",
      accentColor: "#9ca3af",
      borderColor: "#9ca3af",
      nameColor: "#000000",
    },
    tech: {
      primaryColor: "#10b981",
      secondaryColor: "#3b82f6",
      accentColor: "#f59e0b",
      borderColor: "#10b981",
      nameColor: "#10b981",
    },
  };

  return styleMap[templateId] || styleMap.modern;
}

