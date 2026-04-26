import crypto from 'node:crypto';
import { envVar } from './env.js';

const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const COOKIE_NAME = 'admin_session';

const pendingCodes = new Map();
const lastSent = new Map();

function getSecret() {
  const s = envVar('ADMIN_SECRET');
  if (!s) throw new Error('ADMIN_SECRET missing in .env');
  return s;
}

export const adminEmail = () => envVar('ADMIN_EMAIL') || envVar('EMAIL_USER');

export function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

/** Issue a fresh login code. Rate-limited to 1 per 30s. */
export function issueCode(email) {
  const last = lastSent.get(email) || 0;
  if (Date.now() - last < 30 * 1000) {
    throw new Error('Esperá 30 segundos antes de pedir otro código.');
  }
  const code = generateCode();
  pendingCodes.set(email, { code, exp: Date.now() + CODE_TTL_MS });
  lastSent.set(email, Date.now());
  return code;
}

export function verifyCode(email, code) {
  const entry = pendingCodes.get(email);
  if (!entry) return false;
  if (Date.now() > entry.exp) {
    pendingCodes.delete(email);
    return false;
  }
  if (entry.code !== String(code).trim()) return false;
  pendingCodes.delete(email);
  return true;
}

function sign(payload) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('base64url');
}

export function createSession(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS });
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${sign(b64)}`;
}

export function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return null;
  const expected = sign(b64);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export function setSessionCookie(cookies, token) {
  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(cookies) {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

export const SESSION_COOKIE = COOKIE_NAME;
