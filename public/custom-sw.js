// Service Worker para PWA con notificaciones push
// Este archivo debe estar en la carpeta public/

const CACHE_NAME = 'inia-app-v1';
const urlsToCache = [
    '/',
    '/offline.html',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('✅ [SW] Service Worker instalado');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 [SW] Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('❌ [SW] Error al cachear:', error);
            })
    );

    // Activar inmediatamente
    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ [SW] Service Worker activado');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ [SW] Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // Tomar control inmediatamente
    return self.clients.claim();
});

// Manejo de fetch (estrategia Network First)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones que no son GET
    if (event.request.method !== 'GET') return;

    // Ignorar peticiones a APIs externas
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clonar la respuesta
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Si falla, intentar obtener del cache
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }

                        // Si es navegación, mostrar página offline
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

// ========================================
// NOTIFICACIONES PUSH
// ========================================

// Escuchar eventos push
self.addEventListener('push', (event) => {
    console.log('📬 [SW] Push recibido');

    let notificationData = {
        title: 'INIA - Notificación',
        body: 'Tienes una nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
            url: '/'
        }
    };

    // Intentar parsear el payload
    if (event.data) {
        try {
            const payload = event.data.json();
            console.log('📦 [SW] Payload recibido:', payload);

            notificationData = {
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                icon: payload.icon || notificationData.icon,
                badge: payload.badge || notificationData.badge,
                image: payload.image,
                tag: payload.tag || 'default-tag',
                requireInteraction: payload.requireInteraction || false,
                data: payload.data || notificationData.data,
                actions: payload.actions || []
            };
        } catch (error) {
            console.error('❌ [SW] Error parseando payload:', error);
            notificationData.body = event.data.text();
        }
    }

    // Mostrar la notificación
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            image: notificationData.image,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data,
            actions: notificationData.actions,
            vibrate: [200, 100, 200],
            timestamp: Date.now()
        })
    );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('👆 [SW] Click en notificación:', event.notification.tag);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }

                // Si no, abrir nueva ventana
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
    console.log('🔕 [SW] Notificación cerrada:', event.notification.tag);
});

// Mensaje de que el SW está listo
console.log('🚀 [SW] Service Worker cargado y listo para notificaciones push');