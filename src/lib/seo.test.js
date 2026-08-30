import { describe, it, expect } from 'vitest';
import {
  buildGallerySeo,
  resolveOgImage,
  absoluteUrl,
  cleanTitle,
  BRAND_OG_IMAGE,
  OG_WIDTH,
  OG_HEIGHT,
} from './seo.js';

const photo = (name) => ({ key: `demo/${name}.jpg` });

describe('resolveOgImage', () => {
  it('uses the configured cover derivative when there is one', () => {
    const image = resolveOgImage({
      slug: 'demo',
      photos: [photo('a')],
      ogImage: 'og/demo-1756512000.jpg',
    });
    expect(image).toEqual({
      url: '/og/demo-1756512000.jpg',
      optimized: true,
      branded: false,
    });
  });

  it('falls back to the first photo when no cover is configured', () => {
    const image = resolveOgImage({ slug: 'demo', photos: [photo('a'), photo('b')] });
    expect(image).toEqual({ url: '/demo/a.jpg', optimized: false, branded: false });
  });

  it('never exposes a photo from a password-protected gallery', () => {
    const image = resolveOgImage({
      slug: 'demo',
      protected: true,
      photos: [photo('a')],
      ogImage: 'og/demo-1756512000.jpg',
    });
    expect(image).toEqual({ url: BRAND_OG_IMAGE, optimized: true, branded: true });
  });

  it('lets a subgallery inherit the cover of its parent', () => {
    const image = resolveOgImage(
      { slug: 'demo-hijo', photos: [photo('a')] },
      { parent: { slug: 'demo', ogImage: 'og/demo-1756512000.jpg' } },
    );
    expect(image).toEqual({
      url: '/og/demo-1756512000.jpg',
      optimized: true,
      branded: false,
    });
  });

  it('prefers its own cover over the one inherited from the parent', () => {
    const image = resolveOgImage(
      { slug: 'demo-hijo', ogImage: 'og/demo-hijo-2.jpg' },
      { parent: { slug: 'demo', ogImage: 'og/demo-1.jpg' } },
    );
    expect(image.url).toBe('/og/demo-hijo-2.jpg');
  });

  it('borrows a photo from the parent when the subgallery is still empty', () => {
    const image = resolveOgImage(
      { slug: 'demo-hijo', photos: [] },
      { parent: { slug: 'demo', photos: [photo('a')] } },
    );
    expect(image).toEqual({ url: '/demo/a.jpg', optimized: false, branded: false });
  });

  it('falls back to the brand image when there is nothing to show', () => {
    const image = resolveOgImage({ slug: 'demo', photos: [] });
    expect(image).toEqual({ url: BRAND_OG_IMAGE, optimized: true, branded: true });
  });

  it('serves Pixieset photos at the light `large` variant, not xxlarge', () => {
    const image = resolveOgImage({
      slug: 'demo',
      photos: [{ bucket: '065590311', hash: 'abc123', size: 'xxlarge', ext: 'jpg' }],
    });
    expect(image.url).toBe('/galeria/demo/abc123-large.jpg');
  });
});

describe('absoluteUrl', () => {
  it('prefixes a site-relative path with the origin', () => {
    expect(absoluteUrl('https://slpixel.com', '/brand/og-default.jpg')).toBe(
      'https://slpixel.com/brand/og-default.jpg',
    );
  });

  it('leaves an already absolute URL alone', () => {
    expect(absoluteUrl('https://slpixel.com', 'https://cdn.example/a.jpg')).toBe(
      'https://cdn.example/a.jpg',
    );
  });

  it('does not double the slash when the origin has a trailing one', () => {
    expect(absoluteUrl('https://slpixel.com/', '/a.jpg')).toBe('https://slpixel.com/a.jpg');
  });
});

describe('cleanTitle', () => {
  it('strips the "de SLPixel" suffix left by the Pixieset import', () => {
    expect(cleanTitle('BABY SHOWER MALDONADO de SLPixel')).toBe('BABY SHOWER MALDONADO');
  });
});

describe('buildGallerySeo', () => {
  const origin = 'https://slpixel.com';

  it('builds absolute tags for a gallery with a configured cover', () => {
    const seo = buildGallerySeo({
      gallery: {
        slug: 'investidura-de-blanco',
        title: 'INVESTIDURA DE BLANCO de SLPixel',
        ogImage: 'og/investidura-de-blanco-1756512000.jpg',
      },
      origin,
      path: '/galeria/investidura-de-blanco',
    });
    expect(seo).toMatchObject({
      title: 'INVESTIDURA DE BLANCO — SL Pixel',
      image: 'https://slpixel.com/og/investidura-de-blanco-1756512000.jpg',
      imageAlt: 'INVESTIDURA DE BLANCO',
      imageWidth: OG_WIDTH,
      imageHeight: OG_HEIGHT,
      url: 'https://slpixel.com/galeria/investidura-de-blanco',
      optimized: true,
    });
  });

  it('omits the image dimensions when falling back to a raw photo', () => {
    const seo = buildGallerySeo({
      gallery: { slug: 'demo', title: 'Demo', photos: [photo('a')] },
      origin,
      path: '/galeria/demo',
    });
    expect(seo).toMatchObject({
      image: 'https://slpixel.com/demo/a.jpg',
      imageWidth: null,
      imageHeight: null,
      optimized: false,
    });
  });

  it('describes a protected gallery without naming its contents', () => {
    const seo = buildGallerySeo({
      gallery: { slug: 'demo', title: 'Demo', protected: true, photos: [photo('a')] },
      origin,
      path: '/galeria/demo',
    });
    expect(seo.image).toBe('https://slpixel.com/brand/og-default.jpg');
    expect(seo.description).toMatch(/privada/i);
  });

  it('treats a subgallery of a protected parent as protected too', () => {
    const seo = buildGallerySeo({
      gallery: { slug: 'demo-hijo', title: 'Hijo', photos: [photo('a')] },
      parent: { slug: 'demo', title: 'Demo', protected: true },
      origin,
      path: '/galeria/demo/demo-hijo',
    });
    expect(seo.image).toBe('https://slpixel.com/brand/og-default.jpg');
  });

  it('titles a subgallery with its parent', () => {
    const seo = buildGallerySeo({
      gallery: { slug: 'demo-hijo', title: 'Hijo' },
      parent: { slug: 'demo', title: 'Demo de SLPixel' },
      origin,
      path: '/galeria/demo/demo-hijo',
    });
    expect(seo.title).toBe('Hijo · Demo — SL Pixel');
  });
});
