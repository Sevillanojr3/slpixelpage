import { error, fail, redirect } from '@sveltejs/kit';
import {
  read,
  getGallery,
  upsertGallery,
  removePhotoFromGallery,
  deleteGallery,
  setGalleryPassword,
  setGalleryHidden,
  setGalleryParent,
  listChildren,
  isProtected,
  isHidden,
} from '$lib/server/galleries-store.js';
import { deleteObject, publicUrl, siteUrl } from '$lib/server/r2.js';

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const load = async ({ params }) => {
  const data = await read();
  const gallery = data.galleries.find((g) => g.slug === params.slug);
  if (!gallery) throw error(404, 'Galería no encontrada');

  const children = data.galleries
    .filter((g) => g.parent === gallery.slug)
    .map((g) => ({
      slug: g.slug,
      title: g.title || g.slug,
      photoCount: (g.photos || []).length,
      hidden: isHidden(g),
    }));

  const parentInfo = gallery.parent
    ? data.galleries.find((g) => g.slug === gallery.parent)
    : null;

  return {
    gallery: {
      slug: gallery.slug,
      title: gallery.title || gallery.h1 || gallery.slug,
      category: gallery.category || null,
      date: gallery.date || null,
      h1: gallery.h1 || null,
      photos: gallery.photos || [],
      protected: isProtected(gallery),
      hidden: isHidden(gallery),
      parent: gallery.parent || null,
      parentTitle: parentInfo ? parentInfo.title || parentInfo.slug : null,
      parentProtected: parentInfo ? isProtected(parentInfo) : false,
    },
    children,
    eligibleParents: data.galleries
      .filter((g) => !g.parent && g.slug !== gallery.slug)
      .map((g) => ({ slug: g.slug, title: g.title || g.slug })),
    categories: data.categories,
    publicBase: publicUrl(),
    siteUrl: siteUrl(),
  };
};

export const actions = {
  update: async ({ request, params }) => {
    const form = await request.formData();
    const title = (form.get('title') || '').toString().trim();
    const category = (form.get('category') || '').toString() || null;
    const date = (form.get('date') || '').toString() || null;
    if (!title) return fail(400, { error: 'Título requerido.' });
    await upsertGallery({ slug: params.slug, title, category, date });
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
    await removePhotoFromGallery(params.slug, key);
    return { ok: true };
  },

  delete: async ({ params }) => {
    const g = await getGallery(params.slug);
    if (!g) throw redirect(303, '/admin/galerias');
    try {
      await deleteGallery(params.slug);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    throw redirect(303, g.parent ? `/admin/galerias/${g.parent}` : '/admin/galerias');
  },

  setPassword: async ({ request, params }) => {
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    if (password.length < 4) return fail(400, { error: 'La contraseña debe tener al menos 4 caracteres.' });
    try {
      await setGalleryPassword(params.slug, password);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true, passwordChanged: true, lastPassword: password };
  },

  clearPassword: async ({ params }) => {
    try {
      await setGalleryPassword(params.slug, null);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true, passwordCleared: true };
  },

  setHidden: async ({ request, params }) => {
    const form = await request.formData();
    const hidden = form.get('hidden') === '1';
    await setGalleryHidden(params.slug, hidden);
    return { ok: true, hiddenChanged: true };
  },

  setParent: async ({ request, params }) => {
    const form = await request.formData();
    const parent = (form.get('parent') || '').toString().trim() || null;
    try {
      await setGalleryParent(params.slug, parent);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true, parentChanged: true };
  },

  createChild: async ({ request, params }) => {
    const form = await request.formData();
    const title = (form.get('title') || '').toString().trim();
    if (!title) return fail(400, { error: 'Título requerido.' });
    let childSlug = (form.get('slug') || '').toString().trim() || slugify(`${params.slug}-${title}`);
    const data = await read();
    if (data.galleries.some((g) => g.slug === childSlug)) {
      return fail(409, { error: `Ya existe una galería con slug "${childSlug}".` });
    }
    const parent = data.galleries.find((g) => g.slug === params.slug);
    if (!parent) throw error(404, 'Galería padre no encontrada.');
    if (parent.parent) return fail(400, { error: 'Una subgalería no puede tener subgalerías.' });

    await upsertGallery({
      slug: childSlug,
      title,
      parent: params.slug,
      photos: [],
      createdAt: new Date().toISOString(),
    });
    throw redirect(303, `/admin/galerias/${childSlug}`);
  },
};
