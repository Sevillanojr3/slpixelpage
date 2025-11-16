<script>
  export let isOpen = false;
  export let paqueteNombre = '';
  
  let email = '';
  let loading = false;
  let success = false;
  let error = '';
  
  function closeModal() {
    if (!loading) {
      isOpen = false;
      email = '';
      success = false;
      error = '';
    }
  }
  
  async function handleSubmit() {
    if (!email || !email.includes('@')) {
      error = 'Por favor, ingresa un correo válido';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('/api/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          paquete: paqueteNombre
        })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        success = true;
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        error = data.error || 'Error al enviar la solicitud';
      }
    } catch (e) {
      error = 'Error de conexión. Intenta nuevamente.';
    } finally {
      loading = false;
    }
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-backdrop" on:click={closeModal} role="presentation">
    <div class="modal" on:click|stopPropagation role="dialog" aria-modal="true">
      {#if !success}
        <button class="close-btn" on:click={closeModal} aria-label="Cerrar">&times;</button>
        
        <h2>Solicitar Fotos</h2>
        <p class="subtitle">Paquete: <strong>{paqueteNombre}</strong></p>
        
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="email">Tu correo electrónico</label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>
          
          {#if error}
            <p class="error">{error}</p>
          {/if}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      {:else}
        <div class="success-message">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
          </svg>
          <h3>¡Solicitud Enviada!</h3>
          <p>Nos pondremos en contacto contigo pronto.</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    animation: fadeIn 0.3s ease;
  }
  
  .modal {
    background: var(--bg);
    padding: 3rem;
    max-width: 500px;
    width: 100%;
    position: relative;
    animation: fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .close-btn {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: transparent;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    transition: color 0.3s ease;
  }
  
  .close-btn:hover {
    color: var(--fg);
    transform: none;
  }
  
  h2 {
    margin-bottom: 0.5rem;
    font-size: 2rem;
  }
  
  .subtitle {
    margin-bottom: 2rem;
    color: var(--accent);
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 400;
    letter-spacing: 0.02em;
  }
  
  button[type="submit"] {
    width: 100%;
    margin-top: 1rem;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .error {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .success-message {
    text-align: center;
    padding: 2rem 0;
  }
  
  .success-message svg {
    color: #27ae60;
    margin-bottom: 1.5rem;
  }
  
  .success-message h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }
  
  .success-message p {
    color: var(--accent);
  }
  
  @media (max-width: 768px) {
    .modal {
      padding: 2rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
  }
</style>

