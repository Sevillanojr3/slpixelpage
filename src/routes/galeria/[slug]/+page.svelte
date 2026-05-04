<script>
  import { onMount } from 'svelte';
  import { thumbUrl, fullUrl, photoKey } from '$lib/images.js';

  export let data;
  const { gallery } = data;

  const cleanTitle = (t) => (t || '').replace(/\s+de SLPixel$/i, '').trim();
  const title = cleanTitle(gallery.title);

  let lightboxIdx = -1;

  function openLightbox(i) {
    lightboxIdx = i;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightboxIdx = -1;
    document.body.style.overflow = '';
  }
  function prev() { if (lightboxIdx > 0) lightboxIdx -= 1; }
  function next() { if (lightboxIdx < gallery.photos.length - 1) lightboxIdx += 1; }

  function onKey(e) {
    if (lightboxIdx < 0) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  }

  onMount(() => () => (document.body.style.overflow = ''));

  $: current = lightboxIdx >= 0 ? gallery.photos[lightboxIdx] : null;
  $: humanDate = gallery.date
    ? new Date(gallery.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  $: galleryIndex = gallery.galleryIndex || null;
</script>

<svelte:head>
  <title>{title} — SL Pixel</title>
  <meta name="description" content={`Galería fotográfica: ${title}`} />
</svelte:head>

<svelte:window on:keydown={onKey} />

<!-- ===== Header ===== -->
<section class="g-head">
  <div class="container">
    <a href="/galeria" class="back">
      <span class="arrow">←</span>
      <span class="back-label">Volver al índice</span>
    </a>

    <div class="head-meta">
      <span class="label">Portafolio · {gallery.category || 'archivo'}</span>
      <span class="numeral">{String(gallery.photos.length).padStart(3, '0')} fotografías</span>
    </div>

    <h1 class="head-title">{title}</h1>

    <div class="head-bottom">
      <div class="head-info">
        {#if humanDate}
          <div>
            <span class="label">Fecha</span>
            <p>{humanDate}</p>
          </div>
        {/if}
        <div>
          <span class="label">Secuencia</span>
          <p>{gallery.photos.length} piezas · resolución editorial</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== Photo grid ===== -->
<section class="g-grid-section">
  <div class="container wide">
    <div class="g-grid">
      {#each gallery.photos as photo, i (photoKey(photo))}
        <button
          type="button"
          class="tile"
          class:tall={i % 7 === 3 || i % 7 === 5}
          on:click={() => openLightbox(i)}
          aria-label={`Abrir fotografía ${i + 1}`}
        >
          <img src={thumbUrl(photo, gallery.slug)} loading="lazy" decoding="async" alt={`${title} — ${i + 1}`} />
          <span class="tile-num">{String(i + 1).padStart(3, '0')}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<!-- ===== Footer strip ===== -->
<section class="g-foot">
  <div class="container g-foot-grid">
    <span class="numeral">Fin del portafolio ·</span>
    <span class="italic-title">{title}</span>
    <a href="/galeria" class="link-arrow">Siguiente portafolio</a>
  </div>
</section>

<!-- ===== Lightbox ===== -->
{#if current}
  <div class="lightbox" on:click={closeLightbox} role="presentation">
    <div class="lb-bar">
      <span class="numeral">{String(lightboxIdx + 1).padStart(3, '0')} / {String(gallery.photos.length).padStart(3, '0')}</span>
      <span class="label label-paper">{title}</span>
      <button class="lb-close" on:click|stopPropagation={closeLightbox} aria-label="Cerrar">✕ Cerrar</button>
    </div>

    {#if lightboxIdx > 0}
      <button class="lb-nav prev" on:click|stopPropagation={prev} aria-label="Anterior">
        <span class="lb-arrow">←</span>
        <span class="label label-paper">Anterior</span>
      </button>
    {/if}

    <img
      class="lb-img"
      src={fullUrl(current, gallery.slug)}
      alt={`${title} — fotografía ${lightboxIdx + 1}`}
      on:click|stopPropagation
    />

    {#if lightboxIdx < gallery.photos.length - 1}
      <button class="lb-nav next" on:click|stopPropagation={next} aria-label="Siguiente">
        <span class="label label-paper">Siguiente</span>
        <span class="lb-arrow">→</span>
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ============ HEADER ============ */
  .g-head {
    padding: clamp(3rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3.5rem);
    border-bottom: 1px solid var(--line);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    padding: 0.5rem 0;
    transition: color 0.3s ease;
  }

  .back .arrow { transition: transform 0.3s ease; }
  .back:hover { color: var(--ink); opacity: 1; }
  .back:hover .arrow { transform: translateX(-4px); }

  .head-meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 2rem 0 1.25rem;
    border-top: 1px solid var(--line);
    margin-top: 2rem;
  }

  .head-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(2.6rem, 8vw, 7rem);
    line-height: 0.95;
    letter-spacing: -0.03em;
    padding-bottom: 2rem;
    font-variation-settings: 'opsz' 144, 'SOFT' 45, 'WONK' 1;
  }

  .head-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
  }

  .head-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 200px));
    gap: 2.5rem;
  }

  .head-info .label { display: block; margin-bottom: 0.4rem; }
  .head-info p { font-size: 0.95rem; color: var(--ink); }

  /* ============ GRID ============ */
  .wide { max-width: 1600px; }

  .g-grid-section { padding: clamp(3rem, 6vw, 5rem) 0; }

  .g-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 1fr;
    gap: 6px;
  }

  .tile {
    position: relative;
    padding: 0;
    margin: 0;
    background: var(--paper-alt);
    cursor: zoom-in;
    overflow: hidden;
    aspect-ratio: 3 / 2;
    border: none;
    display: block;
  }

  .tile.tall {
    aspect-ratio: 2 / 3;
    grid-row: span 2;
  }

  .tile img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.6s ease;
    filter: saturate(0.98);
  }

  .tile:hover img { transform: scale(1.035); filter: saturate(1.08); }

  .tile-num {
    position: absolute;
    top: 0.6rem;
    left: 0.75rem;
    color: color-mix(in srgb, var(--paper) 85%, transparent);
    font-family: var(--font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .tile:hover .tile-num { opacity: 1; }

  /* ============ FOOT ============ */
  .g-foot {
    padding: clamp(4rem, 8vw, 6rem) 0;
    border-top: 1px solid var(--line);
  }

  .g-foot-grid {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .italic-title {
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    letter-spacing: -0.02em;
    color: var(--ink);
    flex: 1;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
  }

  /* ============ LIGHTBOX ============ */
  .lightbox {
    position: fixed;
    inset: 0;
    background: rgba(8,8,7,0.96);
    z-index: 1000;
    display: grid;
    grid-template-rows: auto 1fr;
    animation: fadeIn 0.3s ease;
  }

  .lb-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem clamp(1rem, 3vw, 2.5rem);
    border-bottom: 1px solid color-mix(in srgb, var(--paper) 12%, transparent);
    color: color-mix(in srgb, var(--paper) 80%, transparent);
  }

  .lb-bar .numeral { color: color-mix(in srgb, var(--paper) 90%, transparent); font-size: 0.8rem; }
  .lb-bar .label-paper { font-size: 0.7rem; letter-spacing: 0.18em; color: color-mix(in srgb, var(--paper) 70%, transparent); }

  .lb-close {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--paper);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--paper) 30%, transparent);
    padding: 0.5rem 0.9rem;
    cursor: pointer;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .lb-close:hover {
    background: var(--paper);
    color: var(--ink);
    border-color: var(--paper);
  }

  .lb-img {
    max-width: 92vw;
    max-height: 85vh;
    object-fit: contain;
    justify-self: center;
    align-self: center;
    user-select: none;
    box-shadow: 0 40px 80px -40px rgba(0,0,0,0.8);
  }

  .lb-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--ink);
    border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
    border-radius: 999px;
    cursor: pointer;
    padding: 0.85rem 1.25rem;
    opacity: 0.9;
    backdrop-filter: blur(6px);
    transition: opacity 0.25s ease, transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }

  .lb-nav:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--accent) 18%, transparent);
    border-color: var(--accent);
  }
  .lb-nav .lb-arrow {
    font-size: 1.8rem;
    line-height: 1;
    color: var(--accent);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  }

  .lb-nav.prev { left: 1rem; }
  .lb-nav.next { right: 1rem; }

  .lb-nav.prev:hover { transform: translateY(-50%) translateX(-4px); }
  .lb-nav.next:hover { transform: translateY(-50%) translateX(4px); }

  /* ============ RESPONSIVE ============ */
  @media (max-width: 900px) {
    .head-bottom { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .head-info { grid-template-columns: 1fr 1fr; gap: 1.5rem; }

    .g-grid { grid-template-columns: repeat(2, 1fr); gap: 4px; }
    .tile.tall { grid-row: span 1; aspect-ratio: 3 / 2; }

    .lb-nav { padding: 0.75rem; }
    .lb-nav.prev { left: 0.25rem; }
    .lb-nav.next { right: 0.25rem; }
    .lb-nav .label-paper { display: none; }
    .lb-nav .lb-arrow { font-size: 2rem; }
    .lb-img { max-width: 96vw; max-height: 78vh; }
  }
</style>
