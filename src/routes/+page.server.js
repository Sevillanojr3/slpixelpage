import { read } from '$lib/server/galleries-store.js';
import { buildSiteSeo } from '$lib/seo.js';

export const prerender = false;

export async function load({ url }) {
  const data = await read();
  // Public-safe view of each gallery (strip auth fields, drop hidden ones).
  const galleries = data.galleries
    .filter((g) => !g.hidden)
    .map((g) => {
      const { passwordHash, salt, ...rest } = g;
      return {
        ...rest,
        protected: Boolean(passwordHash),
        cover: (g.photos || [])[0] || null,
      };
    });
  return {
    galleries,
    seo: buildSiteSeo({
      title: 'SLPixel — Estudio de Fotografía Editorial',
      description:
        'SLPixel — Estudio de fotografía y producción visual en Panamá. Bodas, eventos, deportes y sesiones corporativas.',
      origin: url.origin,
      path: url.pathname,
    }),
  };
}
