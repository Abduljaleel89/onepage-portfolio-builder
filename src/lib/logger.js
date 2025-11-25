/**
 * Structured logging utility
 * In production, integrate with services like Sentry, LogRocket, or CloudWatch
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "INFO" : "DEBUG");

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel];
}

function formatLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    ...context,
  };
}

export const logger = {
  error(message, context = {}) {
    if (shouldLog("ERROR")) {
      const log = formatLog("ERROR", message, context);
      console.error(JSON.stringify(log));
      // In production, send to error tracking service
      if (typeof window !== "undefined" && window.Sentry) {
        window.Sentry.captureException(new Error(message), { extra: context });
      }
    }
  },

  warn(message, context = {}) {
    if (shouldLog("WARN")) {
      const log = formatLog("WARN", message, context);
      console.warn(JSON.stringify(log));
    }
  },

  info(message, context = {}) {
    if (shouldLog("INFO")) {
      const log = formatLog("INFO", message, context);
      console.log(JSON.stringify(log));
    }
  },

  debug(message, context = {}) {
    if (shouldLog("DEBUG")) {
      const log = formatLog("DEBUG", message, context);
      console.debug(JSON.stringify(log));
    }
  },
};

