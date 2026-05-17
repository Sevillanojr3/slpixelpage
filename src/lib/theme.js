import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'slp-theme';

function initialTheme() {
  if (!browser) return 'dark';
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  if (!browser) return;
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f3ebd6' : '#0b0a08');
}

export const theme = writable(initialTheme());

if (browser) {
  theme.subscribe((value) => {
    applyTheme(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch {}
  });
}

export function toggleTheme() {
  theme.update((t) => (t === 'light' ? 'dark' : 'light'));
}
