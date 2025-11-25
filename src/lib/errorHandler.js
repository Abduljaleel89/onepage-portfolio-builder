/**
 * Centralized error handling utility
 */

import { logger } from "./logger";

export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", context = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error, req, res) {
  logger.error("API Error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    code: error.code,
    statusCode: error.statusCode,
  });

  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "An internal error occurred"
      : error.message;

  return res.status(statusCode).json({
    error: message,
    code: error.code || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
}

export function handleClientError(error, context = {}) {
  logger.error("Client Error", {
    error: error.message,
    stack: error.stack,
    ...context,
  });

  // In production, send to error tracking
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(error, { extra: context });
  }
}

export function withErrorHandling(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };
}

