// One-shot: upload src/lib/data/galleries.json to R2 as data/galleries.json.
// Run with: node scripts/seed-galleries-r2.mjs

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { putJson, getJson } from '../src/lib/server/r2.js';

const KEY = 'data/galleries.json';
const FILE = resolve(process.cwd(), 'src/lib/data/galleries.json');

const force = process.argv.includes('--force');

const local = JSON.parse(readFileSync(FILE, 'utf8'));

const remote = await getJson(KEY);
if (remote && !force) {
  console.error(
    `[seed] R2 ya tiene ${KEY} (${(remote.galleries || []).length} galerías). ` +
      `Usá --force para sobreescribir.`
  );
  process.exit(1);
}

await putJson(KEY, local);
console.log(
  `[seed] OK — subidas ${(local.galleries || []).length} galerías y ` +
    `${(local.categories || []).length} categorías a R2://${KEY}`
);
