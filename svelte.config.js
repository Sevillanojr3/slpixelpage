import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		prerender: {
			handleUnseenRoutes: 'ignore',
			handleMissingId: 'ignore',
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore gallery image 404s during prerender — the images are served from
				// the static dir at runtime and may still be syncing locally.
				if (path.startsWith('/galeria/')) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
