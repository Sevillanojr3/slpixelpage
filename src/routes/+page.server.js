import { read } from '$lib/server/galleries-store.js';

export const prerender = false;

export async function load() {
  const data = await read();
  return { galleries: data.galleries };
}
