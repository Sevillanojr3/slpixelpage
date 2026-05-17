import { read } from '$lib/server/galleries-store.js';

export const prerender = false;

export async function load() {
  const data = await read();
  const list = data.galleries
    .filter((g) => !g.hidden && (g.photos || []).length > 0)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      date: g.date,
      category: g.category || 'otros',
      count: g.photos.length,
      cover: g.photos[0],
      protected: Boolean(g.passwordHash),
    }))
    .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));

  return { list };
}
