<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;
  $: ({ categories, uncategorized } = data);
</script>

<header class="head">
  <span class="eyebrow">Admin · Categorías</span>
  <h1>Categorías</h1>
  <p class="sub">{categories.length} categorías. {uncategorized} galería{uncategorized === 1 ? '' : 's'} sin categoría.</p>
</header>

<section class="create">
  <h2>Nueva categoría</h2>
  <form method="POST" action="?/create" use:enhance>
    <div class="row">
      <label>
        <span>Nombre</span>
        <input name="label" required placeholder="Ej. Bodas" />
      </label>
      <label>
        <span>ID (slug)</span>
        <input name="id" placeholder="(auto)" />
      </label>
    </div>
    {#if form?.error}<p class="error">{form.error}</p>{/if}
    <button type="submit" class="btn">Crear</button>
  </form>
</section>

<section class="list">
  <h2>Existentes</h2>
  {#if categories.length === 0}
    <p class="empty">Aún no hay categorías.</p>
  {:else}
    <table>
      <thead>
        <tr><th>Nombre</th><th>ID</th><th>Galerías</th><th></th></tr>
      </thead>
      <tbody>
        {#each categories as c (c.id)}
          <tr>
            <td>
              <form method="POST" action="?/rename" use:enhance>
                <input type="hidden" name="id" value={c.id} />
                <input name="label" value={c.label} class="inline-edit" />
                <button type="submit" class="link-btn">Guardar</button>
              </form>
            </td>
            <td><code>{c.id}</code></td>
            <td class="num">{c.count}</td>
            <td>
              <form method="POST" action="?/delete" use:enhance on:submit={(e) => { if (!confirm(`¿Eliminar la categoría "${c.label}"? Las galerías asociadas quedarán sin categoría.`)) e.preventDefault(); }}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" class="link-btn danger">Eliminar</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  .head { margin-bottom: 2rem; }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin-bottom: 0.6rem;
  }
  h1 { font-size: 1.9rem; font-weight: 400; margin: 0 0 0.4rem; }
  .sub { color: #555; font-size: 0.9rem; margin: 0; }

  section { background: #fff; border: 1px solid #d6cfc3; padding: 1.75rem; margin-bottom: 1.5rem; }
  h2 { font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase; color: #6a665e; font-weight: 500; margin: 0 0 1rem; }

  .row { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.3rem; }
  label span { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #7a756c; }
  input { padding: 0.65rem 0.8rem; border: 1px solid #d6cfc3; background: #f8f6f0; font-size: 0.95rem; }
  input:focus { outline: none; border-color: #0d0d0b; background: #fff; }

  .btn {
    background: #0d0d0b; color: #f5f2ec; border: none; padding: 0.7rem 1.2rem;
    cursor: pointer; font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }

  .error { background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d; padding: 0.65rem; font-size: 0.88rem; margin-bottom: 1rem; }
  .empty { color: #7a756c; font-size: 0.9rem; }

  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.7rem 0; text-align: left; border-bottom: 1px solid #ecE7DE; vertical-align: middle; }
  th { font-size: 0.7rem; letter-spacing: 0.16em; text-transform: uppercase; color: #7a756c; font-weight: 500; }
  td:last-child, th:last-child { text-align: right; }
  code { font-family: Menlo, Monaco, monospace; background: #f1ecdf; padding: 0.1rem 0.4rem; font-size: 0.85rem; }
  .num { font-family: Menlo, Monaco, monospace; }

  .inline-edit { padding: 0.45rem 0.6rem; width: auto; min-width: 200px; }
  .link-btn { background: none; border: none; color: #0d0d0b; cursor: pointer; padding: 0; font-size: 0.85rem; margin-left: 0.6rem; }
  .link-btn.danger { color: #b91c1c; margin-left: 0; }
</style>
