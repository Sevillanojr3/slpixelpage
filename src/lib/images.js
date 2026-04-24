// Resolve image URLs for gallery photos.
// PUBLIC_IMAGES_BASE_URL lets you point everything at a CDN / bucket later
// (e.g. https://cdn.slpixel.com). Leave it blank to serve from /galeria (local).
import { env } from '$env/dynamic/public';

const BASE = (env.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');

/** @param {{bucket:string,hash:string,ext:string}} p */
export function photoUrl(p, size, slug) {
  const ext = (p.ext || 'jpg').toLowerCase();
  const filename = `${p.hash}-${size}.${ext}`;
  if (BASE) return `${BASE}/${slug}/${filename}`;
  return `/galeria/${slug}/${filename}`;
}

export function thumbUrl(p, slug) {
  return photoUrl(p, 'large', slug);
}

export function fullUrl(p, slug) {
  return photoUrl(p, 'xlarge', slug);
}
