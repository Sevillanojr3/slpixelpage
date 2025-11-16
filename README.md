# 📸 SL Pixel - Fotografía Creativa y Producción Visual

Sitio web minimalista y elegante para el estudio fotográfico **SL Pixel**, construido con **SvelteKit**.

## ✨ Características

- 🎨 Diseño minimalista, sobrio y elegante
- 📱 Totalmente responsivo
- 🖼️ Galería de paquetes fotográficos con preview bloqueado
- 📧 Sistema de solicitud de fotos por email
- ⚡ Rápido y optimizado
- 🎭 Animaciones suaves y transiciones elegantes

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ instalado
- npm o pnpm

### Instalación

1. **Clona el repositorio**
```bash
git clone <tu-repositorio>
cd slpixelpage
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**

Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Edita el archivo `.env` y configura tus credenciales de email:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
```

#### 📧 Configuración de Gmail

Para usar Gmail como servicio de correo:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en dos pasos
3. Genera una contraseña de aplicación: https://myaccount.google.com/apppasswords
4. Usa esa contraseña en `EMAIL_PASS`

### Desarrollo

Inicia el servidor de desarrollo:
```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
slpixelpage/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Header.svelte       # Navegación principal
│   │   │   ├── Footer.svelte       # Footer con redes sociales
│   │   │   └── ModalSolicitar.svelte  # Modal para solicitar fotos
│   │   └── styles/
│   │       └── global.css          # Estilos globales
│   └── routes/
│       ├── +layout.svelte          # Layout principal
│       ├── +page.svelte            # Página de inicio
│       ├── galeria/
│       │   └── +page.svelte        # Galería de paquetes
│       └── api/
│           └── solicitar/
│               └── +server.js      # Endpoint para enviar emails
├── static/
│   └── Logos/                      # Logos e imágenes estáticas
├── .env.example                    # Ejemplo de variables de entorno
└── package.json
```

## 🎨 Personalización

### Colores

Los colores principales están definidos en `src/lib/styles/global.css`:

```css
:root {
  --bg: #ffffff;        /* Fondo */
  --fg: #111111;        /* Texto principal */
  --accent: #888888;    /* Acentos y texto secundario */
  --hover: #333333;     /* Color hover */
  --light-gray: #f5f5f5;
  --border: #e0e0e0;
}
```

### Paquetes de Fotos

Edita la lista de paquetes en `src/routes/galeria/+page.svelte`:

```javascript
const paquetes = [
  {
    id: 1,
    nombre: 'Tu Paquete',
    descripcion: 'Descripción del paquete',
    imagenes: 100,
    preview: '/ruta/imagen.jpg'
  },
  // ... más paquetes
];
```

## 📧 Sistema de Solicitudes

Cuando un cliente hace clic en "Solicitar Fotos":

1. Se abre un modal pidiendo su email
2. Se envía una petición POST a `/api/solicitar`
3. El endpoint envía un correo a `slpixelstudio@gmail.com` con:
   - Email del cliente
   - Nombre del paquete solicitado
   - Fecha y hora
4. Se muestra un mensaje de confirmación

## 🚢 Despliegue

### Vercel (Recomendado)

1. **Instala Vercel CLI**
```bash
npm i -g vercel
```

2. **Configura el adaptador de Vercel**

En `svelte.config.js`, asegúrate de usar el adaptador de Vercel:
```bash
npm install -D @sveltejs/adapter-vercel
```

Actualiza `svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
```

3. **Despliega**
```bash
vercel
```

4. **Configura las variables de entorno en Vercel**
   - Ve a tu proyecto en vercel.com
   - Settings → Environment Variables
   - Agrega: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

### Netlify

```bash
npm run build
```

Sube la carpeta `build` a Netlify y configura las variables de entorno.

## 🛠️ Tecnologías

- [SvelteKit](https://kit.svelte.dev/) - Framework
- [Nodemailer](https://nodemailer.com/) - Envío de correos
- CSS Variables - Estilos personalizables
- Vanilla CSS - Sin frameworks CSS

## 📝 Licencia

© 2025 SL Pixel. Todos los derechos reservados.

## 📞 Contacto

**SL Pixel Studio**
- Email: slpixelstudio@gmail.com
- Web: [slpixel.com](https://slpixel.com)

---

Desarrollado con ❤️ para SL Pixel
# slpixelpage
