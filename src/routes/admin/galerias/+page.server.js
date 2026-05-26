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
  const all = data.galleries;
  const childrenCountBySlug = all.reduce((acc, g) => {
    if (g.parent) acc[g.parent] = (acc[g.parent] || 0) + 1;
    return acc;
  }, {});
  return {
    galleries: all.map((g) => ({
      slug: g.slug,
      title: g.title || g.h1 || g.slug,
      category: g.category || null,
      date: g.date || null,
      photoCount: (g.photos || []).length,
      protected: isProtected(g),
      hidden: isHidden(g),
      parent: g.parent || null,
      childrenCount: childrenCountBySlug[g.slug] || 0,
      createdAt: g.createdAt || g.date || null,
    })),
    // Galerías que pueden ser padres: top-level y sin ya ser hijas
    eligibleParents: all
      .filter((g) => !g.parent)
      .map((g) => ({ slug: g.slug, title: g.title || g.slug })),
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
    const parent = (form.get('parent') || '').toString().trim() || null;
    let slug = (form.get('slug') || '').toString().trim() || slugify(title);
    if (!title || !slug) return fail(400, { error: 'Título y slug requeridos.' });

    const data = await read();
    if (data.galleries.some((g) => g.slug === slug)) {
      return fail(409, { error: `Ya existe una galería con slug "${slug}".` });
    }

    if (parent) {
      const parentGallery = data.galleries.find((g) => g.slug === parent);
      if (!parentGallery) return fail(400, { error: 'Galería padre no encontrada.' });
      if (parentGallery.parent) return fail(400, { error: 'Solo se permiten 2 niveles de anidamiento.' });
      // Subgalerías heredan la contraseña: no aceptamos password en creación
      if (access === 'protected') {
        return fail(400, { error: 'Una subgalería hereda la contraseña del padre; no se le asigna una propia.' });
      }
    } else if (access === 'protected' && password.length < 4) {
      return fail(400, { error: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    await upsertGallery({
      slug,
      title,
      category,
      date,
      photos: [],
      parent,
      createdAt: new Date().toISOString(),
    });
    if (!parent && access === 'protected' && password) {
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
    try {
      await deleteGallery(slug);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true };
  },
};
