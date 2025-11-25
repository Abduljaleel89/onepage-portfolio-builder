/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * React hook for debouncing values
 * Note: Import React in the component file where this is used
 */
export function useDebounce(value, delay) {
  // This will be implemented in the component using React hooks
  // Keeping this as a placeholder for documentation
  return value;
}

