import { describe, it, expect, vi, beforeEach } from 'vitest';

// El store y R2 hablan con la red: se sustituyen por dobles.
vi.mock('$lib/server/galleries-store.js', async (importOriginal) => ({
  ...(await importOriginal()),
  read: vi.fn(async () => ({ galleries: [], categories: [] })),
  upsertGallery: vi.fn(),
}));
vi.mock('$lib/server/r2.js', () => ({
  deleteObject: vi.fn(),
  publicUrl: () => '',
  siteUrl: () => 'https://slpixel.com',
}));

import { actions } from './+page.server.js';
import { upsertGallery } from '$lib/server/galleries-store.js';

function updateEvent(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return { request: { formData: async () => form }, params: { slug: 'boda-ana' } };
}

beforeEach(() => vi.mocked(upsertGallery).mockReset());

describe('admin — datos de la galería', () => {
  it('guarda el nombre del fotógrafo sin espacios sobrantes', async () => {
    await actions.update(updateEvent({ title: 'Boda Ana', photographer: '  Jesús Sevillano  ' }));

    expect(upsertGallery).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'boda-ana', photographer: 'Jesús Sevillano' }),
    );
  });

  it('borra el fotógrafo cuando el campo se deja vacío', async () => {
    await actions.update(updateEvent({ title: 'Boda Ana', photographer: '   ' }));

    expect(upsertGallery).toHaveBeenCalledWith(expect.objectContaining({ photographer: null }));
  });
});
