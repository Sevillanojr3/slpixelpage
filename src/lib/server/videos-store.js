// Catalogue of the videos shown on /videos.
//
// Mirrors galleries-store.js: a single JSON document in R2, read through a
// short-lived cache. Array order is the published order — the admin moves an
// entry up or down, there is no separate sort field to keep in sync.

import crypto from 'node:crypto';
import { getJson, putJson } from './r2.js';

const KEY = 'data/videos.json';
const CACHE_TTL_MS = 30 * 1000;

let cache = { data: null, exp: 0 };

function normalizeVideo(v) {
  return {
    id: String(v.id || ''),
    title: String(v.title || 'Sin título'),
    description: String(v.description || ''),
    category: v.category || null,
    key: String(v.key || ''),
    posterKey: v.posterKey || null,
    contentType: v.contentType || 'video/mp4',
    width: Number(v.width) || 0,
    height: Number(v.height) || 0,
    duration: Number(v.duration) || 0,
    size: Number(v.size) || 0,
    hidden: Boolean(v.hidden),
    filename: v.filename || '',
    createdAt: v.createdAt || null,
  };
}

function normalize(raw) {
  const videos = (raw?.videos || []).map(normalizeVideo).filter((v) => v.id && v.key);
  return { videos };
}

export async function read() {
  if (cache.data && Date.now() < cache.exp) return cache.data;
  const data = normalize(await getJson(KEY));
  cache = { data, exp: Date.now() + CACHE_TTL_MS };
  return data;
}

export async function write(data) {
  const normalized = normalize(data);
  await putJson(KEY, normalized);
  cache = { data: normalized, exp: Date.now() + CACHE_TTL_MS };
  return normalized;
}

export async function listVideos() {
  return (await read()).videos;
}

export async function getVideo(id) {
  return (await read()).videos.find((v) => v.id === id) || null;
}

export function newVideoId() {
  return crypto.randomUUID();
}

/** Newest first: a freshly uploaded clip leads the reel. */
export async function addVideo(video) {
  const data = await read();
  const entry = normalizeVideo({
    ...video,
    id: video.id || newVideoId(),
    createdAt: video.createdAt || new Date().toISOString(),
  });
  if (!entry.key) throw new Error('Falta la key del video.');
  data.videos.unshift(entry);
  await write(data);
  return entry;
}

export async function updateVideo(id, patch) {
  const data = await read();
  const idx = data.videos.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error('Video no encontrado.');
  data.videos[idx] = normalizeVideo({ ...data.videos[idx], ...patch, id });
  await write(data);
  return data.videos[idx];
}

/** Returns the removed entry so the caller can drop its objects from R2. */
export async function deleteVideo(id) {
  const data = await read();
  const removed = data.videos.find((v) => v.id === id) || null;
  data.videos = data.videos.filter((v) => v.id !== id);
  await write(data);
  return removed;
}

/** `direction` is -1 (subir) or 1 (bajar). Out-of-range moves are a no-op. */
export async function moveVideo(id, direction) {
  const data = await read();
  const idx = data.videos.findIndex((v) => v.id === id);
  if (idx < 0) throw new Error('Video no encontrado.');
  const target = idx + (direction < 0 ? -1 : 1);
  if (target < 0 || target >= data.videos.length) return data.videos;
  const [entry] = data.videos.splice(idx, 1);
  data.videos.splice(target, 0, entry);
  await write(data);
  return data.videos;
}
