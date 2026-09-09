import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/galleries-store.js', () => ({
  getGallery: vi.fn(),
  isProtected: (g) => Boolean(g?.passwordHash),
}));
vi.mock('$lib/server/gallery-access.js', () => ({ hasAccess: () => false }));

import { load } from './+page.server.js';
import { getGallery } from '$lib/server/galleries-store.js';

const event = {
  params: { parent: 'boda-ana', slug: 'boda-ana-fiesta' },
  cookies: { get: () => undefined },
  locals: { admin: null },
  url: new URL('https://slpixel.com/galeria/boda-ana/boda-ana-fiesta'),
};

function stubCatalogue({ parentPhotographer, childPhotographer }) {
  const parent = { slug: 'boda-ana', title: 'Boda Ana', parent: null, photos: [] };
  if (parentPhotographer !== undefined) parent.photographer = parentPhotographer;

  const child = { slug: 'boda-ana-fiesta', title: 'Fiesta', parent: 'boda-ana', photos: [] };
  if (childPhotographer !== undefined) child.photographer = childPhotographer;

  vi.mocked(getGallery).mockImplementation(async (slug) => {
    if (slug === parent.slug) return parent;
    if (slug === child.slug) return child;
    return null;
  });
}

beforeEach(() => vi.mocked(getGallery).mockReset());

describe('capítulo — fotógrafo', () => {
  it('hereda el fotógrafo del padre cuando el capítulo no tiene uno propio', async () => {
    stubCatalogue({ parentPhotographer: 'Jesús Sevillano' });

    const { child } = await load(event);

    expect(child.photographer).toBe('Jesús Sevillano');
  });

  it('respeta el fotógrafo propio del capítulo', async () => {
    stubCatalogue({ parentPhotographer: 'Jesús Sevillano', childPhotographer: 'Ana Pérez' });

    const { child } = await load(event);

    expect(child.photographer).toBe('Ana Pérez');
  });

  it('deja el fotógrafo en null cuando no hay ninguno', async () => {
    stubCatalogue({});

    const { child } = await load(event);

    expect(child.photographer).toBeNull();
  });
});
