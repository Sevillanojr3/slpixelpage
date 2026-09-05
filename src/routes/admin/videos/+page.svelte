<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { assetUrl } from '$lib/images.js';
  import { videoRatio, orientationOf, ORIENTATION_LABEL, formatDuration, formatBytes } from '$lib/video.js';

  export let data;
  export let form;

  $: ({ videos, categories, publicBase } = data);

  const MAX_MB = 512;
  /** Longest edge of the still frame we store as the poster. */
  const POSTER_MAX_W = 1080;

  let queue = [];
  let uploading = false;
  let dragging = false;
  let defaultCategory = '';

  const stripExt = (name) => name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();

  const previewUrl = (v) => (publicBase ? `${publicBase}/${v.key}` : assetUrl(v.key));
  const posterUrl = (v) =>
    v.posterKey ? (publicBase ? `${publicBase}/${v.posterKey}` : assetUrl(v.posterKey)) : '';

  /**
   * Read width/height/duration and grab a still frame — the only place these
   * exist without decoding the video server-side. A file the browser can't
   * decode still uploads; it just lands without a poster.
   */
  async function probe(file) {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('El navegador no pudo leer este video.'));
      });

      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const duration = Number.isFinite(video.duration) ? video.duration : 0;

      let poster = null;
      try {
        poster = await grabFrame(video, width, height, duration);
      } catch (e) {
        console.warn('[video] no se pudo generar la miniatura:', e.message);
      }
      return { width, height, duration, poster };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function grabFrame(video, width, height, duration) {
    if (!width || !height) throw new Error('Sin dimensiones.');
    // A third of the way in avoids the black frame most clips open on.
    const target = duration ? Math.min(1.5, duration / 3) : 0;
    await new Promise((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error('No se pudo posicionar el video.'));
      video.currentTime = target;
    });

    const scale = Math.min(1, POSTER_MAX_W / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.82));
    if (!blob) throw new Error('El navegador no pudo generar la miniatura.');
    return blob;
  }

  /** PUT straight to R2 with a progress read-out — videos are big. */
  function putWithProgress(url, blob, contentType, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(e.loaded / e.total);
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`R2 respondió ${xhr.status}`));
      xhr.onerror = () => reject(new Error('Fallo de red durante la subida.'));
      xhr.send(blob);
    });
  }

  async function presign(payload) {
    const res = await fetch('/api/admin/video-upload-init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `init ${res.status}`);
    }
    return res.json();
  }

  function patchItem(index, patch) {
    queue = queue.map((it, i) => (i === index ? { ...it, ...patch } : it));
  }

  async function uploadOne(file, index) {
    const contentType = file.type || 'video/mp4';

    patchItem(index, { status: 'Leyendo…' });
    const { width, height, duration, poster } = await probe(file);

    patchItem(index, { status: 'Subiendo…', width, height, duration });
    const { url, key } = await presign({
      kind: 'video',
      filename: file.name,
      contentType,
      size: file.size,
    });
    await putWithProgress(url, file, contentType, (pct) => patchItem(index, { pct }));

    let posterKey = null;
    if (poster) {
      patchItem(index, { status: 'Miniatura…' });
      const shot = await presign({ kind: 'poster' });
      await putWithProgress(shot.url, poster, 'image/jpeg', () => {});
      posterKey = shot.key;
    }

    patchItem(index, { status: 'Guardando…' });
    const finRes = await fetch('/api/admin/video-upload-finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        posterKey,
        title: stripExt(file.name),
        category: defaultCategory || null,
        contentType,
        width,
        height,
        duration,
        size: file.size,
        filename: file.name,
      }),
    });
    if (!finRes.ok) {
      const body = await finRes.json().catch(() => ({}));
      throw new Error(body.error || `finalize ${finRes.status}`);
    }
    patchItem(index, { status: 'Listo ✓', pct: 1, done: true });
  }

  async function ingest(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('video/'));
    const rejected = Array.from(fileList || []).length - files.length;
    if (!files.length) {
      if (rejected) alert('Solo se aceptan archivos de video.');
      return;
    }

    const start = queue.length;
    queue = [
      ...queue,
      ...files.map((f) => ({ name: f.name, size: f.size, pct: 0, status: 'En cola', done: false, error: '' })),
    ];
    uploading = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = start + i;
      if (file.size > MAX_MB * 1024 * 1024) {
        patchItem(index, { status: 'Error', error: `Supera los ${MAX_MB} MB.` });
        continue;
      }
      try {
        await uploadOne(file, index);
      } catch (err) {
        console.error('[video upload]', file.name, err);
        patchItem(index, { status: 'Error', error: err.message });
      }
    }

    uploading = false;
    await invalidateAll();
  }

  function onPick(e) {
    ingest(e.target.files);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    dragging = false;
    ingest(e.dataTransfer?.files);
  }

  const clearQueue = () => (queue = []);
</script>

<header class="head">
  <div>
    <span class="eyebrow">Admin · Videos</span>
    <h1>Videos</h1>
    <p class="sub">
      {videos.length} video{videos.length === 1 ? '' : 's'}. El orden de esta lista es el orden en que
      se ven en <a href="/videos" target="_blank" rel="noopener noreferrer">/videos</a>.
    </p>
  </div>
</header>

{#if form?.error}<p class="error">{form.error}</p>{/if}
{#if form?.deleted}<p class="ok">Video eliminado.</p>{/if}

<section class="upload">
  <h2>Subir videos</h2>
  <p class="copy">
    MP4 (H.264) es el formato más compatible; también se aceptan MOV y WebM. Hasta {MAX_MB} MB por
    archivo. No se recorta nada: se guarda la proporción original y el sitio la respeta —
    vertical 9:16 se ve a pantalla completa en el móvil, horizontal 16:9 se muestra completo con su
    propio fondo difuminado.
  </p>

  <label class="field">
    <span>Categoría por defecto para lo que subas ahora</span>
    <select bind:value={defaultCategory}>
      <option value="">— Sin categoría —</option>
      {#each categories as c (c.id)}
        <option value={c.id}>{c.label}</option>
      {/each}
    </select>
  </label>

  <label
    class="drop"
    class:dragging
    on:dragover|preventDefault={() => (dragging = true)}
    on:dragleave={() => (dragging = false)}
    on:drop={onDrop}
  >
    <input type="file" accept="video/*" multiple on:change={onPick} disabled={uploading} />
    <span>{uploading ? 'Subiendo…' : 'Arrastrá los videos acá o hacé clic para elegirlos'}</span>
  </label>

  {#if queue.length > 0}
    <ul class="queue">
      {#each queue as item (item.name + item.size)}
        <li class:has-error={!!item.error}>
          <div class="q-row">
            <span class="q-name">{item.name}</span>
            <span class="q-meta">
              {formatBytes(item.size)}
              {#if item.width}· {item.width}×{item.height}{/if}
              {#if item.duration}· {formatDuration(item.duration)}{/if}
            </span>
            <span class="q-status">{item.error || item.status}</span>
          </div>
          <div class="bar"><span style={`width:${Math.round((item.pct || 0) * 100)}%`}></span></div>
        </li>
      {/each}
    </ul>
    {#if !uploading}
      <button type="button" class="link-btn" on:click={clearQueue}>Limpiar lista</button>
    {/if}
  {/if}
</section>

<section class="list">
  <h2>Catálogo</h2>
  {#if videos.length === 0}
    <p class="empty">Todavía no hay videos. Subí el primero arriba.</p>
  {:else}
    <ul class="cards">
      {#each videos as v, i (v.id)}
        <li class="card" class:is-hidden={v.hidden}>
          <div class="thumb" style={`--ratio:${videoRatio(v)}`}>
            {#if posterUrl(v)}
              <img src={posterUrl(v)} alt="" loading="lazy" />
            {:else}
              <span class="no-poster">Sin miniatura</span>
            {/if}
            <span class="badge">{formatDuration(v.duration)}</span>
          </div>

          <div class="body">
            <div class="specs">
              <span class="numeral">{String(i + 1).padStart(2, '0')}</span>
              <span class="tag">{ORIENTATION_LABEL[orientationOf(v)]}</span>
              <span class="muted">
                {v.width || '?'}×{v.height || '?'} · {formatBytes(v.size)} · {v.contentType}
              </span>
              {#if v.hidden}<span class="tag warn">Oculto</span>{/if}
            </div>

            <form method="POST" action="?/update" use:enhance>
              <input type="hidden" name="id" value={v.id} />
              <div class="row">
                <label>
                  <span>Título</span>
                  <input name="title" value={v.title} required />
                </label>
                <label>
                  <span>Categoría</span>
                  <select name="category">
                    <option value="" selected={!v.category}>— Sin categoría —</option>
                    {#each categories as c (c.id)}
                      <option value={c.id} selected={v.category === c.id}>{c.label}</option>
                    {/each}
                  </select>
                </label>
              </div>
              <label>
                <span>Descripción</span>
                <textarea name="description" rows="2" placeholder="Se muestra debajo del título">{v.description}</textarea>
              </label>
              <div class="actions">
                <button type="submit" class="btn">Guardar</button>
                {#if form?.savedId === v.id && form?.ok}<span class="saved">Guardado ✓</span>{/if}
              </div>
            </form>

            <div class="row-actions">
              <form method="POST" action="?/move" use:enhance>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="direction" value="up" />
                <button type="submit" class="link-btn" disabled={i === 0}>↑ Subir</button>
              </form>
              <form method="POST" action="?/move" use:enhance>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="direction" value="down" />
                <button type="submit" class="link-btn" disabled={i === videos.length - 1}>↓ Bajar</button>
              </form>
              <form method="POST" action="?/toggleHidden" use:enhance>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="hidden" value={v.hidden ? '0' : '1'} />
                <button type="submit" class="link-btn">{v.hidden ? '👁 Publicar' : '🙈 Ocultar'}</button>
              </form>
              <a class="link-btn" href={previewUrl(v)} target="_blank" rel="noopener noreferrer">Abrir original →</a>
              <form
                method="POST"
                action="?/delete"
                use:enhance
                on:submit={(e) => {
                  if (!confirm(`¿Eliminar "${v.title}"? También se borra el archivo del bucket.`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={v.id} />
                <button type="submit" class="link-btn danger">Eliminar</button>
              </form>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .head { margin-bottom: 2.5rem; }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin: 0 0 0.6rem;
    font-family: Menlo, Monaco, monospace;
  }
  h1 { font-size: 2rem; font-weight: 400; margin: 0; }
  .sub { color: #555; font-size: 0.9rem; margin-top: 0.5rem; }
  .sub a { color: #0d0d0b; }
  h2 {
    font-size: 0.78rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: #6a665e; font-weight: 500; margin: 0 0 1rem;
  }

  section { background: #fff; border: 1px solid #d6cfc3; padding: 1.75rem; margin-bottom: 1.5rem; }
  .copy { color: #555; font-size: 0.9rem; margin: 0 0 1.25rem; max-width: 68ch; }

  label { display: flex; flex-direction: column; gap: 0.3rem; }
  label span { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: #7a756c; }
  input, select, textarea {
    padding: 0.65rem 0.8rem; border: 1px solid #d6cfc3; background: #f8f6f0;
    font-size: 0.95rem; font-family: inherit; width: 100%;
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #0d0d0b; background: #fff; }
  .field { max-width: 320px; margin-bottom: 1.25rem; }

  .drop {
    display: block; padding: 2.25rem; text-align: center;
    border: 2px dashed #d6cfc3; background: #f8f6f0;
    cursor: pointer; transition: border-color 0.2s, background 0.2s;
  }
  .drop:hover, .drop.dragging { border-color: #0d0d0b; background: #fff; }
  .drop input { display: none; }
  .drop span { font-size: 0.85rem; color: #555; letter-spacing: 0.04em; }

  .queue { list-style: none; padding: 0; margin: 1.25rem 0 0.75rem; display: flex; flex-direction: column; gap: 0.6rem; }
  .queue li { background: #f8f6f0; border: 1px solid #d6cfc3; padding: 0.6rem 0.8rem; }
  .queue li.has-error { border-color: #fca5a5; background: #fff8f8; }
  .q-row { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
  .q-name { font-size: 0.86rem; color: #0d0d0b; flex: 1; word-break: break-all; }
  .q-meta { font-family: Menlo, Monaco, monospace; font-size: 0.72rem; color: #7a756c; }
  .q-status { font-size: 0.78rem; color: #4a4339; min-width: 90px; text-align: right; }
  .bar { height: 3px; background: #e4ddd0; margin-top: 0.5rem; }
  .bar span { display: block; height: 100%; background: #0d0d0b; transition: width 0.2s ease; }

  .cards { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1.25rem; }
  .card {
    display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 1.25rem;
    background: #f8f6f0; border: 1px solid #d6cfc3; padding: 1rem;
  }
  .card.is-hidden { opacity: 0.72; border-style: dashed; }

  .thumb {
    position: relative; aspect-ratio: var(--ratio); width: 100%;
    background: #0d0d0b; overflow: hidden; align-self: start;
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .no-poster {
    display: grid; place-items: center; width: 100%; height: 100%;
    color: #7a756c; font-size: 0.74rem;
  }
  .badge {
    position: absolute; right: 0.35rem; bottom: 0.35rem;
    background: rgba(0,0,0,0.7); color: #f5f2ec;
    font-family: Menlo, Monaco, monospace; font-size: 0.68rem; padding: 0.1rem 0.35rem;
  }

  .body { display: flex; flex-direction: column; gap: 0.85rem; min-width: 0; }
  .specs { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
  .numeral { font-family: Menlo, Monaco, monospace; font-size: 0.8rem; color: #7a756c; }
  .tag {
    padding: 0.1rem 0.5rem; border: 1px solid #b9ac8a; background: #efeae0;
    font-size: 0.68rem; letter-spacing: 0.08em; color: #4a4339; border-radius: 999px;
  }
  .tag.warn { border-color: #fcd34d; background: #fffbeb; color: #78350f; }
  .muted { color: #7a756c; font-size: 0.74rem; font-family: Menlo, Monaco, monospace; }

  .row { display: grid; grid-template-columns: 2fr 1fr; gap: 0.85rem; margin-bottom: 0.65rem; }

  .btn {
    background: #0d0d0b; color: #f5f2ec; border: none;
    padding: 0.55rem 1.1rem; cursor: pointer;
    font-size: 0.74rem; letter-spacing: 0.16em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }
  .actions { display: flex; align-items: center; gap: 0.85rem; margin-top: 0.65rem; }
  .saved { font-size: 0.8rem; color: #065f46; }

  .row-actions {
    display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
    padding-top: 0.75rem; border-top: 1px solid #e4ddd0;
  }
  .link-btn {
    background: none; border: none; cursor: pointer; padding: 0;
    font-size: 0.78rem; color: #0d0d0b; text-decoration: none;
  }
  .link-btn:hover { text-decoration: underline; }
  .link-btn[disabled] { opacity: 0.35; cursor: default; text-decoration: none; }
  .link-btn.danger { color: #b91c1c; }

  .ok { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; padding: 0.65rem 0.85rem; font-size: 0.88rem; margin-bottom: 1rem; }
  .error { background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d; padding: 0.65rem 0.85rem; font-size: 0.88rem; margin-bottom: 1rem; }
  .empty { color: #7a756c; font-size: 0.9rem; }

  @media (max-width: 760px) {
    .card { grid-template-columns: 1fr; }
    .thumb { max-width: 220px; }
    .row { grid-template-columns: 1fr; }
  }
</style>
