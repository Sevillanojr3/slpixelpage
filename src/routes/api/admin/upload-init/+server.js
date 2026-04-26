import { json } from '@sveltejs/kit';
import { presignPut } from '$lib/server/r2.js';
import { getGallery } from '$lib/server/galleries-store.js';

const safeName = (name) =>
  String(name || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || `file-${Date.now()}`;

export async function POST({ request, locals }) {
  if (!locals.admin) return json({ error: 'No autorizado' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug || '').trim();
  const filename = String(body.filename || '').trim();
  const contentType = String(body.contentType || 'application/octet-stream');
  if (!slug || !filename) return json({ error: 'slug y filename requeridos' }, { status: 400 });
  if (!(await getGallery(slug))) return json({ error: 'Galería no existe' }, { status: 404 });

  const stamp = Date.now().toString(36);
  const key = `${slug}/${stamp}-${safeName(filename)}`;
  const url = await presignPut(key, contentType, 600);
  return json({ url, key });
}
