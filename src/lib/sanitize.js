/**
 * Input sanitization utilities
 */

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html) {
  if (typeof html !== "string") return "";
  
  const div = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!div) return html; // Server-side, return as-is (will be escaped by React)
  
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent XSS and protocol issues
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== "string") return "";
  
  const trimmed = url.trim();
  if (!trimmed) return "";
  
  // Remove dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(trimmed)) {
    return "";
  }
  
  // If no protocol, assume https
  if (!trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`;
  }
  
  return trimmed;
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate URL format
 */
export function validateUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const sanitized = sanitizeUrl(url);
    new URL(sanitized);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate phone number (basic validation)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  // Allow international format: +1 (555) 123-4567 or similar
  const phoneRegex = /^[\d\s()+\-\.]+$/;
  return phoneRegex.test(phone.trim()) && phone.trim().length >= 10;
}

/**
 * Sanitize text input (remove dangerous characters)
 */
export function sanitizeText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Calculate years of experience from period strings
 */
export function calculateExperienceYears(experienceArray) {
  if (!Array.isArray(experienceArray)) return 0;
  
  let totalMonths = 0;
  const monthRegex = /(\d{1,2})\/(\d{4})/g;
  const yearRegex = /(\d{4})/g;
  
  experienceArray.forEach((exp) => {
    if (!exp.period) return;
    
    const period = exp.period.trim();
    const dates = period.match(/(\d{1,2}\/\d{4}|\d{4})/g);
    
    if (dates && dates.length >= 2) {
      // Parse start and end dates
      const startDate = parseDate(dates[0]);
      const endDate = dates[1].toLowerCase().includes("present") || dates[1].toLowerCase().includes("current")
        ? new Date()
        : parseDate(dates[1]);
      
      if (startDate && endDate) {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth());
        totalMonths += Math.max(0, months);
      }
    } else if (dates && dates.length === 1) {
      // Single date - assume 1 year
      totalMonths += 12;
    }
  });
  
  return Math.floor(totalMonths / 12);
}

/**
 * Parse date string (MM/YYYY or YYYY)
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  const parts = dateStr.split("/");
  if (parts.length === 2) {
    // MM/YYYY
    const month = parseInt(parts[0], 10) - 1;
    const year = parseInt(parts[1], 10);
    return new Date(year, month, 1);
  } else {
    // YYYY
    const year = parseInt(dateStr, 10);
    return new Date(year, 0, 1);
  }
}

