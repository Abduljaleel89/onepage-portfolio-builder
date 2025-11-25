/**
 * Form validation using Zod-like validation
 * For production, install and use Zod: npm install zod
 */

// Simple validation functions (replace with Zod in production)
export const validators = {
  required: (value, message = "This field is required") => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return message;
    }
    return null;
  },

  email: (value, message = "Invalid email address") => {
    if (!value) return null; // Use required() for required fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  url: (value, message = "Invalid URL") => {
    if (!value) return null;
    try {
      new URL(value.startsWith("http") ? value : `https://${value}`);
      return null;
    } catch {
      return message;
    }
  },

  minLength: (min) => (value, message = `Must be at least ${min} characters`) => {
    if (!value) return null;
    if (value.length < min) {
      return message;
    }
    return null;
  },

  maxLength: (max) => (value, message = `Must be at most ${max} characters`) => {
    if (!value) return null;
    if (value.length > max) {
      return message;
    }
    return null;
  },

  phone: (value, message = "Invalid phone number") => {
    if (!value) return null;
    const phoneRegex = /^[\d\s()+\-\.]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, "").length < 10) {
      return message;
    }
    return null;
  },
};

export function validateField(value, rules) {
  for (const rule of rules) {
    const error = typeof rule === "function" ? rule(value) : rule(value);
    if (error) return error;
  }
  return null;
}

export function validateForm(formData, schema) {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(formData[field], rules);
    if (error) {
      errors[field] = error;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Example schema:
// const profileSchema = {
//   name: [validators.required()],
//   email: [validators.required(), validators.email()],
//   website: [validators.url()],
// };
