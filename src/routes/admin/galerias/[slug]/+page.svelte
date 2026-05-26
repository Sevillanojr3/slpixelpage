<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data;
  export let form;

  $: ({ gallery, categories, publicBase, siteUrl, children, eligibleParents } = data);
  $: shareUrl = gallery.parent
    ? `${siteUrl}/galeria/${gallery.parent}/${gallery.slug}`
    : `${siteUrl}/galeria/${gallery.slug}`;

  let creatingChild = false;

  let lastPassword = '';
  let copyMsg = '';
  async function copyShare() {
    const text = lastPassword
      ? `${gallery.title}\n${shareUrl}\nContraseña (descargas): ${lastPassword}`
      : `${gallery.title}\n${shareUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      copyMsg = 'Copiado al portapapeles ✓';
    } catch {
      copyMsg = 'No se pudo copiar. Seleccioná el texto manualmente.';
    }
    setTimeout(() => (copyMsg = ''), 3000);
  }
  $: if (form?.passwordChanged && form?.lastPassword) lastPassword = form.lastPassword;

  let files = null;
  let uploadStatus = '';
  let uploading = false;

  /** Resolve preview URL for a photo entry. Supports admin uploads (key) and Pixieset (bucket/hash/ext). */
  function photoPreviewUrl(p) {
    if (p.key) {
      return publicBase ? `${publicBase}/${p.key}` : `/${p.key}`;
    }
    if (p.bucket && p.hash) {
      const size = p.size || 'large';
      const ext = (p.ext || 'jpg').toLowerCase();
      const path = `${gallery.slug}/${p.hash}-${size}.${ext}`;
      return publicBase ? `${publicBase}/${path}` : `/galeria/${path}`;
    }
    return '';
  }

  function photoIdentity(p) {
    return p.key || `${p.bucket}/${p.hash}`;
  }

  async function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    uploading = true;
    uploadStatus = `0 / ${list.length}`;
    let done = 0;

    for (const file of list) {
      try {
        // 1) ask server for a presigned PUT URL
        const initRes = await fetch('/api/admin/upload-init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: gallery.slug, filename: file.name, contentType: file.type || 'application/octet-stream' }),
        });
        if (!initRes.ok) {
          const errBody = await initRes.json().catch(() => ({}));
          throw new Error(errBody.error || `init ${initRes.status}`);
        }
        const { url, key } = await initRes.json();

        // 2) PUT directly to R2
        const putRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) throw new Error(`R2 PUT ${putRes.status}`);

        // 3) tell the server to record the photo in the manifest
        const finRes = await fetch('/api/admin/upload-finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: gallery.slug, key, filename: file.name }),
        });
        if (!finRes.ok) throw new Error(`finalize ${finRes.status}`);
      } catch (err) {
        console.error('[upload]', file.name, err);
        uploadStatus = `Error en ${file.name}: ${err.message}`;
        uploading = false;
        return;
      }
      done++;
      uploadStatus = `${done} / ${list.length}`;
    }

    uploading = false;
    uploadStatus = `✓ ${done} foto${done === 1 ? '' : 's'} subida${done === 1 ? '' : 's'}`;
    files = null;
    await invalidateAll();
  }
</script>

<header class="head">
  <div>
    {#if gallery.parent}
      <a href={`/admin/galerias/${gallery.parent}`} class="back">← Volver a {gallery.parentTitle}</a>
    {:else}
      <a href="/admin/galerias" class="back">← Volver</a>
    {/if}
    <span class="eyebrow">
      {gallery.parent ? `Subgalería de ${gallery.parentTitle}` : 'Galería'} · /{gallery.slug}
    </span>
    <h1>{gallery.title}</h1>
    {#if gallery.parent && gallery.parentProtected}
      <p class="inherit-note">🔒 Hereda contraseña del padre — visitantes deben desbloquear <strong>{gallery.parentTitle}</strong> primero.</p>
    {:else if gallery.parent}
      <p class="inherit-note">↑ Capítulo del evento <strong>{gallery.parentTitle}</strong> (acceso libre).</p>
    {/if}
  </div>
</header>

<section class="meta-edit">
  <h2>Metadatos</h2>
  <form method="POST" action="?/update" use:enhance>
    <div class="row">
      <label>
        <span>Título</span>
        <input name="title" value={gallery.title} required />
      </label>
      <label>
        <span>Categoría</span>
        <select name="category">
          <option value="" selected={!gallery.category}>— Sin categoría —</option>
          {#each categories as c (c.id)}
            <option value={c.id} selected={gallery.category === c.id}>{c.label}</option>
          {/each}
        </select>
      </label>
      <label>
        <span>Fecha</span>
        <input name="date" type="date" value={gallery.date || ''} />
      </label>
    </div>
    {#if form?.error}<p class="error">{form.error}</p>{/if}
    {#if form?.ok}<p class="ok">Guardado.</p>{/if}
    <button type="submit" class="btn">Guardar cambios</button>
  </form>
</section>

{#if !gallery.parent}
<section class="children">
  <h2>Subgalerías {children.length > 0 ? `· ${children.length}` : ''}</h2>
  <p class="copy">
    Esta galería puede contener capítulos (ej. una boda con misa, recepción, fiesta, novios).
    Los visitantes verán cada capítulo dentro de esta galería y heredarán su acceso.
  </p>

  {#if children.length > 0}
    <ul class="children-list">
      {#each children as c (c.slug)}
        <li>
          <a href={`/admin/galerias/${c.slug}`} class="title">{c.title}</a>
          <span class="muted small">/{c.slug} · {c.photoCount} foto{c.photoCount === 1 ? '' : 's'}</span>
          {#if c.hidden}<span class="hidden-pill">👁️‍🗨️ Oculta</span>{/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if creatingChild}
    <form method="POST" action="?/createChild" use:enhance class="create-child">
      <div class="row">
        <label>
          <span>Título del capítulo</span>
          <input name="title" required placeholder="Ej. Misa, Recepción, Fiesta..." />
        </label>
        <label>
          <span>Slug</span>
          <input name="slug" placeholder="(auto)" />
        </label>
      </div>
      <div class="children-actions">
        <button type="submit" class="btn">Crear capítulo</button>
        <button type="button" class="link-btn" on:click={() => (creatingChild = false)}>Cancelar</button>
      </div>
    </form>
  {:else}
    <button type="button" class="btn" on:click={() => (creatingChild = true)}>+ Nuevo capítulo</button>
  {/if}
  {#if form?.error}<p class="error" style="margin-top:1rem">{form.error}</p>{/if}
</section>
{/if}

<section class="upload">
  <h2>Subir fotos {gallery.parent ? '(de este capítulo)' : ''}</h2>
  <p class="copy">
    Arrastrá o seleccioná archivos. Se suben directo a R2 (bucket <code>slpixel-galeria/{gallery.slug}/</code>) y se agregan a la galería.
  </p>
  <label class="drop">
    <input type="file" accept="image/*" multiple bind:files on:change={handleFiles} disabled={uploading} />
    <span>{uploading ? 'Subiendo…' : 'Seleccionar archivos'}</span>
  </label>
  {#if uploadStatus}<p class="status">{uploadStatus}</p>{/if}
</section>

<section class="photos">
  <h2>{gallery.photos.length} foto{gallery.photos.length === 1 ? '' : 's'}</h2>
  {#if gallery.photos.length === 0}
    <p class="empty">No hay fotos todavía. Subí algunas arriba.</p>
  {:else}
    <ul class="grid">
      {#each gallery.photos as photo (photoIdentity(photo))}
        <li class="tile">
          <img src={photoPreviewUrl(photo)} alt="" loading="lazy" />
          <div class="tile-actions">
            {#if photo.key}
              <form method="POST" action="?/removePhoto" use:enhance on:submit={(e) => { if (!confirm('¿Eliminar esta foto?')) e.preventDefault(); }}>
                <input type="hidden" name="key" value={photo.key} />
                <button type="submit" class="link-btn danger">Eliminar</button>
              </form>
            {:else}
              <span class="muted">(Pixieset)</span>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if !gallery.parent}
<section class="visibility">
  <h2>Visibilidad {gallery.hidden ? '· 👁️‍🗨️ Oculta' : '· 🌐 Pública'}</h2>
  <p class="copy">
    {gallery.hidden
      ? 'Esta galería NO aparece en el sitio público. Solo es accesible con el enlace directo de abajo.'
      : 'Esta galería aparece en el portafolio público.'}
  </p>
  <form method="POST" action="?/setHidden" use:enhance>
    <input type="hidden" name="hidden" value={gallery.hidden ? '0' : '1'} />
    <button type="submit" class="btn">
      {gallery.hidden ? 'Hacer pública' : 'Ocultar del portafolio'}
    </button>
  </form>
  {#if form?.hiddenChanged}<p class="ok">Visibilidad actualizada.</p>{/if}
</section>
{/if}

<section class="share">
  <h2>Compartir enlace</h2>
  <p class="copy">
    Mandale este enlace a tu cliente.
    {gallery.protected
      ? ' La galería es visible para cualquiera, pero solo se podrán descargar las fotos al ingresar la contraseña.'
      : ' La galería se puede ver y descargar libremente.'}
  </p>
  <div class="share-box">
    <span class="share-label">URL</span>
    <code class="share-url">{shareUrl}</code>
  </div>
  {#if gallery.protected && lastPassword}
    <div class="share-box">
      <span class="share-label">Contraseña (descargas)</span>
      <code class="share-url">{lastPassword}</code>
    </div>
  {:else if gallery.protected}
    <p class="muted small">
      🔒 Galería con contraseña activa. Por seguridad la contraseña no se muestra acá —
      si la perdiste, definí una nueva más abajo.
    </p>
  {/if}
  <div class="share-actions">
    <button type="button" class="btn" on:click={copyShare}>Copiar enlace</button>
    <a class="link-btn" href={shareUrl} target="_blank" rel="noopener noreferrer">Abrir en una pestaña →</a>
  </div>
  {#if copyMsg}<p class="ok">{copyMsg}</p>{/if}
</section>

{#if !gallery.parent}
<section class="access">
  <h2>Acceso {gallery.protected ? '· 🔒 Con contraseña' : '· 🟢 Libre'}</h2>
  <p class="copy">
    {gallery.protected
      ? 'Esta galería es privada: los visitantes deben ingresar la contraseña para ver subgalerías, fotos y descargar. La contraseña se aplica a todos los capítulos hijos.'
      : 'Las fotos y subgalerías se pueden ver y descargar libremente. Si querés proteger el evento entero (incluidos sus capítulos), definí una contraseña.'}
  </p>
  <form method="POST" action="?/setPassword" use:enhance>
    <div class="row access-row">
      <label>
        <span>{gallery.protected ? 'Nueva contraseña' : 'Contraseña para descargas'}</span>
        <input name="password" type="text" required minlength="4" placeholder="Mínimo 4 caracteres" />
      </label>
      <button type="submit" class="btn">{gallery.protected ? 'Actualizar contraseña' : 'Proteger descargas'}</button>
    </div>
  </form>
  {#if gallery.protected}
    <form method="POST" action="?/clearPassword" use:enhance on:submit={(e) => { if (!confirm('¿Quitar la contraseña? Cualquiera con el enlace podrá descargar las fotos.')) e.preventDefault(); }}>
      <button type="submit" class="link-btn danger">Quitar contraseña · descargas libres</button>
    </form>
  {/if}
  {#if form?.passwordChanged}<p class="ok">Contraseña guardada.</p>{/if}
  {#if form?.passwordCleared}<p class="ok">Descargas ahora libres.</p>{/if}
  {#if form?.error}<p class="error">{form.error}</p>{/if}
</section>
{/if}

<section class="parent-section">
  <h2>{gallery.parent ? 'Padre · subgalería' : 'Estructura · galería principal'}</h2>
  {#if gallery.parent}
    <p class="copy">
      Esta galería es un capítulo de <strong>{gallery.parentTitle}</strong>. Hereda su contraseña y categoría.
      Podés desvincularla para convertirla de nuevo en una galería principal.
    </p>
    <form method="POST" action="?/setParent" use:enhance on:submit={(e) => { if (!confirm('¿Convertir en galería principal? Dejará de heredar el acceso del padre.')) e.preventDefault(); }}>
      <input type="hidden" name="parent" value="" />
      <button type="submit" class="btn">Desvincular del padre</button>
    </form>
  {:else}
    <p class="copy">
      Esta es una galería principal. Si querés convertirla en capítulo de otra galería, elegí un padre abajo.
      No debe tener subgalerías ni contraseña propia para poder moverse.
    </p>
    <form method="POST" action="?/setParent" use:enhance>
      <div class="row access-row">
        <label>
          <span>Padre</span>
          <select name="parent">
            <option value="">— sin padre —</option>
            {#each eligibleParents as p (p.slug)}
              <option value={p.slug}>{p.title}</option>
            {/each}
          </select>
        </label>
        <button type="submit" class="btn">Mover</button>
      </div>
    </form>
  {/if}
  {#if form?.parentChanged}<p class="ok">Vínculo actualizado.</p>{/if}
</section>

<section class="danger-zone">
  <h2>Zona peligrosa</h2>
  <form method="POST" action="?/delete" use:enhance on:submit={(e) => { if (!confirm(`¿Eliminar la galería "${gallery.title}"? Las fotos en R2 NO se borran.`)) e.preventDefault(); }}>
    <button type="submit" class="btn danger">Eliminar galería</button>
  </form>
</section>

<style>
  .head { margin-bottom: 2.5rem; }
  .back { color: #555; font-size: 0.85rem; text-decoration: none; }
  .back:hover { color: #0d0d0b; }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin: 0.6rem 0;
    font-family: Menlo, Monaco, monospace;
  }
  h1 { font-size: 2rem; font-weight: 400; margin: 0; }
  h2 {
    font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: #6a665e; font-weight: 500; margin: 0 0 1rem;
  }

  section { background: #fff; border: 1px solid #d6cfc3; padding: 1.75rem; margin-bottom: 1.5rem; }

  .row { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  label { display: flex; flex-direction: column; gap: 0.3rem; }
  label span { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #7a756c; }
  input, select {
    padding: 0.65rem 0.8rem; border: 1px solid #d6cfc3; background: #f8f6f0;
    font-size: 0.95rem;
  }
  input:focus, select:focus { outline: none; border-color: #0d0d0b; background: #fff; }

  .btn {
    background: #0d0d0b; color: #f5f2ec; border: none;
    padding: 0.7rem 1.2rem; cursor: pointer;
    font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }
  .btn.danger { background: #b91c1c; }

  .copy { color: #555; font-size: 0.9rem; margin: 0 0 1rem; }
  code { font-family: Menlo, Monaco, monospace; background: #f1ecdf; padding: 0.1rem 0.4rem; }

  .drop {
    display: block; padding: 2rem; text-align: center;
    border: 2px dashed #d6cfc3; background: #f8f6f0;
    cursor: pointer; transition: border-color 0.2s;
  }
  .drop:hover { border-color: #0d0d0b; }
  .drop input { display: none; }
  .drop span { font-size: 0.85rem; color: #555; letter-spacing: 0.05em; }
  .status { margin-top: 0.85rem; font-family: Menlo, Monaco, monospace; font-size: 0.85rem; color: #0d0d0b; }
  .ok { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; padding: 0.65rem 0.85rem; font-size: 0.88rem; margin-bottom: 1rem; }
  .error { background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d; padding: 0.65rem 0.85rem; font-size: 0.88rem; margin-bottom: 1rem; }

  .grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.85rem; }
  .tile { background: #f8f6f0; border: 1px solid #d6cfc3; aspect-ratio: 4/3; position: relative; overflow: hidden; }
  .tile img { width: 100%; height: 100%; object-fit: cover; }
  .tile-actions {
    position: absolute; right: 0.4rem; bottom: 0.4rem;
    background: rgba(255,255,255,0.94); padding: 0.25rem 0.5rem;
  }
  .link-btn { background: none; border: none; cursor: pointer; padding: 0; font-size: 0.78rem; }
  .link-btn.danger { color: #b91c1c; }
  .muted { color: #7a756c; font-size: 0.74rem; }

  .empty { color: #7a756c; font-size: 0.9rem; }

  .danger-zone { border-color: #fca5a5; background: #fff8f8; }

  .visibility, .share, .access { background: #fff; border-color: #d6cfc3; }
  .share-box {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.75rem 0.9rem;
    background: #f8f6f0;
    border: 1px solid #d6cfc3;
    margin-bottom: 0.75rem;
  }
  .share-label {
    font-size: 0.66rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7a756c;
    min-width: 90px;
  }
  .share-url {
    font-family: Menlo, Monaco, monospace;
    font-size: 0.85rem;
    color: #0d0d0b;
    word-break: break-all;
    flex: 1;
  }
  .share-actions { display: flex; gap: 1rem; align-items: center; margin-top: 0.75rem; }
  .share-actions .link-btn { color: #0d0d0b; }
  .muted.small { font-size: 0.82rem; color: #7a756c; margin: 0.4rem 0 0.6rem; }

  .access .row.access-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: end;
    margin-bottom: 0.85rem;
  }
  .access .row.access-row .btn { white-space: nowrap; align-self: end; }
  .access .link-btn { margin-top: 0.4rem; }

  .inherit-note {
    background: #eef6ff; border: 1px solid #b9d6f7; color: #1d4f7a;
    padding: 0.6rem 0.85rem; font-size: 0.88rem; margin: 0.8rem 0 0;
  }
  .children-list {
    list-style: none; padding: 0; margin: 0 0 1.25rem;
    display: flex; flex-direction: column; gap: 0.5rem;
  }
  .children-list li {
    display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
    padding: 0.65rem 0.85rem;
    background: #f8f6f0; border: 1px solid #d6cfc3;
  }
  .children-list .title { color: #0d0d0b; font-weight: 500; text-decoration: none; }
  .children-list .title:hover { text-decoration: underline; }
  .children-list .muted { color: #7a756c; font-family: Menlo, Monaco, monospace; }
  .small { font-size: 0.78rem; }
  .hidden-pill {
    display: inline-block; padding: 0.05rem 0.45rem;
    background: #efeae0; border: 1px solid #b9ac8a; color: #4a4339;
    font-size: 0.7rem; letter-spacing: 0.06em; border-radius: 999px;
  }
  .create-child { margin-top: 0.5rem; }
  .create-child .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem; }
  .children-actions { display: flex; gap: 1rem; align-items: center; }
  .parent-section .row.access-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: end;
  }
</style>
