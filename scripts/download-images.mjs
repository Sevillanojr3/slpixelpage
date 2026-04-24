// Download Pixieset images listed in the scraper manifest into static/galeria/<slug>/.
// Usage:
//   node scripts/download-images.mjs               # download all galleries
//   node scripts/download-images.mjs --only=<slug> # one gallery
//   node scripts/download-images.mjs --sizes=large,xlarge  # override
//
// Safe to re-run; it skips files already on disk.

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.resolve(ROOT, 'src/lib/data/galleries.json');
const OUT_BASE = path.resolve(ROOT, 'static/galeria');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v = true] = a.replace(/^--/, '').split('=');
  return [k, v];
}));

const SIZES = (args.sizes || 'large,xlarge').split(',').map((s) => s.trim());
const ONLY = args.only;
const CONCURRENCY = parseInt(args.concurrency || '6', 10);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
            Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
            Referer: 'https://slpixel.pixieset.com/',
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        },
      )
      .on('error', reject);
  });
}

async function downloadPhoto({ bucket, hash, ext }, destDir) {
  // Map download-size label -> filename suffix on disk
  const map = {
    small: 'small',
    medium: 'medium',
    large: 'large',
    xlarge: 'xlarge',
    xxlarge: 'xxlarge',
  };
  const results = [];
  for (const size of SIZES) {
    if (!map[size]) continue;
    const url = `https://images.pixieset.com/${bucket}/${hash}-${size}.${ext}`;
    const dest = path.join(destDir, `${hash}-${size}.${ext.toLowerCase()}`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
      results.push({ size, dest, skipped: true });
      continue;
    }
    try {
      const buf = await fetchBuffer(url);
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(dest, buf);
      results.push({ size, dest, bytes: buf.length });
    } catch (e) {
      results.push({ size, error: e.message });
    }
  }
  return results;
}

async function runWithConcurrency(items, worker, n) {
  const queue = items.slice();
  let done = 0;
  const total = items.length;
  const runners = Array.from({ length: n }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); } catch (e) { /* swallow */ }
      done++;
      if (done % 20 === 0) process.stdout.write(`  ${done}/${total}\r`);
    }
  });
  await Promise.all(runners);
  process.stdout.write(`  ${done}/${total}\n`);
}

async function main() {
  let totalDl = 0, totalSkip = 0, totalFail = 0, totalBytes = 0;
  for (const g of manifest.galleries) {
    if (ONLY && g.slug !== ONLY) continue;
    const photos = (g.photos || []).filter((p) => p.bucket && p.hash);
    if (photos.length === 0) continue;

    const destDir = path.join(OUT_BASE, g.slug);
    console.log(`\n[${g.slug}] ${photos.length} photos -> ${destDir}`);

    await runWithConcurrency(
      photos,
      async (p) => {
        const r = await downloadPhoto(p, destDir);
        for (const x of r) {
          if (x.error) { totalFail++; }
          else if (x.skipped) { totalSkip++; }
          else { totalDl++; totalBytes += x.bytes; }
        }
      },
      CONCURRENCY,
    );
  }

  console.log('\n==== DONE ====');
  console.log(`  downloaded: ${totalDl}`);
  console.log(`  skipped:    ${totalSkip}`);
  console.log(`  failed:     ${totalFail}`);
  console.log(`  bytes:      ${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
}

main().catch((e) => { console.error(e); process.exit(1); });
