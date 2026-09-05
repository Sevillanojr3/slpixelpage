<script>
  import { onDestroy, onMount, tick } from 'svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { assetUrl } from '$lib/images.js';
  import { videoRatio, orientationOf, ORIENTATION_LABEL, formatDuration } from '$lib/video.js';

  export let data;
  $: ({ videos, categories, seo, jsonLd } = data);

  // Escaping "<" keeps the JSON-LD from closing the <script> tag early.
  $: jsonLdScript =
    jsonLd?.length > 0
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}<\/script>`
      : '';

  const catLabel = (id) => categories.find((c) => c.id === id)?.label || id || 'Video';

  let filter = 'todos';
  $: filtered = filter === 'todos' ? videos : videos.filter((v) => v.category === filter);

  /**
   * 'reel' is the phone experience (one clip per screen, swipe up), 'web' the
   * desktop one (hover-preview wall + theatre). Rendered exclusively so a phone
   * never downloads the wall's posters and vice versa. SSR emits 'web', which
   * CSS hides below 860px until hydration picks the real mode.
   */
  let mode = 'web';

  onMount(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const apply = () => (mode = mq.matches ? 'reel' : 'web');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  });

  /* ============================ reel (mobile) ============================ */

  let reelEl;
  let reelEls = [];
  let reelIndex = 0;
  let reelMuted = true;
  let reelPaused = false;
  let progress = 0;
  let hintDismissed = false;

  function syncReel() {
    reelEls.forEach((el, i) => {
      if (!el) return;
      if (i !== reelIndex) {
        el.pause();
        try {
          el.currentTime = 0;
        } catch {}
        return;
      }
      el.muted = reelMuted;
      if (reelPaused) {
        el.pause();
        return;
      }
      // A browser that refuses unmuted autoplay gets one retry with sound off.
      el.play().catch(() => {
        reelMuted = true;
        el.muted = true;
        el.play().catch(() => {});
      });
    });
  }

  $: if (mode === 'reel') {
    reelIndex;
    reelMuted;
    reelPaused;
    filtered;
    tick().then(syncReel);
  }

  /** Marks a slide active once it covers most of the screen. */
  function slide(node, index) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6 && reelIndex !== index) {
            reelIndex = index;
            reelPaused = false;
            progress = 0;
          }
        }
      },
      { threshold: [0, 0.6, 0.95] },
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }

  function tapSlide(i) {
    if (i !== reelIndex) return;
    reelPaused = !reelPaused;
    hintDismissed = true;
  }

  function toggleReelSound() {
    reelMuted = !reelMuted;
    hintDismissed = true;
  }

  function onReelProgress(e, i) {
    if (i !== reelIndex) return;
    const el = e.currentTarget;
    progress = el.duration ? el.currentTime / el.duration : 0;
  }

  function pickFilter(id) {
    filter = id;
    reelIndex = 0;
    reelPaused = false;
    progress = 0;
    theaterIndex = 0;
    reelEl?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  let shareMsg = '';

  async function share(v) {
    const url = `${location.origin}/videos#v-${v.id}`;
    const payload = { title: `${v.title} · SL Pixel`, text: v.description || v.title, url };
    try {
      if (navigator.share) return await navigator.share(payload);
      await navigator.clipboard.writeText(url);
      shareMsg = 'Enlace copiado ✓';
    } catch {
      /* the user dismissed the share sheet — nothing to report */
    } finally {
      if (shareMsg) setTimeout(() => (shareMsg = ''), 2200);
    }
  }

  /* ============================ wall (desktop) ============================ */

  let hoveredId = null;
  let loadedIds = new Set();
  let cardEls = {};

  async function hoverIn(v) {
    hoveredId = v.id;
    if (!loadedIds.has(v.id)) {
      loadedIds = new Set(loadedIds).add(v.id);
      await tick();
    }
    const el = cardEls[v.id];
    if (el) el.play().catch(() => {});
  }

  function hoverOut(v) {
    if (hoveredId === v.id) hoveredId = null;
    const el = cardEls[v.id];
    if (el) {
      el.pause();
      try {
        el.currentTime = 0;
      } catch {}
    }
  }

  /* ============================== theatre ============================== */

  let theaterOpen = false;
  let theaterIndex = 0;
  let theaterEl;
  $: current = filtered[theaterIndex] || null;

  function openTheater(i) {
    theaterIndex = i;
    theaterOpen = true;
  }

  function closeTheater() {
    theaterOpen = false;
  }

  function step(delta) {
    if (!filtered.length) return;
    theaterIndex = (theaterIndex + delta + filtered.length) % filtered.length;
  }

  function onKey(e) {
    if (!theaterOpen) return;
    if (e.key === 'Escape') return closeTheater();
    if (e.key === 'ArrowRight') return step(1);
    if (e.key === 'ArrowLeft') return step(-1);
    if (e.key === 'm' || e.key === 'M') {
      if (theaterEl) theaterEl.muted = !theaterEl.muted;
      return;
    }
    if (e.key === ' ') {
      e.preventDefault();
      if (theaterEl) theaterEl.paused ? theaterEl.play().catch(() => {}) : theaterEl.pause();
    }
  }

  // Freeze the page behind the theatre so the wall doesn't scroll under it.
  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = theaterOpen ? 'hidden' : '';
  }

  // Leaving the page with the theatre open would strand the lock on <body>.
  onDestroy(() => {
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  });

  $: totalDuration = filtered.reduce((acc, v) => acc + (v.duration || 0), 0);
</script>

<Seo {...seo} />
<svelte:head>{@html jsonLdScript}</svelte:head>
<svelte:window on:keydown={onKey} />

{#if videos.length === 0}
  <section class="v-empty">
    <div class="container">
      <span class="label">Estudio · Movimiento</span>
      <h1 class="v-title"><span class="italic">Videos.</span> Muy pronto.</h1>
      <p>Estamos montando las primeras piezas en movimiento. Volvé en unos días.</p>
      <a class="link-arrow" href="/galeria">Ver el portafolio fotográfico</a>
    </div>
  </section>
{:else if mode === 'reel'}
  <!-- ======================= REEL · teléfono ======================= -->
  <div class="reel-shell">
    {#if categories.length > 1}
      <div class="reel-tabs">
        <button class="tab" class:active={filter === 'todos'} on:click={() => pickFilter('todos')}>Todos</button>
        {#each categories as c (c.id)}
          <button class="tab" class:active={filter === c.id} on:click={() => pickFilter(c.id)}>{c.label}</button>
        {/each}
      </div>
    {/if}

    <div class="reel" bind:this={reelEl}>
      {#each filtered as v, i (v.id)}
        <section class="slide" id={`v-${v.id}`} use:slide={i}>
          <!-- Ambient fill: the poster blown up and blurred, so a horizontal
               clip sits on its own colours instead of black bars. -->
          {#if v.posterKey}
            <img class="ambient" src={assetUrl(v.posterKey)} alt="" aria-hidden="true" />
          {/if}

          <button class="tap-layer" on:click={() => tapSlide(i)} aria-label={reelPaused && i === reelIndex ? 'Reproducir' : 'Pausar'}>
            <video
              bind:this={reelEls[i]}
              class="reel-video"
              src={Math.abs(i - reelIndex) <= 1 ? assetUrl(v.key) : undefined}
              poster={v.posterKey ? assetUrl(v.posterKey) : undefined}
              preload={i === reelIndex ? 'auto' : 'metadata'}
              playsinline
              loop
              muted
              on:timeupdate={(e) => onReelProgress(e, i)}
            ></video>
            {#if i === reelIndex && reelPaused}
              <span class="play-badge" aria-hidden="true">▶</span>
            {/if}
          </button>

          <div class="slide-rail">
            <button class="rail-btn" on:click={toggleReelSound} aria-label={reelMuted ? 'Activar sonido' : 'Silenciar'}>
              <span aria-hidden="true">{reelMuted ? '🔇' : '🔊'}</span>
            </button>
            <button class="rail-btn" on:click={() => share(v)} aria-label="Compartir">
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div class="slide-info">
            <span class="label">{catLabel(v.category)} · {formatDuration(v.duration)}</span>
            <h2>{v.title}</h2>
            {#if v.description}<p>{v.description}</p>{/if}
          </div>

          {#if i === reelIndex}
            <div class="reel-progress"><span style={`transform: scaleX(${progress})`}></span></div>
          {/if}

          {#if i === 0 && !hintDismissed && filtered.length > 1}
            <span class="swipe-hint" aria-hidden="true">Deslizá ↑</span>
          {/if}
        </section>
      {/each}
    </div>

    {#if shareMsg}<p class="toast">{shareMsg}</p>{/if}
  </div>
{:else}
  <!-- ======================= MURO · escritorio ======================= -->
  <div class="web-mode">
    <section class="v-header">
      <div class="container">
        <div class="v-top"><span class="label">Index · Movimiento</span></div>
        <h1 class="v-title"><span class="italic">Videos.</span> Obra en movimiento.</h1>
        <div class="v-sub">
          <p>
            Piezas cortas del estudio. Pasá el cursor sobre cualquiera para verla en movimiento
            y hacé clic para abrirla en sala — con flechas ← → para saltar entre clips.
          </p>
          <div class="v-counters">
            <div><span class="numeral">{String(filtered.length).padStart(2, '0')}</span><span class="label">Piezas</span></div>
            <div><span class="numeral">{formatDuration(totalDuration)}</span><span class="label">En total</span></div>
          </div>
        </div>

        {#if categories.length > 1}
          <div class="filters">
            <button class="f-btn" class:active={filter === 'todos'} on:click={() => pickFilter('todos')}><span>Todos</span></button>
            {#each categories as c (c.id)}
              <button class="f-btn" class:active={filter === c.id} on:click={() => pickFilter(c.id)}><span>{c.label}</span></button>
            {/each}
          </div>
        {/if}
      </div>
    </section>

    <section class="wall-section">
      <div class="container">
        {#if filtered.length === 0}
          <p class="empty">No hay videos en esta categoría.</p>
        {:else}
          <div class="masonry">
            {#each filtered as v, i (v.id)}
              <article class="card" class:is-hovered={hoveredId === v.id}>
                <button
                  class="card-btn"
                  style={`--ratio:${videoRatio(v)}`}
                  on:mouseenter={() => hoverIn(v)}
                  on:mouseleave={() => hoverOut(v)}
                  on:focus={() => hoverIn(v)}
                  on:blur={() => hoverOut(v)}
                  on:click={() => openTheater(i)}
                >
                  <span class="card-media">
                    {#if v.posterKey}
                      <img src={assetUrl(v.posterKey)} alt={v.title} loading="lazy" />
                    {/if}
                    {#if loadedIds.has(v.id)}
                      <video
                        bind:this={cardEls[v.id]}
                        src={assetUrl(v.key)}
                        preload="none"
                        muted
                        loop
                        playsinline
                      ></video>
                    {/if}
                  </span>
                  <span class="card-veil"></span>
                  <span class="card-badges">
                    <span class="pill">{ORIENTATION_LABEL[orientationOf(v)]}</span>
                    <span class="pill mono">{formatDuration(v.duration)}</span>
                  </span>
                  <span class="card-info">
                    <span class="label">{catLabel(v.category)}</span>
                    <span class="card-title">{v.title}</span>
                    <span class="card-cta">Ver en sala →</span>
                  </span>
                </button>
              </article>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  </div>
{/if}

{#if theaterOpen && current}
  <div class="theater" role="dialog" aria-modal="true" aria-label={current.title}>
    <button class="theater-scrim" on:click={closeTheater} aria-label="Cerrar sala"></button>

    {#if current.posterKey}
      <img class="theater-glow" src={assetUrl(current.posterKey)} alt="" aria-hidden="true" />
    {/if}

    <button class="theater-close" on:click={closeTheater} aria-label="Cerrar">✕</button>

    {#if filtered.length > 1}
      <button class="theater-nav prev" on:click={() => step(-1)} aria-label="Anterior">‹</button>
      <button class="theater-nav next" on:click={() => step(1)} aria-label="Siguiente">›</button>
    {/if}

    <div class="theater-body">
      {#key current.id}
        <div class="theater-stage" style={`--ratio:${videoRatio(current)}`}>
          <video
            bind:this={theaterEl}
            src={assetUrl(current.key)}
            poster={current.posterKey ? assetUrl(current.posterKey) : undefined}
            controls
            autoplay
            playsinline
            preload="auto"
          >
            <track kind="captions" />
          </video>
        </div>
      {/key}

      <div class="theater-meta">
        <span class="label">
          {catLabel(current.category)} · {formatDuration(current.duration)} · {ORIENTATION_LABEL[orientationOf(current)]}
        </span>
        <h2>{current.title}</h2>
        {#if current.description}<p>{current.description}</p>{/if}
        <span class="keys numeral">← → cambiar · espacio pausar · M silenciar · esc salir</span>
      </div>
    </div>

    {#if filtered.length > 1}
      <div class="filmstrip">
        {#each filtered as v, i (v.id)}
          <button
            class="strip"
            class:active={i === theaterIndex}
            style={`--ratio:${videoRatio(v)}`}
            on:click={() => (theaterIndex = i)}
            aria-label={v.title}
            aria-current={i === theaterIndex}
          >
            {#if v.posterKey}
              <img src={assetUrl(v.posterKey)} alt="" loading="lazy" />
            {:else}
              <span class="strip-fallback">{v.title.slice(0, 2)}</span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Height of the fixed header the layout already reserves on phones. */
  .reel-shell {
    --header-h: 100px;
    position: relative;
    height: calc(100svh - var(--header-h));
    background: var(--paper-fixed-deep);
  }

  /* SSR renders the wall; below 860px it stays hidden until hydration
     swaps in the reel, so the phone never flashes the desktop layout. */
  @media (max-width: 860px) {
    .web-mode { display: none; }
  }

  /* ============================ reel ============================ */

  .reel {
    height: 100%;
    overflow-y: auto;
    scroll-snap-type: y mandatory;
    overscroll-behavior-y: contain;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .reel::-webkit-scrollbar { display: none; }

  .slide {
    position: relative;
    height: 100%;
    scroll-snap-align: start;
    scroll-snap-stop: always;
    overflow: hidden;
    background: var(--paper-fixed-deep);
  }

  .ambient {
    position: absolute;
    inset: -12%;
    width: 124%;
    height: 124%;
    object-fit: cover;
    filter: blur(42px) saturate(1.3) brightness(0.5);
    transform: scale(1.1);
  }

  .tap-layer {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    width: 100%;
    padding: 0;
    background: transparent;
    border: 0;
  }

  /* contain, never cover: a 16:9 clip keeps its bars over the blurred fill. */
  .reel-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .play-badge {
    position: absolute;
    font-size: 3.4rem;
    color: color-mix(in srgb, var(--ink-fixed-light) 82%, transparent);
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
    pointer-events: none;
    animation: fadeIn 0.2s ease;
  }

  .reel-tabs {
    position: absolute;
    top: 0.85rem;
    left: 0;
    right: 0;
    z-index: 6;
    display: flex;
    gap: 0.4rem;
    justify-content: center;
    flex-wrap: wrap;
    padding: 0 0.75rem;
  }

  .tab {
    padding: 0.35rem 0.85rem;
    font-family: var(--font-sans);
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink-fixed-light-2);
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid transparent;
    border-radius: 999px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .tab.active {
    color: var(--paper-fixed-deep);
    background: var(--accent-fixed);
    border-color: var(--accent-fixed);
  }

  .slide-rail {
    position: absolute;
    right: 0.85rem;
    bottom: 8.5rem;
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }

  .rail-btn {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    font-size: 1.05rem;
    color: var(--ink-fixed-light);
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid var(--line-fixed-dark);
    border-radius: 999px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .slide-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    padding: 4.5rem 1.15rem 2.4rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.86), rgba(0, 0, 0, 0.45) 45%, transparent);
    pointer-events: none;
  }
  .slide-info .label { color: var(--accent-fixed-soft); }
  .slide-info h2 {
    font-size: clamp(1.5rem, 6.5vw, 2.1rem);
    line-height: 1.02;
    margin: 0.45rem 0 0.35rem;
    color: var(--ink-fixed-light);
  }
  .slide-info p {
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--ink-fixed-light-2);
    max-width: 32ch;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .reel-progress {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    height: 2px;
    background: rgba(255, 255, 255, 0.16);
  }
  .reel-progress span {
    display: block;
    height: 100%;
    background: var(--accent-fixed);
    transform-origin: left center;
    transform: scaleX(0);
  }

  .swipe-hint {
    position: absolute;
    left: 50%;
    bottom: 1.4rem;
    z-index: 5;
    transform: translateX(-50%);
    font-family: var(--font-sans);
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink-fixed-light-2);
    animation: fadeUpSm 2.2s ease-in-out infinite alternate;
  }

  .toast {
    position: absolute;
    left: 50%;
    bottom: 2rem;
    z-index: 20;
    transform: translateX(-50%);
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    color: var(--paper-fixed-deep);
    background: var(--accent-fixed);
  }

  /* ============================ header (web) ============================ */

  .v-header {
    padding: clamp(4rem, 9vw, 8rem) 0 clamp(2.5rem, 5vw, 4rem);
    border-bottom: 1px solid var(--line);
  }
  .v-top { padding-bottom: 3rem; }

  .v-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(3rem, 11vw, 9rem);
    letter-spacing: -0.035em;
    line-height: 0.9;
    margin-bottom: 3rem;
    font-variation-settings: 'opsz' 144, 'SOFT' 45, 'WONK' 1;
  }
  .v-title .italic {
    font-style: italic;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--accent);
  }

  .v-sub {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 3rem;
    align-items: end;
    padding-bottom: 2.5rem;
  }
  .v-sub p { max-width: 56ch; }

  .v-counters { display: flex; gap: 2.5rem; }
  .v-counters div { display: flex; flex-direction: column; gap: 0.35rem; }
  .v-counters .numeral { font-size: 1.6rem; color: var(--ink); }

  .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .f-btn {
    padding: 0.55rem 1.1rem;
    font-family: var(--font-sans);
    font-size: 0.66rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid var(--line-strong);
    transition: color 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  }
  .f-btn:hover { color: var(--accent); border-color: var(--accent); }
  .f-btn.active { color: var(--paper); background: var(--accent); border-color: var(--accent); }

  /* ============================ wall ============================ */

  .wall-section { padding: clamp(3rem, 6vw, 5rem) 0 clamp(5rem, 10vw, 8rem); }

  /* Columns rather than grid: mixed 9:16 / 16:9 / 1:1 tiles pack without
     leaving the ragged gaps a row-based grid would. */
  .masonry {
    columns: 3;
    column-gap: clamp(1rem, 1.6vw, 1.6rem);
  }
  @media (max-width: 1500px) { .masonry { columns: 3; } }
  @media (max-width: 1180px) { .masonry { columns: 2; } }

  .card {
    break-inside: avoid;
    margin-bottom: clamp(1rem, 1.6vw, 1.6rem);
  }

  .card-btn {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: var(--ratio);
    overflow: hidden;
    background: var(--paper-alt);
    border: 1px solid var(--line);
    padding: 0;
    text-align: left;
    transition: border-color 0.4s ease, transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .card-btn:hover, .card-btn:focus-visible {
    border-color: var(--accent);
    transform: translateY(-4px);
    outline: none;
  }

  .card-media { position: absolute; inset: 0; display: block; }
  .card-media img,
  .card-media video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .card-media video { opacity: 0; transition: opacity 0.45s ease; }
  .is-hovered .card-media video { opacity: 1; }

  .card-veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.82), rgba(0, 0, 0, 0.12) 52%, rgba(0, 0, 0, 0.28));
    opacity: 0.85;
    transition: opacity 0.4s ease;
  }
  .is-hovered .card-veil { opacity: 0.62; }

  .card-badges {
    position: absolute;
    top: 0.7rem;
    left: 0.7rem;
    display: flex;
    gap: 0.4rem;
  }
  .pill {
    padding: 0.18rem 0.55rem;
    font-family: var(--font-sans);
    font-size: 0.58rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-fixed-light);
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .pill.mono { font-family: var(--font-mono); letter-spacing: 0.08em; }

  .card-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1.15rem 1.15rem 1.25rem;
  }
  .card-info .label { color: var(--accent-fixed-soft); }
  .card-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.2rem, 1.6vw, 1.7rem);
    line-height: 1.02;
    letter-spacing: -0.015em;
    color: var(--ink-fixed-light);
  }
  .card-cta {
    font-family: var(--font-sans);
    font-size: 0.64rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--accent-fixed);
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.35s ease, transform 0.35s ease;
  }
  .is-hovered .card-cta { opacity: 1; transform: translateY(0); }

  /* ============================ theatre ============================ */

  .theater {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: grid;
    grid-template-rows: 1fr auto;
    background: color-mix(in srgb, var(--paper-fixed-deep) 96%, transparent);
    animation: fadeIn 0.28s ease;
  }

  .theater-scrim { position: absolute; inset: 0; background: transparent; border: 0; }

  /* Bleeds the clip's own colour behind the letterboxing. */
  .theater-glow {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(70px) saturate(1.4) brightness(0.35);
    opacity: 0.75;
    pointer-events: none;
  }

  .theater-body {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: auto minmax(240px, 22rem);
    gap: clamp(1.5rem, 3vw, 3rem);
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 3.5rem) clamp(3.5rem, 6vw, 6rem) 1rem;
    min-height: 0;
    pointer-events: none;
  }
  .theater-body > * { pointer-events: auto; }

  .theater-stage {
    aspect-ratio: var(--ratio);
    height: min(70vh, calc(62vw / var(--ratio)));
    max-width: 100%;
    background: #000;
    border: 1px solid var(--line-fixed-dark);
    box-shadow: 0 40px 120px -30px rgba(0, 0, 0, 0.9);
  }
  .theater-stage video { width: 100%; height: 100%; object-fit: contain; background: #000; }

  .theater-meta { max-width: 34rem; }
  .theater-meta .label { color: var(--accent-fixed-soft); }
  .theater-meta h2 {
    font-size: clamp(1.8rem, 3vw, 3rem);
    margin: 0.6rem 0 0.9rem;
    color: var(--ink-fixed-light);
  }
  .theater-meta p { color: var(--ink-fixed-light-2); }
  .keys { display: block; margin-top: 1.6rem; color: var(--muted-fixed); font-size: 0.66rem; }

  .theater-close,
  .theater-nav {
    position: absolute;
    z-index: 4;
    display: grid;
    place-items: center;
    color: var(--ink-fixed-light);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--line-fixed-dark);
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  .theater-close:hover,
  .theater-nav:hover { background: var(--accent-fixed); color: var(--paper-fixed-deep); border-color: var(--accent-fixed); }

  .theater-close { top: 1.2rem; right: 1.4rem; width: 44px; height: 44px; font-size: 0.95rem; }
  .theater-nav { top: 45%; width: 46px; height: 68px; font-size: 1.9rem; line-height: 1; }
  .theater-nav.prev { left: 0.9rem; }
  .theater-nav.next { right: 0.9rem; }

  .filmstrip {
    position: relative;
    z-index: 3;
    display: flex;
    gap: 0.55rem;
    align-items: flex-end;
    overflow-x: auto;
    padding: 0.9rem clamp(1rem, 4vw, 3rem) 1.4rem;
    scrollbar-width: thin;
  }
  .strip {
    flex: 0 0 auto;
    width: 88px;
    aspect-ratio: var(--ratio);
    overflow: hidden;
    background: var(--paper-fixed-dark);
    border: 1px solid var(--line-fixed-dark);
    opacity: 0.5;
    transition: opacity 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  }
  .strip img { width: 100%; height: 100%; object-fit: cover; }
  .strip-fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-family: var(--font-display);
    color: var(--muted-fixed);
  }
  .strip:hover { opacity: 0.85; transform: translateY(-3px); }
  .strip.active { opacity: 1; border-color: var(--accent-fixed); }

  @media (max-width: 1080px) {
    .theater-body { grid-template-columns: minmax(0, 1fr); justify-items: center; }
    .theater-stage { height: min(56vh, calc(88vw / var(--ratio))); }
    .theater-meta { text-align: center; }
  }

  /* ============================ empty ============================ */

  .v-empty { padding: clamp(6rem, 14vw, 12rem) 0; }
  .v-empty p { margin: 1.5rem 0 2rem; max-width: 46ch; }
  .empty { color: var(--muted); }

  @media (max-width: 700px) {
    .v-sub { grid-template-columns: 1fr; gap: 2rem; align-items: start; }
  }
</style>
