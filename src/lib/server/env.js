// Centralized .env loader. Workaround for SvelteKit/Vite env propagation
// quirks in WSL — reads the .env file directly at startup.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cache = {};

try {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    cache[key] = val;
  }
} catch (e) {
  console.error('[env] could not read .env:', e.message);
}

/** Read an env variable. Falls back to process.env, then defaultValue. */
export function envVar(key, defaultValue) {
  return cache[key] || process.env[key] || defaultValue;
}
