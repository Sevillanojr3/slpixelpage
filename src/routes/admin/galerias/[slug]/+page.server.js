import { error, fail, redirect } from '@sveltejs/kit';
import { read, getGallery, upsertGallery, removePhotoFromGallery, deleteGallery } from '$lib/server/galleries-store.js';
import { deleteObject, publicUrl } from '$lib/server/r2.js';

export const load = async ({ params }) => {
  const data = read();
  const gallery = data.galleries.find((g) => g.slug === params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');
  return {
    gallery: {
      slug: gallery.slug,
      title: gallery.title || gallery.h1 || gallery.slug,
      category: gallery.category || null,
      date: gallery.date || null,
      h1: gallery.h1 || null,
      photos: gallery.photos || [],
    },
    categories: data.categories,
    publicBase: publicUrl(),
  };
};

export const actions = {
  update: async ({ request, params }) => {
    const form = await request.formData();
    const title = (form.get('title') || '').toString().trim();
    const category = (form.get('category') || '').toString() || null;
    const date = (form.get('date') || '').toString() || null;
    if (!title) return fail(400, { error: 'Título requerido.' });
    upsertGallery({ slug: params.slug, title, category, date });
    return { ok: true };
  },

  removePhoto: async ({ request, params }) => {
    const form = await request.formData();
    const key = (form.get('key') || '').toString();
    if (!key) return fail(400, { error: 'Falta key' });
    try {
      await deleteObject(key);
    } catch (e) {
      console.warn('[admin] R2 delete failed (continuing):', e.message);
    }
    removePhotoFromGallery(params.slug, key);
    return { ok: true };
  },

  delete: async ({ params }) => {
    const g = getGallery(params.slug);
    if (!g) throw redirect(303, '/admin/galerias');
    deleteGallery(params.slug);
    throw redirect(303, '/admin/galerias');
  },
};
