# Guía Rápida de PWA para Desarrolladores

##  Quick Start

### Instalación de Dependencias
```bash
npm install
```

Las dependencias de PWA ya están incluidas en `package.json`:
- `next-pwa`
- `workbox-webpack-plugin`

### Desarrollo Local
```bash
npm run dev
```

**Nota**: La PWA está deshabilitada en modo desarrollo para mejor DX.

### Testear PWA Localmente
```bash
npm run build
npm start
```

Abre `http://localhost:3000` y verifica en DevTools (Application tab).

##  Estructura de Archivos PWA

```
inia-frontend-jc/
├── public/
│   ├── manifest.json          # Configuración de la PWA
│   ├── icons/                 # Iconos de la app
│   │   ├── icon-72x72.png
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── sw.js                  # Service Worker (generado automáticamente)
│   └── workbox-*.js           # Archivos de Workbox (generados)
├── app/
│   ├── layout.tsx             # Meta tags PWA
│   └── offline/
│       └── page.tsx           # Página offline
├── components/
│   ├── pwa-install.tsx        # Banner de instalación
│   └── network-status.tsx     # Indicador de conexión
├── lib/
│   └── hooks/
│       └── use-online-status.ts  # Hook para detectar conexión
├── next.config.mjs            # Configuración PWA
└── docs/
    └── PWA_IMPLEMENTATION.md  # Documentación completa
```

## ️ Configuración Principal

### next.config.mjs
```javascript
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ...
});
```

### manifest.json
```json
{
  "name": "INIA - Sistema de Análisis de Semillas",
  "short_name": "INIA",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0066cc"
}
```

## ️ Desarrollo

### Agregar Nueva Estrategia de Caché

Edita `next.config.mjs` en la sección `runtimeCaching`:

```javascript
runtimeCaching: [
  {
    urlPattern: /\/tu-ruta\/.*/,
    handler: 'NetworkFirst', // o 'CacheFirst', 'StaleWhileRevalidate'
    options: {
      cacheName: 'tu-cache-name',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 300,
      },
    },
  },
]
```

### Handlers Disponibles

1. **NetworkFirst**: Intenta red primero, fallback a caché
   - Uso: APIs, datos dinámicos
   
2. **CacheFirst**: Usa caché si existe, sino red
   - Uso: Imágenes, fuentes, assets estáticos
   
3. **StaleWhileRevalidate**: Usa caché mientras actualiza en background
   - Uso: CSS, JS, archivos que cambian ocasionalmente

4. **NetworkOnly**: Solo red, sin caché
   - Uso: Datos sensibles, tiempo real

5. **CacheOnly**: Solo caché
   - Uso: Assets precacheados

### Usar el Hook de Online Status

```tsx
import { useOnlineStatus } from '@/lib/hooks/use-online-status'

function MyComponent() {
  const isOnline = useOnlineStatus()
  
  if (!isOnline) {
    return <div>Modo Offline</div>
  }
  
  return <div>Conectado</div>
}
```

### Componente de Instalación PWA

```tsx
import { PWAInstallButton } from '@/components/pwa-install'

function MyComponent() {
  return (
    <div>
      <PWAInstallButton />
    </div>
  )
}
```

##  Personalización

### Cambiar Iconos

1. Crea iconos en estos tamaños:
   - 72x72, 96x96, 128x128, 144x144
   - 152x152, 192x192, 384x384, 512x512

2. Usa herramientas:
   - [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)

3. Reemplaza en `/public/icons/`

### Cambiar Tema de Color

1. Edita `manifest.json`:
```json
{
  "theme_color": "#tuColor",
  "background_color": "#tuColor"
}
```

2. Actualiza en `app/layout.tsx`:
```tsx
export const viewport: Viewport = {
  themeColor: '#tuColor',
}
```

### Agregar Shortcuts

Edita `manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Nuevo Análisis",
      "url": "/registro/analisis",
      "icons": [{ "src": "/icons/icon-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

##  Debugging

### Ver Service Worker
1. Abrir DevTools (F12)
2. Application → Service Workers
3. Ver estado: "activated and running"

### Ver Caché
1. DevTools → Application → Cache Storage
2. Ver: api-cache, static-cache, image-cache

### Simular Offline
1. DevTools → Network tab
2. Throttling dropdown → "Offline"

### Limpiar Todo
```javascript
// En la consola del navegador
await caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})

navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})
```

##  Testing

### Checklist de Pruebas

- [ ] App se instala correctamente
- [ ] Funciona offline (al menos parcialmente)
- [ ] Iconos se muestran correctamente
- [ ] Service Worker se registra sin errores
- [ ] Caché funciona según estrategia
- [ ] Página offline se muestra cuando corresponde
- [ ] Banner de instalación aparece
- [ ] Theme color correcto en la barra de navegación

### Lighthouse Audit

```bash
npm run build
npm start
```

1. Abrir Chrome DevTools
2. Lighthouse tab
3. Seleccionar "Progressive Web App"
4. Run audit

Objetivo: Score > 90

##  Build & Deploy

### Build para Producción
```bash
npm run build
```

Genera:
- `/public/sw.js`
- `/public/workbox-*.js`
- Archivos optimizados en `/.next/`

### Deploy

#### Vercel
```bash
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Verificar Deploy

1. Visitar el sitio
2. DevTools → Application
3. Verificar Manifest y Service Worker
4. Probar instalación

##  Seguridad

### HTTPS Requerido
Service Workers **requieren HTTPS** en producción.

Excepciones:
- `localhost` (desarrollo)
- `127.0.0.1`

### Cors y API
Si tu API está en diferente dominio:

```javascript
// En tu API backend
headers: {
  'Access-Control-Allow-Origin': 'https://tu-dominio.com',
  'Access-Control-Allow-Credentials': 'true',
}
```

##  Performance

### Precargar Rutas Críticas
```javascript
// En next.config.mjs
buildExcludes: [/middleware-manifest\.json$/],
```

### Lazy Load Components
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Cargando...</p>
})
```

### Optimizar Imágenes
```tsx
import Image from 'next/image'

<Image 
  src="/path/to/image.png"
  width={500}
  height={300}
  alt="Description"
/>
```

##  Recursos Útiles

- [Next-PWA Docs](https://github.com/shadowwalker/next-pwa)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)

## 🆘 Problemas Comunes

### SW no se registra
```bash
# Verificar que next-pwa está instalado
npm list next-pwa

# Reinstalar si es necesario
npm install next-pwa --save
```

### Cambios no se reflejan
```bash
# Limpiar caché de Next.js
rm -rf .next

# Rebuild
npm run build
npm start
```

### Error en producción
```bash
# Verificar logs del Service Worker
# DevTools → Console → Filtrar por "sw.js"
```

##  Best Practices

1. **Siempre testear en producción** antes de deploy
2. **Versionar el Service Worker** si haces cambios manuales
3. **No cachear datos sensibles** (tokens, passwords)
4. **Usar Network First para APIs** críticas
5. **Documentar cambios** en estrategias de caché
6. **Monitorear tamaño del caché** (límite ~50-100MB)
7. **Limpiar caché viejo** regularmente

##  Tips

- Usa `skipWaiting: true` para forzar updates inmediatos
- Implementa analytics para medir uso offline
- Considera notificaciones push para engagement
- Prueba en diferentes dispositivos y navegadores
- Mantén los iconos optimizados (usa WebP cuando sea posible)

---

**¿Dudas?** Consulta la documentación completa en `docs/PWA_IMPLEMENTATION.md`