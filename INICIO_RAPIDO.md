# ⚡ Inicio Rápido - SL Pixel

## En 3 pasos simples

### 1️⃣ Instalar dependencias

```bash
npm install
```

### 2️⃣ Crear archivo `.env`

Crea un archivo llamado `.env` en la raíz del proyecto con:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```

> 💡 **Para Gmail:** Necesitas una "Contraseña de aplicación"
>
> 1. Ve a https://myaccount.google.com/apppasswords
> 2. Genera una contraseña para "Correo"
> 3. Copia los 16 caracteres y úsalos en `EMAIL_PASS`

### 3️⃣ Iniciar el servidor

```bash
npm run dev
```

🎉 **¡Listo!** Abre http://localhost:5173

---

## Estructura del Sitio

```
┌─────────────────────────────────────┐
│           PÁGINA DE INICIO          │
│  - Hero elegante                    │
│  - Sección "Sobre nosotros"        │
│  - Servicios                        │
│  - CTA (Call to action)            │
│  - Contacto                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│             GALERÍA                 │
│  - Grid de paquetes de fotos       │
│  - Imágenes con blur               │
│  - Botón "Solicitar fotos"         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         MODAL DE SOLICITUD          │
│  - Input de email                   │
│  - Envío a slpixelstudio@gmail.com │
│  - Mensaje de confirmación         │
└─────────────────────────────────────┘
```

---

## Personalizar el Sitio

### Cambiar Logos

Reemplaza las imágenes en: `static/Logos/`

### Editar Paquetes de Fotos

Edita el array en: `src/routes/galeria/+page.svelte`

```javascript
const paquetes = [
  {
    id: 1,
    nombre: 'Nombre del Paquete',
    descripcion: 'Descripción breve',
    imagenes: 100,
    preview: '/ruta/imagen.jpg'
  }
];
```

### Cambiar Colores

Edita las variables en: `src/lib/styles/global.css`

```css
:root {
  --bg: #ffffff;        /* Fondo */
  --fg: #111111;        /* Texto */
  --accent: #888888;    /* Acentos */
}
```

### Modificar Textos

- **Inicio:** `src/routes/+page.svelte`
- **Galería:** `src/routes/galeria/+page.svelte`
- **Header:** `src/lib/components/Header.svelte`
- **Footer:** `src/lib/components/Footer.svelte`

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Formatear código
npm run format
```

---

## ¿Listo para publicar?

Lee la guía completa de despliegue:

- 📄 [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel, Netlify, VPS
- 📄 [INSTALACION.md](./INSTALACION.md) - Guía detallada
- 📄 [README.md](./README.md) - Documentación completa

---

## Checklist de Tareas

Antes de poner el sitio en producción:

- [ ] Configurar variables de entorno (`.env`)
- [ ] Probar envío de correos localmente
- [ ] Cambiar logos en `static/Logos/`
- [ ] Editar paquetes en la galería
- [ ] Personalizar textos en Home
- [ ] Actualizar links de redes sociales en Footer
- [ ] Verificar que todo sea responsivo en móvil
- [ ] Build y preview: `npm run build && npm run preview`
- [ ] Configurar dominio personalizado (opcional)
- [ ] Desplegar a Vercel/Netlify

---

## Soporte

¿Problemas? Consulta:

- **Instalación:** [INSTALACION.md](./INSTALACION.md)
- **Despliegue:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Errores comunes:** Revisa los logs en la terminal

📧 **Contacto del estudio:** slpixelstudio@gmail.com
