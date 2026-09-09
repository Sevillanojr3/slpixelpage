import { describe, it, expect, vi, beforeEach } from 'vitest';

// El store habla con R2: solo se sustituye la lectura del catálogo.
vi.mock('$lib/server/galleries-store.js', async (importOriginal) => ({
  ...(await importOriginal()),
  read: vi.fn(),
}));

import { load } from './+page.server.js';
import { read } from '$lib/server/galleries-store.js';

const event = { url: new URL('https://slpixel.com/') };

beforeEach(() => vi.mocked(read).mockReset());

describe('portada — galerías públicas', () => {
  it('descarta las ocultas y las subgalerías que cuelgan de un padre oculto', async () => {
    vi.mocked(read).mockResolvedValue({
      galleries: [
        { slug: 'publica', parent: null, photos: [{ key: 'a.jpg' }] },
        { slug: 'oculta', parent: null, hidden: true, photos: [{ key: 'b.jpg' }] },
        { slug: 'hija-de-oculta', parent: 'oculta', photos: [{ key: 'c.jpg' }] },
        { slug: 'hija-visible', parent: 'publica', photos: [{ key: 'd.jpg' }] },
        { slug: 'huerfana', parent: 'no-existe', photos: [{ key: 'e.jpg' }] },
      ],
    });

    const { galleries } = await load(event);

    expect(galleries.map((g) => g.slug)).toEqual(['publica', 'hija-visible']);
  });

  it('no expone las credenciales de una galería protegida', async () => {
    vi.mocked(read).mockResolvedValue({
      galleries: [
        {
          slug: 'protegida',
          parent: null,
          photos: [{ key: 'a.jpg' }],
          passwordHash: 'hash',
          salt: 'salt',
        },
      ],
    });

    const { galleries } = await load(event);

    expect(galleries[0]).toMatchObject({ slug: 'protegida', protected: true });
    expect(galleries[0]).not.toHaveProperty('passwordHash');
    expect(galleries[0]).not.toHaveProperty('salt');
  });
});
