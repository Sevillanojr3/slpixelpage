// Resolve image URLs for gallery photos.
// PUBLIC_IMAGES_BASE_URL lets you point everything at a CDN / bucket later
// (e.g. https://cdn.slpixel.com). Leave it blank to serve from /galeria (local).
import { env } from '$env/dynamic/public';

const BASE = (env.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');

// Single source of truth for the best variant currently published to the
// bucket. xxlarge originals were synced 2026-04-26.
export const BEST_SIZE = 'xxlarge';

// Pixieset cover-type entries don't have an xxlarge variant in the bucket
// (Pixieset returns 404 when scraping that size for covers). Cap them at
// xlarge — that's the highest size we actually downloaded for them.
const COVER_MAX_SIZE = 'xlarge';

/**
 * Object key of a photo inside the bucket. Admin-uploaded photos store a direct
 * R2 key (e.g. "slug/abc-file.jpg"); Pixieset entries are addressed by hash and
 * variant. Returns '' for an entry we can't resolve.
 *
 * @param {{bucket?:string,hash?:string,ext?:string,size?:string,key?:string}} p
 */
export function photoObjectKey(p, size, slug) {
  if (p?.key) return p.key;
  if (!p?.hash) return '';
  const ext = (p.ext || 'jpg').toLowerCase();
  const effective = p.size === 'cover' && size === 'xxlarge' ? COVER_MAX_SIZE : size;
  return `${slug}/${p.hash}-${effective}.${ext}`;
}

/** @param {{bucket?:string,hash?:string,ext?:string,size?:string,key?:string}} p */
export function photoUrl(p, size, slug) {
  const key = photoObjectKey(p, size, slug);
  if (BASE) return `${BASE}/${key}`;
  // Locally, Pixieset variants are served from the static gallery dir.
  return p?.key ? `/${key}` : `/galeria/${key}`;
}

/** Stable identity for keying #each blocks across both photo formats. */
export function photoKey(p) {
  return p?.key || (p?.hash ? `${p.bucket || ''}/${p.hash}` : JSON.stringify(p));
}

// Both helpers now resolve to the highest-quality variant available.
// `thumbUrl` is kept as an alias so existing callers keep working.
export function thumbUrl(p, slug) {
  return photoUrl(p, BEST_SIZE, slug);
}

export function fullUrl(p, slug) {
  return photoUrl(p, BEST_SIZE, slug);
}

/**
 * URL of any raw object in the bucket addressed by key (videos, posters).
 * Falls back to a site-relative path when no CDN base is configured, which is
 * what local development serves out of /static.
 */
export function assetUrl(key) {
  if (!key) return '';
  return BASE ? `${BASE}/${key}` : `/${key}`;
}
