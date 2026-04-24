import { error } from '@sveltejs/kit';
import galleries from '$lib/data/galleries.json';

export const prerender = true;

export function entries() {
  return galleries.galleries.filter((g) => (g.photos || []).length > 0).map((g) => ({ slug: g.slug }));
}

export function load({ params }) {
  const gallery = galleries.galleries.find((g) => g.slug === params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');
  return { gallery };
}
