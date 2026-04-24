// Resolve logo URLs.
// When PUBLIC_IMAGES_BASE_URL is set we serve logos from the CDN (same bucket,
// under /Logos/). Otherwise we fall back to /static/Logos/ locally.
import { env } from '$env/dynamic/public';

const BASE = (env.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');

export function logoUrl(filename) {
  if (BASE) return `${BASE}/Logos/${filename}`;
  return `/Logos/${filename}`;
}

export const logos = {
  isoBlue:   'slpixels_isoblue.png',
  isoWhite:  'slpixels_isoW.png',
  textBlue:  'slpixels_textblue.png',
  textWhite: 'slpixels_text white.png',
  fullWhite: 'slpixels_white.png',
  signature: 'Firma JS.png',
};
