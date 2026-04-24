# Hosting de imágenes — Opciones y recomendación

La galería vive en `static/galeria/<slug>/...`. Para desarrollo local eso funciona perfecto. Para producción hay que resolver dos cosas:

1. **Volumen**: el total descargado (tamaños `large` + `xlarge`) está en el orden de 600–900 MB. Poner eso en git frena el repo y no escala cuando subas más galerías.
2. **Deploy**: Vercel/Netlify tienen límites de artefactos (Vercel 100 MB por deployment de assets estáticos en el plan Hobby).

La solución estándar es publicar las imágenes a un **bucket** (con CDN en frente) y apuntar el sitio con la variable de entorno `PUBLIC_IMAGES_BASE_URL`. El código ya está preparado para eso: ver `src/lib/images.js`.

## Comparación rápida

| Opción | Costo típico (500 MB – 5 GB) | Egress | CDN incluido | Facilidad (1-5) | Notas |
|---|---|---|---|---|---|
| **Cloudflare R2** | 0 €/mes (10 GB free) → luego $0.015/GB | **Gratis** | Sí (Cloudflare) | 5 | Mejor relación precio/performance. S3-compatible. |
| **Backblaze B2** | $6/TB/mes almacenamiento | $0.01/GB (3× gratis via Bandwidth Alliance con Cloudflare) | Via Bunny/Cloudflare | 4 | Muy barato; normalmente pareado con un CDN. |
| **Bunny.net Storage + CDN** | $0.01/GB almacenamiento + $0.01/GB egress | Incluido | Sí (Bunny CDN) | 5 | Muy rápido, pay-as-you-go con mínimos bajos. |
| **Cloudinary** | Free 25 GB storage + 25 GB/mes egress | Incluido | Sí | 4 | **Optimización on-the-fly** (f_auto, q_auto). Ideal si no querés pre-generar tamaños. |
| **imagekit.io** | Free 20 GB storage + 20 GB/mes egress | Incluido | Sí | 4 | Similar a Cloudinary. |
| **AWS S3 + CloudFront** | ~$0.023/GB storage + $0.085/GB egress | Pago | Sí (CloudFront) | 2 | Estándar de industria; la configuración es más laboriosa. |
| **Supabase Storage** | Free hasta 1 GB | Pago sobre cuota | Sí | 4 | Útil si ya usás Supabase para lo demás. |
| **Vercel Blob** | $0.15/GB almacenamiento + $0.30/GB egress | Pago | Sí | 5 | Perfecto si estás deployando en Vercel, pero egress caro para fotos. |
| **Pixieset hotlink (actual)** | 0 € | 0 € | Sí (CF) | — | No recomendado: Cloudflare bloquea requests server-side y no controlás las imágenes. |

### Recomendación

**Cloudflare R2** es la opción con mejor relación precio/beneficio para este caso:

- Almacenamiento: 10 GB gratis, luego $0.015/GB/mes. Con ~2 GB esto sigue costando prácticamente nada.
- **Cero cargos de egress**. Las imágenes se sirven ilimitadamente sin costo variable.
- CDN global de Cloudflare incluido.
- API compatible con S3, por lo que cualquier cliente (rclone, aws-cli, s3cmd, boto3) sirve.

Alternativa: **Cloudinary free tier** si querés evitar manejar tamaños manualmente (genera thumbnails on-demand).

---

## Plan para migrar a Cloudflare R2

1. **Crear cuenta** en Cloudflare → _R2 → Create bucket_ → nombre `slpixel-galeria`.
2. **Activar acceso público**: _Settings → Public Access → Connect a domain_. Te dan un subdominio `pub-XXXXX.r2.dev` o podés asignar `cdn.slpixel.com`.
3. **Subir imágenes** con [rclone](https://rclone.org) (la skill `compound-engineering:rclone` lo automatiza):

   ```bash
   # Configurar remote S3 apuntando al endpoint de R2
   rclone config   # (interactivo — credenciales de tu cuenta R2)

   # Sync
   rclone sync ./static/galeria r2:slpixel-galeria \
     --exclude ".gitkeep" \
     --progress --transfers 8
   ```

4. **Configurar la variable de entorno** del proyecto:
   ```env
   PUBLIC_IMAGES_BASE_URL=https://pub-xxxxxxxxxxxxxxxx.r2.dev
   ```
   O en Vercel/Netlify: _Settings → Environment Variables_.

5. **Redeploy** y verificar que la galería carga desde R2 (DevTools → Network).

6. **Cache**: las imágenes de Pixieset pesan ~90 KB (large) y ~270 KB (xxlarge). Con caché de CDN (TTL 1 año; las URLs contienen hash, son content-addressed) el costo de egress sigue siendo cero en R2.

## Script de sincronización

Ver `scripts/download-images.mjs` (descarga desde Pixieset) y el README en `scripts/`. Cuando se agreguen nuevas galerías, basta con:

```bash
# 1) Regenerar manifest (requiere Playwright — opcional; se puede editar manualmente).
# 2) Descargar nuevas imágenes.
node scripts/download-images.mjs

# 3) Subir al bucket.
rclone sync ./static/galeria r2:slpixel-galeria --progress
```

## Si optás por _no_ usar bucket

- Dejar `PUBLIC_IMAGES_BASE_URL` vacío.
- Incluir `static/galeria/` en el repo (removiendo las reglas de `.gitignore` correspondientes).
- Usar Git LFS si el repo se vuelve grande.
- Aceptar que el tamaño del deployment crece con cada galería nueva.

Para volúmenes por debajo de 100 MB esto es viable; más allá, un bucket es claramente mejor.
