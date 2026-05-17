<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';

  export let data;
  export let form;

  $: ({ gallery, categories, publicBase } = data);

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
    <a href="/admin/galerias" class="back">← Volver</a>
    <span class="eyebrow">Galería · /{gallery.slug}</span>
    <h1>{gallery.title}</h1>
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

<section class="upload">
  <h2>Subir fotos</h2>
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

<section class="access">
  <h2>Acceso {gallery.protected ? '· 🔒 Protegida' : '· Libre'}</h2>
  <p class="copy">
    {gallery.protected
      ? 'Esta galería requiere una contraseña para visualizarse. Cambiala o quitala cuando quieras.'
      : 'Esta galería es pública. Cualquier persona con el enlace puede verla.'}
  </p>
  <form method="POST" action="?/setPassword" use:enhance>
    <div class="row access-row">
      <label>
        <span>{gallery.protected ? 'Nueva contraseña' : 'Contraseña'}</span>
        <input name="password" type="text" required minlength="4" placeholder="Mínimo 4 caracteres" />
      </label>
      <button type="submit" class="btn">{gallery.protected ? 'Actualizar contraseña' : 'Proteger galería'}</button>
    </div>
  </form>
  {#if gallery.protected}
    <form method="POST" action="?/clearPassword" use:enhance on:submit={(e) => { if (!confirm('¿Quitar la contraseña y dejar la galería pública?')) e.preventDefault(); }}>
      <button type="submit" class="link-btn danger">Quitar contraseña · volver a pública</button>
    </form>
  {/if}
  {#if form?.passwordChanged}<p class="ok">Contraseña guardada.</p>{/if}
  {#if form?.passwordCleared}<p class="ok">Galería ahora pública.</p>{/if}
  {#if form?.error}<p class="error">{form.error}</p>{/if}
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

  .access { background: #fff; border-color: #d6cfc3; }
  .access .row.access-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: end;
    margin-bottom: 0.85rem;
  }
  .access .row.access-row .btn { white-space: nowrap; align-self: end; }
  .access .link-btn { margin-top: 0.4rem; }
</style>
