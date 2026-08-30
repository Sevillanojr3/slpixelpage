import { error, fail, redirect } from '@sveltejs/kit';
import {
  getGallery,
  listChildren,
  verifyGalleryPassword,
  isProtected,
} from '$lib/server/galleries-store.js';
import { hasAccess, setAccessCookie } from '$lib/server/gallery-access.js';
import { buildGallerySeo } from '$lib/seo.js';

export const prerender = false;

function sanitize(g) {
  const { passwordHash, salt, ...rest } = g;
  return rest;
}

function childSummary(child) {
  const photos = child.photos || [];
  return {
    slug: child.slug,
    title: child.title || child.slug,
    count: photos.length,
    cover: photos[0] || null,
    date: child.date || null,
  };
}

export async function load({ params, cookies, locals, url }) {
  const gallery = await getGallery(params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');

  // Si es una subgalería, redirigir a /galeria/[parent]/[slug]
  if (gallery.parent) {
    throw redirect(307, `/galeria/${gallery.parent}/${gallery.slug}`);
  }

  const children = await listChildren(gallery.slug);
  const hasChildren = children.length > 0;

  const protectedGallery = isProtected(gallery);
  const unlocked = !protectedGallery || locals.admin || hasAccess(cookies, params.slug);

  // Built from the full gallery so the locked branch below still gets a
  // preview — resolveOgImage falls back to the brand image when protected.
  const seo = buildGallerySeo({
    gallery: { ...sanitize(gallery), protected: protectedGallery },
    origin: url.origin,
    path: url.pathname,
  });

  // Si está protegida y no desbloqueada: no exponer fotos ni subgalerías
  if (protectedGallery && !unlocked) {
    return {
      gallery: {
        ...sanitize({ ...gallery, photos: [], children: [] }),
        protected: true,
        hasChildren,
      },
      downloadsUnlocked: false,
      locked: true,
      seo,
    };
  }

  return {
    gallery: {
      ...sanitize(gallery),
      protected: protectedGallery,
      hasChildren,
      children: children.map(childSummary),
    },
    downloadsUnlocked: unlocked,
    locked: false,
    seo,
  };
}

export const actions = {
  unlock: async ({ request, params, cookies }) => {
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    const gallery = await getGallery(params.slug);
    if (!gallery) throw error(404, 'Galería no encontrada');
    if (gallery.parent) throw error(400, 'Esta galería es una subgalería.');
    if (!isProtected(gallery)) return { ok: true };
    if (!verifyGalleryPassword(gallery, password)) {
      return fail(401, { error: 'Contraseña incorrecta.' });
    }
    setAccessCookie(cookies, params.slug);
    return { ok: true };
  },
};
