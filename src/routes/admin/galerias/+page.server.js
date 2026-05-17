import { fail, redirect } from '@sveltejs/kit';
import {
  read,
  upsertGallery,
  deleteGallery,
  setGalleryCategory,
  setGalleryPassword,
  setGalleryHidden,
  isProtected,
  isHidden,
} from '$lib/server/galleries-store.js';
import { siteUrl } from '$lib/server/r2.js';

export const load = async () => {
  const data = await read();
  return {
    galleries: data.galleries.map((g) => ({
      slug: g.slug,
      title: g.title || g.h1 || g.slug,
      category: g.category || null,
      date: g.date || null,
      photoCount: (g.photos || []).length,
      protected: isProtected(g),
      hidden: isHidden(g),
      createdAt: g.createdAt || g.date || null,
    })),
    categories: data.categories,
    siteUrl: siteUrl(),
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
    const access = (form.get('access') || 'public').toString();
    const password = (form.get('password') || '').toString();
    let slug = (form.get('slug') || '').toString().trim() || slugify(title);
    if (!title || !slug) return fail(400, { error: 'Título y slug requeridos.' });
    if (access === 'protected' && password.length < 4) {
      return fail(400, { error: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const data = await read();
    if (data.galleries.some((g) => g.slug === slug)) {
      return fail(409, { error: `Ya existe una galería con slug "${slug}".` });
    }
    await upsertGallery({
      slug,
      title,
      category,
      date,
      photos: [],
      createdAt: new Date().toISOString(),
    });
    if (access === 'protected' && password) {
      await setGalleryPassword(slug, password);
    }
    throw redirect(303, `/admin/galerias/${slug}`);
  },

  setPassword: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    const password = (form.get('password') || '').toString();
    try {
      await setGalleryPassword(slug, password || null);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true };
  },

  clearPassword: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    await setGalleryPassword(slug, null);
    return { ok: true };
  },

  toggleHidden: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    const hidden = form.get('hidden') === '1';
    await setGalleryHidden(slug, hidden);
    return { ok: true };
  },

  setCategory: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    const category = (form.get('category') || '').toString() || null;
    await setGalleryCategory(slug, category);
    return { ok: true };
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const slug = (form.get('slug') || '').toString();
    await deleteGallery(slug);
    return { ok: true };
  },
};
