import Redis from 'ioredis';
import crypto from 'crypto';

// TTL in seconds
const DEFAULT_TTL_SEC = 10 * 60; // 10 minutes

let redis: Redis | null = null;
const memoryStore = new Map<string, { verifier: string; createdAt: number; ttlSec: number }>();

// Attempt to initialize Redis if REDIS_URL is provided
(() => {
  try {
    const url = process.env.REDIS_URL;
    if (url) {
      const client = new Redis(url);
      client.on('error', (e) => {
        // eslint-disable-next-line no-console
        console.error('[oauthState] Redis error, falling back to memory:', e.message);
      });
      client.on('ready', () => {
        // eslint-disable-next-line no-console
        console.log('[oauthState] Connected to Redis');
      });
      redis = client;
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[oauthState] Failed to init Redis, using memory store:', e?.message || e);
    redis = null;
  }
})();

// Memory cleanup
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of memoryStore.entries()) {
    if (now - v.createdAt > v.ttlSec * 1000) memoryStore.delete(k);
  }
}, 60 * 1000).unref?.();

export const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export const createRandomString = (bytes = 32) => base64url(crypto.randomBytes(bytes));

export async function storeState(state: string, verifier: string, ttlSec = DEFAULT_TTL_SEC): Promise<void> {
  if (redis) {
    await redis.setex(`oauth:state:${state}`, ttlSec, verifier);
    return;
  }
  memoryStore.set(state, { verifier, createdAt: Date.now(), ttlSec });
}

export async function getAndDeleteState(state: string): Promise<string | null> {
  if (redis) {
    const key = `oauth:state:${state}`;
    const v = await redis.get(key);
    if (v) await redis.del(key);
    return v;
  }
  const item = memoryStore.get(state);
  if (!item) return null;
  memoryStore.delete(state);
  return item.verifier;
}
