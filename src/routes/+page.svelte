<script>
  import { onMount } from 'svelte';
  import galleries from '$lib/data/galleries.json';
  import { thumbUrl, fullUrl } from '$lib/images.js';

  const cleanTitle = (t) => (t || '').replace(/\s+de SLPixel$/i, '').trim();
  const all = (galleries.galleries || [])
    .filter((g) => (g.photos || []).length > 0)
    .map((g) => ({ ...g, title: cleanTitle(g.title) }));

  const bySlug = (slug) => all.find((g) => g.slug === slug);

  // Hero carousel — hand-picked moments across galleries.
  // Lead with Cumpleaños Meris #50 (photo 051) per the user's pick.
  // Each entry is { slug, index }. Missing entries fall back to photos[0].
  const heroPicks = [
    { slug: 'cumpleanosmeris50',           index: 51 },
    { slug: 'babyshowermaldonadocastaneda', index: 4  },
    { slug: 'tridenttrustpanamaparty',     index: 12 },
    { slug: 'cdplazaamadorvsrealespana',   index: 8  },
    { slug: 'cumpleanospancho73',          index: 6  },
    { slug: 'panamvsrepblicadominicanau17', index: 5  },
  ];

  const heroSlides = heroPicks
    .map(({ slug, index }) => {
      const g = bySlug(slug);
      if (!g) return null;
      const photo = g.photos[index] || g.photos[0];
      return photo ? { photo, slug: g.slug, title: g.title } : null;
    })
    .filter(Boolean);

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

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
</script>

<svelte:head>
  <title>SL Pixel — Estudio de Fotografía Editorial</title>
  <meta name="description" content="SL Pixel — Estudio de fotografía y producción visual en Panamá. Eventos, deportes y sesiones corporativas." />
</svelte:head>

<!-- =============== HERO =============== -->
<section
  class="hero"
  class:mounted
  on:mouseenter={() => (heroPaused = true)}
  on:mouseleave={() => (heroPaused = false)}
  aria-label="Galería principal de SL Pixel"
>
  <div class="hero-image">
    {#each heroSlides as slide, i (slide.slug + i)}
      <img
        src={fullUrl(slide.photo, slide.slug)}
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
      <span class="label label-paper">SL Pixel Studio · Panamá</span>
    </div>

    <div class="hero-center">
      <h1 class="hero-title">
        <span class="ht-line"><em>Momentos</em></span>
        <span class="ht-line">que <span class="ht-alt">permanecen</span></span>
      </h1>
    </div>

    <div class="hero-bottom">
      <p class="hero-lede">
        Fotografía creativa y producción visual. Eventos, retratos, deportes, marcas.
        Una mirada editorial sobre lo irrepetible.
      </p>
      <div class="hero-actions">
        <a href="/galeria" class="btn btn-paper">Ver galería</a>
        <a href="#servicios" class="hero-sub">Explorar servicios →</a>
      </div>
    </div>
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

<!-- =============== ABOUT / INTRO =============== -->
<section class="section about">
  <div class="container about-grid">
    <div class="about-meta">
      <span class="label">§ 01 · Estudio</span>
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
          SL Pixel es un estudio independiente dedicado a la fotografía de
          eventos, producción audiovisual y dirección creativa con base en
          Ciudad de Panamá.
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
      <span class="label">§ 02 · Servicios</span>
      <h2>
        Un lenguaje para
        <span class="italic">cada encargo</span>.
      </h2>
    </div>

    <ol class="services-list">
      <li class="service">
        <span class="numeral num">01</span>
        <div>
          <h3>Fotografía de eventos</h3>
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
        <span class="label">§ 03 · Trabajos seleccionados</span>
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
      <span class="label label-paper">§ 04 · Invitación</span>
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
      <a href="mailto:info@slpixel.com" class="btn btn-paper">Escribir al estudio</a>
    </div>
  </div>
</section>

<!-- =============== CONTACT =============== -->
<section id="contacto" class="section contact">
  <div class="container contact-grid">
    <div>
      <span class="label">§ 05 · Contacto</span>
      <hr class="rule-short" />
    </div>
    <div class="contact-body">
      <p class="contact-lede">
        Estudio SL&nbsp;Pixel · Ciudad de Panamá. Atención por correo y redes
        sociales.
      </p>
      <a href="mailto:info@slpixel.com" class="email-big">info@slpixel.com</a>
      <div class="contact-meta">
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
    color: var(--paper);
    background: var(--ink);
  }

  .hero-image {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--ink);
  }

  .hero-image img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
    filter: saturate(1.05) contrast(1.02);
    /* sharper bicubic-ish resampling on upscales (browser-dependent) */
    image-rendering: -webkit-optimize-contrast;
    opacity: 0;
    transform: scale(1.04);
    transition: opacity 1.4s ease;
    will-change: opacity, transform;
  }

  .hero-image img.active {
    opacity: 1;
    /* Ken Burns: gentle drift while this slide is on screen.
       Limited zoom range to minimise visible upscale on big monitors. */
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
      linear-gradient(180deg, rgba(13,13,11,0.55) 0%, rgba(13,13,11,0.15) 38%, rgba(13,13,11,0.85) 100%),
      radial-gradient(80% 50% at 50% 30%, transparent 0%, rgba(13,13,11,0.35) 100%);
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
    background: color-mix(in srgb, var(--paper) 35%, transparent);
    border: 0;
    padding: 0;
    cursor: pointer;
    transition: background 0.4s ease, width 0.4s ease;
  }

  .hero-dot.on {
    background: var(--paper);
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
    padding: clamp(1.25rem, 3vw, 2.25rem) var(--page-gutter) clamp(1.75rem, 3vw, 2.5rem);
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

  .numeral-ws { font-family: var(--font-mono); letter-spacing: 0.2em; font-size: 0.68rem; }

  .hero-center {
    align-self: end;
    padding-bottom: 2vh;
  }

  .hero-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(3.4rem, 10.5vw, 10rem);
    line-height: 0.92;
    color: var(--paper);
    letter-spacing: -0.03em;
    font-variation-settings: 'opsz' 144, 'SOFT' 45, 'WONK' 1;
  }

  .ht-line { display: block; opacity: 0; filter: blur(12px); transform: translateY(18px); }
  .hero.mounted .ht-line:nth-child(1) { animation: blurIn 1s cubic-bezier(0.2,0.7,0.2,1) 0.25s forwards; }
  .hero.mounted .ht-line:nth-child(2) { animation: blurIn 1s cubic-bezier(0.2,0.7,0.2,1) 0.55s forwards; }

  .hero-title em {
    font-style: italic;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--paper);
  }
  .ht-alt {
    font-style: italic;
    font-weight: 300;
    color: color-mix(in srgb, var(--paper) 82%, transparent);
  }

  .hero-bottom {
    align-items: flex-end;
    opacity: 0;
    animation: fadeUp 1s ease 0.9s forwards;
  }

  .hero-lede {
    max-width: 38ch;
    font-size: clamp(0.95rem, 1.2vw, 1.1rem);
    line-height: 1.55;
    color: color-mix(in srgb, var(--paper) 88%, transparent);
  }

  .hero-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }

  .hero-sub {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--paper);
    border-bottom: 1px solid color-mix(in srgb, var(--paper) 40%, transparent);
    padding-bottom: 3px;
  }

  .hero-sub:hover { border-bottom-color: var(--paper); opacity: 1; }

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
    line-height: 1.0;
    letter-spacing: -0.025em;
    margin-bottom: 2rem;
  }

  .italic {
    font-style: italic;
    font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    color: var(--accent);
  }

  .about-copy { max-width: 48ch; margin-bottom: 2rem; }

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
  }

  .about-image img {
    width: 100%; height: 100%;
    object-fit: cover;
  }

  .caption {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: linear-gradient(180deg, transparent, rgba(13,13,11,0.72));
    color: var(--paper);
    font-family: var(--font-sans);
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .caption .numeral { color: color-mix(in srgb, var(--paper) 60%, transparent); }

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
  .service:hover { background: color-mix(in srgb, var(--paper-alt) 40%, white); }

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
  }

  .service p {
    font-size: 0.95rem;
    line-height: 1.6;
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
  }

  .f-meta {
    display: flex;
    gap: 1rem;
    margin-top: 0.3rem;
    align-items: baseline;
  }

  .f-meta .label { color: var(--accent); font-size: 0.62rem; }

  .desktop-only { display: inline-flex; }
  .mobile-only { display: none; }

  /* =================== CTA =================== */
  .cta {
    background: var(--ink);
    color: var(--paper);
    padding: clamp(4rem, 8vw, 7rem) 0;
  }

  .cta-grid {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 4rem;
    align-items: end;
  }

  .cta h2 {
    font-size: clamp(2rem, 5.5vw, 5.2rem);
    color: var(--paper);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .cta h2 .italic { color: color-mix(in srgb, var(--paper) 78%, transparent); }

  .cta-action p {
    color: color-mix(in srgb, var(--paper) 75%, transparent);
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
    line-height: 1.25;
    letter-spacing: -0.02em;
    font-weight: 300;
    max-width: 30ch;
  }

  .email-big {
    display: inline-block;
    font-family: var(--font-display);
    font-style: italic;
    font-weight: 300;
    font-size: clamp(2rem, 6vw, 4.5rem);
    letter-spacing: -0.03em;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 0.1em;
    line-height: 1;
    transition: color 0.3s ease;
    font-variation-settings: 'opsz' 144, 'SOFT' 80, 'WONK' 1;
  }

  .email-big:hover { color: var(--accent); border-bottom-color: var(--accent); opacity: 1; }

  .contact-meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    max-width: 400px;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
  }

  .contact-meta p { font-size: 0.95rem; margin-top: 0.25rem; }
  .contact-meta a { border-bottom: 1px solid transparent; }
  .contact-meta a:hover { border-bottom-color: var(--ink); opacity: 1; }

  /* =================== RESPONSIVE =================== */
  @media (max-width: 900px) {
    .hero { height: min(92vh, 820px); min-height: 560px; }
    .hero-frame { padding: 1.25rem 1.1rem 1.75rem; }
    .hero-top { flex-direction: column; gap: 0.4rem; }
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
