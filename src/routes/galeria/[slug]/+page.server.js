import { error } from '@sveltejs/kit';
import { getGallery } from '$lib/server/galleries-store.js';

export const prerender = false;

export async function load({ params }) {
  const gallery = await getGallery(params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');
  return { gallery };
}
