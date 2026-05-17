import { error, fail } from '@sveltejs/kit';
import { getGallery, verifyGalleryPassword, isProtected } from '$lib/server/galleries-store.js';
import { hasAccess, setAccessCookie } from '$lib/server/gallery-access.js';

export const prerender = false;

function sanitize(g) {
  const { passwordHash, salt, ...rest } = g;
  return rest;
}

export async function load({ params, cookies, locals }) {
  const gallery = await getGallery(params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');

  const protectedGallery = isProtected(gallery);
  // Admins or visitors with valid access cookie can download.
  const downloadsUnlocked =
    !protectedGallery || locals.admin || hasAccess(cookies, params.slug);

  return {
    gallery: { ...sanitize(gallery), protected: protectedGallery },
    downloadsUnlocked,
  };
}

export const actions = {
  unlock: async ({ request, params, cookies }) => {
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    const gallery = await getGallery(params.slug);
    if (!gallery) throw error(404, 'Galería no encontrada');
    if (!isProtected(gallery)) return { ok: true };
    if (!verifyGalleryPassword(gallery, password)) {
      return fail(401, { error: 'Contraseña incorrecta.' });
    }
    setAccessCookie(cookies, params.slug);
    return { ok: true };
  },
};
