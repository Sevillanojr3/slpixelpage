<script>
  import { page } from '$app/stores';
  export let data;
  $: admin = data.admin;
</script>

<svelte:head>
  <title>SL Pixel · Admin</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell">
  <header class="admin-bar">
    <div class="brand">
      <a href="/admin/galerias">SL Pixel · Admin</a>
    </div>
    {#if admin}
      <nav class="admin-nav">
        <a href="/admin/galerias" class:active={$page.url.pathname.startsWith('/admin/galerias')}>Galerías</a>
        <a href="/admin/videos" class:active={$page.url.pathname.startsWith('/admin/videos')}>Videos</a>
        <a href="/admin/categorias" class:active={$page.url.pathname.startsWith('/admin/categorias')}>Categorías</a>
        <a href="/admin/password" class:active={$page.url.pathname.startsWith('/admin/password')}>Contraseña</a>
      </nav>
      <div class="admin-user">
        <span>{admin.email}</span>
        <form method="POST" action="/admin/logout">
          <button type="submit" class="btn-ghost">Salir</button>
        </form>
      </div>
    {/if}
  </header>

  <main class="admin-main">
    <slot />
  </main>
</div>

<style>
  :global(.admin-shell *) { box-sizing: border-box; }

  .admin-shell {
    min-height: 100vh;
    background: #f8f6f0;
    color: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  }

  .admin-bar {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 1.75rem;
    background: #1a1a1a;
    color: #f8f6f0;
    border-bottom: 1px solid #333;
  }

  .brand a {
    color: inherit;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .admin-nav {
    display: flex;
    gap: 1.5rem;
    margin-left: 2rem;
    flex: 1;
  }
  .admin-nav a {
    color: #aaa;
    text-decoration: none;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.4rem 0;
    border-bottom: 1px solid transparent;
  }
  .admin-nav a:hover { color: #fff; }
  .admin-nav a.active { color: #fff; border-bottom-color: #fff; }

  .admin-user {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.82rem;
    color: #aaa;
  }

  .btn-ghost {
    background: transparent;
    color: #f8f6f0;
    border: 1px solid #555;
    padding: 0.4rem 0.9rem;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .btn-ghost:hover { background: #fff; color: #1a1a1a; }

  .admin-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.75rem 5rem;
  }
</style>
