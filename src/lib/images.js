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

/** @param {{bucket?:string,hash?:string,ext?:string,size?:string,key?:string}} p */
export function photoUrl(p, size, slug) {
  // Admin-uploaded photos store a direct R2 key (e.g. "slug/abc-file.jpg").
  if (p?.key) {
    if (BASE) return `${BASE}/${p.key}`;
    return `/${p.key}`;
  }
  const ext = (p.ext || 'jpg').toLowerCase();
  const effective = p?.size === 'cover' && size === 'xxlarge' ? COVER_MAX_SIZE : size;
  const filename = `${p.hash}-${effective}.${ext}`;
  if (BASE) return `${BASE}/${slug}/${filename}`;
  return `/galeria/${slug}/${filename}`;
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
