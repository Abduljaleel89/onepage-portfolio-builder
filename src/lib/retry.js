/**
 * Retry utility with exponential backoff
 */

export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = null,
    shouldRetry = (error) => true,
  } = options;

  let lastError;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === maxAttempts) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt, maxAttempts);
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoff;
    }
  }

  throw lastError;
}

export function isRetryableError(error) {
  // Network errors, timeouts, and 5xx errors are retryable
  if (!error) return false;
  
  if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") return true;
  if (error.status >= 500 && error.status < 600) return true;
  if (error.status === 429) return true; // Rate limit
  
  return false;
}

/**
 * Retry with exponential backoff (alias for retry function with better naming)
 */
export async function retryWithBackoff(fn, options = {}) {
  return retry(fn, {
    maxAttempts: options.maxRetries || options.maxAttempts || 3,
    delay: options.initialDelay || 1000,
    backoff: options.backoff || 2,
    onRetry: options.onRetry
      ? (error, attempt, maxAttempts) => options.onRetry(attempt, error)
      : null,
    shouldRetry: options.shouldRetry || isRetryableError,
  });
}

