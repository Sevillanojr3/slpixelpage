# Scripts

## `download-images.mjs`

Descarga las imágenes listadas en `src/lib/data/galleries.json` desde `images.pixieset.com` hacia `static/galeria/<slug>/`. Las imágenes se guardan con nombre `<hash>-<size>.<ext>` (por ejemplo `280cfb99...-large.jpg`).

### Uso

```bash
# Descarga todo (tamaños por defecto: large + xlarge)
node scripts/download-images.mjs

# Solo una galería
node scripts/download-images.mjs --only=caivssaprissa

# Solo thumbnails chicos (más rápido)
node scripts/download-images.mjs --sizes=medium

# Calidad máxima
node scripts/download-images.mjs --sizes=large,xlarge,xxlarge

# Más paralelismo
node scripts/download-images.mjs --concurrency=12
```

### Notas

- Es **idempotente**: si el archivo ya existe con >1KB, lo salta.
- Funciona directo contra `images.pixieset.com` (sin Cloudflare challenge).
- `full` / `original` están bloqueados (403) — el máximo disponible es `xxlarge` (~1600px).

## `pixieset-manifest.mjs` _(opcional)_

Si necesitás re-generar `galleries.json` desde cero (por ejemplo porque se publicaron nuevas galerías en Pixieset), usá el scraper Playwright que vive en `/tmp/pixieset-scraper/` (no está versionado). Copia las salidas a `src/lib/data/galleries.json`.
