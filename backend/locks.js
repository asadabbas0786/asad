// locks.js
// Lock service with optional Redis; falls back to in-memory Map

import { createClient } from 'redis';

const useRedis = !!process.env.REDIS_URL;
let redis = null;
const mem = new Map(); // key -> { value, expiresAt }

/**
 * Initialize Redis client (if REDIS_URL is provided).
 * Call this once before using setnxWithTTL/delKey.
 */
export async function initLock() {
  if (!useRedis) {
    console.log('[Locks] Using in-memory locks (no REDIS_URL set)');
    return;
  }
  try {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (e) => console.error('[Redis] error:', e));
    await redis.connect();
    console.log('[Locks] Connected to Redis');
  } catch (err) {
    console.error('[Locks] Failed to connect to Redis, falling back to memory:', err.message);
    redis = null;
  }
}

/**
 * Set key if not exists, with TTL.
 * Returns true if lock acquired, false if already locked.
 */
export async function setnxWithTTL(key, value, ttlSec) {
  if (redis) {
    const ok = await redis.set(key, value, { NX: true, EX: ttlSec });
    return ok === 'OK';
  }

  // Memory fallback
  const now = Date.now();
  // Clean expired
  const cur = mem.get(key);
  if (cur && cur.expiresAt <= now) mem.delete(key);
  if (mem.has(key)) return false;

  mem.set(key, { value, expiresAt: now + ttlSec * 1000 });
  return true;
}

/**
 * Delete a key (release a lock).
 */
export async function delKey(key) {
  if (redis) {
    try {
      return await redis.del(key);
    } catch (e) {
      console.error('[Redis] delKey error:', e);
      return 0;
    }
  }
  mem.delete(key);
  return 1;
}
