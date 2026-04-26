<script>
  export let form;
</script>

<section class="verify">
  <div class="card">
    <span class="eyebrow">Verificación</span>
    <h1>Ingresá el código</h1>
    <p class="copy">Acabamos de mandarte un correo con un código de 6 dígitos.</p>

    <form method="POST">
      <input
        name="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        required
        autofocus
        placeholder="000000"
      />
      <button type="submit" class="btn">Entrar</button>
    </form>

    {#if form?.error}<p class="error">{form.error}</p>{/if}

    <p class="help">¿No te llegó? <a href="/admin/login">Pedir uno nuevo</a>.</p>
  </div>
</section>

<style>
  .verify { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
  .card {
    width: 100%; max-width: 460px;
    background: #fff; border: 1px solid #d6cfc3;
    padding: 2.5rem 2.25rem;
  }
  .eyebrow {
    display: block; font-size: 0.7rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: #7a756c; margin-bottom: 0.85rem;
  }
  h1 { font-size: 1.7rem; font-weight: 400; margin: 0 0 0.85rem; }
  .copy { font-size: 0.95rem; color: #4a4a4a; margin: 0 0 1.75rem; }

  input {
    width: 100%; padding: 0.95rem;
    font-family: Menlo, Monaco, monospace;
    font-size: 1.6rem; letter-spacing: 0.4em; text-align: center;
    background: #f8f6f0; border: 1px solid #d6cfc3;
    margin-bottom: 1rem;
  }
  input:focus { outline: none; border-color: #0d0d0b; background: #fff; }

  .btn {
    width: 100%; padding: 0.95rem;
    background: #0d0d0b; color: #f5f2ec; border: none; cursor: pointer;
    font-size: 0.85rem; letter-spacing: 0.18em; text-transform: uppercase;
  }
  .btn:hover { opacity: 0.85; }
  .error {
    margin-top: 1rem; padding: 0.7rem 0.95rem;
    background: #fef2f2; border: 1px solid #fca5a5; color: #7f1d1d;
    font-size: 0.88rem;
  }
  .help { margin-top: 1.5rem; font-size: 0.82rem; color: #7a756c; text-align: center; }
  .help a { color: #0d0d0b; }
</style>
