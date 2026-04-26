// Merge the Playwright scraper's output (/tmp/pixieset-scraper/out/galleries/*.json)
// into the app manifest (src/lib/data/galleries.json).
//
// Usage: node scripts/update-manifest.mjs
//
// The scraper lives outside the repo (it's dev-only tooling). If the source dir
// is missing, run the scraper first (see README).

import fs from 'node:fs';
import path from 'node:path';

const SRC = '/tmp/pixieset-scraper/out/galleries';
const DST = path.resolve('src/lib/data/galleries.json');

if (!fs.existsSync(SRC)) {
  console.error(`Scraper output not found at ${SRC}.`);
  console.error('Generate it first by running the Playwright scraper in /tmp/pixieset-scraper.');
  process.exit(1);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json'));
const galleries = files
  .map((f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')))
  .filter((g) => (g.photos || []).length > 0)
  .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));

// Preserve admin-managed fields (categories, custom photo entries) from the
// existing manifest. The scraper only knows about Pixieset photos, so we keep
// any photos with `key` (admin uploads) and merge them back in.
let existing = { base: 'https://slpixel.pixieset.com', galleries: [], categories: undefined };
if (fs.existsSync(DST)) {
  try { existing = JSON.parse(fs.readFileSync(DST, 'utf8')); } catch {}
}

const existingBySlug = Object.fromEntries((existing.galleries || []).map((g) => [g.slug, g]));

const merged = galleries.map((g) => {
  const prev = existingBySlug[g.slug];
  if (!prev) return g;
  const adminPhotos = (prev.photos || []).filter((p) => p.key);
  // Prefer existing admin-managed metadata when present (so editing in /admin sticks).
  return {
    ...g,
    title: prev.title || g.title,
    date: prev.date || g.date,
    category: prev.category || g.category,
    photos: [...(g.photos || []), ...adminPhotos],
  };
});

const out = { base: 'https://slpixel.pixieset.com', galleries: merged };
if (existing.categories) out.categories = existing.categories;

fs.writeFileSync(DST, JSON.stringify(out, null, 2));

const total = galleries.reduce((acc, g) => acc + g.photos.length, 0);
console.log(`Wrote ${galleries.length} galleries (${total} photos) to ${DST}`);
