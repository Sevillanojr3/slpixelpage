<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { logoUrl, logos } from '$lib/logos.js';

  let menuOpen = false;
  let scrolled = false;

  function toggleMenu() { menuOpen = !menuOpen; }

  onMount(() => {
    const onScroll = () => (scrolled = window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
</script>

<header class="header" class:scrolled>
  <div class="container">
    <nav class="nav">
      <a href="/" class="brand" aria-label="SL Pixel, inicio">
        <img class="brand-iso" src={logoUrl(logos.isoBlue)} alt="" />
        <img class="brand-word" src={logoUrl(logos.textBlue)} alt="SL Pixel" />
      </a>

      <ul class="nav-links" class:open={menuOpen}>
        <li class="nav-meta"><span class="label">Estudio · Panamá</span></li>
        <li><a href="/" class:active={$page.url.pathname === '/'} on:click={() => (menuOpen = false)}>Inicio</a></li>
        <li><a href="/galeria" class:active={$page.url.pathname.startsWith('/galeria')} on:click={() => (menuOpen = false)}>Galería</a></li>
        <li><a href="/#servicios" on:click={() => (menuOpen = false)}>Servicios</a></li>
        <li><a href="/#contacto" on:click={() => (menuOpen = false)}>Contacto</a></li>
      </ul>

      <button class="menu-toggle" on:click={toggleMenu} aria-label="Abrir menú" aria-expanded={menuOpen}>
        <span class:open={menuOpen}></span>
        <span class:open={menuOpen}></span>
      </button>
    </nav>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    background: color-mix(in srgb, var(--paper) 78%, transparent);
    backdrop-filter: blur(14px) saturate(1.1);
    -webkit-backdrop-filter: blur(14px) saturate(1.1);
    border-bottom: 1px solid transparent;
    transition: border-color 0.35s ease, background 0.35s ease;
  }

  .header.scrolled {
    border-bottom-color: var(--line);
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 0;
    gap: 2rem;
  }

  /* ========== brand lockup ========== */
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    line-height: 1;
  }

  .brand-iso {
    height: 36px;
    width: auto;
    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .brand-word {
    height: 22px;
    width: auto;
    padding-left: 0.7rem;
    border-left: 1px solid var(--line-strong);
  }

  .brand:hover .brand-iso { transform: rotate(-8deg); }
  .brand:hover { opacity: 1; }

  /* ========== nav ========== */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2.25rem;
    list-style: none;
  }

  .nav-meta { display: none; }

  .nav-links a {
    font-family: var(--font-sans);
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ink);
    position: relative;
    padding: 0.4rem 0;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    left: 0; bottom: -4px;
    width: 0; height: 1px;
    background: var(--ink);
    transition: width 0.3s cubic-bezier(0.76, 0, 0.24, 1);
  }

  .nav-links a:hover::after,
  .nav-links a.active::after { width: 100%; }
  .nav-links a:hover { opacity: 1; }

  /* ========== mobile toggle ========== */
  .menu-toggle {
    display: none;
    width: 32px; height: 32px;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .menu-toggle span {
    width: 22px;
    height: 1px;
    background: var(--ink);
    transition: transform 0.35s ease, width 0.35s ease, opacity 0.2s ease;
  }

  .menu-toggle span:nth-child(2) { width: 14px; }

  .menu-toggle span.open:nth-child(1) {
    width: 22px;
    transform: translateY(3.5px) rotate(45deg);
  }
  .menu-toggle span.open:nth-child(2) {
    width: 22px;
    transform: translateY(-3.5px) rotate(-45deg);
  }

  @media (max-width: 860px) {
    /* On mobile the hero sits behind a solid header (no peek-through).
       IMPORTANT: clear backdrop-filter — otherwise it creates a containing
       block that traps the fixed .nav-links panel inside the header. */
    .header {
      background: var(--paper);
      border-bottom: 1px solid var(--line);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .header.scrolled { border-bottom-color: var(--line-strong); }

    .nav { padding: 0.85rem 0; gap: 1rem; }

    .menu-toggle {
      display: flex;
      position: relative;
      z-index: 2;
    }

    /* swap: on mobile we show the wordmark (not the icon alone) for recognisability */
    .brand-iso { height: 30px; }
    .brand-word {
      display: block;
      height: 18px;
      padding-left: 0.55rem;
      border-left: 1px solid var(--line-strong);
    }

    .nav-links {
      position: fixed;
      inset: 0;
      top: 58px;
      z-index: 90;
      background: var(--paper);
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 3rem var(--page-gutter);
      gap: 1.75rem;
      transform: translateX(100%);
      transition: transform 0.5s cubic-bezier(0.76, 0, 0.24, 1);
      border-top: 1px solid var(--line);
      box-shadow: -20px 0 40px -20px rgba(13, 13, 11, 0.18);
    }

    .nav-links.open { transform: translateX(0); }

    .nav-meta { display: block; margin-bottom: 1.25rem; }
    .nav-links a { font-size: 1.15rem; letter-spacing: 0.18em; }
  }

  /* small phones — show only the icon to save space */
  @media (max-width: 420px) {
    .brand-word { display: none; }
    .brand-iso { height: 28px; }
  }
</style>
