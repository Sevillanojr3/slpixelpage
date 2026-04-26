import { json } from '@sveltejs/kit';
import { addPhotoToGallery, getGallery } from '$lib/server/galleries-store.js';

export async function POST({ request, locals }) {
  if (!locals.admin) return json({ error: 'No autorizado' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const slug = String(body.slug || '');
  const key = String(body.key || '');
  const filename = String(body.filename || '');
  if (!slug || !key) return json({ error: 'slug y key requeridos' }, { status: 400 });
  if (!(await getGallery(slug))) return json({ error: 'Galería no existe' }, { status: 404 });

  await addPhotoToGallery(slug, { key, filename, uploadedAt: new Date().toISOString() });
  return json({ ok: true });
}
