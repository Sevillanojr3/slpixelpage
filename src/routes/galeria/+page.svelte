<script>
  import ModalSolicitar from '$lib/components/ModalSolicitar.svelte';
  
  let modalOpen = false;
  let selectedPaquete = '';
  
  const paquetes = [
    {
      id: 1,
      nombre: 'Bodas Premium',
      descripcion: 'Cobertura completa de tu día especial',
      imagenes: 250,
      preview: '/Logos/slpixels_isoblue.png'
    },
    {
      id: 2,
      nombre: 'Sesión Empresarial',
      descripcion: 'Fotografía corporativa y de equipo',
      imagenes: 100,
      preview: '/Logos/slpixels_isoblue.png'
    },
    {
      id: 3,
      nombre: 'Eventos Deportivos',
      descripcion: 'Acción y emoción en cada toma',
      imagenes: 150,
      preview: '/Logos/slpixels_isoblue.png'
    },
    {
      id: 4,
      nombre: 'Graduaciones',
      descripcion: 'Captura tus logros académicos',
      imagenes: 80,
      preview: '/Logos/slpixels_isoblue.png'
    },
    {
      id: 5,
      nombre: 'Quinceañeras',
      descripcion: 'Tu fiesta de XV años inolvidable',
      imagenes: 200,
      preview: '/Logos/slpixels_isoblue.png'
    },
    {
      id: 6,
      nombre: 'Sesión Personal',
      descripcion: 'Retratos únicos y creativos',
      imagenes: 50,
      preview: '/Logos/slpixels_isoblue.png'
    }
  ];
  
  function abrirModal(nombrePaquete) {
    selectedPaquete = nombrePaquete;
    modalOpen = true;
  }
</script>

<svelte:head>
  <title>Galería - SL Pixel</title>
  <meta name="description" content="Explora nuestra galería de paquetes fotográficos disponibles" />
</svelte:head>

<div class="galeria-page">
  <!-- Header Section -->
  <section class="galeria-header">
    <div class="container">
      <h1>Galería de Paquetes</h1>
      <p class="subtitle">Selecciona un paquete para solicitar tus fotos</p>
    </div>
  </section>
  
  <!-- Paquetes Grid -->
  <section class="section paquetes-section">
    <div class="container">
      <div class="paquetes-grid">
        {#each paquetes as paquete}
          <div class="paquete-card">
            <div class="paquete-image">
              <img src={paquete.preview} alt={paquete.nombre} />
              <div class="paquete-overlay">
                <div class="overlay-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                  </svg>
                  <p>Fotos bloqueadas</p>
                </div>
              </div>
            </div>
            
            <div class="paquete-info">
              <h3>{paquete.nombre}</h3>
              <p class="descripcion">{paquete.descripcion}</p>
              <p class="cantidad">{paquete.imagenes} imágenes</p>
              
              <button 
                class="btn-solicitar" 
                on:click={() => abrirModal(paquete.nombre)}
              >
                Solicitar Fotos
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Info Section -->
  <section class="section info-section">
    <div class="container">
      <div class="info-content">
        <h2>¿Cómo funciona?</h2>
        <div class="steps">
          <div class="step">
            <span class="step-number">1</span>
            <h4>Selecciona tu paquete</h4>
            <p>Elige el evento o sesión que deseas ver</p>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <h4>Solicita acceso</h4>
            <p>Ingresa tu correo electrónico</p>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <h4>Recibe tus fotos</h4>
            <p>Te contactaremos con el enlace de descarga</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<ModalSolicitar bind:isOpen={modalOpen} paqueteNombre={selectedPaquete} />

<style>
  .galeria-page {
    min-height: 100vh;
  }
  
  /* Header */
  .galeria-header {
    padding: 6rem 0 4rem;
    text-align: center;
    background: var(--light-gray);
  }
  
  .galeria-header h1 {
    margin-bottom: 1rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: var(--accent);
  }
  
  /* Paquetes Grid */
  .paquetes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 3rem;
  }
  
  .paquete-card {
    background: var(--bg);
    border: 1px solid var(--border);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  
  .paquete-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .paquete-image {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: var(--light-gray);
  }
  
  .paquete-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(15px) brightness(0.6);
    transform: scale(1.1);
    transition: all 0.4s ease;
  }
  
  .paquete-card:hover .paquete-image img {
    filter: blur(20px) brightness(0.4);
    transform: scale(1.15);
  }
  
  .paquete-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .overlay-content {
    text-align: center;
    color: var(--bg);
  }
  
  .overlay-content svg {
    margin-bottom: 1rem;
    opacity: 0.9;
  }
  
  .overlay-content p {
    color: var(--bg);
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  .paquete-info {
    padding: 2rem;
  }
  
  .paquete-info h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 400;
  }
  
  .descripcion {
    margin-bottom: 0.5rem;
    color: var(--accent);
  }
  
  .cantidad {
    font-size: 0.9rem;
    color: var(--accent);
    margin-bottom: 1.5rem;
    font-weight: 400;
  }
  
  .btn-solicitar {
    width: 100%;
    padding: 1rem;
    font-size: 0.85rem;
  }
  
  /* Info Section */
  .info-section {
    background: var(--light-gray);
  }
  
  .info-content {
    max-width: 1000px;
    margin: 0 auto;
    text-align: center;
  }
  
  .info-content h2 {
    margin-bottom: 4rem;
  }
  
  .steps {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 3rem;
  }
  
  .step {
    padding: 2rem;
  }
  
  .step-number {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 2px solid var(--fg);
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 300;
    margin-bottom: 1.5rem;
  }
  
  .step h4 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    font-weight: 400;
  }
  
  .step p {
    color: var(--accent);
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .galeria-header {
      padding: 4rem 0 3rem;
    }
    
    .paquetes-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .steps {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
</style>

