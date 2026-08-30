<script>
  import { SITE_NAME } from '$lib/seo.js';

  /** Values produced by buildGallerySeo() / buildSiteSeo() in $lib/seo.js. */
  export let title;
  export let description = '';
  export let image = '';
  export let imageAlt = SITE_NAME;
  /** Only set when we generated the image ourselves and know its size. */
  export let imageWidth = null;
  export let imageHeight = null;
  export let url = '';
  export let type = 'website';
</script>

<svelte:head>
  <title>{title}</title>
  {#if description}<meta name="description" content={description} />{/if}
  {#if url}<link rel="canonical" href={url} />{/if}

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:locale" content="es_ES" />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  {#if description}<meta property="og:description" content={description} />{/if}
  {#if url}<meta property="og:url" content={url} />{/if}
  {#if image}
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={imageAlt} />
    {#if imageWidth && imageHeight}
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
    {/if}
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  {#if description}<meta name="twitter:description" content={description} />{/if}
  {#if image}
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content={imageAlt} />
  {/if}
</svelte:head>
