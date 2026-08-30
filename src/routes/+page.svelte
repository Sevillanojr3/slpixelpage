<script>
  import { onMount } from 'svelte';
  import { thumbUrl, fullUrl } from '$lib/images.js';
  import { env as publicEnv } from '$env/dynamic/public';
  import { brand } from '$lib/logos.js';
  import Seo from '$lib/components/Seo.svelte';
  import { cleanTitle } from '$lib/seo.js';

  export let data;

  const all = (data.galleries || [])
    .filter((g) => (g.photos || []).length > 0)
    .map((g) => ({ ...g, title: cleanTitle(g.title) }));

  const bySlug = (slug) => all.find((g) => g.slug === slug);

  // Hero carousel — curated photos served from R2 (carrusel/ prefix).
  const CARRUSEL_BASE = (publicEnv.PUBLIC_IMAGES_BASE_URL || '').replace(/\/$/, '');
  const carruselFiles = [
    'bagoso-aniversario-041.jpg',
    'cuki-y-juli-09.jpg',
    'dsc07335.jpg',
    'dsc09143.jpg',
    'dsc6887.jpg',
    'dsc7276.jpg',
    'dsc7533.jpg',
    'julieta-07.jpg',
    'seleccion-01.jpg',
    'ttptycp-57.jpg',
  ];
  const heroSlides = carruselFiles.map((file) => ({
    src: CARRUSEL_BASE ? `${CARRUSEL_BASE}/carrusel/${file}` : `/carrusel/${file}`,
    key: file,
  }));

  // About: pick an atmospheric photo from a different gallery
  const aboutGallery = bySlug('cumpleanospancho73') || bySlug('tridenttrustpanamaparty') || all[1] || all[0];
  const aboutPhoto = aboutGallery.photos[6] || aboutGallery.photos[2] || aboutGallery.photos[0];

  // Curated featured works (4 varied categories)
  const featuredSlugs = [
    'tridenttrustpanamaparty',
    'cdplazaamadorvsrealespana',
    'cumpleanosmeris50',
    'panamvsrepblicadominicanau17',
  ];
  const featured = featuredSlugs.map(bySlug).filter(Boolean);

  // Marquee list of all gallery titles for the ticker band
  const marqueeTitles = all.map((g) => g.title);

  // Latest galleries — newest first, by createdAt (fallback to date), max 6
  function ts(g) {
    return Date.parse(g.createdAt || g.date || '') || 0;
  }
  const latest = [...(data.galleries || [])]
    .filter((g) => (g.photos || []).length > 0)
    .map((g) => ({ ...g, title: cleanTitle(g.title) }))
    .sort((a, b) => ts(b) - ts(a))
    .slice(0, 6);

  function shortDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    } catch { return ''; }
  }

  let mounted = false;
  let activeHero = 0;
  let heroPaused = false;

  onMount(() => {
    mounted = true;

    if (heroSlides.length < 2) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const SLIDE_MS = 6000;
    const id = setInterval(() => {
      if (heroPaused || document.hidden) return;
      activeHero = (activeHero + 1) % heroSlides.length;
    }, SLIDE_MS);

    return () => clearInterval(id);
  });
</script>

<Seo {...data.seo} />

<!-- =============== HERO =============== -->
<section
  class="hero"
  class:mounted
  on:mouseenter={() => (heroPaused = true)}
  on:mouseleave={() => (heroPaused = false)}
  aria-label="Galería principal de SLPixel"
>
  <div class="hero-image">
    {#each heroSlides as slide, i (slide.key)}
      <img
        src={slide.src}
        alt=""
        class:active={i === activeHero}
        loading={i === 0 ? 'eager' : 'lazy'}
        fetchpriority={i === 0 ? 'high' : 'auto'}
        decoding="async"
      />
    {/each}
    <div class="hero-scrim"></div>
  </div>

  {#if heroSlides.length > 1}
    <div class="hero-dots" aria-hidden="true">
      {#each heroSlides as _, i}
        <button
          type="button"
          class="hero-dot"
          class:on={i === activeHero}
          on:click={() => (activeHero = i)}
          aria-label={`Mostrar imagen ${i + 1}`}
        ></button>
      {/each}
    </div>
  {/if}

  <div class="hero-frame">
    <div class="hero-top">
      <span class="label">Fotografía editorial · Bodas · Eventos</span>
      <span class="numeral">SLPixel · Estudio · Panamá</span>
    </div>

    <div class="hero-center">
      <h1 class="hero-title">
        <span class="ht-line">Convirtiendo momentos</span>
        <span class="ht-line">en recuerdos <em>eternos</em>.</span>
      </h1>
    </div>

    <div class="hero-bottom">
      <p class="hero-lede">
        Fotografía documental y artística para crear recuerdos auténticos,
        belleza y emociones reales.
      </p>
      <div class="hero-actions">
        <a href="/galeria" class="btn">Ver portafolio</a>
        <a href="#servicios" class="hero-sub">Explorar servicios →</a>
      </div>
    </div>
  </div>

</section>

<!-- =============== STATEMENT BAND =============== -->
<section class="statement">
  <div class="container">
    <span class="label">SLPixel Studio</span>
    <h2 class="statement-title">
      Construyendo <em>memorias</em>
      <br />
      que resisten el paso del tiempo.
    </h2>
  </div>
</section>

<!-- =============== MARQUEE BAND =============== -->
<section class="marquee" aria-hidden="true">
  <div class="marquee-track">
    {#each [...marqueeTitles, ...marqueeTitles] as t, i}
      <span class="m-item"><span class="star">✦</span>{t}</span>
    {/each}
  </div>
</section>

<!-- =============== LATEST GALLERIES =============== -->
{#if latest.length > 0}
  <section class="latest section">
    <div class="container">
      <div class="latest-head">
        <div>
          <span class="label">Recién publicadas</span>
          <h2>Últimas galerías.</h2>
        </div>
        <a href="/galeria" class="link-arrow desktop-only">Ver todas →</a>
      </div>

      <ul class="latest-grid">
        {#each latest as g, i (g.slug)}
          <li class="l-card">
            <a href={`/galeria/${g.slug}`} class="l-link">
              <div class="l-img">
                {#if g.cover}
                  <img src={thumbUrl(g.cover, g.slug)} alt={g.title} loading="lazy" />
                {/if}
                {#if g.protected}
                  <span class="dl-pill" title="Descargas con contraseña">🔒</span>
                {/if}
              </div>
              <div class="l-info">
                <span class="numeral">{shortDate(g.createdAt || g.date) || '—'}</span>
                <h3>{g.title}</h3>
                <span class="label l-meta">{g.category || 'archivo'} · {(g.photos || []).length} fotos</span>
              </div>
            </a>
          </li>
        {/each}
      </ul>

      <a href="/galeria" class="link-arrow mobile-only">Ver todas →</a>
    </div>
  </section>
{/if}

<!-- =============== ABOUT / INTRO =============== -->
<section id="sobre-mi" class="section about">
  <div class="container about-grid">
    <div class="about-meta">
      <span class="label">Sobre mí</span>
      <hr class="rule-short" />
    </div>

    <div class="about-text">
      <h2>
        Cada imagen
        <span class="italic">es un archivo</span>
        de lo que fue irrepetible.
      </h2>

      <div class="about-copy prose">
        <p>
          SLPixel es un estudio independiente dedicado a la fotografía de
          bodas, eventos, producción audiovisual y dirección creativa con base
          en Ciudad de Panamá.
        </p>
        <p>
          Trabajamos con la disciplina del editorial y la sensibilidad del
          retrato. Nuestro objetivo no es documentar: es construir una
          memoria visual que resista el paso del tiempo.
        </p>
      </div>

      <div class="about-links">
        <a href="/galeria" class="link-arrow">Portafolio completo</a>
        <a href="#contacto" class="link-arrow">Agendar proyecto</a>
      </div>
    </div>

    <div class="about-image">
      <img src={fullUrl(aboutPhoto, aboutGallery.slug)} alt="" loading="lazy" />
      <figcaption class="caption">
        <span class="numeral">Fig. 01</span>
        <span>{aboutGallery.title}</span>
      </figcaption>
    </div>
  </div>
</section>

<!-- =============== SERVICES =============== -->
<section id="servicios" class="section services">
  <div class="container">
    <div class="services-head">
      <span class="label">Servicios</span>
      <h2>
        Un lenguaje para
        <span class="italic">cada encargo</span>.
      </h2>
    </div>

    <ol class="services-list">
      <li class="service">
        <span class="numeral num">01</span>
        <div>
          <h3>Bodas y celebraciones</h3>
          <p>
            Bodas, quinceañeras, cumpleaños y celebraciones privadas. Cobertura de principio a fin,
            con entrega editorial y una selección curada del momento clave.
          </p>
        </div>
      </li>

      <li class="service">
        <span class="numeral num">02</span>
        <div>
          <h3>Producción corporativa</h3>
          <p>
            Branding fotográfico, galas empresariales, retratos ejecutivos y piezas
            audiovisuales para redes. Coordinación completa de locación, dirección y post.
          </p>
        </div>
      </li>

      <li class="service">
        <span class="numeral num">03</span>
        <div>
          <h3>Cobertura deportiva</h3>
          <p>
            Partidos de liga nacional e internacional, selecciones, entrenamientos y
            momentos deportivos. Archivo disponible para prensa y clubes.
          </p>
        </div>
      </li>
    </ol>
  </div>
</section>

<!-- =============== FEATURED WORKS =============== -->
<section class="section featured">
  <div class="container">
    <div class="featured-head">
      <div>
        <span class="label">Trabajos seleccionados</span>
        <h2>Últimos portafolios.</h2>
      </div>
      <a href="/galeria" class="link-arrow desktop-only">Ver todos los portafolios</a>
    </div>

    <div class="featured-grid">
      {#each featured as g, i (g.slug)}
        <a class="f-card" class:offset={i % 2 === 1} href={`/galeria/${g.slug}`}>
          <div class="f-img">
            <img src={thumbUrl(g.photos[0], g.slug)} alt={g.title} loading="lazy" />
          </div>
          <div class="f-info">
            <span class="numeral">0{i + 1} / {String(featured.length).padStart(2, '0')}</span>
            <h3>{g.title}</h3>
            <div class="f-meta">
              <span class="label">{g.category}</span>
              <span class="numeral">{g.photos.length} fotos</span>
            </div>
          </div>
        </a>
      {/each}
    </div>

    <a href="/galeria" class="link-arrow mobile-only">Ver todos los portafolios</a>
  </div>
</section>

<!-- =============== CTA =============== -->
<section class="cta">
  <div class="container cta-grid">
    <div>
      <span class="label">Invitación</span>
      <h2>
        Cuéntanos tu proyecto.
        <span class="italic">Hagámoslo memorable.</span>
      </h2>
    </div>
    <div class="cta-action">
      <p>
        Reservamos un número limitado de encargos al mes para garantizar la calidad
        que entregamos. Escribe a nuestro correo y respondemos en 24 horas.
      </p>
      <a href="mailto:info@slpixel.com" class="btn">Escribir al estudio</a>
    </div>
  </div>
</section>

<!-- =============== CONTACT =============== -->
<section id="contacto" class="section contact">
  <div class="container contact-grid">
    <div>
      <span class="label">Contacto</span>
      <hr class="rule-short" />
    </div>
    <div class="contact-body">
      <p class="contact-lede">
        Estudio SLPixel · Ciudad de Panamá. Atención por correo y redes
        sociales.
      </p>
      <a href="mailto:info@slpixel.com" class="email-big">info@slpixel.com</a>
      <div class="contact-meta">
        <div>
          <span class="label">Teléfono</span>
          <p>
            <a href="tel:+50764660639">+507 6466-0639</a>
          </p>
        </div>
        <div>
          <span class="label">Redes</span>
          <p>
            <a href="https://www.instagram.com/slpixel/" target="_blank" rel="noopener noreferrer">@slpixel ↗</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* =================== HERO =================== */
  .hero {
    position: relative;
    height: min(100vh, 960px);
    min-height: 640px;
    overflow: hidden;
    color: var(--ink-fixed-light);
    background: var(--paper-fixed-dark);
  }

  .hero-image {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--paper-fixed-dark);
  }

  .hero-image img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
    filter: saturate(1.05) contrast(1.05);
    image-rendering: -webkit-optimize-contrast;
    opacity: 0;
    transform: scale(1.04);
    transition: opacity 1.4s ease;
    will-change: opacity, transform;
  }

  .hero-image img.active {
    opacity: 1;
    animation: heroKenBurns 9s ease-out forwards;
  }

  @keyframes heroKenBurns {
    from { transform: scale(1.05); }
    to   { transform: scale(1.0); }
  }

  .hero-scrim {
    position: absolute;
    inset: 0;
    z-index: 1;
    background:
      linear-gradient(180deg, rgba(11,10,8,0.65) 0%, rgba(11,10,8,0.18) 38%, rgba(11,10,8,0.92) 100%),
      linear-gradient(90deg, rgba(11,10,8,0.55) 0%, rgba(11,10,8,0) 60%);
    pointer-events: none;
  }

  .hero-dots {
    position: absolute;
    bottom: clamp(0.9rem, 1.4vw, 1.4rem);
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    gap: 0.55rem;
    padding: 0.5rem 0.75rem;
  }

  .hero-dot {
    width: 26px;
    height: 2px;
    background: color-mix(in srgb, var(--ink-fixed-light) 30%, transparent);
    border: 0;
    padding: 0;
    cursor: pointer;
    transition: background 0.4s ease, width 0.4s ease;
  }

  .hero-dot.on {
    background: var(--accent-fixed);
    width: 44px;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-image img.active { animation: none; transform: none; }
    .hero-image img { transition: none; }
  }

  .hero-frame {
    position: relative;
    height: 100%;
    z-index: 2;
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: clamp(1.5rem, 3vw, 2.5rem) var(--page-gutter) clamp(2rem, 3.5vw, 3rem);
    max-width: var(--page-max);
    margin: 0 auto;
  }

  .hero-top, .hero-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
  }

  .hero-top {
    align-items: flex-start;
    opacity: 0;
    animation: fadeIn 0.8s ease 0.15s forwards;
  }

  .hero-top .label { color: var(--accent-fixed); }
  .hero-top .numeral { color: color-mix(in srgb, var(--ink-fixed-light) 65%, transparent); }

  .hero-center {
    align-self: end;
    padding-bottom: 3vh;
    max-width: 24ch;
  }

  .hero-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(2.6rem, 7.5vw, 6.8rem);
    line-height: 1.0;
    color: var(--ink-fixed-light);
    letter-spacing: -0.025em;
    font-variation-settings: 'opsz' 144, 'SOFT' 45, 'WONK' 1;
  }

  .ht-line { display: block; opacity: 0; filter: blur(12px); transform: translateY(18px); }
  .hero.mounted .ht-line:nth-child(1) { animation: blurIn 1s cubic-bezier(0.2,0.7,0.2,1) 0.25s forwards; }
  .hero.mounted .ht-line:nth-child(2) { animation: blurIn 1s cubic-bezier(0.2,0.7,0.2,1) 0.55s forwards; }

  .hero-title em {
    font-style: italic;
    font-weight: 300;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--accent-fixed);
  }

  .hero-bottom {
    align-items: flex-end;
    opacity: 0;
    animation: fadeUp 1s ease 0.9s forwards;
  }

  .hero-lede {
    max-width: 38ch;
    font-size: clamp(0.95rem, 1.2vw, 1.1rem);
    line-height: 1.65;
    color: color-mix(in srgb, var(--ink-fixed-light) 86%, transparent);
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }

  .hero-sub {
    font-family: var(--font-sans);
    font-size: 0.74rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--ink-fixed-light) 75%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--accent-fixed) 50%, transparent);
    padding-bottom: 3px;
    transition: color 0.3s ease, border-color 0.3s ease;
  }

  .hero-sub:hover {
    color: var(--accent-fixed);
    border-bottom-color: var(--accent-fixed);
    opacity: 1;
  }

  /* =================== STATEMENT =================== */
  .statement {
    background: var(--paper);
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    padding: clamp(4.5rem, 9vw, 8rem) 0;
    text-align: center;
  }

  .statement .label {
    display: block;
    margin-bottom: 1.75rem;
    color: var(--accent);
  }

  .statement-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.85rem, 4.6vw, 4rem);
    line-height: 1.18;
    letter-spacing: -0.02em;
    color: var(--ink);
    max-width: 22ch;
    margin: 0 auto;
  }

  .statement-title em {
    font-style: italic;
    color: var(--accent);
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
  }

  /* =================== MARQUEE =================== */
  .marquee {
    overflow: hidden;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
    background: var(--paper-alt);
    padding: 1.1rem 0;
  }

  .marquee-track {
    display: inline-flex;
    white-space: nowrap;
    gap: 3.5rem;
    animation: marquee 60s linear infinite;
    will-change: transform;
  }

  .m-item {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(1rem, 1.6vw, 1.35rem);
    font-weight: 300;
    color: var(--ink);
    letter-spacing: -0.01em;
    display: inline-flex;
    align-items: center;
    gap: 3rem;
  }

  .star {
    font-style: normal;
    color: var(--accent);
    margin-right: 1rem;
  }

  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  /* =================== ABOUT =================== */
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 6fr 5fr;
    gap: clamp(2rem, 5vw, 5rem);
    align-items: start;
  }

  .about-meta { position: sticky; top: calc(12vh); }
  .about-meta .label { display: block; margin-bottom: 0.9rem; }

  .about-text h2 {
    font-family: var(--font-display);
    font-size: clamp(2.1rem, 5.5vw, 4.75rem);
    line-height: 1.04;
    letter-spacing: -0.025em;
    margin-bottom: 2rem;
    color: var(--ink);
  }

  .italic {
    font-style: italic;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--accent);
  }

  .about-copy { max-width: 48ch; margin-bottom: 2rem; }
  .about-copy p { color: var(--ink-2); }

  .about-links {
    display: flex;
    gap: 2.25rem;
    flex-wrap: wrap;
  }

  .about-image {
    position: relative;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: var(--paper-alt);
    border: 1px solid var(--line);
  }

  .about-image img {
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 10%;
  }

  .caption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: linear-gradient(180deg, transparent, rgba(0,0,0,0.85));
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .caption .numeral { color: var(--accent); }

  /* =================== SERVICES =================== */
  .services { background: var(--paper-alt); }

  .services-head {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
    margin-bottom: 5rem;
    align-items: end;
  }

  .services-head h2 {
    font-size: clamp(2rem, 5vw, 4.5rem);
  }

  .services-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border-top: 1px solid var(--line-strong);
  }

  .service {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.25rem;
    padding: 2.5rem 2rem 2.5rem 0;
    border-bottom: 1px solid var(--line-strong);
    border-right: 1px solid var(--line-strong);
    transition: background 0.35s ease;
  }

  .service:last-child { border-right: none; }
  .service:hover { background: var(--paper-soft); }

  .num {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    letter-spacing: 0.1em;
    padding-top: 0.5rem;
  }

  .service h3 {
    font-family: var(--font-display);
    font-size: clamp(1.35rem, 2vw, 1.8rem);
    font-weight: 400;
    margin-bottom: 0.75rem;
    letter-spacing: -0.015em;
    color: var(--ink);
  }

  .service p {
    font-size: 0.95rem;
    line-height: 1.65;
    color: var(--ink-2);
  }

  /* =================== FEATURED =================== */
  .featured-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .featured-head h2 {
    font-size: clamp(2rem, 5vw, 4.5rem);
    margin-top: 0.5rem;
  }

  .featured-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2rem 2rem;
  }

  .f-card {
    display: block;
    color: var(--ink);
    transition: transform 0.5s ease;
  }
  .f-card:hover { opacity: 1; transform: translateY(-6px); }

  .f-card:nth-child(1) { grid-column: 1 / span 7; }
  .f-card:nth-child(2) { grid-column: 8 / span 5; margin-top: clamp(2rem, 6vw, 5rem); }
  .f-card:nth-child(3) { grid-column: 1 / span 5; }
  .f-card:nth-child(4) { grid-column: 6 / span 7; margin-top: clamp(2rem, 6vw, 5rem); }

  .f-img {
    overflow: hidden;
    aspect-ratio: 4 / 3;
    background: var(--paper-alt);
    position: relative;
    border: 1px solid var(--line);
  }

  .f-card:nth-child(odd) .f-img { aspect-ratio: 5 / 4; }

  .f-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    filter: saturate(1);
  }

  .f-card:hover .f-img img { transform: scale(1.045); }

  .f-info {
    padding-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .f-info h3 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.35rem, 2.2vw, 2rem);
    letter-spacing: -0.015em;
    line-height: 1.05;
    color: var(--ink);
  }

  .f-card:hover .f-info h3 { color: var(--accent); }

  .f-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.3rem;
    align-items: baseline;
  }

  .f-meta .label { color: var(--accent); font-size: 0.62rem; }

  .desktop-only { display: inline-flex; }
  .mobile-only { display: none; }

  /* =================== LATEST =================== */
  .latest {
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }

  .latest-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .latest-head h2 {
    font-size: clamp(1.8rem, 4.2vw, 3.5rem);
    margin-top: 0.5rem;
  }

  .latest-grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem 1.5rem;
  }

  .l-card { display: block; }
  .l-link { display: block; color: var(--ink); }
  .l-link:hover { opacity: 1; }

  .l-img {
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: var(--paper-alt);
    border: 1px solid var(--line);
    position: relative;
  }

  .l-img img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .l-link:hover .l-img img { transform: scale(1.045); }

  .dl-pill {
    position: absolute;
    top: 0.55rem;
    left: 0.55rem;
    background: color-mix(in srgb, var(--paper) 78%, transparent);
    color: var(--ink);
    border: 1px solid var(--line-strong);
    padding: 0.18rem 0.4rem;
    font-family: var(--font-sans);
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .l-info {
    padding-top: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .l-info h3 {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.1rem, 1.6vw, 1.5rem);
    letter-spacing: -0.01em;
    line-height: 1.1;
    color: var(--ink);
  }

  .l-link:hover .l-info h3 { color: var(--accent); }

  .l-meta {
    color: var(--muted);
    font-size: 0.6rem;
  }

  @media (max-width: 900px) {
    .latest-head { flex-direction: column; align-items: flex-start; margin-bottom: 2rem; }
    .latest-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 560px) {
    .latest-grid { grid-template-columns: 1fr; }
  }

  /* =================== CTA =================== */
  .cta {
    background: var(--paper-alt);
    color: var(--ink);
    padding: clamp(4rem, 8vw, 7rem) 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }

  .cta-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 4rem;
    align-items: end;
  }

  .cta h2 {
    font-size: clamp(2rem, 5.5vw, 5.2rem);
    color: var(--ink);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .cta-action p {
    color: var(--ink-2);
    margin-bottom: 1.5rem;
    max-width: 38ch;
  }

  /* =================== CONTACT =================== */
  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 4rem;
    align-items: start;
  }

  .contact-body { display: flex; flex-direction: column; gap: 2rem; }

  .contact-lede {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 3vw, 2.3rem);
    line-height: 1.3;
    letter-spacing: -0.02em;
    font-weight: 300;
    max-width: 30ch;
    color: var(--ink);
  }

  .email-big {
    display: inline-block;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(2rem, 6vw, 4.5rem);
    letter-spacing: -0.03em;
    border-bottom: 1px solid var(--accent);
    padding-bottom: 0.1em;
    line-height: 1;
    color: var(--accent);
    transition: color 0.3s ease, border-color 0.3s ease;
    font-variation-settings: 'opsz' 144, 'SOFT' 80, 'WONK' 1;
  }

  .email-big:hover { color: var(--accent-soft); border-bottom-color: var(--accent-soft); opacity: 1; }

  .contact-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 400px;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
  }

  .contact-meta p { font-size: 0.95rem; margin-top: 0.25rem; color: var(--ink-2); }
  .contact-meta a { border-bottom: 1px solid transparent; color: var(--ink); }
  .contact-meta a:hover { border-bottom-color: var(--accent); color: var(--accent); opacity: 1; }

  /* =================== RESPONSIVE =================== */
  @media (max-width: 900px) {
    .hero { height: min(94vh, 820px); min-height: 580px; }
    .hero-frame { padding: 1.25rem 1.1rem 1.75rem; }
    .hero-top { flex-direction: column; gap: 0.4rem; align-items: flex-start; }
    .hero-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
      padding-bottom: 0;
    }
    .hero-actions {
      align-items: flex-start;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }

    .about-grid { grid-template-columns: 1fr; gap: 2rem; }
    .about-meta { position: static; display: flex; gap: 1rem; align-items: center; }
    .about-meta .rule-short { flex: 0 0 48px; }
    .about-image { aspect-ratio: 4 / 5; max-width: 480px; }

    .services-head { grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem; }
    .services-list { grid-template-columns: 1fr; }
    .service { border-right: none; padding: 2rem 0; }

    .featured-head { flex-direction: column; align-items: flex-start; margin-bottom: 2.5rem; }
    .featured-grid { grid-template-columns: 1fr; }
    .f-card:nth-child(n) { grid-column: 1 / -1; margin-top: 0; }

    .desktop-only { display: none; }
    .mobile-only { display: inline-flex; margin-top: 2rem; }

    .cta-grid { grid-template-columns: 1fr; gap: 2rem; }
    .contact-grid { grid-template-columns: 1fr; gap: 2rem; }
    .contact-meta { grid-template-columns: 1fr 1fr; }
  }
</style>
