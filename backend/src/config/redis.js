// backend/src/config/redis.js
// Centralized Redis client + safe cache helpers.
// If Redis is unavailable or disabled, every helper degrades gracefully
// (no cache) so the API keeps working against MongoDB.
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
const REDIS_HOST = process.env.REDIS_HOST;

let client = null;
let isReady = false;

/**
 * Lazily create (but do not yet connect) the Redis client.
 * Returns null when Redis is disabled or no host is configured.
 */
export const createRedisClient = () => {
  if (client) return client;
  if (!REDIS_ENABLED || !REDIS_HOST) {
    console.log('⚠️  Redis disabled (set REDIS_ENABLED=true and REDIS_HOST to enable).');
    return null;
  }

  client = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: Number(process.env.REDIS_PORT) || 19809,
      // Upstash / redis.io TLS endpoints require tls: {} — enable via REDIS_TLS=true
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    },
  });

  client.on('error', (err) => {
    console.error('❌ Redis Client Error:', err.message);
    isReady = false;
  });
  client.on('connect', () => console.log('🔗 Redis connecting...'));
  client.on('ready', () => {
    isReady = true;
    console.log('✅ Redis connected and ready');
  });
  client.on('end', () => {
    isReady = false;
    console.log('🔌 Redis connection closed');
  });

  return client;
};

/**
 * Connect to Redis at startup. Failures are non-fatal.
 */
export const connectRedis = async () => {
  const c = createRedisClient();
  if (!c) return null;
  try {
    await c.connect();
    return c;
  } catch (err) {
    console.error('❌ Redis connection failed (continuing without cache):', err.message);
    return null;
  }
};

/** Returns the connected client, or null if not ready. */
export const getRedis = () => (isReady ? client : null);

/** Get a cached string value (null on miss / error). */
export const cacheGet = async (key) => {
  const c = getRedis();
  if (!c) return null;
  try {
    return await c.get(key);
  } catch {
    return null;
  }
};

/** Store a string value with a TTL in seconds. */
export const cacheSet = async (key, value, ttlSeconds = 300) => {
  const c = getRedis();
  if (!c) return;
  try {
    await c.set(key, value, { EX: ttlSeconds });
  } catch {
    /* ignore cache write failures */
  }
};

/**
 * Delete one or more keys. Supports an exact key or a glob pattern
 * (e.g. 'products:*'). Pattern deletes are best-effort.
 */
export const cacheDel = async (keyOrPattern) => {
  const c = getRedis();
  if (!c) return;
  try {
    if (typeof keyOrPattern === 'string' && keyOrPattern.includes('*')) {
      const keys = await c.keys(keyOrPattern);
      if (keys.length) await c.del(keys);
    } else {
      await c.del(keyOrPattern);
    }
  } catch {
    /* ignore */
  }
};

/**
 * Convenience wrapper: return cached JSON if present, otherwise run `fn`,
 * cache its (JSON-serializable) result, and return it.
 */
export const cacheWrap = async (key, ttlSeconds, fn) => {
  const cached = await cacheGet(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      /* fall through to recompute */
    }
  }
  const value = await fn();
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
  return value;
};
