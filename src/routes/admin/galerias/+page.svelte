<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  let creating = false;
  let createAccess = 'public';
  $: ({ galleries, categories } = data);

  function badge(cat) {
    if (!cat) return 'Sin categoría';
    return categories.find((c) => c.id === cat)?.label || cat;
  }
</script>

<header class="head">
  <div>
    <span class="eyebrow">Admin · Galerías</span>
    <h1>Galerías</h1>
    <p class="sub">{galleries.length} galerías. Cambiá categoría con el dropdown, o creá una nueva.</p>
  </div>
  <button class="btn" on:click={() => (creating = !creating)}>
    {creating ? 'Cancelar' : 'Nueva galería'}
  </button>
</header>

{#if creating}
  <section class="create">
    <form method="POST" action="?/create" use:enhance>
      <div class="row">
        <label>
          <span>Título</span>
          <input name="title" required placeholder="Ej. Cumpleaños Carlos 50" />
        </label>
        <label>
          <span>Slug</span>
          <input name="slug" placeholder="(auto)" />
        </label>
      </div>
      <div class="row">
        <label>
          <span>Categoría</span>
          <select name="category">
            <option value="">— Sin categoría —</option>
            {#each categories as c (c.id)}
              <option value={c.id}>{c.label}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>Fecha</span>
          <input name="date" type="date" />
        </label>
      </div>
      <div class="row">
        <label>
          <span>Acceso</span>
          <select name="access" bind:value={createAccess}>
            <option value="public">Libre · pública</option>
            <option value="protected">Con contraseña</option>
          </select>
        </label>
        <label>
          <span>Contraseña {createAccess === 'protected' ? '(requerida)' : '(no se usa)'}</span>
          <input name="password" type="text" placeholder="Mínimo 4 caracteres" disabled={createAccess !== 'protected'} />
        </label>
      </div>
      {#if form?.error}<p class="error">{form.error}</p>{/if}
      <button type="submit" class="btn">Crear galería</button>
    </form>
  </section>
{/if}

<table class="grid">
  <thead>
    <tr>
      <th>Galería</th>
      <th>Categoría</th>
      <th>Fotos</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each galleries as g (g.slug)}
      <tr>
        <td>
          <a href={`/admin/galerias/${g.slug}`} class="title">{g.title}</a>
          {#if g.protected}
            <span class="lock-pill" title="Descargas con contraseña">🔒 Descargas</span>
          {/if}
          {#if g.hidden}
            <span class="hidden-pill" title="No aparece públicamente">👁️‍🗨️ Oculta</span>
          {/if}
          <div class="meta">/{g.slug}{g.date ? ` · ${g.date}` : ''}</div>
        </td>
        <td>
          <form method="POST" action="?/setCategory" use:enhance>
            <input type="hidden" name="slug" value={g.slug} />
            <select name="category" on:change={(e) => e.target.form.requestSubmit()}>
              <option value="" selected={!g.category}>— sin categoría —</option>
              {#each categories as c (c.id)}
                <option value={c.id} selected={g.category === c.id}>{c.label}</option>
              {/each}
            </select>
          </form>
        </td>
        <td class="num">{g.photoCount}</td>
        <td class="actions">
          <a href={`/admin/galerias/${g.slug}`}>Editar</a>
          <form method="POST" action="?/toggleHidden" use:enhance>
            <input type="hidden" name="slug" value={g.slug} />
            <input type="hidden" name="hidden" value={g.hidden ? '0' : '1'} />
            <button type="submit" class="link-btn">{g.hidden ? 'Mostrar' : 'Ocultar'}</button>
          </form>
          <form method="POST" action="?/delete" use:enhance on:submit={(e) => { if (!confirm(`¿Eliminar "${g.title}"? Las fotos siguen en R2.`)) e.preventDefault(); }}>
            <input type="hidden" name="slug" value={g.slug} />
            <button type="submit" class="link-btn danger">Eliminar</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .head { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin-bottom: 0.6rem;
  }
  h1 { font-size: 1.9rem; font-weight: 400; margin: 0 0 0.4rem; }
  .sub { color: #555; font-size: 0.9rem; margin: 0; }

  .btn {
    background: #0d0d0b; color: #f5f2ec; border: none;
    padding: 0.7rem 1.2rem; cursor: pointer;
    font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }

  .create {
    background: #fff; border: 1px solid #d6cfc3;
    padding: 1.5rem 1.75rem; margin-bottom: 2rem;
  }
  .create .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .create label { display: flex; flex-direction: column; gap: 0.3rem; }
  .create label span { font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: #7a756c; }
  .create input, .create select {
    padding: 0.7rem 0.8rem; border: 1px solid #d6cfc3; background: #f8f6f0;
    font-size: 0.95rem;
  }
  .create input:focus, .create select:focus { outline: none; border-color: #0d0d0b; background: #fff; }
  .error {
    background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d;
    padding: 0.7rem; font-size: 0.88rem; margin-bottom: 1rem;
  }

  .grid { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #d6cfc3; }
  .grid th, .grid td { padding: 0.85rem 1rem; border-bottom: 1px solid #ecE7DE; text-align: left; vertical-align: top; }
  .grid th {
    background: #f1ecdf; font-size: 0.7rem; letter-spacing: 0.16em;
    text-transform: uppercase; color: #6a665e; font-weight: 500;
  }
  .grid tr:last-child td { border-bottom: none; }
  .title { color: #0d0d0b; font-weight: 500; text-decoration: none; }
  .title:hover { text-decoration: underline; }
  .meta { color: #7a756c; font-size: 0.78rem; margin-top: 0.2rem; font-family: Menlo, Monaco, monospace; }
  .lock-pill {
    display: inline-block; margin-left: 0.5rem; padding: 0.05rem 0.45rem;
    background: #fff7e0; border: 1px solid #d8c270; color: #7a5a00;
    font-size: 0.7rem; letter-spacing: 0.06em; border-radius: 999px;
    vertical-align: middle;
  }
  .hidden-pill {
    display: inline-block; margin-left: 0.35rem; padding: 0.05rem 0.45rem;
    background: #efeae0; border: 1px solid #b9ac8a; color: #4a4339;
    font-size: 0.7rem; letter-spacing: 0.06em; border-radius: 999px;
    vertical-align: middle;
  }
  .num { font-family: Menlo, Monaco, monospace; }
  .actions { display: flex; gap: 1rem; align-items: center; }
  .actions a { color: #0d0d0b; font-size: 0.85rem; }
  .link-btn { background: none; border: none; color: #0d0d0b; cursor: pointer; padding: 0; font-size: 0.85rem; }
  .link-btn.danger { color: #b91c1c; }

  select {
    padding: 0.45rem 0.6rem; border: 1px solid #d6cfc3; background: #f8f6f0;
    font-size: 0.85rem;
  }
</style>
