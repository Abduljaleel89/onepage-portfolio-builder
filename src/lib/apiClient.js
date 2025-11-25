/**
 * API client with retry logic and error handling
 */
import { retryWithBackoff } from "./retry";
import { logger } from "./logger";

class ApiClient {
  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    const { retries = 3, ...fetchOptions } = options;
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    return retryWithBackoff(
      async () => {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        return response.json();
      },
      {
        maxRetries: retries,
        onRetry: (attempt, error) => {
          logger.warn(`API request failed, retrying (${attempt}/${retries}):`, error.message);
        },
      }
    );
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: "GET" });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: "DELETE" });
  }

  async upload(url, formData, options = {}) {
    const { retries = 2, onProgress, ...fetchOptions } = options;
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    return retryWithBackoff(
      async () => {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          method: "POST",
          body: formData,
          // Don't set Content-Type header for FormData, browser will set it with boundary
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: `HTTP ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }

        return response.json();
      },
      {
        maxRetries: retries,
        onRetry: (attempt, error) => {
          logger.warn(`Upload failed, retrying (${attempt}/${retries}):`, error.message);
        },
      }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

