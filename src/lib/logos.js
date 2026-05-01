// Resolve logo URLs.
// When PUBLIC_IMAGES_BASE_URL is set we serve legacy logos from the CDN
// (same bucket, under /Logos/). Otherwise we fall back to /static/Logos/.
// New brand assets live under /static/brand/ and are always served locally.
import { env } from '$env/dynamic/public';

const BASE = (env.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');

export function logoUrl(filename) {
  if (BASE) return `${BASE}/Logos/${filename}`;
  return `/Logos/${filename}`;
}

// Legacy SL Pixel marks (still on the R2 CDN under Logos/).
export const logos = {
  isoBlue:   'slpixels_isoblue.png',
  isoWhite:  'slpixels_isoW.png',
  textBlue:  'slpixels_textblue.png',
  textWhite: 'slpixels_text white.png',
  fullWhite: 'slpixels_white.png',
  signature: 'Firma JS.png',
};

// New SLPixel brand identity (gold + black). Served locally.
export const brand = {
  navbar:  '/brand/slpixel-navbar.png',     // for dark backgrounds
  light:   '/brand/slpixel-light-bg.png',   // for light backgrounds
  favicon: '/brand/favicon.png',            // camera lens iso mark
};
