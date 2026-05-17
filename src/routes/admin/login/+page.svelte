<script>
  export let data;
  export let form;
</script>

<section class="login">
  <div class="card">
    <span class="eyebrow">Acceso restringido</span>
    <h1>Iniciar sesión</h1>

    {#if !data.hasPassword}
      <p class="copy">
        Aún no hay contraseña configurada. Vamos a enviarte un código por correo a
        <strong>{data.adminEmail}</strong> para que puedas elegir una.
      </p>
      <form method="POST" action="/admin/forgot">
        <input type="hidden" name="setup" value="1" />
        <button type="submit" class="btn">Configurar contraseña</button>
      </form>
    {:else}
      <p class="copy">Ingresá tu contraseña para entrar al panel.</p>
      <form method="POST">
        <input
          name="password"
          type="password"
          autocomplete="current-password"
          required
          autofocus
          placeholder="Contraseña"
        />
        <button type="submit" class="btn">Entrar</button>
      </form>

      {#if form?.error}<p class="error">{form.error}</p>{/if}

      <p class="help">
        ¿Olvidaste tu contraseña? <a href="/admin/forgot">Enviar código por correo</a>.
      </p>
    {/if}
  </div>
</section>

<style>
  .login {
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
  .copy { font-size: 0.95rem; line-height: 1.5; color: #4a4a4a; margin: 0 0 1.25rem; }
  .copy strong { color: #0d0d0b; font-weight: 600; }
  input[type='password'] {
    width: 100%;
    padding: 0.85rem 0.95rem;
    background: #f8f6f0;
    border: 1px solid #d6cfc3;
    font-size: 1rem;
    margin-bottom: 0.85rem;
    color: #0d0d0b;
  }
  input[type='password']:focus { outline: none; border-color: #0d0d0b; background: #fff; }
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
  .help {
    margin-top: 1.5rem;
    font-size: 0.82rem;
    color: #7a756c;
    text-align: center;
  }
  .help a { color: #0d0d0b; text-decoration: underline; }
</style>
