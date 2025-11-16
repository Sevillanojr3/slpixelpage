# 🚀 Guía de Instalación - SL Pixel

## Paso 1: Instalar Dependencias

Abre la terminal en el directorio del proyecto y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias, incluyendo:
- SvelteKit
- Nodemailer (para envío de correos)
- Todas las dependencias de desarrollo

## Paso 2: Configurar Variables de Entorno

### Opción A: Gmail (Recomendado para desarrollo)

1. **Crea un archivo `.env`** en la raíz del proyecto:
```bash
touch .env
```

2. **Configura Gmail con contraseña de aplicación:**

   a. Ve a tu cuenta de Google: https://myaccount.google.com/
   
   b. Busca "Seguridad" → "Verificación en dos pasos" y actívala
   
   c. Ve a "Contraseñas de aplicaciones": https://myaccount.google.com/apppasswords
   
   d. Genera una nueva contraseña para "Correo" en "Otro dispositivo personalizado"
   
   e. Copia la contraseña generada (son 16 caracteres sin espacios)

3. **Edita el archivo `.env`** con estos valores:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # La contraseña de aplicación
```

### Opción B: Otros proveedores de email

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=tu-email@outlook.com
EMAIL_PASS=tu-contraseña
```

#### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=tu-email@yahoo.com
EMAIL_PASS=tu-contraseña-de-aplicacion
```

#### Servidor SMTP Personalizado
```env
EMAIL_HOST=smtp.tuservidor.com
EMAIL_PORT=587
EMAIL_USER=tu-usuario
EMAIL_PASS=tu-contraseña
```

## Paso 3: Verificar Configuración

Asegúrate de que el archivo `.env` esté en la raíz del proyecto y **NO** esté incluido en Git (ya está en `.gitignore`).

## Paso 4: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

El sitio estará disponible en: **http://localhost:5173**

## Paso 5: Probar el Sistema de Correos

1. Navega a http://localhost:5173/galeria
2. Haz clic en "Solicitar Fotos" en cualquier paquete
3. Ingresa un email de prueba
4. Verifica que llegue el correo a `slpixelstudio@gmail.com`

## Solución de Problemas

### Error: "Invalid login" o "Authentication failed"

**Causa:** Contraseña incorrecta o Gmail bloqueó el acceso

**Solución:**
1. Verifica que usaste una "Contraseña de aplicación" y no tu contraseña normal de Gmail
2. Asegúrate de que la verificación en dos pasos esté activada
3. Copia la contraseña sin espacios: `xxxxxxxxxxxxxxxx`

### Error: "ECONNREFUSED" o "Connection timeout"

**Causa:** Problema de conexión al servidor SMTP

**Solución:**
1. Verifica tu conexión a internet
2. Confirma que `EMAIL_HOST` y `EMAIL_PORT` sean correctos
3. Algunos proveedores de internet bloquean el puerto 587, intenta con el puerto 465:
   ```env
   EMAIL_PORT=465
   ```

### Los correos no llegan

**Causa:** Pueden estar en spam o configuración incorrecta

**Solución:**
1. Revisa la carpeta de spam/correo no deseado
2. Verifica que el `EMAIL_USER` esté bien escrito
3. Comprueba los logs en la terminal para ver errores

### Variables de entorno no se cargan

**Causa:** El archivo `.env` no está en la ubicación correcta

**Solución:**
1. Asegúrate de que `.env` esté en la **raíz del proyecto** (junto a `package.json`)
2. Reinicia el servidor de desarrollo después de crear/modificar `.env`
3. No uses comillas en los valores del `.env`

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

# Ver logs en tiempo real (en otra terminal)
npm run dev -- --debug
```

## Próximos Pasos

Una vez que todo funcione localmente:

1. **Personaliza los paquetes** en `src/routes/galeria/+page.svelte`
2. **Cambia los logos** en la carpeta `static/Logos/`
3. **Ajusta los colores** en `src/lib/styles/global.css`
4. **Despliega a producción** siguiendo la guía en `README.md`

## Despliegue a Vercel

1. **Instala el adaptador de Vercel:**
```bash
npm install -D @sveltejs/adapter-vercel
```

2. **Actualiza `svelte.config.js`:**
```javascript
import adapter from '@sveltejs/adapter-vercel';
```

3. **Despliega:**
```bash
npm i -g vercel
vercel
```

4. **Configura las variables de entorno en Vercel:**
   - Ve a tu proyecto en vercel.com
   - Settings → Environment Variables
   - Agrega las 4 variables: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

---

¿Necesitas ayuda? Contacta al desarrollador o revisa la documentación en `README.md`

