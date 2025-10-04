"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRandomString = exports.base64url = void 0;
exports.storeState = storeState;
exports.getAndDeleteState = getAndDeleteState;
const ioredis_1 = __importDefault(require("ioredis"));
const crypto_1 = __importDefault(require("crypto"));
// TTL in seconds
const DEFAULT_TTL_SEC = 10 * 60; // 10 minutes
let redis = null;
const memoryStore = new Map();
// Attempt to initialize Redis if REDIS_URL is provided
(() => {
    try {
        const url = process.env.REDIS_URL;
        if (url) {
            const client = new ioredis_1.default(url);
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
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error('[oauthState] Failed to init Redis, using memory store:', e?.message || e);
        redis = null;
    }
})();
// Memory cleanup
setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
        if (now - v.createdAt > v.ttlSec * 1000)
            memoryStore.delete(k);
    }
}, 60 * 1000).unref?.();
const base64url = (input) => Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
exports.base64url = base64url;
const createRandomString = (bytes = 32) => (0, exports.base64url)(crypto_1.default.randomBytes(bytes));
exports.createRandomString = createRandomString;
async function storeState(state, verifier, ttlSec = DEFAULT_TTL_SEC) {
    if (redis) {
        await redis.setex(`oauth:state:${state}`, ttlSec, verifier);
        return;
    }
    memoryStore.set(state, { verifier, createdAt: Date.now(), ttlSec });
}
async function getAndDeleteState(state) {
    if (redis) {
        const key = `oauth:state:${state}`;
        const v = await redis.get(key);
        if (v)
            await redis.del(key);
        return v;
    }
    const item = memoryStore.get(state);
    if (!item)
        return null;
    memoryStore.delete(state);
    return item.verifier;
}
