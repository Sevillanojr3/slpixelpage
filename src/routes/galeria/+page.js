import galleries from '$lib/data/galleries.json';

export const prerender = true;
export const ssr = true;

export function load() {
  const list = galleries.galleries
    .filter((g) => (g.photos || []).length > 0)
    .map((g) => ({
      slug: g.slug,
      title: g.title,
      date: g.date,
      category: g.category || 'otros',
      count: g.photos.length,
      cover: g.photos[0], // first photo is used as card cover
    }))
    .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));

  return { list };
}
