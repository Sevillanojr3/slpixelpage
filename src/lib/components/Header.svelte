<script>
  import { page } from '$app/stores';
  
  let menuOpen = false;
  
  function toggleMenu() {
    menuOpen = !menuOpen;
  }
</script>

<header class="header">
  <div class="container">
    <nav class="nav">
      <a href="/" class="logo">
        <img src="/Logos/slpixels_textblue.png" alt="SL Pixel" />
      </a>
      
      <button class="menu-toggle" on:click={toggleMenu} aria-label="Toggle menu">
        <span class:open={menuOpen}></span>
        <span class:open={menuOpen}></span>
        <span class:open={menuOpen}></span>
      </button>
      
      <ul class="nav-links" class:open={menuOpen}>
        <li><a href="/" class:active={$page.url.pathname === '/'}>Inicio</a></li>
        <li><a href="/galeria" class:active={$page.url.pathname === '/galeria'}>Galería</a></li>
        <li><a href="/#servicios">Servicios</a></li>
        <li><a href="/#contacto">Contacto</a></li>
      </ul>
    </nav>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 100;
    border-bottom: 1px solid var(--border);
  }
  
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 0;
  }
  
  .logo img {
    height: 40px;
    transition: transform 0.3s ease;
  }
  
  .logo:hover img {
    transform: scale(1.05);
  }
  
  .nav-links {
    display: flex;
    gap: 3rem;
    list-style: none;
  }
  
  .nav-links a {
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    position: relative;
  }
  
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--fg);
    transition: width 0.3s ease;
  }
  
  .nav-links a:hover::after,
  .nav-links a.active::after {
    width: 100%;
  }
  
  .menu-toggle {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
  }
  
  .menu-toggle span {
    width: 25px;
    height: 2px;
    background: var(--fg);
    transition: all 0.3s ease;
  }
  
  .menu-toggle span.open:nth-child(1) {
    transform: rotate(45deg) translate(7px, 7px);
  }
  
  .menu-toggle span.open:nth-child(2) {
    opacity: 0;
  }
  
  .menu-toggle span.open:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
  }
  
  @media (max-width: 768px) {
    .menu-toggle {
      display: flex;
    }
    
    .nav-links {
      position: fixed;
      top: 80px;
      left: 0;
      right: 0;
      background: var(--bg);
      flex-direction: column;
      gap: 0;
      padding: 2rem;
      border-bottom: 1px solid var(--border);
      transform: translateY(-100%);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }
    
    .nav-links.open {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    
    .nav-links li {
      padding: 1rem 0;
      border-bottom: 1px solid var(--border);
    }
    
    .nav-links li:last-child {
      border-bottom: none;
    }
  }
</style>

