# PWA - Progressive Web App

## Implementación de PWA en INIA

Este documento describe la implementación de Progressive Web App (PWA) para el Sistema de Análisis de Semillas del INIA.

## ✨ Características Implementadas

### 1. **Manifest.json**
- Ubicación: `/public/manifest.json`
- Define metadatos de la aplicación:
  - Nombre de la app
  - Iconos en diferentes tamaños
  - Tema de colores
  - Modo de visualización (standalone)
  - Shortcuts (accesos directos)

### 2. **Service Worker**
- Configurado con `next-pwa`
- Estrategias de caché:
  - **NetworkFirst**: Para peticiones API (con fallback a caché)
  - **StaleWhileRevalidate**: Para archivos estáticos (JS, CSS, HTML)
  - **CacheFirst**: Para imágenes (PNG, JPG, SVG, etc.)

### 3. **Funcionalidad Offline**
- Página offline personalizada: `/app/offline/page.tsx`
- Caché de recursos críticos
- Notificación al usuario cuando no hay conexión

### 4. **Instalación de PWA**
- Banner de instalación personalizado
- Botón de instalación en la UI
- Componente: `/components/pwa-install.tsx`

### 5. **Iconos**
Tamaños disponibles:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152 (Apple)
- 192x192
- 384x384
- 512x512

Ubicación: `/public/icons/`

## 📱 Instalación para Usuarios

### En Android (Chrome/Edge):
1. Abre el sitio web
2. Toca el menú (⋮) → "Instalar aplicación" o "Agregar a pantalla de inicio"
3. Confirma la instalación

### En iOS (Safari):
1. Abre el sitio web
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma

### En Desktop (Chrome/Edge):
1. Abre el sitio web
2. Busca el icono de instalación (+) en la barra de direcciones
3. O usa el banner de instalación que aparece automáticamente

## 🔧 Configuración Técnica

### Next.js Config (`next.config.mjs`)
```javascript
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // ... estrategias de caché
});
```

### Estrategias de Caché

#### API Requests
```javascript
{
  urlPattern: /^http:\/\/localhost:8080\/api\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 300, // 5 minutos
    }
  }
}
```

#### Static Assets
```javascript
{
  urlPattern: /\.(?:js|css|html|json)$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 604800, // 7 días
    }
  }
}
```

#### Images
```javascript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'image-cache',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 2592000, // 30 días
    }
  }
}
```

## 🎨 Personalización

### Cambiar Colores del Tema
Edita `/public/manifest.json`:
```json
{
  "theme_color": "#0066cc",
  "background_color": "#ffffff"
}
```

### Cambiar Iconos
1. Crea iconos en los tamaños requeridos
2. Reemplaza los archivos en `/public/icons/`
3. Asegúrate de mantener los nombres y formatos

### Agregar Shortcuts
Edita la sección `shortcuts` en `/public/manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Nombre del Acceso",
      "short_name": "Acceso",
      "description": "Descripción",
      "url": "/ruta/destino",
      "icons": [...]
    }
  ]
}
```

## 🧪 Testing

### Modo Desarrollo
La PWA está **deshabilitada en desarrollo** para mejor experiencia de desarrollo (hot reload, etc.)

Para testear PWA en desarrollo:
1. Construye la aplicación: `npm run build`
2. Inicia en modo producción: `npm start`
3. Abre en navegador: `http://localhost:3000`

### Validación
Usa las DevTools de Chrome:
1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. Verifica:
   - Manifest
   - Service Workers
   - Cache Storage
   - Offline functionality

### Lighthouse Audit
1. Abre DevTools
2. Ve a "Lighthouse"
3. Selecciona "Progressive Web App"
4. Ejecuta audit

## 🚀 Deploy

### Vercel/Netlify
La PWA funciona automáticamente al hacer deploy.

### Docker
Asegúrate de:
1. Incluir `/public` en la imagen
2. Servir archivos estáticos correctamente
3. Usar HTTPS (requerido para Service Workers)

## 📊 Métricas

### Cache Hit Rate
Monitorea en la consola del navegador:
```javascript
// En DevTools → Application → Service Workers → Console
```

### Uso de Almacenamiento
```javascript
navigator.storage.estimate().then(estimate => {
  console.log(`Usado: ${estimate.usage}`);
  console.log(`Disponible: ${estimate.quota}`);
});
```

## ⚠️ Limitaciones

1. **Service Workers requieren HTTPS** (excepto localhost)
2. **iOS tiene limitaciones**:
   - No soporta algunas APIs
   - Límite de caché más restrictivo
   - No hay notificaciones push
3. **Caché limitado**: ~50MB en la mayoría de navegadores

## 🔄 Actualización de Service Worker

Cuando actualizas la app:
1. El SW se actualiza automáticamente
2. `skipWaiting: true` activa la nueva versión inmediatamente
3. Los usuarios ven cambios en la próxima recarga

### Forzar Actualización Manual
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.update();
    });
  });
}
```

## 📚 Recursos

- [Next-PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web App Manifest](https://web.dev/add-manifest/)

## 🐛 Troubleshooting

### Service Worker no se registra
1. Verifica que estás en HTTPS o localhost
2. Revisa la consola por errores
3. Verifica que `register: true` en config

### Caché no funciona
1. Limpia el caché: DevTools → Application → Clear storage
2. Verifica las estrategias de caché en `next.config.mjs`
3. Chequea Network tab para ver qué se está cacheando

### App no se instala
1. Verifica manifest.json es accesible
2. Asegúrate de tener todos los iconos
3. Usa Lighthouse para ver problemas específicos

## 📝 Mantenimiento

### Limpiar Caché Viejo
El Service Worker limpia automáticamente según las configuraciones de `maxEntries` y `maxAgeSeconds`.

### Monitoreo
Considera implementar:
- Analytics de uso offline
- Reportes de errores del SW
- Métricas de instalación