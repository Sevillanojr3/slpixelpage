import { fail } from '@sveltejs/kit';
import { read, addCategory, deleteCategory, renameCategory } from '$lib/server/galleries-store.js';

export const load = async () => {
  const data = await read();
  const counts = {};
  for (const g of data.galleries) {
    const k = g.category || '__none__';
    counts[k] = (counts[k] || 0) + 1;
  }
  return {
    categories: data.categories.map((c) => ({ ...c, count: counts[c.id] || 0 })),
    uncategorized: counts['__none__'] || 0,
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
    const label = (form.get('label') || '').toString().trim();
    if (!label) return fail(400, { error: 'Nombre requerido.' });
    const id = (form.get('id') || '').toString().trim() || slugify(label);
    if (!id) return fail(400, { error: 'Slug inválido.' });
    try {
      await addCategory({ id, label });
    } catch (e) {
      return fail(409, { error: e.message });
    }
    return { ok: true };
  },

  rename: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    const label = (form.get('label') || '').toString().trim();
    if (!id || !label) return fail(400, { error: 'Faltan datos.' });
    try {
      await renameCategory(id, label);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true };
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    await deleteCategory(id);
    return { ok: true };
  },
};
