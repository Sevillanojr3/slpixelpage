<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { logoUrl, logos } from '$lib/logos.js';
  import '$lib/styles/global.css';

  const favicon = logoUrl(logos.isoBlue);
</script>

<svelte:head>
  <link rel="icon" type="image/png" href={favicon} />
  <link rel="apple-touch-icon" href={favicon} />
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
  }

  main {
    flex: 1;
    margin-top: 76px;
  }

  @media (max-width: 860px) {
    main {
      margin-top: 58px;
    }
  }
</style>
