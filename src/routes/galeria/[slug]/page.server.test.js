import { describe, it, expect, vi, beforeEach } from 'vitest';

// The store talks to R2, so the loader is exercised against a stub.
vi.mock('$lib/server/galleries-store.js', () => ({
  getGallery: vi.fn(),
  listChildren: vi.fn(async () => []),
  verifyGalleryPassword: vi.fn(),
  isProtected: (g) => Boolean(g?.passwordHash),
}));
vi.mock('$lib/server/gallery-access.js', () => ({
  hasAccess: () => false,
  setAccessCookie: vi.fn(),
}));

import { load } from './+page.server.js';
import { getGallery } from '$lib/server/galleries-store.js';

const event = {
  params: { slug: 'investidura-de-blanco' },
  cookies: { get: () => undefined },
  locals: { admin: null },
  url: new URL('https://slpixel.com/galeria/investidura-de-blanco'),
};

beforeEach(() => vi.mocked(getGallery).mockReset());

describe('gallery loader share metadata', () => {
  it('hands the page the configured thumbnail as an absolute URL', async () => {
    vi.mocked(getGallery).mockResolvedValue({
      slug: 'investidura-de-blanco',
      title: 'INVESTIDURA DE BLANCO de SLPixel',
      parent: null,
      photos: [{ key: 'investidura-de-blanco/a.jpg' }],
      ogImage: 'og/investidura-de-blanco-mfx1.jpg',
    });

    const data = await load(event);

    expect(data.seo).toMatchObject({
      title: 'INVESTIDURA DE BLANCO — SL Pixel',
      image: 'https://slpixel.com/og/investidura-de-blanco-mfx1.jpg',
      url: 'https://slpixel.com/galeria/investidura-de-blanco',
      optimized: true,
    });
  });

  it('still returns metadata on the locked branch, and never a photo', async () => {
    vi.mocked(getGallery).mockResolvedValue({
      slug: 'investidura-de-blanco',
      title: 'INVESTIDURA DE BLANCO',
      parent: null,
      passwordHash: 'x',
      salt: 'y',
      photos: [{ key: 'investidura-de-blanco/a.jpg' }],
      ogImage: 'og/investidura-de-blanco-mfx1.jpg',
    });

    const data = await load(event);

    expect(data.locked).toBe(true);
    expect(data.seo.image).toBe('https://slpixel.com/brand/og-default.jpg');
    expect(JSON.stringify(data)).not.toContain('investidura-de-blanco/a.jpg');
  });

  it('leaks neither the password hash nor the salt into the payload', async () => {
    vi.mocked(getGallery).mockResolvedValue({
      slug: 'demo',
      title: 'Demo',
      parent: null,
      passwordHash: 'super-secret-hash',
      salt: 'super-secret-salt',
      photos: [],
    });

    const data = await load(event);

    expect(JSON.stringify(data)).not.toMatch(/super-secret/);
  });
});
