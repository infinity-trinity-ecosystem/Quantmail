/**
 * Optional Redis client for rate limiting.
 *
 * Returns an ioredis client when REDIS_URL is set, or null when Redis is not
 * configured.  The rate-limit plugin falls back to its in-memory store when
 * this returns null, so the server boots successfully without Redis in
 * development.
 */

import { Redis } from "ioredis";

let _client: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (_client) return _client;

  const url = process.env["REDIS_URL"];
  if (!url) return null;

  _client = new Redis(url, {
    connectTimeout: 500,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  _client.on("error", (err: Error) => {
    // Log but do not crash — rate limiter will use in-memory fallback
    console.warn("[Redis] connection error:", err.message);
  });

  return _client;
}
