import { Router } from 'express';
import { signToken, authenticate } from '../middleware/auth';
import axios from 'axios';
import qs from 'querystring';
import crypto from 'crypto';
import { storeState, getAndDeleteState } from '../services/oauthState';

const router = Router();

// ===== OAuth2 Config =====
const OAUTH2_AUTHORIZE_URL = process.env.OAUTH2_AUTHORIZE_URL || 'https://auth.nasa.gov/oauth2/authorize';
const OAUTH2_TOKEN_URL = process.env.OAUTH2_TOKEN_URL || 'https://auth.nasa.gov/oauth2/token';
const OAUTH2_USERINFO_URL = process.env.OAUTH2_USERINFO_URL || 'https://auth.nasa.gov/oauth2/userinfo';
const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID || '';
const OAUTH2_CLIENT_SECRET = process.env.OAUTH2_CLIENT_SECRET || '';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8000';
const FRONTEND_CALLBACK_URL = process.env.FRONTEND_CALLBACK_URL || 'http://localhost:3000/auth/callback';
const OAUTH2_REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI || `${BACKEND_BASE_URL}/api/v1/auth/callback`;
const OAUTH2_SCOPE = process.env.OAUTH2_SCOPE || 'openid profile email';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@nasa.gov')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// eslint-disable-next-line no-console
console.log('[auth] Admin emails configured:', ADMIN_EMAILS);

// ===== State persistence (in-memory) and PKCE helpers =====
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const base64url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const createRandomString = (bytes = 32) => base64url(crypto.randomBytes(bytes));

const createState = () => createRandomString(16);

const createCodeVerifier = () => createRandomString(32);

const createCodeChallenge = (verifier: string) => {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
};

// Note: Cleanup handled by Redis TTL when Redis is used; in-memory cleanup occurs in oauthState service

// POST /api/v1/auth/login (demo-only)
// Accepts email/password and returns a signed JWT. This is a stub for NASA OAuth2.
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  // Demo user resolution and role inference
  const lower = String(email).toLowerCase();
  const role = ADMIN_EMAILS.includes(lower)
    ? 'administrator'
    : (lower.endsWith('@nasa.gov') ? 'nasa_scientist' : 'researcher');
  const user = {
    id: 'demo-user-' + Buffer.from(email).toString('base64').slice(0, 8),
    name: email.split('@')[0],
    email,
    role,
  } as const;

  const token = signToken({ sub: user.id, name: user.name, email: user.email, role });
  return res.json({ user, token });
});

// GET /api/v1/auth/me
router.get('/auth/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

// ===== OAuth2 Authorization Code Flow =====
// GET /api/v1/auth/start -> Redirects to NASA (or configured) OAuth2 provider
router.get('/auth/start', (_req, res) => {
  if (!OAUTH2_CLIENT_ID) {
    return res.status(500).json({ error: 'OAuth2 is not configured: missing OAUTH2_CLIENT_ID' });
  }
  const state = createState();
  const code_verifier = createCodeVerifier();
  const code_challenge = createCodeChallenge(code_verifier);
  // persist state -> verifier with TTL
  void storeState(state, code_verifier, Math.floor(STATE_TTL_MS / 1000));

  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', OAUTH2_CLIENT_ID);
  params.set('redirect_uri', OAUTH2_REDIRECT_URI);
  params.set('scope', OAUTH2_SCOPE);
  params.set('state', state);
  params.set('code_challenge', code_challenge);
  params.set('code_challenge_method', 'S256');
  const url = `${OAUTH2_AUTHORIZE_URL}?${params.toString()}`;
  res.redirect(url);
});

// GET /api/v1/auth/callback?code=...&state=...
router.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query as { code?: string; state?: string };
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });
  if (!state) return res.status(400).json({ error: 'Missing state' });
  const verifier = await getAndDeleteState(state);
  if (!verifier) return res.status(400).json({ error: 'Invalid or expired state' });
  if (!OAUTH2_CLIENT_ID || !OAUTH2_CLIENT_SECRET) {
    return res.status(500).json({ error: 'OAuth2 is not configured: client id/secret missing' });
  }
  try {
    // Exchange code for tokens
    const body = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: OAUTH2_REDIRECT_URI,
      client_id: OAUTH2_CLIENT_ID,
      client_secret: OAUTH2_CLIENT_SECRET,
      code_verifier: verifier,
    } as Record<string, string>;

    const tokenRes = await axios.post(
      OAUTH2_TOKEN_URL,
      qs.stringify(body),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token /*, id_token, token_type, expires_in */ } = tokenRes.data || {};
    if (!access_token) {
      return res.status(502).json({ error: 'Token exchange failed' });
    }

    // Fetch userinfo
    const userRes = await axios.get(OAUTH2_USERINFO_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const profile = userRes.data || {};
    const email: string = profile.email || profile.preferred_username || 'unknown@nasa.gov';
    const name: string = profile.name || email.split('@')[0];

    // Map role with admin override
    const lower = String(email).toLowerCase();
    const role = ADMIN_EMAILS.includes(lower)
      ? 'administrator'
      : (lower.endsWith('@nasa.gov') ? 'nasa_scientist' : 'researcher');
    const appUser = {
      id: 'oauth-' + crypto.createHash('sha1').update(email).digest('hex').slice(0, 12),
      name,
      email,
      role,
    } as const;

    const appToken = signToken({ sub: appUser.id, name: appUser.name, email: appUser.email, role });

    // Redirect to frontend callback with token
    const redirectUrl = new URL(FRONTEND_CALLBACK_URL);
    redirectUrl.searchParams.set('token', appToken);
    redirectUrl.searchParams.set('role', role);
    redirectUrl.searchParams.set('name', name);
    redirectUrl.searchParams.set('email', email);
    // State already invalidated by getAndDeleteState

    return res.redirect(redirectUrl.toString());
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[oauth callback] error', err?.response?.data || err?.message || err);
    return res.status(502).json({ error: 'OAuth2 callback failed' });
  }
});

export default router;
