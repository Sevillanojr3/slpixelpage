<script>
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '$lib/styles/global.css';
</script>

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
    margin-top: 80px;
  }
  
  @media (max-width: 768px) {
    main {
      margin-top: 70px;
    }
  }
</style>
