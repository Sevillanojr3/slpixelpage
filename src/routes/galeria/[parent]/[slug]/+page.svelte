<script>
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';

  export let data;
  $: ({ parent, child, downloadsUnlocked } = data);
  $: protectedDownloads = parent.protected && !downloadsUnlocked;

  const cleanTitle = (t) => (t || '').replace(/\s+de SLPixel$/i, '').trim();
  $: parentTitle = cleanTitle(parent.title);
  $: title = cleanTitle(child.title);
  $: photos = child.photos || [];
  $: humanDate = child.date
    ? new Date(child.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
</script>

<svelte:head>
  <title>{title} · {parentTitle} — SL Pixel</title>
  <meta name="description" content={`${title} — parte de ${parentTitle}`} />
</svelte:head>

<section class="g-head">
  <div class="container">
    <a href={`/galeria/${parent.slug}`} class="back">
      <span class="arrow">←</span>
      <span class="back-label">Volver a {parentTitle}</span>
    </a>

    <div class="head-meta">
      <span class="label">Capítulo · {parentTitle}</span>
      <span class="numeral">{String(photos.length).padStart(3, '0')} fotografías</span>
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
          <span class="label">Pertenece a</span>
          <p><a href={`/galeria/${parent.slug}`} class="parent-link">{parentTitle}</a></p>
        </div>
      </div>
    </div>
  </div>
</section>

{#if parent.protected}
  <section class="dl-band">
    <div class="container dl-band-grid">
      <span class="label">
        {downloadsUnlocked ? '🔓 Descargas activas (vía contraseña del evento)' : '🔒 Descargas protegidas'}
      </span>
    </div>
  </section>
{/if}

{#if photos.length > 0}
  <PhotoGrid
    {photos}
    slug={child.slug}
    {title}
    {downloadsUnlocked}
    {protectedDownloads}
  />
{:else}
  <section class="empty-state">
    <div class="container">
      <p>Este capítulo todavía no tiene fotos.</p>
    </div>
  </section>
{/if}

<section class="g-foot">
  <div class="container g-foot-grid">
    <span class="numeral">Fin del capítulo ·</span>
    <span class="italic-title">{title}</span>
    <a href={`/galeria/${parent.slug}`} class="link-arrow">Volver a {parentTitle}</a>
  </div>
</section>

<style>
  .dl-band {
    background: var(--paper-alt);
    border-bottom: 1px solid var(--line);
    padding: 1rem 0;
  }
  .dl-band-grid { display: flex; align-items: center; }
  .dl-band .label { color: var(--accent); }

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
    font-size: clamp(2.4rem, 7vw, 6rem);
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
    grid-template-columns: repeat(2, minmax(0, 220px));
    gap: 2.5rem;
  }
  .head-info .label { display: block; margin-bottom: 0.4rem; }
  .head-info p { font-size: 0.95rem; color: var(--ink); }
  .parent-link { color: var(--accent); text-decoration: underline; }

  .empty-state { padding: 4rem 0; text-align: center; color: var(--muted); }

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

  @media (max-width: 900px) {
    .head-bottom { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .head-info { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  }
</style>
