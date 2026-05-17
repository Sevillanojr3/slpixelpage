import { error, fail } from '@sveltejs/kit';
import { getGallery, verifyGalleryPassword, isProtected } from '$lib/server/galleries-store.js';
import { hasAccess, setAccessCookie } from '$lib/server/gallery-access.js';

export const prerender = false;

function sanitize(g) {
  // strip auth fields before sending to the browser
  const { passwordHash, salt, ...rest } = g;
  return rest;
}

export async function load({ params, cookies, locals }) {
  const gallery = await getGallery(params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');

  // Admins always pass through; visitors with a valid access cookie too.
  const protectedGallery = isProtected(gallery);
  const unlocked = !protectedGallery || locals.admin || hasAccess(cookies, params.slug);

  if (!unlocked) {
    return {
      gallery: {
        slug: gallery.slug,
        title: gallery.title,
        category: gallery.category || null,
        date: gallery.date || null,
        protected: true,
        photoCount: (gallery.photos || []).length,
      },
      locked: true,
    };
  }

  return { gallery: sanitize(gallery), locked: false };
}

export const actions = {
  unlock: async ({ request, params, cookies }) => {
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    const gallery = await getGallery(params.slug);
    if (!gallery) throw error(404, 'Galería no encontrada');
    if (!isProtected(gallery)) {
      return { ok: true };
    }
    if (!verifyGalleryPassword(gallery, password)) {
      return fail(401, { error: 'Contraseña incorrecta.' });
    }
    setAccessCookie(cookies, params.slug);
    return { ok: true };
  },
};
