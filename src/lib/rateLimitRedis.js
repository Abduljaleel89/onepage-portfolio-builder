/**
 * Production-ready rate limiting with Redis support
 * Falls back to in-memory if Redis is not available
 */

let redisClient = null;

// Try to initialize Redis if available
async function initRedis() {
  if (redisClient) return redisClient;
  
  try {
    // Only import if REDIS_URL is set
    if (process.env.REDIS_URL) {
      const redis = await import("ioredis");
      redisClient = new redis.default(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
      });
      
      redisClient.on("error", (err) => {
        console.error("Redis connection error:", err);
        redisClient = null; // Fallback to in-memory
      });
      
      return redisClient;
    }
  } catch (err) {
    console.warn("Redis not available, falling back to in-memory rate limiting:", err.message);
  }
  
  return null;
}

// In-memory fallback
const memoryStore = new Map();

async function getRateLimit(key, windowMs, max) {
  const redis = await initRedis();
  const now = Date.now();
  
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      const ttl = await redis.pttl(key);
      return {
        count,
        resetTime: now + ttl,
        remaining: Math.max(0, max - count),
      };
    } catch (err) {
      console.error("Redis error, falling back to memory:", err);
      // Fall through to memory store
    }
  }
  
  // In-memory fallback
  const record = memoryStore.get(key);
  if (!record || now - record.resetTime > windowMs) {
    memoryStore.set(key, {
      count: 1,
      resetTime: now,
    });
    return {
      count: 1,
      resetTime: now + windowMs,
      remaining: max - 1,
    };
  }
  
  record.count++;
  return {
    count: record.count,
    resetTime: record.resetTime,
    remaining: Math.max(0, max - record.count),
  };
}

export function createRateLimiter(options = {}) {
  const { windowMs = 60 * 1000, max = 10 } = options;
  
  return async (req, res, next) => {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        req.socket?.remoteAddress ||
        "unknown";
      
      const key = `rate_limit:${ip}:${req.url}`;
      const limit = await getRateLimit(key, windowMs, max);
      
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", limit.remaining);
      res.setHeader("X-RateLimit-Reset", new Date(limit.resetTime).toISOString());
      
      if (limit.count > max) {
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
        });
      }
      
      if (next) next();
    } catch (err) {
      console.error("Rate limit error:", err);
      if (next) next(); // Allow request through on error
    }
  };
}

// Cleanup memory store periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now - record.resetTime > 60000) {
        memoryStore.delete(key);
      }
    }
  }, 60000);
}

