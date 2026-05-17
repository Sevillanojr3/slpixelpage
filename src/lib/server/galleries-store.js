import crypto from 'node:crypto';
import { getJson, putJson } from './r2.js';

const KEY = 'data/galleries.json';

function scrypt(password, salt) {
  return crypto.scryptSync(String(password), salt, 64).toString('base64');
}

export function hashGalleryPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64');
  return { salt, passwordHash: scrypt(password, salt) };
}

export function verifyGalleryPassword(gallery, password) {
  if (!gallery?.passwordHash || !gallery?.salt) return false;
  if (typeof password !== 'string' || !password) return false;
  const candidate = scrypt(password, gallery.salt);
  const a = Buffer.from(candidate);
  const b = Buffer.from(gallery.passwordHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export const isProtected = (g) => Boolean(g?.passwordHash);

const DEFAULT_CATEGORIES = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'corporativo', label: 'Corporativo' },
];

const DEFAULT_DATA = {
  base: 'https://slpixel.pixieset.com',
  galleries: [],
  categories: DEFAULT_CATEGORIES,
};

function normalize(raw) {
  if (!raw) return { ...DEFAULT_DATA };
  return {
    base: raw.base || DEFAULT_DATA.base,
    galleries: raw.galleries || [],
    categories: raw.categories || DEFAULT_CATEGORIES,
  };
}

const CACHE_TTL_MS = 30 * 1000;
let cache = { data: null, exp: 0 };

export async function read() {
  if (cache.data && Date.now() < cache.exp) return cache.data;
  const raw = await getJson(KEY);
  const data = normalize(raw);
  cache = { data, exp: Date.now() + CACHE_TTL_MS };
  return data;
}

export async function write(data) {
  const normalized = normalize(data);
  await putJson(KEY, normalized);
  cache = { data: normalized, exp: Date.now() + CACHE_TTL_MS };
}

export async function listCategories() {
  return (await read()).categories;
}

export async function addCategory({ id, label }) {
  const data = await read();
  if (data.categories.some((c) => c.id === id)) {
    throw new Error(`La categoría "${id}" ya existe.`);
  }
  data.categories.push({ id, label });
  await write(data);
  return data.categories;
}

export async function renameCategory(id, label) {
  const data = await read();
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) throw new Error('Categoría no encontrada.');
  cat.label = label;
  await write(data);
}

export async function deleteCategory(id) {
  const data = await read();
  data.categories = data.categories.filter((c) => c.id !== id);
  for (const g of data.galleries) {
    if (g.category === id) g.category = null;
  }
  await write(data);
}

export async function listGalleries() {
  return (await read()).galleries;
}

export async function getGallery(slug) {
  return (await read()).galleries.find((g) => g.slug === slug) || null;
}

export async function upsertGallery(gallery) {
  const data = await read();
  const idx = data.galleries.findIndex((g) => g.slug === gallery.slug);
  if (idx >= 0) {
    data.galleries[idx] = { ...data.galleries[idx], ...gallery };
  } else {
    data.galleries.push({
      photos: [],
      createdAt: new Date().toISOString(),
      ...gallery,
    });
  }
  await write(data);
  return data.galleries.find((g) => g.slug === gallery.slug) || null;
}

export async function setGalleryPassword(slug, password) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  if (!password) {
    delete g.passwordHash;
    delete g.salt;
  } else {
    if (typeof password !== 'string' || password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres.');
    }
    const { passwordHash, salt } = hashGalleryPassword(password);
    g.passwordHash = passwordHash;
    g.salt = salt;
  }
  await write(data);
}

export async function deleteGallery(slug) {
  const data = await read();
  data.galleries = data.galleries.filter((g) => g.slug !== slug);
  await write(data);
}

export async function setGalleryCategory(slug, category) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.category = category;
  await write(data);
}

export async function addPhotoToGallery(slug, photo) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.photos = g.photos || [];
  g.photos.push(photo);
  await write(data);
}

export async function removePhotoFromGallery(slug, key) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) return;
  g.photos = (g.photos || []).filter((p) => p.key !== key);
  await write(data);
}
