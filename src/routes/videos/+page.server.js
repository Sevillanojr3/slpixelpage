import { listVideos } from '$lib/server/videos-store.js';
import { listCategories } from '$lib/server/galleries-store.js';
import { assetUrl } from '$lib/images.js';
import { absoluteUrl, buildSiteSeo } from '$lib/seo.js';

export const prerender = false;

export async function load({ url }) {
  let videos = [];
  let categories = [];
  try {
    [videos, categories] = await Promise.all([listVideos(), listCategories()]);
  } catch (e) {
    // A missing bucket shouldn't take the page down — it renders empty instead.
    console.warn('[videos] no se pudo leer el catálogo:', e.message);
  }

  const visible = videos
    .filter((v) => !v.hidden)
    .map(({ hidden, size, filename, ...v }) => v);

  const used = new Set(visible.map((v) => v.category).filter(Boolean));

  return {
    videos: visible,
    // Only offer filters that actually match something.
    categories: categories.filter((c) => used.has(c.id)),
    jsonLd: visible.slice(0, 24).map((v) => ({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.description || `Video de SL Pixel · ${v.title}`,
      thumbnailUrl: v.posterKey ? absoluteUrl(url.origin, assetUrl(v.posterKey)) : undefined,
      contentUrl: absoluteUrl(url.origin, assetUrl(v.key)),
      uploadDate: v.createdAt || undefined,
      width: v.width || undefined,
      height: v.height || undefined,
    })),
    seo: buildSiteSeo({
      title: 'Videos — SL Pixel',
      description:
        'Reels y piezas en movimiento del estudio SL Pixel: eventos, deportes y producciones corporativas en Panamá.',
      origin: url.origin,
      path: url.pathname,
    }),
  };
}
