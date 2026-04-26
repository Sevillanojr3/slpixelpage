import { fail, redirect } from '@sveltejs/kit';
import { read, upsertGallery, deleteGallery, setGalleryCategory } from '$lib/server/galleries-store.js';

export const load = async () => {
  const data = read();
  return {
    galleries: data.galleries.map((g) => ({
      slug: g.slug,
      title: g.title || g.h1 || g.slug,
      category: g.category || null,
      date: g.date || null,
      photoCount: (g.photos || []).length,
    })),
    categories: data.categories,
  };
};

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const title = (form.get('title') || '').toString().trim();
    const category = (form.get('category') || '').toString().trim() || null;
    const date = (form.get('date') || '').toString().trim() || null;
    let slug = (form.get('slug') || '').toString().trim() || slugify(title);
    if (!title || !slug) return fail(400, { error: 'Título y slug requeridos.' });

    const data = read();
    if (data.galleries.some((g) => g.slug === slug)) {
      return fail(409, { error: `Ya existe una galería con slug "${slug}".` });
    }
    upsertGallery({ slug, title, category, date, photos: [] });
    throw redirect(303, `/admin/galerias/${slug}`);
  },

  setCategory: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    const category = (form.get('category') || '').toString() || null;
    setGalleryCategory(slug, category);
    return { ok: true };
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    deleteGallery(slug);
    return { ok: true };
  },
};
