<script>
  import { theme, toggleTheme } from '$lib/theme.js';

  export let compact = false;

  $: isLight = $theme === 'light';
</script>

<button
  type="button"
  class="tt"
  class:compact
  class:light={isLight}
  on:click={toggleTheme}
  aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
  title={isLight ? 'Modo oscuro' : 'Modo claro'}
>
  <span class="icon" aria-hidden="true">
    {#if isLight}
      <!-- moon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
      </svg>
    {:else}
      <!-- sun -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    {/if}
  </span>
  {#if !compact}
    <span class="lbl">{isLight ? 'Noche' : 'Día'}</span>
  {/if}
</button>

<style>
  .tt {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.45rem 0.85rem;
    background: transparent;
    color: var(--ink);
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.66rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  }

  .tt:hover {
    color: var(--accent);
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .tt.compact {
    padding: 0.4rem;
    width: 34px; height: 34px;
    justify-content: center;
  }

  .icon {
    display: inline-flex;
    width: 16px; height: 16px;
  }
  .icon :global(svg) { width: 100%; height: 100%; }

  .lbl { line-height: 1; }
</style>
