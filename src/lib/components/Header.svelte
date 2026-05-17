<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { brand } from '$lib/logos.js';
  import ThemeToggle from './ThemeToggle.svelte';

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
      <a href="/" class="brand" aria-label="SLPixel, inicio">
        <img class="brand-mark" src={brand.navbar} alt="SLPixel · Fotografía" />
      </a>

      <ul class="nav-links" class:open={menuOpen}>
        <li class="nav-meta"><span class="label">Estudio · Panamá</span></li>
        <li><a href="/" class:active={$page.url.pathname === '/'} on:click={() => (menuOpen = false)}>Inicio</a></li>
        <li><a href="/#sobre-mi" on:click={() => (menuOpen = false)}>Sobre mí</a></li>
        <li><a href="/#servicios" on:click={() => (menuOpen = false)}>Servicios</a></li>
        <li><a href="/galeria" class:active={$page.url.pathname.startsWith('/galeria')} on:click={() => (menuOpen = false)}>Portafolio</a></li>
        <li><a href="/#contacto" on:click={() => (menuOpen = false)}>Contacto</a></li>
        <li class="nav-toggle-mobile"><ThemeToggle /></li>
      </ul>

      <div class="nav-extra"><ThemeToggle compact /></div>

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
    background: color-mix(in srgb, var(--paper) 72%, transparent);
    backdrop-filter: blur(18px) saturate(1.1);
    -webkit-backdrop-filter: blur(18px) saturate(1.1);
    border-bottom: 1px solid transparent;
    transition: border-color 0.4s ease, background 0.4s ease, padding 0.4s ease;
  }

  .header.scrolled {
    background: color-mix(in srgb, var(--paper) 92%, transparent);
    border-bottom-color: var(--line);
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 0;
    gap: 2rem;
  }

  /* ========== brand lockup ========== */
  .brand {
    display: inline-flex;
    align-items: center;
    line-height: 1;
  }

  .brand-mark {
    height: 124px;
    width: auto;
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.4s ease;
    filter: drop-shadow(0 2px 18px rgba(201, 164, 100, 0.12));
  }

  .brand:hover .brand-mark {
    transform: scale(1.02);
    filter: drop-shadow(0 4px 24px rgba(201, 164, 100, 0.25));
  }
  .brand:hover { opacity: 1; }

  /* ========== nav ========== */
  .nav-links {
    display: flex;
    align-items: center;
    gap: 2.5rem;
    list-style: none;
  }

  .nav-meta { display: none; }
  .nav-toggle-mobile { display: none; }

  .nav-extra {
    display: inline-flex;
    align-items: center;
  }

  .nav-links a {
    font-family: var(--font-sans);
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink);
    position: relative;
    padding: 0.45rem 0;
    transition: color 0.3s ease;
  }

  .nav-links a:hover { color: var(--accent); opacity: 1; }

  .nav-links a::after {
    content: '';
    position: absolute;
    left: 0; bottom: -3px;
    width: 0; height: 1px;
    background: var(--accent);
    transition: width 0.35s cubic-bezier(0.76, 0, 0.24, 1);
  }

  .nav-links a:hover::after,
  .nav-links a.active::after { width: 100%; }

  .nav-links a.active { color: var(--accent); }

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
    background: var(--accent);
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

  @media (max-width: 960px) {
    .nav-links { gap: 1.6rem; }
    .nav-links a { font-size: 0.7rem; letter-spacing: 0.24em; }
  }

  @media (max-width: 860px) {
    .header {
      background: var(--paper);
      border-bottom: 1px solid var(--line);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }
    .header.scrolled { border-bottom-color: var(--line-strong); }

    .nav { padding: 0.7rem 0; gap: 1rem; }

    .menu-toggle {
      display: flex;
      position: relative;
      z-index: 2;
    }

    .nav-extra { display: none; }
    .nav-toggle-mobile { display: block; margin-top: 1.5rem; }

    .brand-mark { height: 84px; }

    .nav-links {
      position: fixed;
      inset: 0;
      top: 60px;
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
      box-shadow: -20px 0 40px -20px rgba(0, 0, 0, 0.6);
    }

    .nav-links.open { transform: translateX(0); }

    .nav-meta { display: block; margin-bottom: 1.25rem; }
    .nav-links a { font-size: 1.05rem; letter-spacing: 0.2em; }
  }

  @media (max-width: 420px) {
    .brand-mark { height: 70px; }
  }
</style>
