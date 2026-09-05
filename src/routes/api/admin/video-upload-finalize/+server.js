import { json } from '@sveltejs/kit';
import { addVideo } from '$lib/server/videos-store.js';

/**
 * Record a video the browser already pushed to R2. The dimensions and duration
 * are read client-side from the file before upload — that is the only place we
 * can get them without decoding the video on the server.
 */
export async function POST({ request, locals }) {
  if (!locals.admin) return json({ error: 'No autorizado' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const key = String(body.key || '').trim();
  if (!key.startsWith('videos/')) return json({ error: 'key inválida' }, { status: 400 });

  try {
    const video = await addVideo({
      key,
      posterKey: String(body.posterKey || '').trim() || null,
      title: String(body.title || '').trim() || String(body.filename || 'Sin título'),
      description: String(body.description || '').trim(),
      category: String(body.category || '').trim() || null,
      contentType: String(body.contentType || 'video/mp4'),
      width: Number(body.width) || 0,
      height: Number(body.height) || 0,
      duration: Number(body.duration) || 0,
      size: Number(body.size) || 0,
      filename: String(body.filename || ''),
    });
    return json({ ok: true, video });
  } catch (e) {
    return json({ error: e.message }, { status: 400 });
  }
}
