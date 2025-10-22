# 🚀 Inicio Rápido - Push Notifications

## Resumen de lo Implementado

✅ **Frontend:**
- Hook `usePushNotifications` para manejar suscripciones
- Componente `PushNotificationSetup` para UI de configuración
- Service Worker personalizado para recibir notificaciones
- API routes para comunicación con backend
- Documentación completa

✅ **Backend (por implementar):**
- Guía completa en `BACKEND_PUSH_IMPLEMENTATION.md`
- Código de ejemplo para Spring Boot
- Configuración VAPID
- Endpoints necesarios

## 📋 Checklist de Implementación

### Frontend (Ya Hecho ✅)

- [x] Hook `use-push-notifications.ts`
- [x] Componente `push-notification-setup.tsx`
- [x] Service Worker `custom-sw.js`
- [x] API routes (subscribe/unsubscribe/test)
- [x] Documentación completa

### Backend (Por Hacer 🔨)

- [ ] Generar VAPID keys
- [ ] Agregar dependencias Maven
- [ ] Crear entidad `PushSubscription`
- [ ] Crear repositorio
- [ ] Implementar `PushNotificationService`
- [ ] Crear `PushController`
- [ ] Integrar con sistema de notificaciones existente
- [ ] Migración de base de datos

### Configuración (Por Hacer ⚙️)

- [ ] Configurar variable `NEXT_PUBLIC_VAPID_PUBLIC_KEY` en `.env.local`
- [ ] Actualizar `next.config.mjs` si es necesario
- [ ] Configurar HTTPS (requerido para producción)

## 🎯 Uso Rápido

### 1. Agregar el componente en tu página de notificaciones

```tsx
// En app/notificaciones/page.tsx
import { PushNotificationSetup } from '@/components/push-notification-setup';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>Notificaciones</h1>
      
      {/* Componente de configuración de push */}
      <PushNotificationSetup />
      
      {/* Resto de tu página de notificaciones */}
    </div>
  );
}
```

### 2. O usar la versión compacta en settings

```tsx
// En cualquier página de configuración
import { PushNotificationSetup } from '@/components/push-notification-setup';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <h2>Preferencias de Notificaciones</h2>
      
      {/* Versión compacta (switch) */}
      <PushNotificationSetup compact />
    </div>
  );
}
```

### 3. Auto-solicitar permisos después de login

```tsx
// En tu NotificationProvider o después del login
import { usePushNotifications } from '@/lib/hooks/use-push-notifications';

export function NotificationProvider({ children }) {
  const { requestPermission, isSupported } = usePushNotifications();
  
  useEffect(() => {
    // Esperar un poco después del login para no ser intrusivo
    const timer = setTimeout(() => {
      if (isSupported) {
        requestPermission();
      }
    }, 3000); // 3 segundos después del login
    
    return () => clearTimeout(timer);
  }, [isSupported, requestPermission]);
  
  return <>{children}</>;
}
```

### 4. Enviar notificación desde el backend (después de implementar)

```java
// Ejemplo: Enviar notificación cuando se completa un análisis
@Service
public class AnalisisService {
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    public void completarAnalisis(Long analisisId) {
        Analisis analisis = analisisRepository.findById(analisisId);
        analisis.setEstado(EstadoAnalisis.COMPLETADO);
        analisisRepository.save(analisis);
        
        // Enviar push notification
        PushNotificationRequest notification = PushNotificationRequest.builder()
            .title("Análisis Completado")
            .body("El análisis #" + analisisId + " ha finalizado")
            .url("/listado/analisis/germinacion/" + analisisId)
            .icon("/icons/icon-192x192.png")
            .tag("analisis-" + analisisId)
            .notificationId(analisisId)
            .actions(List.of(
                PushNotificationRequest.Action.builder()
                    .action("view")
                    .title("Ver Análisis")
                    .build(),
                PushNotificationRequest.Action.builder()
                    .action("dismiss")
                    .title("Cerrar")
                    .build()
            ))
            .build();
        
        pushNotificationService.sendPushNotificationToUser(
            analisis.getAnalista().getId(),
            notification
        );
    }
}
```

## 🧪 Testing en Local

### 1. Generar VAPID keys de prueba

```bash
npm install -g web-push
web-push generate-vapid-keys
```

### 2. Configurar en el frontend

Crea `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNg...tu-clave-publica...
```

### 3. Probar suscripción

1. Inicia sesión en la app
2. Ve a `/notificaciones`
3. Haz clic en "Activar Notificaciones"
4. Acepta los permisos del navegador

### 4. Enviar notificación de prueba

Opción A - Desde el componente (modo desarrollo):
```tsx
// Ya incluido en PushNotificationSetup
// Botón "Enviar Notificación de Prueba" visible solo en dev
```

Opción B - Desde DevTools:
```javascript
// En Console
const registration = await navigator.serviceWorker.ready;
registration.showNotification('Test', {
  body: 'Notificación de prueba',
  icon: '/icons/icon-192x192.png',
  badge: '/icons/icon-72x72.png',
  tag: 'test',
  data: { url: '/notificaciones' }
});
```

Opción C - Desde backend (después de implementar):
```bash
# POST /api/push/test
curl -X POST http://localhost:8080/api/push/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Prueba","body":"Test desde cURL"}'
```

## 📱 Testing en Móvil

### Android

1. Haz build de producción: `npm run build`
2. Inicia servidor: `npm start`
3. Accede desde tu Android (misma red WiFi): `http://TU_IP:3000`
4. Instala la PWA
5. Activa notificaciones
6. Cierra la app completamente
7. Envía una notificación de prueba desde el backend
8. ✅ Deberías recibir la notificación incluso con la app cerrada

### iOS

⚠️ **Limitado**: iOS solo soporta push en PWAs instaladas desde iOS 16.4+
- Funciona solo en apps instaladas (Add to Home Screen)
- No funciona en Safari normal

## 🐛 Troubleshooting

### "No se muestran notificaciones"

1. ✅ Verifica que estás en HTTPS (o localhost)
2. ✅ Confirma permisos del navegador
3. ✅ Revisa Console del Service Worker (DevTools → Application → Service Workers)
4. ✅ Verifica que el SW está activo y running

### "Error al suscribir"

1. ✅ VAPID key correcta en `.env.local`
2. ✅ Service Worker registrado correctamente
3. ✅ Backend respondiendo en `/api/push/subscribe`

### "Notificaciones no llegan en segundo plano"

1. ✅ Service Worker debe estar activo
2. ✅ PWA debe estar instalada (en algunos navegadores)
3. ✅ Revisa que el backend está enviando correctamente

## 📚 Documentación Completa

- **[PUSH_NOTIFICATIONS_GUIDE.md](./PUSH_NOTIFICATIONS_GUIDE.md)** - Guía completa con arquitectura y detalles
- **[BACKEND_PUSH_IMPLEMENTATION.md](../inia-backend/BACKEND_PUSH_IMPLEMENTATION.md)** - Implementación del backend
- **[PWA_IMPLEMENTATION.md](./PWA_IMPLEMENTATION.md)** - Documentación PWA existente

## ⚡ Próximos Pasos

1. **Implementar backend** siguiendo `BACKEND_PUSH_IMPLEMENTATION.md`
2. **Generar y configurar VAPID keys**
3. **Probar localmente** con notificaciones de prueba
4. **Integrar con sistema de notificaciones existente**
5. **Deploy a producción** con HTTPS configurado
6. **Monitorear** y ajustar según feedback de usuarios

## 💡 Tips

- **No solicites permisos inmediatamente**: Espera a que el usuario esté familiarizado con la app
- **Explica el beneficio**: Muestra por qué las notificaciones son útiles
- **Permite desactivar fácilmente**: Respeta la preferencia del usuario
- **No abuses**: Solo envía notificaciones relevantes e importantes
- **Personaliza**: Usa el nombre del usuario, detalles específicos
- **Testing exhaustivo**: Prueba en diferentes navegadores y dispositivos
