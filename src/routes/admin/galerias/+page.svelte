<script>
  import { enhance } from '$app/forms';
  export let data;
  export let form;

  let creating = false;
  let createAccess = 'public';
  let createParent = '';
  $: ({ galleries, categories, eligibleParents } = data);

  // Agrupar jerárquicamente: para cada top-level, sus hijos justo abajo
  $: ordered = (() => {
    const topLevel = galleries.filter((g) => !g.parent);
    const childrenByParent = galleries.reduce((acc, g) => {
      if (g.parent) (acc[g.parent] = acc[g.parent] || []).push(g);
      return acc;
    }, {});
    const out = [];
    for (const top of topLevel) {
      out.push(top);
      for (const child of childrenByParent[top.slug] || []) out.push(child);
    }
    // Huérfanas (parent que ya no existe) al final
    const seen = new Set(out.map((g) => g.slug));
    for (const g of galleries) if (!seen.has(g.slug)) out.push(g);
    return out;
  })();

  // Si elegís un padre al crear, la contraseña se deshabilita (hereda del padre)
  $: if (createParent) createAccess = 'public';
</script>

<header class="head">
  <div>
    <span class="eyebrow">Admin · Galerías</span>
    <h1>Galerías</h1>
    <p class="sub">{galleries.length} galerías. Asigná un padre para crear subgalerías (capítulos).</p>
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
          <input name="title" required placeholder="Ej. Boda Juan & María" />
        </label>
        <label>
          <span>Slug</span>
          <input name="slug" placeholder="(auto)" />
        </label>
      </div>
      <div class="row">
        <label>
          <span>Categoría</span>
          <select name="category" disabled={!!createParent}>
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
          <span>Padre (opcional · crea como subgalería)</span>
          <select name="parent" bind:value={createParent}>
            <option value="">— Sin padre · galería principal —</option>
            {#each eligibleParents as p (p.slug)}
              <option value={p.slug}>{p.title}</option>
            {/each}
          </select>
        </label>
        <label>
          <span>{createParent ? 'Hereda del padre' : 'Acceso'}</span>
          <select name="access" bind:value={createAccess} disabled={!!createParent}>
            <option value="public">Libre · pública</option>
            <option value="protected">Con contraseña</option>
          </select>
        </label>
      </div>
      {#if !createParent}
        <div class="row">
          <label>
            <span>Contraseña {createAccess === 'protected' ? '(requerida)' : '(no se usa)'}</span>
            <input name="password" type="text" placeholder="Mínimo 4 caracteres" disabled={createAccess !== 'protected'} />
          </label>
          <div></div>
        </div>
      {:else}
        <p class="hint">📁 Esta galería será un capítulo dentro del padre seleccionado. Heredará su contraseña (si la tiene).</p>
      {/if}
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
    {#each ordered as g (g.slug)}
      <tr class:child-row={!!g.parent}>
        <td>
          {#if g.parent}<span class="tree">↳</span>{/if}
          <a href={`/admin/galerias/${g.slug}`} class="title">{g.title}</a>
          {#if g.childrenCount > 0}
            <span class="parent-pill" title="Galería padre con subgalerías">📁 {g.childrenCount} capítulos</span>
          {/if}
          {#if g.protected}
            <span class="lock-pill" title="Acceso con contraseña">🔒 Privada</span>
          {/if}
          {#if g.parent && !g.protected}
            <span class="inherit-pill" title="Hereda acceso del padre">↑ Hereda</span>
          {/if}
          {#if g.hidden}
            <span class="hidden-pill" title="No aparece públicamente">👁️‍🗨️ Oculta</span>
          {/if}
          <div class="meta">/{g.slug}{g.date ? ` · ${g.date}` : ''}{g.parent ? ` · padre: ${g.parent}` : ''}</div>
        </td>
        <td>
          {#if g.parent}
            <span class="muted small">— hereda —</span>
          {:else}
            <form method="POST" action="?/setCategory" use:enhance>
              <input type="hidden" name="slug" value={g.slug} />
              <select name="category" on:change={(e) => e.target.form.requestSubmit()}>
                <option value="" selected={!g.category}>— sin categoría —</option>
                {#each categories as c (c.id)}
                  <option value={c.id} selected={g.category === c.id}>{c.label}</option>
                {/each}
              </select>
            </form>
          {/if}
        </td>
        <td class="num">{g.photoCount}</td>
        <td class="actions">
          <a href={`/admin/galerias/${g.slug}`}>Editar</a>
          <form method="POST" action="?/toggleHidden" use:enhance>
            <input type="hidden" name="slug" value={g.slug} />
            <input type="hidden" name="hidden" value={g.hidden ? '0' : '1'} />
            <button type="submit" class="link-btn">{g.hidden ? 'Mostrar' : 'Ocultar'}</button>
          </form>
          <form method="POST" action="?/delete" use:enhance on:submit={(e) => { if (!confirm(`¿Eliminar "${g.title}"? Las fotos siguen en R2.${g.childrenCount > 0 ? '\n\nOJO: tiene subgalerías y no se puede borrar mientras existan.' : ''}`)) e.preventDefault(); }}>
            <input type="hidden" name="slug" value={g.slug} />
            <button type="submit" class="link-btn danger">Eliminar</button>
          </form>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#if form?.error}<p class="error" style="margin-top:1rem">{form.error}</p>{/if}

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
  .hint {
    background: #eef6ff; border: 1px solid #b9d6f7; color: #1d4f7a;
    padding: 0.65rem 0.85rem; font-size: 0.88rem; margin: 0 0 1rem;
  }
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
  .grid tr.child-row td { background: #faf8f1; padding-left: 2rem; }
  .tree { color: #7a756c; margin-right: 0.4rem; font-family: Menlo, Monaco, monospace; }
  .title { color: #0d0d0b; font-weight: 500; text-decoration: none; }
  .title:hover { text-decoration: underline; }
  .meta { color: #7a756c; font-size: 0.78rem; margin-top: 0.2rem; font-family: Menlo, Monaco, monospace; }
  .lock-pill {
    display: inline-block; margin-left: 0.5rem; padding: 0.05rem 0.45rem;
    background: #fff7e0; border: 1px solid #d8c270; color: #7a5a00;
    font-size: 0.7rem; letter-spacing: 0.06em; border-radius: 999px;
    vertical-align: middle;
  }
  .parent-pill {
    display: inline-block; margin-left: 0.5rem; padding: 0.05rem 0.45rem;
    background: #eef6ff; border: 1px solid #b9d6f7; color: #1d4f7a;
    font-size: 0.7rem; letter-spacing: 0.06em; border-radius: 999px;
    vertical-align: middle;
  }
  .inherit-pill {
    display: inline-block; margin-left: 0.5rem; padding: 0.05rem 0.45rem;
    background: #f3eaff; border: 1px solid #c5a8eb; color: #4f2b87;
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
  .muted { color: #7a756c; }
  .small { font-size: 0.78rem; }

  select {
    padding: 0.45rem 0.6rem; border: 1px solid #d6cfc3; background: #f8f6f0;
    font-size: 0.85rem;
  }
</style>
