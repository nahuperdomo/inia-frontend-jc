# 🔔 Guía de Implementación de Notificaciones Push

## Descripción General

Esta guía detalla cómo implementar **notificaciones push** en la PWA del sistema INIA para recibir notificaciones incluso cuando la app está cerrada o en segundo plano.

## 📋 Requisitos Previos

1. ✅ PWA ya implementada (manifest.json + service worker)
2. ✅ HTTPS habilitado (requerido para push notifications)
3. ✅ Backend con soporte para Web Push (necesitarás VAPID keys)

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Frontend      │
│  (PWA Client)   │
└────────┬────────┘
         │ 1. Solicita permiso
         │ 2. Suscribe al push
         ▼
┌─────────────────┐
│ Service Worker  │
│  (Background)   │
└────────┬────────┘
         │ 3. Escucha eventos push
         ▼
┌─────────────────┐
│   Push Service  │
│ (Google/Mozilla)│
└────────┬────────┘
         ▲
         │ 4. Envía notificación
┌────────┴────────┐
│   Backend API   │
│  (Spring Boot)  │
└─────────────────┘
```

## 🚀 Pasos de Implementación

### Paso 1: Generar VAPID Keys (Backend)

Las VAPID keys son necesarias para autenticar las notificaciones push.

**En el backend (Spring Boot):**

```bash
# Instalar la librería
npm install -g web-push
web-push generate-vapid-keys
```

Guarda las claves generadas en tu `application.properties`:

```properties
# Push Notifications
push.vapid.public.key=BNg...
push.vapid.private.key=Abc...
push.vapid.subject=mailto:admin@inia.org.uy
```

### Paso 2: Crear Hook de Push Notifications (Frontend)

Archivo: `/lib/hooks/use-push-notifications.ts`

### Paso 3: Actualizar Service Worker

El service worker debe escuchar eventos `push` y mostrar notificaciones.

Archivo: `/public/custom-sw.js`

### Paso 4: Configurar Next.js para Custom Service Worker

Actualiza `next.config.mjs` para incluir tu service worker personalizado.

### Paso 5: Crear Componente de Suscripción

Crea un componente que solicite permisos y maneje la suscripción.

Archivo: `/components/push-notification-setup.tsx`

### Paso 6: Backend - Endpoints para Push

Tu backend necesita estos endpoints:

```java
// DTO para suscripción
public class PushSubscriptionDTO {
    private String endpoint;
    private Keys keys;
    
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}

// Controller
@PostMapping("/api/push/subscribe")
public ResponseEntity<?> subscribe(@RequestBody PushSubscriptionDTO subscription) {
    // Guardar suscripción en base de datos asociada al usuario
    pushService.savePushSubscription(getCurrentUserId(), subscription);
    return ResponseEntity.ok("Suscripción guardada");
}

@PostMapping("/api/push/unsubscribe")
public ResponseEntity<?> unsubscribe() {
    pushService.removePushSubscription(getCurrentUserId());
    return ResponseEntity.ok("Suscripción eliminada");
}

// Servicio para enviar notificaciones
@Service
public class PushNotificationService {
    
    @Autowired
    private PushSubscriptionRepository subscriptionRepository;
    
    public void sendNotificationToUser(Long userId, String title, String body, String url) {
        List<PushSubscription> subscriptions = subscriptionRepository.findByUserId(userId);
        
        for (PushSubscription sub : subscriptions) {
            sendPushNotification(sub, title, body, url);
        }
    }
    
    private void sendPushNotification(PushSubscription sub, String title, String body, String url) {
        // Usar librería web-push de Java
        // Ejemplo con nl.martijndwars:web-push
    }
}
```

### Paso 7: Integrar con Sistema de Notificaciones

Actualiza tu `NotificationProvider` para inicializar push:

```typescript
// En NotificationProvider.tsx
import { usePushNotifications } from '@/lib/hooks/use-push-notifications';

export function NotificationProvider({ children }: NotificationProviderProps) {
    const { requestPermission, isSupported } = usePushNotifications();
    
    useEffect(() => {
        // Solicitar permiso después de login
        if (isSupported) {
            requestPermission();
        }
    }, []);
    
    // ... resto del código
}
```

## 📱 Tipos de Notificaciones

### 1. Notificación Simple
```javascript
{
  title: "Nueva tarea asignada",
  body: "Se te ha asignado el análisis #1234",
  icon: "/icons/icon-192x192.png"
}
```

### 2. Notificación con Acción
```javascript
{
  title: "Análisis completado",
  body: "El análisis de germinación #1234 está listo",
  icon: "/icons/icon-192x192.png",
  actions: [
    { action: "view", title: "Ver Análisis" },
    { action: "dismiss", title: "Descartar" }
  ],
  data: {
    url: "/listado/analisis/germinacion/1234"
  }
}
```

### 3. Notificación con Imagen
```javascript
{
  title: "Reporte generado",
  body: "Tu reporte mensual está listo",
  icon: "/icons/icon-192x192.png",
  image: "/images/report-preview.png",
  badge: "/icons/badge-72x72.png"
}
```

## 🔐 Seguridad

### Permisos
- Las notificaciones requieren **permiso explícito** del usuario
- El permiso se puede revocar en cualquier momento desde el navegador
- Solo funciona en **contextos seguros** (HTTPS)

### Validación Backend
```java
// Validar que la suscripción pertenece al usuario autenticado
@PostMapping("/api/push/subscribe")
public ResponseEntity<?> subscribe(
    @RequestBody PushSubscriptionDTO subscription,
    @AuthenticationPrincipal UserDetails user
) {
    // Asociar suscripción al usuario actual
    Long userId = getCurrentUserId(user);
    pushService.savePushSubscription(userId, subscription);
    return ResponseEntity.ok("OK");
}
```

## 📊 Escenarios de Uso

### 1. Nueva Notificación en el Sistema
```java
// Backend - Cuando se crea una notificación
@Transactional
public void crearNotificacion(NotificacionDTO notif) {
    // Guardar en BD
    Notificacion saved = notificacionRepository.save(notif);
    
    // Enviar push al usuario
    pushService.sendNotificationToUser(
        notif.getUsuarioId(),
        notif.getTitulo(),
        notif.getMensaje(),
        "/notificaciones/" + saved.getId()
    );
}
```

### 2. Análisis Finalizado
```java
public void notificarAnalisisCompletado(Long analisisId) {
    Analisis analisis = analisisRepository.findById(analisisId);
    
    pushService.sendNotificationToUser(
        analisis.getAnalista().getId(),
        "Análisis completado",
        "El análisis #" + analisisId + " ha finalizado",
        "/listado/analisis/germinacion/" + analisisId
    );
}
```

### 3. Tarea Asignada
```java
public void notificarTareaAsignada(Long usuarioId, String tarea) {
    pushService.sendNotificationToUser(
        usuarioId,
        "Nueva tarea asignada",
        tarea,
        "/dashboard"
    );
}
```

## 🧪 Testing

### Test Manual
1. Abre la app en Chrome/Edge
2. Acepta los permisos de notificación
3. Cierra la app o ponla en segundo plano
4. Desde Postman/Backend, envía una notificación
5. Verifica que aparece incluso con la app cerrada

### Test con DevTools
```javascript
// En DevTools Console
navigator.serviceWorker.ready.then(registration => {
  registration.showNotification('Test', {
    body: 'Esta es una notificación de prueba',
    icon: '/icons/icon-192x192.png'
  });
});
```

### Simular Push Event
```javascript
// En Service Worker Console (DevTools → Application → Service Workers)
self.registration.showNotification('Test Push', {
  body: 'Simulación de push notification',
  icon: '/icons/icon-192x192.png',
  badge: '/icons/badge-72x72.png',
  tag: 'test',
  requireInteraction: false
});
```

## ⚠️ Limitaciones por Plataforma

### Android (Chrome/Edge)
✅ Soporte completo
✅ Notificaciones en background
✅ Acciones en notificaciones
✅ Imágenes y badges

### iOS (Safari)
❌ **NO soporta Web Push** (hasta iOS 16.4+)
⚠️ Soporte limitado en iOS 16.4+
- Solo en apps instaladas (Add to Home Screen)
- No funciona en Safari normal
- Limitaciones de funcionalidad

### Desktop (Chrome/Edge/Firefox)
✅ Soporte completo
✅ Notificaciones nativas del OS
✅ Todas las features

### Windows PWA
✅ Integración con Action Center
✅ Notificaciones persistentes

## 🔧 Troubleshooting

### Notificaciones no aparecen
1. ✅ Verifica permisos del navegador
2. ✅ Confirma que el service worker está activo
3. ✅ Revisa la consola del service worker
4. ✅ Verifica que estás en HTTPS

### Suscripción falla
1. ✅ VAPID public key correcta
2. ✅ Service worker registrado
3. ✅ Navegador soporta push

### Backend no puede enviar
1. ✅ VAPID keys configuradas
2. ✅ Suscripción guardada correctamente
3. ✅ Endpoint del push válido

## 📈 Mejores Prácticas

### 1. No Abusar
- Envía solo notificaciones relevantes
- Respeta la configuración del usuario
- Permite desactivar notificaciones

### 2. UX
- Solicita permiso en el momento apropiado (no inmediatamente)
- Explica por qué necesitas el permiso
- Ofrece opciones de personalización

### 3. Performance
- No envíes notificaciones masivas
- Agrupa notificaciones relacionadas
- Usa TTL (time-to-live) apropiado

### 4. Contenido
- Títulos claros y concisos
- Mensajes informativos
- URLs relevantes para acciones

## 🎯 Próximos Pasos

1. ✅ Implementar archivos del frontend (hooks, componentes)
2. ✅ Configurar backend (VAPID, endpoints, servicio)
3. ✅ Actualizar service worker para manejar push
4. ✅ Integrar con sistema de notificaciones existente
5. ✅ Testing exhaustivo
6. ✅ Deploy y monitoreo

## 📚 Recursos

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Push Libraries](https://github.com/web-push-libs)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)
- [Push Notifications Best Practices](https://web.dev/push-notifications-overview/)
