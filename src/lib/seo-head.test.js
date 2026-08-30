import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Seo from './components/Seo.svelte';
import { buildGallerySeo } from './seo.js';

/** Every <meta> the component emitted, as a { key: content } map. */
function metaMap(html) {
  const map = {};
  for (const [, key, content] of html.matchAll(
    /<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/g,
  )) {
    map[key] = content;
  }
  return map;
}

describe('<Seo> head output', () => {
  const seo = buildGallerySeo({
    gallery: {
      slug: 'investidura-de-blanco',
      title: 'INVESTIDURA DE BLANCO de SLPixel',
      ogImage: 'og/investidura-de-blanco-mfx1.jpg',
    },
    origin: 'https://slpixel.com',
    path: '/galeria/investidura-de-blanco',
  });
  const { head } = render(Seo, { props: seo });
  const meta = metaMap(head);

  it('emits the tags WhatsApp and Facebook read', () => {
    expect(meta).toMatchObject({
      'og:title': 'INVESTIDURA DE BLANCO — SL Pixel',
      'og:image': 'https://slpixel.com/og/investidura-de-blanco-mfx1.jpg',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:url': 'https://slpixel.com/galeria/investidura-de-blanco',
      'og:type': 'website',
      'og:site_name': 'SL Pixel',
    });
  });

  it('emits the Twitter/X large-card tags', () => {
    expect(meta).toMatchObject({
      'twitter:card': 'summary_large_image',
      'twitter:image': 'https://slpixel.com/og/investidura-de-blanco-mfx1.jpg',
    });
  });

  it('sets the title and canonical link', () => {
    expect(head).toContain('<title>INVESTIDURA DE BLANCO — SL Pixel</title>');
    expect(head).toContain(
      '<link rel="canonical" href="https://slpixel.com/galeria/investidura-de-blanco"/>',
    );
  });

  it('leaves out the dimensions when the image is an unmeasured photo', () => {
    const fallback = buildGallerySeo({
      gallery: { slug: 'demo', title: 'Demo', photos: [{ key: 'demo/a.jpg' }] },
      origin: 'https://slpixel.com',
      path: '/galeria/demo',
    });
    const out = metaMap(render(Seo, { props: fallback }).head);
    expect(out['og:image']).toBe('https://slpixel.com/demo/a.jpg');
    expect(out['og:image:width']).toBeUndefined();
  });

  it('shows the brand image for a protected gallery', () => {
    const locked = buildGallerySeo({
      gallery: {
        slug: 'demo',
        title: 'Demo',
        protected: true,
        photos: [{ key: 'demo/a.jpg' }],
        ogImage: 'og/demo-1.jpg',
      },
      origin: 'https://slpixel.com',
      path: '/galeria/demo',
    });
    const out = metaMap(render(Seo, { props: locked }).head);
    expect(out['og:image']).toBe('https://slpixel.com/brand/og-default.jpg');
  });
});
