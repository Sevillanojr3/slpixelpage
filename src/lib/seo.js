// Share-preview (Open Graph / Twitter) metadata for the public pages.
//
// Everything here is pure so it can be unit-tested: the routes pass in the
// gallery, the request origin and the path, and get back the exact strings the
// <Seo> component renders into <head>.
import { photoUrl } from './images.js';

/** Dimensions of every image we generate ourselves. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Neutral image used whenever we must not expose a client's photos. */
export const BRAND_OG_IMAGE = '/brand/og-default.jpg';

export const SITE_NAME = 'SL Pixel';

// When no cover has been generated we fall back to a raw photo. Pixieset
// entries get served at `large` instead of the gallery's usual xxlarge:
// WhatsApp silently drops link previews over roughly 600 KB.
const FALLBACK_SIZE = 'large';

/** Strip the "de SLPixel" suffix the Pixieset import left on titles. */
export function cleanTitle(title) {
  return String(title || '')
    .replace(/\s+de SLPixel$/i, '')
    .trim();
}

/** Turn a site-relative path into the absolute URL crawlers require. */
export function absoluteUrl(origin, path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = String(origin || '').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function firstPhotoUrl(gallery) {
  const photo = (gallery?.photos || [])[0];
  if (!photo) return null;
  return photoUrl(photo, FALLBACK_SIZE, gallery.slug);
}

/**
 * Pick the image a shared gallery link should preview with.
 *
 * `optimized` is false when we fell back to a full-weight photo — the admin
 * surfaces that as "sin miniatura optimizada", and we skip the og:image
 * dimensions because we don't know them.
 *
 * @param {object} gallery
 * @param {{parent?: object|null}} [opts]
 * @returns {{url: string, optimized: boolean, branded: boolean}}
 */
export function resolveOgImage(gallery, { parent = null } = {}) {
  const brand = { url: BRAND_OG_IMAGE, optimized: true, branded: true };
  if (!gallery) return brand;

  // A password-protected gallery never leaks a photo into the preview.
  if (gallery.protected || parent?.protected) return brand;

  const ogKey = gallery.ogImage || parent?.ogImage;
  if (ogKey) return { url: photoUrl({ key: ogKey }), optimized: true, branded: false };

  const photo = firstPhotoUrl(gallery) || firstPhotoUrl(parent);
  if (photo) return { url: photo, optimized: false, branded: false };

  return brand;
}

/**
 * Full set of head values for a gallery page. Used by both the top-level and
 * the subgallery route; `parent` is null for the former.
 *
 * @param {{gallery: object, parent?: object|null, origin: string, path: string}} args
 */
export function buildGallerySeo({ gallery, parent = null, origin, path }) {
  const isProtected = Boolean(gallery?.protected || parent?.protected);
  const title = cleanTitle(gallery?.title || gallery?.slug);
  const parentTitle = parent ? cleanTitle(parent.title || parent.slug) : null;
  const image = resolveOgImage(gallery, { parent });

  const description = isProtected
    ? `Galería privada de ${SITE_NAME}. Pedí la contraseña para ver «${title}».`
    : parentTitle
      ? `${title} — parte de ${parentTitle}. Fotografía por ${SITE_NAME}.`
      : `Galería fotográfica «${title}» por ${SITE_NAME}.`;

  return {
    title: parentTitle ? `${title} · ${parentTitle} — ${SITE_NAME}` : `${title} — ${SITE_NAME}`,
    description,
    image: absoluteUrl(origin, image.url),
    imageAlt: image.branded ? SITE_NAME : title,
    imageWidth: image.optimized ? OG_WIDTH : null,
    imageHeight: image.optimized ? OG_HEIGHT : null,
    url: absoluteUrl(origin, path),
    optimized: image.optimized,
  };
}

/** Head values for the pages that are not a single gallery (home, index). */
export function buildSiteSeo({ title, description, origin, path }) {
  return {
    title,
    description,
    image: absoluteUrl(origin, BRAND_OG_IMAGE),
    imageAlt: SITE_NAME,
    imageWidth: OG_WIDTH,
    imageHeight: OG_HEIGHT,
    url: absoluteUrl(origin, path),
    optimized: true,
  };
}
