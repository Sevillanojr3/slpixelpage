<script>
  import { onMount } from 'svelte';
  import { thumbUrl, fullUrl, photoKey } from '$lib/images.js';

  export let photos = [];
  export let slug = '';
  export let title = '';
  export let downloadsUnlocked = false;
  export let protectedDownloads = false;

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
  function next() { if (lightboxIdx < photos.length - 1) lightboxIdx += 1; }

  function onKey(e) {
    if (lightboxIdx < 0) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  }

  function blockContext(e) {
    if (protectedDownloads) e.preventDefault();
  }

  function filenameFor(photo, i) {
    const base = (slug || 'foto').replace(/[^a-z0-9-_]/gi, '');
    const ext = (photo.ext || (photo.key || '').split('.').pop() || 'jpg').toLowerCase();
    return `${base}-${String(i + 1).padStart(3, '0')}.${ext}`;
  }

  async function downloadCurrent() {
    if (!current) return;
    const url = fullUrl(current, slug);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filenameFor(current, lightboxIdx);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  onMount(() => () => (document.body.style.overflow = ''));

  $: current = lightboxIdx >= 0 ? photos[lightboxIdx] : null;
</script>

<svelte:window on:keydown={onKey} />

<section class="g-grid-section" class:protected={protectedDownloads} on:contextmenu={blockContext}>
  <div class="container wide">
    <div class="g-grid">
      {#each photos as photo, i (photoKey(photo))}
        <button
          type="button"
          class="tile"
          class:tall={i % 7 === 3 || i % 7 === 5}
          on:click={() => openLightbox(i)}
          aria-label={`Abrir fotografía ${i + 1}`}
        >
          <img
            src={thumbUrl(photo, slug)}
            loading="lazy"
            decoding="async"
            alt={`${title} — ${i + 1}`}
            draggable={!protectedDownloads}
          />
          <span class="tile-num">{String(i + 1).padStart(3, '0')}</span>
          {#if protectedDownloads}<span class="tile-shield" aria-hidden="true"></span>{/if}
        </button>
      {/each}
    </div>
  </div>
</section>

{#if current}
  <div class="lightbox" class:protected={protectedDownloads} on:click={closeLightbox} on:contextmenu={blockContext} role="presentation">
    <div class="lb-bar">
      <span class="numeral">{String(lightboxIdx + 1).padStart(3, '0')} / {String(photos.length).padStart(3, '0')}</span>
      <span class="label label-paper">{title}</span>
      <div class="lb-bar-actions">
        {#if downloadsUnlocked}
          <button class="lb-download" on:click|stopPropagation={downloadCurrent} aria-label="Descargar foto">⤓ Descargar</button>
        {:else if protectedDownloads}
          <span class="lb-locked" title="Descargas con contraseña">🔒 Sin descargas</span>
        {/if}
        <button class="lb-close" on:click|stopPropagation={closeLightbox} aria-label="Cerrar">✕ Cerrar</button>
      </div>
    </div>

    {#if lightboxIdx > 0}
      <button class="lb-nav prev" on:click|stopPropagation={prev} aria-label="Anterior">
        <span class="lb-arrow">←</span>
        <span class="label label-paper">Anterior</span>
      </button>
    {/if}

    <img
      class="lb-img"
      src={fullUrl(current, slug)}
      alt={`${title} — fotografía ${lightboxIdx + 1}`}
      draggable={!protectedDownloads}
      on:click|stopPropagation
    />
    {#if protectedDownloads}<div class="lb-shield" aria-hidden="true" on:click|stopPropagation></div>{/if}

    {#if lightboxIdx < photos.length - 1}
      <button class="lb-nav next" on:click|stopPropagation={next} aria-label="Siguiente">
        <span class="label label-paper">Siguiente</span>
        <span class="lb-arrow">→</span>
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ============ DOWNLOAD PROTECTION ============ */
  .g-grid-section.protected .tile img,
  .lightbox.protected .lb-img {
    -webkit-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-touch-callout: none;
    pointer-events: none;
  }
  .tile-shield {
    position: absolute;
    inset: 0;
    background: transparent;
    z-index: 2;
    pointer-events: auto;
  }
  .lb-shield {
    position: absolute;
    left: 0; right: 0; top: 0; bottom: 0;
    margin: auto;
    width: min(92vw, 1400px);
    height: 85vh;
    background: transparent;
    pointer-events: auto;
    z-index: 2;
  }
  .g-grid-section.protected .tile { position: relative; }
  .g-grid-section.protected .tile .tile-num { z-index: 3; }

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
    border-bottom: 1px solid color-mix(in srgb, var(--ink-fixed-light) 12%, transparent);
    color: color-mix(in srgb, var(--ink-fixed-light) 80%, transparent);
  }

  .lb-bar .numeral { color: color-mix(in srgb, var(--ink-fixed-light) 90%, transparent); font-size: 0.8rem; }
  .lb-bar .label-paper { font-size: 0.7rem; letter-spacing: 0.18em; color: color-mix(in srgb, var(--ink-fixed-light) 70%, transparent); }

  .lb-bar-actions { display: flex; gap: 0.65rem; align-items: center; }

  .lb-close, .lb-download {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink-fixed-light);
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--ink-fixed-light) 30%, transparent);
    padding: 0.5rem 0.9rem;
    cursor: pointer;
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }

  .lb-close:hover {
    background: var(--ink-fixed-light);
    color: var(--paper-fixed-dark);
    border-color: var(--ink-fixed-light);
  }

  .lb-download {
    color: var(--accent-fixed);
    border-color: color-mix(in srgb, var(--accent-fixed) 50%, transparent);
  }
  .lb-download:hover {
    background: var(--accent-fixed);
    color: var(--paper-fixed-dark);
    border-color: var(--accent-fixed);
  }

  .lb-locked {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--ink-fixed-light) 65%, transparent);
    padding: 0.45rem 0.75rem;
    border: 1px dashed color-mix(in srgb, var(--ink-fixed-light) 25%, transparent);
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
    color: var(--ink-fixed-light);
    border: 1px solid color-mix(in srgb, var(--accent-fixed) 40%, transparent);
    border-radius: 999px;
    cursor: pointer;
    padding: 0.85rem 1.25rem;
    opacity: 0.9;
    backdrop-filter: blur(6px);
    transition: opacity 0.25s ease, transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
  }

  .lb-nav:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--accent-fixed) 18%, transparent);
    border-color: var(--accent-fixed);
  }
  .lb-nav .lb-arrow {
    font-size: 1.8rem;
    line-height: 1;
    color: var(--accent-fixed);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
  }

  .lb-nav.prev { left: 1rem; }
  .lb-nav.next { right: 1rem; }

  .lb-nav.prev:hover { transform: translateY(-50%) translateX(-4px); }
  .lb-nav.next:hover { transform: translateY(-50%) translateX(4px); }

  /* ============ RESPONSIVE ============ */
  @media (max-width: 900px) {
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
