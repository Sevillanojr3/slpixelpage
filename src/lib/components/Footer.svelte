<script>
  import { brand } from '$lib/logos.js';
  const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="container">
    <div class="top">
      <div class="mark">
        <img class="mark-logo" src={brand.navbar} alt="SLPixel · Fotografía" />
        <span class="label">Est. 2022 · Ciudad de Panamá</span>
      </div>

      <div class="cta prose">
        <h3>¿Conversamos?</h3>
        <a href="mailto:info@slpixel.com" class="email">info@slpixel.com</a>
      </div>
    </div>

    <hr class="rule-light" />

    <div class="columns">
      <div class="col">
        <span class="label">Navegar</span>
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/#sobre-mi">Sobre mí</a></li>
          <li><a href="/#servicios">Servicios</a></li>
          <li><a href="/galeria">Portafolio</a></li>
          <li><a href="/#contacto">Contacto</a></li>
        </ul>
      </div>

      <div class="col">
        <span class="label">Servicios</span>
        <ul>
          <li>Bodas y celebraciones</li>
          <li>Producción visual</li>
          <li>Sesiones corporativas</li>
          <li>Cobertura deportiva</li>
        </ul>
      </div>

      <div class="col">
        <span class="label">Social</span>
        <ul>
          <li>
            <a href="https://www.instagram.com/slpixel/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          </li>
        </ul>
      </div>

      <div class="col col-wide">
        <span class="label">Colofón</span>
        <p class="small">
          Sitio diseñado con tipografía Fraunces y Instrument Sans. Fotografía &amp; dirección
          creativa por SLPixel. Las imágenes exhibidas son extractos; las versiones en alta
          resolución se entregan bajo solicitud.
        </p>
      </div>
    </div>

    <div class="bottom">
      <span class="numeral">© {year} · SLPixel Studio</span>
      <span class="numeral">Todos los derechos reservados</span>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: var(--paper-fixed-deep);
    color: var(--ink-fixed-light);
    padding: clamp(4rem, 7vw, 6rem) 0 2.25rem;
    margin-top: 0;
    border-top: 1px solid var(--line-fixed-dark);
  }

  .top {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 3rem;
    padding-bottom: 3rem;
  }

  .mark { display: flex; flex-direction: column; gap: 1.25rem; align-items: flex-start; }

  .mark-logo {
    height: clamp(72px, 9vw, 110px);
    width: auto;
    max-width: 360px;
    filter: drop-shadow(0 4px 24px rgba(201, 164, 100, 0.15));
  }

  .cta { text-align: right; }
  .cta h3 {
    color: var(--ink-fixed-light);
    font-size: clamp(1.4rem, 2.2vw, 2.1rem);
    font-weight: 300;
    margin-bottom: 0.65rem;
  }

  .email {
    font-family: var(--font-sans);
    font-size: 1.05rem;
    letter-spacing: 0.05em;
    color: var(--accent-fixed);
    border-bottom: 1px solid color-mix(in srgb, var(--accent-fixed) 50%, transparent);
    padding-bottom: 3px;
    transition: color 0.3s ease, border-color 0.3s ease;
  }

  .email:hover { color: var(--accent-fixed-soft); border-bottom-color: var(--accent-fixed-soft); opacity: 1; }

  .rule-light {
    height: 1px;
    border: 0;
    background: var(--line-fixed-dark);
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
    color: var(--accent-fixed);
    font-size: 0.66rem;
  }

  .col ul { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
  .col ul li { color: var(--ink-fixed-light-2); font-size: 0.92rem; }
  .col a { color: inherit; border-bottom: 1px solid transparent; padding-bottom: 1px; transition: color 0.3s ease, border-color 0.3s ease; }
  .col a:hover { color: var(--accent-fixed); border-bottom-color: var(--accent-fixed); opacity: 1; }

  .small {
    font-size: 0.88rem;
    line-height: 1.6;
    color: var(--ink-fixed-light-2);
    max-width: 46ch;
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    padding-top: 1.5rem;
    border-top: 1px solid var(--line-fixed-dark);
  }

  .bottom .numeral { color: var(--muted-fixed); }

  @media (max-width: 860px) {
    .top { grid-template-columns: 1fr; align-items: start; }
    .cta { text-align: left; }
    .columns { grid-template-columns: repeat(2, 1fr); gap: 2.5rem 1.5rem; }
    .col { grid-column: span 1; }
    .col-wide { grid-column: span 2; }
    .bottom { flex-direction: column; gap: 0.4rem; }
  }
</style>
