<script>
  import { thumbUrl } from '$lib/images.js';
  import PhotoGrid from '$lib/components/PhotoGrid.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { cleanTitle } from '$lib/seo.js';

  export let data;
  export let form;
  $: ({ gallery, downloadsUnlocked, locked, seo } = data);
  $: protectedDownloads = gallery.protected && !downloadsUnlocked;
  $: children = gallery.children || [];
  $: photos = gallery.photos || [];
  $: hasChildren = gallery.hasChildren;

  $: title = cleanTitle(gallery.title);

  let showUnlock = false;

  $: totalPhotosInChildren = children.reduce((acc, c) => acc + c.count, 0);
  $: totalPieces = photos.length + totalPhotosInChildren;
  $: humanDate = gallery.date
    ? new Date(gallery.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
</script>

<Seo {...seo} />

<!-- ===== Header ===== -->
<section class="g-head">
  <div class="container">
    <a href="/galeria" class="back">
      <span class="arrow">←</span>
      <span class="back-label">Volver al índice</span>
    </a>

    <div class="head-meta">
      <span class="label">Portafolio · {gallery.category || 'archivo'}</span>
      <span class="numeral">
        {#if locked}
          Acceso protegido
        {:else if hasChildren && photos.length === 0}
          {String(children.length).padStart(2, '0')} subgalerías · {totalPhotosInChildren} fotografías
        {:else if hasChildren}
          {String(children.length).padStart(2, '0')} subgalerías · {totalPieces} fotografías
        {:else}
          {String(photos.length).padStart(3, '0')} fotografías
        {/if}
      </span>
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
          <p>
            {#if locked}
              Contenido protegido — ingresá la contraseña
            {:else if hasChildren}
              {children.length} capítulos · {totalPieces} piezas
            {:else}
              {photos.length} piezas · resolución editorial
            {/if}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{#if gallery.protected}
  <section class="dl-band">
    <div class="container dl-band-grid">
      <div>
        <span class="label">
          {#if locked}
            🔒 Galería protegida
          {:else if downloadsUnlocked}
            🔓 Acceso desbloqueado
          {:else}
            🔒 Descargas protegidas
          {/if}
        </span>
        <p class="dl-copy">
          {#if locked}
            Esta galería tiene contenido privado. Ingresá la contraseña que te compartimos para ver
            {hasChildren ? 'las subgalerías y' : ''} las fotos.
          {:else if downloadsUnlocked}
            Tenés acceso completo: podés ver {hasChildren ? 'las subgalerías y' : ''} descargar las fotos.
          {:else}
            Las fotos se pueden ver pero no descargar. Ingresá la contraseña para activar las descargas.
          {/if}
        </p>
      </div>
      {#if !downloadsUnlocked}
        <div class="dl-action">
          {#if showUnlock || locked}
            <form method="POST" action="?/unlock" class="unlock-form">
              <input name="password" type="password" autocomplete="current-password" required placeholder="Contraseña" />
              <button type="submit" class="btn">Desbloquear</button>
            </form>
            {#if form?.error}<p class="dl-error">{form.error}</p>{/if}
          {:else}
            <button type="button" class="btn" on:click={() => (showUnlock = true)}>Ingresar contraseña</button>
          {/if}
        </div>
      {/if}
    </div>
  </section>
{/if}

{#if locked}
  <!-- Galería bloqueada: no se muestran ni subgalerías ni fotos -->
  <section class="locked-screen">
    <div class="container">
      <div class="locked-card">
        <span class="label">🔒 Contenido privado</span>
        <h2>Necesitás la contraseña para entrar</h2>
        <p>Una vez que la ingreses arriba vas a poder navegar {hasChildren ? 'las subgalerías' : 'las fotos'} y descargar el material.</p>
      </div>
    </div>
  </section>
{:else}
  {#if hasChildren}
    <!-- ===== Subgalerías ===== -->
    <section class="sub-section">
      <div class="container">
        <div class="sub-header">
          <span class="label">Capítulos · {children.length}</span>
          <p class="sub-copy">Navegá cada momento por separado. El acceso es el mismo para todos.</p>
        </div>
        <ul class="sub-grid">
          {#each children as c, i (c.slug)}
            <li class="sub-item">
              <a href={`/galeria/${gallery.slug}/${c.slug}`} class="sub-link">
                <div class="sub-meta-top">
                  <span class="numeral">{String(i + 1).padStart(2, '0')}</span>
                  <span class="numeral">— {c.count}</span>
                </div>
                <div class="sub-img">
                  {#if c.cover}
                    <img src={thumbUrl(c.cover, c.slug)} alt={c.title} loading="lazy" />
                  {:else}
                    <div class="sub-empty">Sin fotos aún</div>
                  {/if}
                </div>
                <div class="sub-info">
                  <h3>{c.title}</h3>
                  <span class="link-sub">Entrar <span class="arrow">→</span></span>
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </section>
  {/if}

  {#if photos.length > 0}
    {#if hasChildren}
      <section class="own-photos-band">
        <div class="container">
          <span class="label">Fotos sueltas del evento</span>
        </div>
      </section>
    {/if}
    <PhotoGrid
      {photos}
      slug={gallery.slug}
      {title}
      {downloadsUnlocked}
      {protectedDownloads}
    />
  {:else if !hasChildren}
    <section class="empty-state">
      <div class="container">
        <p>Esta galería todavía no tiene contenido.</p>
      </div>
    </section>
  {/if}
{/if}

<!-- ===== Footer strip ===== -->
{#if !locked}
  <section class="g-foot">
    <div class="container g-foot-grid">
      <span class="numeral">Fin del portafolio ·</span>
      <span class="italic-title">{title}</span>
      <a href="/galeria" class="link-arrow">Siguiente portafolio</a>
    </div>
  </section>
{/if}

<style>
  /* ============ DOWNLOAD BAND ============ */
  .dl-band {
    background: var(--paper-alt);
    border-bottom: 1px solid var(--line);
    padding: 1.25rem 0;
  }
  .dl-band-grid {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 2rem;
    align-items: center;
  }
  .dl-band .label { color: var(--accent); display: block; margin-bottom: 0.4rem; }
  .dl-copy { color: var(--ink-2); font-size: 0.95rem; line-height: 1.55; max-width: 60ch; margin: 0; }
  .dl-action { display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end; }
  .unlock-form { display: flex; gap: 0.5rem; }
  .unlock-form input {
    padding: 0.65rem 0.85rem;
    background: var(--paper);
    color: var(--ink);
    border: 1px solid var(--line-strong);
    font-size: 0.95rem;
    min-width: 220px;
  }
  .unlock-form input:focus { outline: none; border-color: var(--accent); background: var(--paper-soft); }
  .dl-error {
    color: #b00020;
    font-size: 0.85rem;
    background: color-mix(in srgb, #b00020 12%, transparent);
    border: 1px solid color-mix(in srgb, #b00020 35%, transparent);
    padding: 0.4rem 0.7rem;
  }
  @media (max-width: 720px) {
    .dl-band-grid { grid-template-columns: 1fr; }
    .dl-action { align-items: stretch; }
    .unlock-form { flex-direction: column; }
    .unlock-form input { min-width: 0; }
  }

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
    grid-template-columns: repeat(2, minmax(0, 220px));
    gap: 2.5rem;
  }

  .head-info .label { display: block; margin-bottom: 0.4rem; }
  .head-info p { font-size: 0.95rem; color: var(--ink); }

  /* ============ LOCKED ============ */
  .locked-screen { padding: clamp(4rem, 8vw, 7rem) 0; }
  .locked-card {
    border: 1px dashed var(--line-strong);
    background: var(--paper-alt);
    padding: clamp(2rem, 4vw, 3rem);
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
  }
  .locked-card .label { color: var(--accent); display: block; margin-bottom: 1rem; }
  .locked-card h2 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
  }
  .locked-card p { color: var(--ink-2); margin: 0; }

  /* ============ SUBGALLERIES ============ */
  .sub-section {
    padding: clamp(3rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3rem);
    border-bottom: 1px solid var(--line);
  }
  .sub-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--line);
    margin-bottom: 2.5rem;
    flex-wrap: wrap;
  }
  .sub-header .label { color: var(--muted); }
  .sub-copy { color: var(--ink-2); font-size: 0.95rem; max-width: 50ch; margin: 0; }

  .sub-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    padding: 0;
    margin: 0;
  }
  .sub-link { display: block; color: var(--ink); }
  .sub-meta-top {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid var(--line);
    margin-bottom: 0.75rem;
  }
  .sub-img {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--paper-alt);
  }
  .sub-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .sub-link:hover .sub-img img { transform: scale(1.04); }
  .sub-empty {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted);
    font-size: 0.78rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .sub-info {
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .sub-info h3 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.2rem, 2vw, 1.8rem);
    line-height: 1.05;
    letter-spacing: -0.015em;
    margin: 0;
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
  }
  .link-sub .arrow { display: inline-block; transition: transform 0.35s ease; }
  .sub-link:hover .link-sub { opacity: 1; }
  .sub-link:hover .link-sub .arrow { transform: translateX(6px); }

  .own-photos-band {
    padding: 2.5rem 0 0;
  }
  .own-photos-band .label { color: var(--muted); }

  .empty-state {
    padding: 4rem 0;
    text-align: center;
    color: var(--muted);
  }

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

  /* ============ RESPONSIVE ============ */
  @media (max-width: 900px) {
    .head-bottom { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
    .head-info { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .sub-grid { grid-template-columns: 1fr; }
  }
</style>
