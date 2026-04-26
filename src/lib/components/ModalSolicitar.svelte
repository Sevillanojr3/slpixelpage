<script>
  import { onMount } from 'svelte';

  export let isOpen = false;
  export let paqueteNombre = '';

  let email = '';
  let mensaje = '';
  let loading = false;
  let success = false;
  let error = '';
  /** @type {{ mailto:string, subject:string, body:string } | null} */
  let fallback = null;

  $: if (isOpen) {
    // reset transient state every time the modal is reopened
    success = false;
    error = '';
    fallback = null;
  }

  function closeModal() {
    if (loading) return;
    isOpen = false;
    email = '';
    mensaje = '';
    success = false;
    error = '';
    fallback = null;
  }

  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      error = 'Ingresá un correo válido';
      return;
    }
    loading = true;
    error = '';
    fallback = null;

    try {
      const res = await fetch('/api/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, paquete: paqueteNombre, mensaje }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.ok) {
        success = true;
      } else {
        error = data.error || 'No se pudo enviar la solicitud.';
        if (data.fallback?.mailto) fallback = data.fallback;
      }
    } catch {
      error = 'Sin conexión. Probá de nuevo o escribinos directamente.';
      fallback = {
        mailto: 'info@slpixel.com',
        subject: `Solicitud de fotos en alta resolución — ${paqueteNombre}`,
        body: `Paquete: ${paqueteNombre}\nCliente: ${email}\n\n${mensaje}`,
      };
    } finally {
      loading = false;
    }
  }

  function fallbackHref(f) {
    const params = new URLSearchParams({ subject: f.subject, body: f.body });
    return `mailto:${f.mailto}?${params.toString()}`;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  onMount(() => () => {
    // ensure we never leave the body locked if the parent unmounts mid-open
    document.body.style.overflow = '';
  });

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="ms-backdrop" on:click={closeModal} role="presentation">
    <div
      class="ms-modal"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="ms-title"
      tabindex="-1"
    >
      <button class="ms-close" on:click={closeModal} aria-label="Cerrar">✕</button>

      {#if !success}
        <span class="ms-eyebrow">§ Solicitud · Alta resolución</span>
        <h2 id="ms-title" class="ms-title">Pedí las fotos en HD</h2>
        <p class="ms-sub">
          Galería: <strong>{paqueteNombre || '—'}</strong>
        </p>
        <p class="ms-copy">
          Te enviamos las fotos en alta resolución a tu correo.
          Tiempo estimado de respuesta: 24-48 horas.
        </p>

        <form class="ms-form" on:submit|preventDefault={handleSubmit}>
          <label class="ms-field">
            <span class="ms-label">Tu correo electrónico</span>
            <input
              type="email"
              bind:value={email}
              placeholder="vos@ejemplo.com"
              autocomplete="email"
              required
              disabled={loading}
            />
          </label>

          <label class="ms-field">
            <span class="ms-label">Mensaje (opcional)</span>
            <textarea
              bind:value={mensaje}
              rows="3"
              placeholder="¿Buscás alguna foto en particular? ¿Para qué la vas a usar?"
              disabled={loading}
            ></textarea>
          </label>

          {#if error}
            <div class="ms-error">
              <p>{error}</p>
              {#if fallback}
                <a class="ms-fallback" href={fallbackHref(fallback)}>
                  Escribir directamente a {fallback.mailto} →
                </a>
              {/if}
            </div>
          {/if}

          <button type="submit" class="btn ms-submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar solicitud'}
          </button>
        </form>
      {:else}
        <div class="ms-success">
          <span class="ms-eyebrow">Listo</span>
          <h3 class="ms-title">Solicitud enviada</h3>
          <p class="ms-copy">
            Te respondemos a <strong>{email}</strong> en las próximas 24-48 horas
            con las fotos en alta resolución.
          </p>
          <button class="btn btn-ghost" on:click={closeModal}>Cerrar</button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .ms-backdrop {
    position: fixed;
    inset: 0;
    background: color-mix(in srgb, #0d0d0b 78%, transparent);
    backdrop-filter: blur(8px) saturate(1.05);
    -webkit-backdrop-filter: blur(8px) saturate(1.05);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1100;
    padding: clamp(0.75rem, 3vw, 1.75rem);
    animation: ms-fade 0.3s ease;
  }

  .ms-modal {
    position: relative;
    width: 100%;
    max-width: 520px;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    background: var(--paper);
    color: var(--ink);
    padding: clamp(1.75rem, 4vw, 2.75rem);
    border: 1px solid var(--line-strong);
    box-shadow: 0 40px 80px -20px rgba(13, 13, 11, 0.5);
    animation: ms-rise 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .ms-close {
    position: absolute;
    top: 0.85rem;
    right: 0.95rem;
    background: transparent;
    border: 1px solid transparent;
    color: var(--ink);
    font-size: 1.05rem;
    line-height: 1;
    width: 36px;
    height: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.25s ease, opacity 0.25s ease;
  }
  .ms-close:hover { border-color: var(--line-strong); opacity: 0.7; }

  .ms-eyebrow {
    font-family: var(--font-sans);
    font-size: 0.66rem;
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted);
    display: block;
    margin-bottom: 0.85rem;
  }

  .ms-title {
    font-family: var(--font-display);
    font-weight: 300;
    font-size: clamp(1.6rem, 3.2vw, 2.2rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 0.7rem;
  }

  .ms-sub {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: var(--muted);
    margin-bottom: 1rem;
  }
  .ms-sub strong { color: var(--ink); font-weight: 500; }

  .ms-copy {
    font-family: var(--font-sans);
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--ink);
    margin-bottom: 1.6rem;
    max-width: 42ch;
  }

  .ms-form { display: flex; flex-direction: column; gap: 1.1rem; }

  .ms-field { display: flex; flex-direction: column; gap: 0.4rem; }

  .ms-label {
    font-family: var(--font-sans);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .ms-form input,
  .ms-form textarea {
    font-family: var(--font-sans);
    font-size: 0.98rem;
    color: var(--ink);
    background: var(--paper-alt);
    border: 1px solid var(--line);
    padding: 0.85rem 0.95rem;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .ms-form input:focus,
  .ms-form textarea:focus {
    outline: none;
    border-color: var(--ink);
    background: #fff;
  }

  .ms-form textarea { resize: vertical; min-height: 80px; }

  .ms-error {
    background: color-mix(in srgb, var(--accent) 8%, var(--paper));
    border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
    padding: 0.85rem 1rem;
    color: var(--ink);
  }
  .ms-error p { font-size: 0.88rem; margin-bottom: 0.4rem; }

  .ms-fallback {
    display: inline-block;
    font-family: var(--font-sans);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--accent);
    border-bottom: 1px solid currentColor;
    padding-bottom: 1px;
  }
  .ms-fallback:hover { opacity: 0.75; }

  .ms-submit {
    width: 100%;
    margin-top: 0.4rem;
    justify-content: center;
  }
  .ms-submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .ms-success { text-align: left; }
  .ms-success .btn { margin-top: 1.25rem; }

  @keyframes ms-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes ms-rise {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ms-backdrop, .ms-modal { animation: none; }
  }
</style>
