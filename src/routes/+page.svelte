<script>
  import { onMount } from 'svelte';
  
  let loaded = false;
  
  onMount(() => {
    loaded = true;
  });
</script>

<svelte:head>
  <title>SL Pixel - Fotografía Creativa y Producción Visual</title>
  <meta name="description" content="Estudio de fotografía creativa y producción visual profesional" />
</svelte:head>

<!-- Hero Section -->
<section class="hero" class:loaded>
  <div class="hero-background">
    <div class="hero-overlay"></div>
  </div>
  <div class="hero-content">
    <div class="container">
      <h1 class="hero-title">SL Pixel</h1>
      <p class="hero-subtitle">Fotografía Creativa y Producción Visual</p>
      <a href="/galeria" class="btn">Ver Galería</a>
    </div>
  </div>
</section>

<!-- About Section -->
<section class="section about">
  <div class="container">
    <div class="about-content">
      <div class="about-text">
        <h2>Capturamos momentos únicos</h2>
        <p>
          En SL Pixel transformamos instantes en recuerdos eternos. 
          Cada imagen cuenta una historia, cada encuadre es una obra de arte.
        </p>
        <p>
          Nuestra pasión por la fotografía y la producción visual nos impulsa 
          a crear contenido excepcional que supera las expectativas.
        </p>
      </div>
      <div class="about-image">
        <div class="image-placeholder">
          <img src="/Logos/slpixels_isoblue.png" alt="SL Pixel Studio" />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section id="servicios" class="section services">
  <div class="container">
    <h2 class="section-title">Nuestros Servicios</h2>
    
    <div class="services-grid">
      <div class="service-card">
        <div class="service-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1" fill="none"/>
          </svg>
        </div>
        <h3>Fotografía de Eventos</h3>
        <p>Bodas, cumpleaños, eventos corporativos y más. Capturamos cada momento especial.</p>
      </div>
      
      <div class="service-card">
        <div class="service-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1" fill="none"/>
            <path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1"/>
          </svg>
        </div>
        <h3>Producción Visual</h3>
        <p>Videos promocionales, contenido para redes sociales y producción audiovisual completa.</p>
      </div>
      
      <div class="service-card">
        <div class="service-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1" fill="none"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1"/>
          </svg>
        </div>
        <h3>Sesiones Personalizadas</h3>
        <p>Retratos, fotografía de producto, editorial y sesiones creativas adaptadas a ti.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="section cta">
  <div class="container">
    <div class="cta-content">
      <h2>¿Listo para crear algo increíble?</h2>
      <p>Explora nuestra galería y descubre nuestro trabajo</p>
      <a href="/galeria" class="btn secondary">Explorar Galería</a>
    </div>
  </div>
</section>

<!-- Contact Section -->
<section id="contacto" class="section contact">
  <div class="container">
    <h2 class="section-title">Contáctanos</h2>
    <div class="contact-info">
      <p>¿Tienes un proyecto en mente? Nos encantaría conocer tu visión.</p>
      <a href="mailto:slpixelstudio@gmail.com" class="contact-email">slpixelstudio@gmail.com</a>
    </div>
  </div>
</section>

<style>
  /* Hero Section */
  .hero {
    position: relative;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .hero-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  }
  
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%);
  }
  
  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    color: var(--bg);
  }
  
  .hero-title {
    font-size: clamp(3rem, 8vw, 6rem);
    font-weight: 200;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 1s ease forwards 0.3s;
  }
  
  .hero-subtitle {
    font-size: clamp(1rem, 2vw, 1.5rem);
    font-weight: 300;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 3rem;
    color: rgba(255, 255, 255, 0.9);
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 1s ease forwards 0.6s;
  }
  
  .hero .btn {
    background: transparent;
    color: var(--bg);
    border: 2px solid var(--bg);
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 1s ease forwards 0.9s;
  }
  
  .hero .btn:hover {
    background: var(--bg);
    color: var(--fg);
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* About Section */
  .about {
    background: var(--light-gray);
  }
  
  .about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6rem;
    align-items: center;
  }
  
  .about-text h2 {
    margin-bottom: 2rem;
  }
  
  .about-text p {
    margin-bottom: 1.5rem;
    line-height: 1.8;
  }
  
  .about-image {
    position: relative;
  }
  
  .image-placeholder {
    aspect-ratio: 4/3;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
  }
  
  .image-placeholder img {
    max-width: 60%;
    opacity: 0.8;
  }
  
  /* Services Section */
  .section-title {
    text-align: center;
    margin-bottom: 4rem;
  }
  
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 3rem;
  }
  
  .service-card {
    text-align: center;
    padding: 3rem 2rem;
    transition: transform 0.3s ease;
  }
  
  .service-card:hover {
    transform: translateY(-10px);
  }
  
  .service-icon {
    margin-bottom: 2rem;
    color: var(--fg);
  }
  
  .service-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 400;
  }
  
  .service-card p {
    line-height: 1.7;
  }
  
  /* CTA Section */
  .cta {
    background: var(--fg);
    color: var(--bg);
  }
  
  .cta-content {
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .cta h2 {
    margin-bottom: 1rem;
    color: var(--bg);
  }
  
  .cta p {
    margin-bottom: 2rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
  }
  
  .cta .btn {
    background: transparent;
    color: var(--bg);
    border: 2px solid var(--bg);
  }
  
  .cta .btn:hover {
    background: var(--bg);
    color: var(--fg);
  }
  
  /* Contact Section */
  .contact-info {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .contact-info p {
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }
  
  .contact-email {
    display: inline-block;
    font-size: 1.5rem;
    font-weight: 300;
    padding: 1rem 2rem;
    border: 1px solid var(--border);
    transition: all 0.3s ease;
  }
  
  .contact-email:hover {
    border-color: var(--fg);
    transform: translateY(-2px);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .hero {
      height: 80vh;
    }
    
    .about-content {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    
    .services-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .service-card {
      padding: 2rem 1rem;
    }
  }
</style>
