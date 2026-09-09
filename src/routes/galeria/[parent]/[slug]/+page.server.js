import { error, redirect } from '@sveltejs/kit';
import { getGallery, isProtected } from '$lib/server/galleries-store.js';
import { hasAccess } from '$lib/server/gallery-access.js';
import { buildGallerySeo } from '$lib/seo.js';

export const prerender = false;

function sanitize(g) {
  const { passwordHash, salt, ...rest } = g;
  return rest;
}

export async function load({ params, cookies, locals, url }) {
  const parent = await getGallery(params.parent);
  if (!parent) throw error(404, 'Galería padre no encontrada');
  if (parent.parent) throw error(400, 'Estructura inválida.');

  const child = await getGallery(params.slug);
  if (!child) throw error(404, 'Subgalería no encontrada');
  if (child.parent !== parent.slug) {
    // Slug existe pero no pertenece a este padre
    if (!child.parent) throw redirect(307, `/galeria/${child.slug}`);
    throw redirect(307, `/galeria/${child.parent}/${child.slug}`);
  }

  const protectedParent = isProtected(parent);
  const unlocked = !protectedParent || locals.admin || hasAccess(cookies, parent.slug);

  if (protectedParent && !unlocked) {
    // Redirigir al padre para que ingrese la contraseña ahí
    throw redirect(307, `/galeria/${parent.slug}`);
  }

  const parentSummary = {
    slug: parent.slug,
    title: parent.title || parent.slug,
    category: parent.category || null,
    protected: protectedParent,
  };

  return {
    parent: parentSummary,
    child: {
      ...sanitize(child),
      // El capítulo hereda el fotógrafo del evento salvo que tenga uno propio.
      photographer: child.photographer || parent.photographer || null,
    },
    downloadsUnlocked: unlocked,
    // A subgallery with no cover of its own inherits the parent's.
    seo: buildGallerySeo({
      gallery: sanitize(child),
      parent: { ...parentSummary, ogImage: parent.ogImage, photos: parent.photos },
      origin: url.origin,
      path: url.pathname,
    }),
  };
}
