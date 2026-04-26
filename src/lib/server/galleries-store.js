import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILE = resolve(process.cwd(), 'src/lib/data/galleries.json');

const DEFAULT_CATEGORIES = [
  { id: 'eventos', label: 'Eventos' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'corporativo', label: 'Corporativo' },
];

export function read() {
  const raw = JSON.parse(readFileSync(FILE, 'utf8'));
  return {
    base: raw.base || 'https://slpixel.pixieset.com',
    galleries: raw.galleries || [],
    categories: raw.categories || DEFAULT_CATEGORIES,
  };
}

export function write(data) {
  const payload = {
    base: data.base || 'https://slpixel.pixieset.com',
    galleries: data.galleries || [],
    categories: data.categories || DEFAULT_CATEGORIES,
  };
  writeFileSync(FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

export function listCategories() {
  return read().categories;
}

export function addCategory({ id, label }) {
  const data = read();
  if (data.categories.some((c) => c.id === id)) {
    throw new Error(`La categoría "${id}" ya existe.`);
  }
  data.categories.push({ id, label });
  write(data);
  return data.categories;
}

export function renameCategory(id, label) {
  const data = read();
  const cat = data.categories.find((c) => c.id === id);
  if (!cat) throw new Error('Categoría no encontrada.');
  cat.label = label;
  write(data);
}

export function deleteCategory(id) {
  const data = read();
  data.categories = data.categories.filter((c) => c.id !== id);
  for (const g of data.galleries) {
    if (g.category === id) g.category = null;
  }
  write(data);
}

export function listGalleries() {
  return read().galleries;
}

export function getGallery(slug) {
  return read().galleries.find((g) => g.slug === slug) || null;
}

export function upsertGallery(gallery) {
  const data = read();
  const idx = data.galleries.findIndex((g) => g.slug === gallery.slug);
  if (idx >= 0) {
    data.galleries[idx] = { ...data.galleries[idx], ...gallery };
  } else {
    data.galleries.push({ photos: [], ...gallery });
  }
  write(data);
  return getGallery(gallery.slug);
}

export function deleteGallery(slug) {
  const data = read();
  data.galleries = data.galleries.filter((g) => g.slug !== slug);
  write(data);
}

export function setGalleryCategory(slug, category) {
  const data = read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.category = category;
  write(data);
}

export function addPhotoToGallery(slug, photo) {
  const data = read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) throw new Error('Galería no encontrada.');
  g.photos = g.photos || [];
  g.photos.push(photo);
  write(data);
}

export function removePhotoFromGallery(slug, key) {
  const data = read();
  const g = data.galleries.find((x) => x.slug === slug);
  if (!g) return;
  g.photos = (g.photos || []).filter((p) => p.key !== key);
  write(data);
}
