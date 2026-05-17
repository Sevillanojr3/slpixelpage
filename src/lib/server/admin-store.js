import crypto from 'node:crypto';
import { getJson, putJson } from './r2.js';

const KEY = 'data/admin.json';

const DEFAULT = { passwordHash: null, salt: null, passwordUpdatedAt: null };

let cache = { data: null, exp: 0 };
const CACHE_TTL_MS = 30 * 1000;

export async function read() {
  if (cache.data && Date.now() < cache.exp) return cache.data;
  const raw = await getJson(KEY);
  const data = { ...DEFAULT, ...(raw || {}) };
  cache = { data, exp: Date.now() + CACHE_TTL_MS };
  return data;
}

export async function write(data) {
  const merged = { ...DEFAULT, ...data };
  await putJson(KEY, merged);
  cache = { data: merged, exp: Date.now() + CACHE_TTL_MS };
}

function scryptHash(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('base64');
}

export async function hasPassword() {
  const { passwordHash } = await read();
  return Boolean(passwordHash);
}

export async function setPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }
  const salt = crypto.randomBytes(16).toString('base64');
  const passwordHash = scryptHash(password, salt);
  await write({ passwordHash, salt, passwordUpdatedAt: new Date().toISOString() });
}

export async function verifyPassword(password) {
  const { passwordHash, salt } = await read();
  if (!passwordHash || !salt) return false;
  if (typeof password !== 'string' || !password) return false;
  const candidate = scryptHash(password, salt);
  const a = Buffer.from(candidate);
  const b = Buffer.from(passwordHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
