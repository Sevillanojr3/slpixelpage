<script>
  import { thumbUrl } from '$lib/images.js';

  export let data;
  const { list } = data;

  const cleanTitle = (t) => (t || '').replace(/\s+de SLPixel$/i, '').trim();
  const cleaned = list.map((g) => ({ ...g, title: cleanTitle(g.title) }));

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'deportes', label: 'Deportes' },
    { id: 'corporativo', label: 'Corporativo' },
  ];

  let filter = 'todos';
  $: visible = filter === 'todos' ? cleaned : cleaned.filter((g) => g.category === filter);

  $: totalPhotos = visible.reduce((acc, g) => acc + g.count, 0);

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function year(iso) {
    if (!iso) return '—';
    return new Date(iso).getFullYear();
  }
</script>

<svelte:head>
  <title>Galería — SL Pixel</title>
  <meta name="description" content="Portafolios de fotografía SL Pixel: eventos, deportes y sesiones corporativas." />
</svelte:head>

<!-- Page header -->
<section class="gal-header">
  <div class="container">
    <div class="g-top">
      <span class="label">Index · Portafolios</span>
    </div>

    <h1 class="g-title">
      <span class="italic">Galería.</span>
      Obra publicada.
    </h1>

    <div class="g-sub">
      <p>
        Una selección de los encargos recientes del estudio. Cada portafolio
        conserva su secuencia original, sin jerarquías añadidas.
      </p>

      <div class="g-counters">
        <div><span class="numeral">{String(visible.length).padStart(2, '0')}</span><span class="label">Portafolios</span></div>
        <div><span class="numeral">{totalPhotos}</span><span class="label">Fotografías</span></div>
      </div>
    </div>

    <div class="filters">
      {#each categories as c}
        <button class="f-btn" class:active={filter === c.id} on:click={() => (filter = c.id)}>
          <span>{c.label}</span>
        </button>
      {/each}
    </div>
  </div>
</section>

<!-- Grid -->
<section class="g-grid-section">
  <div class="container">
    {#if cleaned.length === 0}
      <div class="empty">
        <p>Aún no hay galerías publicadas.</p>
        <p class="help">Ejecuta <code>npm run galeria:sync</code> para poblarlas.</p>
      </div>
    {:else if visible.length === 0}
      <p class="empty">No hay galerías en esta categoría.</p>
    {:else}
      <ul class="g-grid">
        {#each visible as g, i (g.slug)}
          <li class="g-item" style={`--i:${i};`}>
            <a href={`/galeria/${g.slug}`} class="g-link">
              <div class="g-meta-top">
                <span class="numeral">{String(i + 1).padStart(2, '0')}</span>
                <span class="numeral">— {g.count}</span>
              </div>

              <div class="g-img" class:locked={g.protected}>
                {#if g.cover}
                  <img src={thumbUrl(g.cover, g.slug)} alt={g.title} loading="lazy" />
                {:else if g.protected}
                  <div class="lock-cover">
                    <span class="lock-icon" aria-hidden="true">🔒</span>
                    <span class="lock-text">Galería protegida</span>
                  </div>
                {/if}
              </div>

              <div class="g-info">
                <span class="label">{g.category} · {year(g.date)}{g.protected ? ' · 🔒' : ''}</span>
                <h3>{g.title}</h3>
                <span class="link-sub">{g.protected ? 'Ingresar contraseña' : 'Ver portafolio'} <span class="arrow">→</span></span>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</section>

<style>
  .gal-header {
    padding: clamp(5rem, 10vw, 9rem) 0 clamp(3rem, 6vw, 5rem);
    border-bottom: 1px solid var(--line);
  }

  .g-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 3rem;
  }

  .g-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(3rem, 12vw, 10rem);
    letter-spacing: -0.035em;
    line-height: 0.9;
    margin-bottom: 3.5rem;
    font-variation-settings: 'opsz' 144, 'SOFT' 45, 'WONK' 1;
  }

  .g-title .italic {
    font-style: italic;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--accent);
    margin-right: 0.25em;
  }

  .g-sub {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4rem;
    align-items: end;
    padding-bottom: 3rem;
  }

  .g-sub p { max-width: 48ch; color: var(--ink-2); }

  .g-counters {
    display: flex;
    gap: 3rem;
    white-space: nowrap;
  }

  .g-counters > div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    border-top: 1px solid var(--line-strong);
    padding-top: 0.7rem;
  }

  .g-counters .numeral {
    font-family: var(--font-display);
    font-weight: 300;
    font-style: italic;
    color: var(--ink);
    font-size: clamp(1.5rem, 2.5vw, 2.25rem);
    letter-spacing: -0.015em;
  }

  .filters {
    display: flex;
    gap: 0;
    border-top: 1px solid var(--line-strong);
    padding-top: 1.5rem;
    flex-wrap: wrap;
  }

  .f-btn {
    background: transparent;
    border: none;
    padding: 0 1.8rem 0 0;
    margin-right: 1.8rem;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    cursor: pointer;
    position: relative;
    transition: color 0.3s ease;
    padding-bottom: 0.45rem;
  }

  .f-btn::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0;
    height: 1px;
    background: var(--ink);
    transition: width 0.35s cubic-bezier(0.76, 0, 0.24, 1);
  }

  .f-btn:hover { color: var(--ink); }
  .f-btn:hover::after { width: calc(100% - 1.8rem); }
  .f-btn.active { color: var(--ink); }
  .f-btn.active::after { width: calc(100% - 1.8rem); }

  /* ========== GRID ========== */
  .g-grid-section { padding: clamp(3rem, 6vw, 5rem) 0 clamp(5rem, 10vw, 8rem); }

  .g-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: 2rem;
    row-gap: clamp(3rem, 5vw, 5rem);
  }

  .g-item {
    grid-column: span 6;
    animation: fadeUp 0.8s ease forwards;
    animation-delay: calc(var(--i, 0) * 60ms);
    opacity: 0;
  }

  /* every 3rd full-width, others 6 cols — editorial asymmetric rhythm */
  .g-item:nth-child(6n + 1) { grid-column: 1 / span 7; }
  .g-item:nth-child(6n + 2) { grid-column: 8 / span 5; margin-top: clamp(2rem, 5vw, 4.5rem); }
  .g-item:nth-child(6n + 3) { grid-column: 1 / span 5; margin-top: clamp(-4rem, -5vw, -2rem); }
  .g-item:nth-child(6n + 4) { grid-column: 6 / span 7; }
  .g-item:nth-child(6n + 5) { grid-column: 1 / span 6; margin-top: clamp(-4rem, -5vw, -2rem); }
  .g-item:nth-child(6n + 6) { grid-column: 7 / span 6; margin-top: clamp(2rem, 5vw, 4.5rem); }

  .g-link { display: block; color: var(--ink); }
  .g-link:hover { opacity: 1; }

  .g-meta-top {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--line);
    margin-bottom: 0.9rem;
  }

  .g-img {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--paper-alt);
  }

  .g-item:nth-child(6n + 1) .g-img,
  .g-item:nth-child(6n + 4) .g-img { aspect-ratio: 5 / 4; }

  .g-item:nth-child(6n + 3) .g-img,
  .g-item:nth-child(6n + 5) .g-img { aspect-ratio: 4 / 5; }

  .g-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .g-link:hover .g-img img { transform: scale(1.04); }

  .g-img.locked {
    background:
      repeating-linear-gradient(
        135deg,
        var(--paper-alt) 0 14px,
        var(--paper-soft) 14px 28px
      );
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lock-cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    color: var(--ink-2);
  }
  .lock-icon { font-size: 2.2rem; }
  .lock-text {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .g-info {
    padding-top: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .g-info .label { color: var(--muted); font-size: 0.66rem; }

  .g-info h3 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.3rem, 2.2vw, 2.1rem);
    line-height: 1.05;
    letter-spacing: -0.015em;
    margin: 0.1rem 0 0.4rem;
    max-width: 22ch;
  }

  .link-sub {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ink);
    opacity: 0.65;
    margin-top: 0.5rem;
  }
  .link-sub .arrow {
    display: inline-block;
    transition: transform 0.35s ease;
  }
  .g-link:hover .link-sub { opacity: 1; }
  .g-link:hover .link-sub .arrow { transform: translateX(6px); }

  /* empty states */
  .empty {
    text-align: center;
    padding: 5rem 0;
    color: var(--muted);
  }
  .empty .help { margin-top: 0.6rem; font-size: 0.85rem; }
  .empty code {
    background: var(--paper-alt);
    padding: 0.15rem 0.45rem;
    border: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: 0.82rem;
  }

  /* ========== RESPONSIVE ========== */
  @media (max-width: 900px) {
    .g-top { flex-direction: column; gap: 0.5rem; padding-bottom: 2rem; }
    .g-title { margin-bottom: 2rem; }
    .g-sub { grid-template-columns: 1fr; gap: 2rem; padding-bottom: 2rem; }
    .g-counters { gap: 2rem; }

    .filters { padding-top: 1rem; }
    .f-btn { padding: 0 1.2rem 0 0; margin-right: 1.2rem; font-size: 0.72rem; }
    .f-btn:hover::after,
    .f-btn.active::after { width: calc(100% - 1.2rem); }

    .g-grid { grid-template-columns: 1fr; row-gap: 3rem; }
    .g-item:nth-child(n) { grid-column: 1 / -1; margin-top: 0; }
    .g-item:nth-child(n) .g-img { aspect-ratio: 4 / 3; }
  }
</style>
