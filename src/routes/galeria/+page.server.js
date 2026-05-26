import { read } from '$lib/server/galleries-store.js';

export const prerender = false;

export async function load() {
  const data = await read();
  const all = data.galleries;
  const topLevel = all.filter((g) => !g.parent && !g.hidden);

  // Para una galería padre, sumar fotos de sus hijos y elegir cover
  const list = topLevel
    .map((g) => {
      const children = all.filter((c) => c.parent === g.slug && !c.hidden);
      const childPhotos = children.reduce((acc, c) => acc + (c.photos || []).length, 0);
      const ownPhotos = (g.photos || []).length;
      const totalPhotos = ownPhotos + childPhotos;

      // Cover: primera foto propia, sino la primera de la primera subgalería con fotos
      let cover = (g.photos || [])[0] || null;
      let coverSlug = g.slug;
      if (!cover) {
        for (const c of children) {
          if ((c.photos || []).length > 0) {
            cover = c.photos[0];
            coverSlug = c.slug;
            break;
          }
        }
      }
      return {
        slug: g.slug,
        title: g.title,
        date: g.date,
        category: g.category || 'otros',
        count: totalPhotos,
        childrenCount: children.length,
        cover,
        coverSlug,
        protected: Boolean(g.passwordHash),
      };
    })
    // Mostrar solo galerías con contenido (fotos propias o subgalerías)
    .filter((g) => g.count > 0 || g.childrenCount > 0)
    .sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0));

  return { list };
}
