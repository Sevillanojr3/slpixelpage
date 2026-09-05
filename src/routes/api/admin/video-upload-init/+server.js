import { json } from '@sveltejs/kit';
import { presignPut } from '$lib/server/r2.js';

// Videos go straight from the browser to R2 with a presigned PUT, the same way
// photos do. Two prefixes: `videos/` for the file itself and `videos/posters/`
// for the still frame the admin grabs client-side, so a poster never shows up
// as a clip of its own.

const MAX_MB = 512;
const MAX_BYTES = MAX_MB * 1024 * 1024;

// Long enough for a 500 MB upload on a slow connection.
const PUT_EXPIRY_SEC = 3600;

const safeName = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || `video-${Date.now()}`;

export async function POST({ request, locals }) {
  if (!locals.admin) return json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const kind = body.kind === 'poster' ? 'poster' : 'video';
  const filename = String(body.filename || '').trim();
  const contentType = String(body.contentType || '').trim();
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (kind === 'poster') {
    const url = await presignPut(`videos/posters/${stamp}.jpg`, 'image/jpeg', PUT_EXPIRY_SEC);
    return json({ url, key: `videos/posters/${stamp}.jpg` });
  }

  if (!filename) return json({ error: 'filename requerido' }, { status: 400 });
  if (!contentType.startsWith('video/')) {
    return json({ error: 'El archivo debe ser un video.' }, { status: 400 });
  }
  const size = Number(body.size) || 0;
  if (size > MAX_BYTES) {
    return json({ error: `El video supera el límite de ${MAX_MB} MB.` }, { status: 413 });
  }

  const key = `videos/${stamp}-${safeName(filename)}`;
  const url = await presignPut(key, contentType, PUT_EXPIRY_SEC);
  return json({ url, key, maxBytes: MAX_BYTES });
}
