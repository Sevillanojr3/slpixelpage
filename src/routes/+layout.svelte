<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { brand } from '$lib/logos.js';
  import { dev } from '$app/environment';
  import { injectAnalytics } from '@vercel/analytics/sveltekit';
  import '$lib/styles/global.css';

  injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={brand.favicon} />
  <link rel="apple-touch-icon" href={brand.favicon} />
  <meta name="theme-color" content="#0b0a08" />
</svelte:head>

<div class="app">
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--paper);
  }

  main {
    flex: 1;
    margin-top: 148px;
  }

  @media (max-width: 860px) {
    main {
      margin-top: 100px;
    }
  }
</style>
