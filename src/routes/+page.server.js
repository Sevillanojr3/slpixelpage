import { read } from '$lib/server/galleries-store.js';

export const prerender = false;

export async function load() {
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
  return { galleries };
}
