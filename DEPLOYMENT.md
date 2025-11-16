# 🚀 Guía de Despliegue - SL Pixel

## Despliegue en Vercel (Recomendado)

Vercel es la plataforma oficial de SvelteKit y ofrece despliegue gratuito con dominio HTTPS.

### Método 1: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/slpixel.git
git push -u origin main
```

2. **Conecta con Vercel**
   - Ve a https://vercel.com
   - Haz clic en "Add New" → "Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto SvelteKit

3. **Configura las Variables de Entorno**
   - En el dashboard de tu proyecto
   - Ve a "Settings" → "Environment Variables"
   - Agrega las siguientes variables:
     ```
     EMAIL_HOST = smtp.gmail.com
     EMAIL_PORT = 587
     EMAIL_USER = tu-email@gmail.com
     EMAIL_PASS = tu-contraseña-de-aplicacion
     ```
   - Aplica las variables a: Production, Preview, Development

4. **Despliega**
   - Haz clic en "Deploy"
   - Espera 1-2 minutos
   - ¡Tu sitio estará en línea!

### Método 2: Desde CLI

1. **Instala Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Despliega**
```bash
vercel
```

4. **Configura variables de entorno**
```bash
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

5. **Redespliega con las variables**
```bash
vercel --prod
```

### Configurar Dominio Personalizado

1. En Vercel Dashboard → "Settings" → "Domains"
2. Agrega tu dominio (ej: `slpixel.com`)
3. Configura los registros DNS según las instrucciones
4. Espera a que se propague (puede tardar hasta 48 horas)

---

## Despliegue en Netlify

1. **Instala el adaptador de Netlify**
```bash
npm install -D @sveltejs/adapter-netlify
```

2. **Actualiza `svelte.config.js`**
```javascript
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter()
  }
};
```

3. **Build**
```bash
npm run build
```

4. **Sube a Netlify**
   - Ve a https://netlify.com
   - Arrastra la carpeta `build` o conecta con GitHub
   - Configura las variables de entorno en Site settings → Environment

---

## Despliegue en VPS Propio (Node.js)

### Usando PM2

1. **Instala Node.js en tu servidor**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Instala PM2**
```bash
sudo npm install -g pm2
```

3. **Sube tu código al servidor**
```bash
# En tu máquina local
git push origin main

# En tu servidor
git clone tu-repositorio
cd slpixelpage
npm install
```

4. **Crea archivo `.env` en el servidor**
```bash
nano .env
```
Pega tu configuración y guarda (Ctrl+X, Y, Enter)

5. **Build del proyecto**
```bash
npm run build
```

6. **Usa adapter-node**

Instala el adaptador:
```bash
npm install -D @sveltejs/adapter-node
```

Actualiza `svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-node';

export default {
  kit: {
    adapter: adapter()
  }
};
```

Rebuild:
```bash
npm run build
```

7. **Inicia con PM2**
```bash
pm2 start build/index.js --name slpixel
pm2 save
pm2 startup
```

8. **Configura Nginx como reverse proxy**
```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. **Configura SSL con Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com
```

---

## Despliegue en Docker

1. **Crea `Dockerfile`**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["node", "build"]
```

2. **Crea `docker-compose.yml`**
```yaml
version: '3.8'
services:
  slpixel:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

3. **Build y run**
```bash
docker-compose up -d
```

---

## Checklist Pre-Despliegue

Antes de desplegar a producción, verifica:

- [ ] Las variables de entorno están configuradas correctamente
- [ ] El correo de destino es `slpixelstudio@gmail.com`
- [ ] Los logos están en la carpeta `static/Logos/`
- [ ] Probaste el envío de correos en local
- [ ] Actualizaste los textos y descripciones
- [ ] Configuraste los paquetes reales en la galería
- [ ] El sitio es responsivo en móvil
- [ ] No hay errores en la consola del navegador
- [ ] El `.env` NO está subido a Git

---

## Post-Despliegue

### Pruebas

1. Abre tu sitio en producción
2. Navega a la galería
3. Solicita un paquete con un email de prueba
4. Verifica que llegue el correo a `slpixelstudio@gmail.com`
5. Prueba en móvil y desktop

### Monitoreo

Con Vercel:
- Dashboard → Analytics (tráfico)
- Dashboard → Logs (errores)

Con PM2:
- `pm2 logs slpixel`
- `pm2 monit`

### Updates

Para actualizar el sitio:

**En Vercel:** Solo haz `git push` y se desplegará automáticamente

**En VPS:**
```bash
git pull
npm install
npm run build
pm2 restart slpixel
```

---

## Solución de Problemas en Producción

### Los correos no se envían en producción

**Causa:** Variables de entorno no configuradas

**Solución:**
1. Verifica que las 4 variables estén en Vercel/Netlify
2. Asegúrate de aplicarlas a "Production"
3. Redespliega el sitio

### Error 500 en el endpoint `/api/solicitar`

**Causa:** Error al conectar con el servidor SMTP

**Solución:**
1. Verifica los logs en Vercel Dashboard
2. Confirma que `EMAIL_USER` y `EMAIL_PASS` sean correctos
3. Prueba cambiando `EMAIL_PORT` de 587 a 465

### El sitio carga pero las rutas no funcionan

**Causa:** Configuración incorrecta del adaptador

**Solución:**
1. Verifica que uses el adaptador correcto para tu plataforma
2. En Vercel, debe ser `adapter-auto` o `adapter-vercel`
3. Rebuild y redespliega

---

¿Necesitas más ayuda? Contacta al equipo de soporte de tu plataforma:
- Vercel: https://vercel.com/support
- Netlify: https://www.netlify.com/support/

