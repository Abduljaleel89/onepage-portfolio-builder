/**
 * Simple in-memory rate limiting
 * For production, use Redis or a proper rate limiting library
 */

const requests = new Map();

/**
 * Rate limit middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 */
export function createRateLimiter(options = {}) {
  const { windowMs = 60 * 1000, max = 10 } = options;
  
  return (req, res, next) => {
    try {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
                 req.headers["x-real-ip"] || 
                 req.socket?.remoteAddress || 
                 "unknown";
      
      const key = `${ip}-${req.url}`;
      const now = Date.now();
      const record = requests.get(key);
      
      if (!record || now - record.resetTime > windowMs) {
        // New window
        requests.set(key, {
          count: 1,
          resetTime: now
        });
        if (next) next();
        return;
      }
      
      if (record.count >= max) {
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((windowMs - (now - record.resetTime)) / 1000)
        });
      }
      
      record.count++;
      if (next) next();
    } catch (err) {
      // If rate limiting fails, allow request through
      console.error("Rate limit error:", err);
      if (next) next();
    }
  };
}

/**
 * Clean up old entries periodically
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requests.entries()) {
      if (now - record.resetTime > 60000) { // 1 minute
        requests.delete(key);
      }
    }
  }, 60000); // Clean every minute
}

