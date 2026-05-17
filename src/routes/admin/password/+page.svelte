<script>
  export let data;
  export let form;

  $: isReset = data.mode === 'reset';
  $: needsCurrent = !isReset && data.hasPassword;
</script>

<section class="password">
  <div class="card">
    <span class="eyebrow">{isReset ? 'Restablecer contraseña' : 'Cambiar contraseña'}</span>
    <h1>{isReset ? 'Elegí una contraseña nueva' : 'Cambiar contraseña'}</h1>
    <p class="copy">Mínimo 8 caracteres. Vas a usarla para entrar al panel.</p>

    <form method="POST">
      {#if needsCurrent}
        <label>
          <span>Contraseña actual</span>
          <input name="current" type="password" autocomplete="current-password" required />
        </label>
      {/if}
      <label>
        <span>Nueva contraseña</span>
        <input name="password" type="password" autocomplete="new-password" required minlength="8" />
      </label>
      <label>
        <span>Confirmar contraseña</span>
        <input name="confirm" type="password" autocomplete="new-password" required minlength="8" />
      </label>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

      <button type="submit" class="btn">Guardar</button>
    </form>

    <p class="help">
      <a href={isReset ? '/admin/login' : '/admin/galerias'}>← Volver</a>
    </p>
  </div>
</section>

<style>
  .password { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
  .card { width: 100%; max-width: 480px; background: #fff; border: 1px solid #d6cfc3; padding: 2.5rem 2.25rem; }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin-bottom: 0.85rem;
  }
  h1 { font-size: 1.7rem; font-weight: 400; margin: 0 0 0.85rem; }
  .copy { font-size: 0.95rem; line-height: 1.5; color: #4a4a4a; margin: 0 0 1.5rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
  label span { font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase; color: #7a756c; }
  input {
    padding: 0.85rem 0.95rem; background: #f8f6f0;
    border: 1px solid #d6cfc3; font-size: 1rem; color: #0d0d0b;
  }
  input:focus { outline: none; border-color: #0d0d0b; background: #fff; }
  .btn {
    width: 100%; padding: 0.95rem; background: #0d0d0b;
    color: #f5f2ec; border: none; cursor: pointer;
    font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }
  .error {
    margin: 0.5rem 0 1rem; padding: 0.7rem 0.95rem;
    background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d;
    font-size: 0.88rem;
  }
  .help { margin-top: 1.5rem; font-size: 0.82rem; color: #7a756c; text-align: center; }
  .help a { color: #0d0d0b; }
</style>
