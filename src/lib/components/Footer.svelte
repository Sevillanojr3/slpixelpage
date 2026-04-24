<script>
  import { logoUrl, logos } from '$lib/logos.js';
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container">
    <div class="top">
      <div class="mark">
        <img class="mark-logo" src={logoUrl(logos.fullWhite)} alt="SL Pixel" />
        <span class="label label-paper">Est. 2022 · Ciudad de Panamá</span>
      </div>

      <div class="cta prose">
        <h3>¿Conversamos?</h3>
        <a href="mailto:slpixelstudio@gmail.com" class="email">slpixelstudio@gmail.com</a>
      </div>
    </div>

    <hr class="rule-light" />

    <div class="columns">
      <div class="col">
        <span class="label">Navegar</span>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/galeria">Galería</a></li>
          <li><a href="/#servicios">Servicios</a></li>
          <li><a href="/#contacto">Contacto</a></li>
        </ul>
      </div>

      <div class="col">
        <span class="label">Servicios</span>
        <ul>
          <li>Fotografía de eventos</li>
          <li>Producción visual</li>
          <li>Sesiones corporativas</li>
          <li>Cobertura deportiva</li>
        </ul>
      </div>

      <div class="col">
        <span class="label">Social</span>
        <ul>
          <li>
            <a href="https://instagram.com/slpixel" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          </li>
          <li>
            <a href="https://facebook.com/slpixel" target="_blank" rel="noopener noreferrer">Facebook ↗</a>
          </li>
        </ul>
      </div>

      <div class="col col-wide">
        <span class="label">Colofón</span>
        <p class="small">
          Sitio diseñado con tipografía Fraunces y Instrument Sans. Fotografía &amp; dirección
          creativa por SL&nbsp;Pixel. Las imágenes exhibidas son extractos; las versiones en alta
          resolución se entregan bajo solicitud.
        </p>
        <img class="signature" src={logoUrl(logos.signature)} alt="Javier Sevillano · Photographer" />
      </div>
    </div>

    <div class="bottom">
      <span class="numeral">© {year} · SL Pixel Studio</span>
      <span class="numeral">Todos los derechos reservados</span>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--ink);
    color: var(--paper);
    padding: clamp(4rem, 7vw, 6rem) 0 2.25rem;
    margin-top: clamp(4rem, 8vw, 7rem);
  }

  .top {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 3rem;
    padding-bottom: 3rem;
  }

  .mark { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }

  .mark-logo {
    height: clamp(56px, 8vw, 96px);
    width: auto;
    max-width: 320px;
    filter: drop-shadow(0 2px 14px rgba(255,255,255,0.04));
  }

  .cta { text-align: right; }
  .cta h3 {
    color: var(--paper);
    font-size: clamp(1.4rem, 2.2vw, 2.1rem);
    font-weight: 300;
    margin-bottom: 0.65rem;
  }

  .email {
    font-family: var(--font-sans);
    font-size: 1.05rem;
    letter-spacing: 0.05em;
    border-bottom: 1px solid color-mix(in srgb, var(--paper) 40%, transparent);
    padding-bottom: 3px;
  }

  .email:hover { border-bottom-color: var(--paper); opacity: 1; }

  .rule-light {
    height: 1px;
    border: 0;
    background: color-mix(in srgb, var(--paper) 22%, transparent);
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 2rem;
    padding: 3.5rem 0;
  }

  .col { grid-column: span 2; display: flex; flex-direction: column; gap: 1rem; }
  .col-wide { grid-column: span 6; }

  .col .label {
    color: color-mix(in srgb, var(--paper) 55%, transparent);
    font-size: 0.66rem;
  }

  .col ul { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
  .col ul li { color: color-mix(in srgb, var(--paper) 85%, transparent); font-size: 0.92rem; }
  .col a { color: inherit; border-bottom: 1px solid transparent; padding-bottom: 1px; }
  .col a:hover { border-bottom-color: currentColor; opacity: 1; }

  .small { font-size: 0.88rem; line-height: 1.55; color: color-mix(in srgb, var(--paper) 70%, transparent); max-width: 46ch; }

  .signature {
    display: block;
    margin-top: 2.25rem;
    height: auto;
    width: clamp(220px, 28vw, 320px);
    max-width: 100%;
    opacity: 0.85;
    /* the PNG ships with an opaque warm-gray card around the mark.
       screen-blend drops the card into the dark footer so only the
       light signature reads, at full aspect ratio. */
    mix-blend-mode: screen;
    filter: grayscale(1) contrast(1.1) brightness(1.15);
    transition: opacity 0.4s ease;
  }
  .signature:hover { opacity: 1; }

  .bottom {
    display: flex;
    justify-content: space-between;
    padding-top: 1.5rem;
    border-top: 1px solid color-mix(in srgb, var(--paper) 16%, transparent);
  }

  .bottom .numeral { color: color-mix(in srgb, var(--paper) 55%, transparent); }

  @media (max-width: 860px) {
    .top { grid-template-columns: 1fr; align-items: start; }
    .cta { text-align: left; }
    .columns { grid-template-columns: repeat(2, 1fr); gap: 2.5rem 1.5rem; }
    .col { grid-column: span 1; }
    .col-wide { grid-column: span 2; }
    .signature { width: min(260px, 80%); margin-top: 2rem; }
    .bottom { flex-direction: column; gap: 0.4rem; }
  }
</style>
