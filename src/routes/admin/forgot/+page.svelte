<script>
  export let data;
  export let form;
</script>

<section class="forgot">
  <div class="card">
    <span class="eyebrow">{data.setup ? 'Configuración inicial' : 'Restablecer contraseña'}</span>
    <h1>{data.setup ? 'Configurar contraseña' : 'Olvidé mi contraseña'}</h1>
    <p class="copy">
      {data.setup
        ? 'Vamos a enviarte un código de verificación al correo administrador. Después podrás elegir tu contraseña.'
        : 'Vamos a enviarte un código de verificación al correo administrador para que puedas restablecer tu contraseña.'}
    </p>

    <form method="POST">
      <button type="submit" class="btn">Enviar código</button>
    </form>

    {#if form?.error}<p class="error">{form.error}</p>{/if}

    <p class="help">
      <a href="/admin/login">← Volver al inicio de sesión</a>
    </p>
  </div>
</section>

<style>
  .forgot {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card {
    width: 100%;
    max-width: 460px;
    background: #fff;
    border: 1px solid #d6cfc3;
    padding: 2.5rem 2.25rem;
  }
  .eyebrow {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7a756c;
    margin-bottom: 0.85rem;
  }
  h1 { font-size: 1.7rem; font-weight: 400; margin: 0 0 0.85rem; }
  .copy { font-size: 0.95rem; line-height: 1.5; color: #4a4a4a; margin: 0 0 1.75rem; }
  .btn {
    width: 100%;
    padding: 0.95rem;
    background: #0d0d0b;
    color: #f5f2ec;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }
  .error {
    margin-top: 1rem;
    padding: 0.7rem 0.95rem;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    color: #7f1d1d;
    font-size: 0.88rem;
  }
  .help { margin-top: 1.5rem; font-size: 0.82rem; color: #7a756c; text-align: center; }
  .help a { color: #0d0d0b; }
</style>
