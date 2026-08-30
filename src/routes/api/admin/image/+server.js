import { error } from '@sveltejs/kit';
import { getObject } from '$lib/server/r2.js';

// Same-origin proxy for bucket images. The admin editor needs to read a photo
// into a <canvas> to build the 1200x630 share thumbnail, and the public r2.dev
// host sends no CORS headers — going through our own origin avoids having to
// configure CORS on the bucket and keeps the canvas untainted.

const IMAGE_KEY = /\.(jpe?g|png|webp|avif|gif)$/i;

export async function GET({ url, locals }) {
  if (!locals.admin) throw error(401, 'No autorizado');

  const key = (url.searchParams.get('key') || '').trim();
  if (!key) throw error(400, 'Falta key');
  if (key.startsWith('/') || key.includes('..')) throw error(400, 'Key inválida');
  if (!IMAGE_KEY.test(key)) throw error(400, 'Solo se pueden leer imágenes');

  let object;
  try {
    object = await getObject(key);
  } catch (e) {
    if (e?.name === 'NoSuchKey' || e?.$metadata?.httpStatusCode === 404) {
      throw error(404, 'Imagen no encontrada');
    }
    throw e;
  }

  return new Response(object.body, {
    headers: {
      'content-type': object.contentType,
      'cache-control': 'private, max-age=300',
    },
  });
}
