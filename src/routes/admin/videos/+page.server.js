import { fail } from '@sveltejs/kit';
import {
  listVideos,
  updateVideo,
  deleteVideo,
  moveVideo,
} from '$lib/server/videos-store.js';
import { listCategories } from '$lib/server/galleries-store.js';
import { deleteObject, publicUrl } from '$lib/server/r2.js';

export const load = async () => {
  const [videos, categories] = await Promise.all([listVideos(), listCategories()]);
  return { videos, categories, publicBase: publicUrl() };
};

export const actions = {
  update: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    const title = (form.get('title') || '').toString().trim();
    if (!title) return fail(400, { error: 'El título es obligatorio.' });
    try {
      await updateVideo(id, {
        title,
        description: (form.get('description') || '').toString().trim(),
        category: (form.get('category') || '').toString().trim() || null,
      });
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true, savedId: id };
  },

  toggleHidden: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    const hidden = form.get('hidden') === '1';
    try {
      await updateVideo(id, { hidden });
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true, savedId: id };
  },

  move: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    const direction = form.get('direction') === 'up' ? -1 : 1;
    try {
      await moveVideo(id, direction);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    return { ok: true };
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const id = (form.get('id') || '').toString();
    let removed;
    try {
      removed = await deleteVideo(id);
    } catch (e) {
      return fail(400, { error: e.message });
    }
    // The manifest is already clean; a bucket object that survives is noise,
    // not corruption, so a failed delete only gets logged.
    for (const key of [removed?.key, removed?.posterKey].filter(Boolean)) {
      try {
        await deleteObject(key);
      } catch (e) {
        console.warn('[admin] R2 delete failed (continuing):', key, e.message);
      }
    }
    return { ok: true, deleted: true };
  },
};
