import crypto from 'node:crypto';
import { envVar } from './env.js';

const TTL_MS = 12 * 60 * 60 * 1000;
const COOKIE_PREFIX = 'gallery_access_';

function getSecret() {
  const s = envVar('ADMIN_SECRET');
  if (!s) throw new Error('ADMIN_SECRET missing in .env');
  return s;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

const cookieName = (slug) => `${COOKIE_PREFIX}${slug.replace(/[^a-z0-9-_]/gi, '')}`;

export function createAccessToken(slug) {
  const payload = JSON.stringify({ slug, exp: Date.now() + TTL_MS });
  const b64 = Buffer.from(payload).toString('base64url');
  return `${b64}.${sign(b64)}`;
}

export function verifyAccessToken(token, slug) {
  if (!token || typeof token !== 'string') return false;
  const [b64, sig] = token.split('.');
  if (!b64 || !sig) return false;
  const expected = sign(b64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return data.slug === slug && Date.now() < data.exp;
  } catch {
    return false;
  }
}

export function setAccessCookie(cookies, slug) {
  cookies.set(cookieName(slug), createAccessToken(slug), {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TTL_MS / 1000,
  });
}

export function getAccessCookie(cookies, slug) {
  return cookies.get(cookieName(slug));
}

export function hasAccess(cookies, slug) {
  return verifyAccessToken(getAccessCookie(cookies, slug), slug);
}
