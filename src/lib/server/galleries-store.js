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
export const isHidden = (g) => Boolean(g?.hidden);
export const isChild = (g) => Boolean(g?.parent);

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
  const galleries = (raw.galleries || []).map((g) => ({
    ...g,
    parent: g.parent || null,
  }));
  return {
    base: raw.base || DEFAULT_DATA.base,
    galleries,
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

export async function listChildren(parentSlug) {
  return (await read()).galleries.filter((g) => g.parent === parentSlug);
}

export async function listTopLevel() {
  return (await read()).galleries.filter((g) => !g.parent);
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
  if (g.parent) {
    throw new Error('Una subgalería hereda la contraseña del padre; no se puede asignar una propia.');
  }
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
  const hasChildren = data.galleries.some((g) => g.parent === slug);
  if (hasChildren) {
    throw new Error('La galería tiene subgalerías. Eliminalas o moverlas antes.');
  }
  data.galleries = data.galleries.filter((g) => g.slug !== slug);
  await write(data);
}

export async function setGalleryParent(slug, parentSlug) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  if (!parentSlug) {
    g.parent = null;
    await write(data);
    return;
  }
  if (parentSlug === slug) throw new Error('Una galería no puede ser su propio padre.');
  const parent = data.galleries.find((x) => x.slug === parentSlug);
  if (!parent) throw new Error('Galería padre no encontrada.');
  if (parent.parent) {
    throw new Error('Solo se permiten 2 niveles: el padre elegido ya es una subgalería.');
  }
  const hasChildren = data.galleries.some((x) => x.parent === slug);
  if (hasChildren) {
    throw new Error('Esta galería ya tiene subgalerías; no puede convertirse en subgalería.');
  }
  if (g.passwordHash) {
    throw new Error('Quitá la contraseña antes de convertirla en subgalería (heredará del padre).');
  }
  g.parent = parentSlug;
  await write(data);
}

export async function setGalleryCategory(slug, category) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.category = category;
  await write(data);
}

export async function setGalleryHidden(slug, hidden) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.hidden = Boolean(hidden);
  await write(data);
}

/**
 * Store the share-preview cover for a gallery.
 *
 * `ogImage` is the R2 key of the 1200x630 derivative the admin just uploaded;
 * `coverPhoto` is the key of the photo it was made from, so the editor can mark
 * it. Pass no arguments to clear both. Returns the previous derivative key so
 * the caller can delete the orphan from the bucket.
 */
export async function setGalleryCover(slug, { ogImage = null, coverPhoto = null } = {}) {
  const data = await read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  const previous = g.ogImage || null;
  if (ogImage) {
    g.ogImage = ogImage;
    g.coverPhoto = coverPhoto;
  } else {
    delete g.ogImage;
    delete g.coverPhoto;
  }
  await write(data);
  return previous === ogImage ? null : previous;
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
  // The generated derivative is its own object and still renders fine, but the
  // "★ portada" marker would point at a photo that no longer exists.
  if (g.coverPhoto === key) delete g.coverPhoto;
  await write(data);
}
