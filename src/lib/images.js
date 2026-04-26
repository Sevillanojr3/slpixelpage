// Resolve image URLs for gallery photos.
// PUBLIC_IMAGES_BASE_URL lets you point everything at a CDN / bucket later
// (e.g. https://cdn.slpixel.com). Leave it blank to serve from /galeria (local).
import { env } from '$env/dynamic/public';

const BASE = (env.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');

// Single source of truth for the best variant currently published to the
// bucket. Bump to 'xxlarge' once those originals are synced.
export const BEST_SIZE = 'xlarge';

// Pixieset cover-type entries only exist as `<hash>-cover.<ext>`. Asking
// for any other size returns 404. Detect and serve the cover URL instead.
const COVER_SIZE = 'cover';

/** @param {{bucket:string,hash:string,ext:string,size?:string}} p */
export function photoUrl(p, size, slug) {
  const ext = (p.ext || 'jpg').toLowerCase();
  const effective = p?.size === COVER_SIZE ? COVER_SIZE : size;
  const filename = `${p.hash}-${effective}.${ext}`;
  if (BASE) return `${BASE}/${slug}/${filename}`;
  return `/galeria/${slug}/${filename}`;
}

// Both helpers now resolve to the highest-quality variant available.
// `thumbUrl` is kept as an alias so existing callers keep working.
export function thumbUrl(p, slug) {
  return photoUrl(p, BEST_SIZE, slug);
}

export function fullUrl(p, slug) {
  return photoUrl(p, BEST_SIZE, slug);
}
