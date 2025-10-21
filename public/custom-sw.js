// Custom Service Worker para INIA PWA
// Este archivo maneja notificaciones push y eventos en segundo plano

// Importar Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

// ==============================================
// CONFIGURACIÓN DE CACHÉ (desde next-pwa)
// ==============================================

workbox.core.skipWaiting();
workbox.core.clientsClaim();

// Caché para API requests
workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutos
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// Caché para archivos estáticos
workbox.routing.registerRoute(
    ({ request }) => request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'document',
    new StaleWhileRevalidate({
        cacheName: 'static-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
            }),
        ],
    })
);

// Caché para imágenes
workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
            }),
        ],
    })
);

// ==============================================
// EVENTOS DE PUSH NOTIFICATIONS
// ==============================================

/**
 * Evento PUSH - Se ejecuta cuando llega una notificación del servidor
 * Este evento funciona INCLUSO cuando la app está cerrada
 */
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push recibido', event);

    // Datos por defecto si no hay payload
    let notificationData = {
        title: 'Sistema INIA',
        body: 'Tienes una nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'default',
        data: {
            url: '/notificaciones',
        },
    };

    // Si hay datos en el push, parsearlos
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                icon: payload.icon || notificationData.icon,
                badge: payload.badge || notificationData.badge,
                tag: payload.tag || `notif-${Date.now()}`,
                image: payload.image,
                data: {
                    url: payload.url || payload.data?.url || '/notificaciones',
                    notificationId: payload.notificationId,
                    ...payload.data,
                },
                actions: payload.actions || [
                    {
                        action: 'open',
                        title: 'Ver',
                    },
                    {
                        action: 'close',
                        title: 'Cerrar',
                    },
                ],
                requireInteraction: payload.requireInteraction || false,
                silent: payload.silent || false,
                vibrate: payload.vibrate || [200, 100, 200],
            };
        } catch (error) {
            console.error('[Service Worker] Error parsing push data:', error);
        }
    }

    // Mostrar la notificación
    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            image: notificationData.image,
            data: notificationData.data,
            actions: notificationData.actions,
            requireInteraction: notificationData.requireInteraction,
            silent: notificationData.silent,
            vibrate: notificationData.vibrate,
        })
    );
});

/**
 * Evento NOTIFICATIONCLICK - Se ejecuta cuando el usuario hace clic en la notificación
 */
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click:', event);

    event.notification.close(); // Cerrar la notificación

    const urlToOpen = event.notification.data?.url || '/notificaciones';
    const notificationId = event.notification.data?.notificationId;

    // Manejar acciones específicas
    if (event.action) {
        console.log('[Service Worker] Action clicked:', event.action);

        if (event.action === 'close') {
            // Solo cerrar la notificación
            return;
        }

        // Otras acciones personalizadas
        if (event.action === 'view') {
            // Abrir URL específica
        } else if (event.action === 'dismiss') {
            // Marcar como leída sin abrir
            if (notificationId) {
                fetch(`/api/notificaciones/${notificationId}/marcar-leida`, {
                    method: 'PUT',
                    credentials: 'include',
                }).catch(error => {
                    console.error('Error marking notification as read:', error);
                });
            }
            return;
        }
    }

    // Abrir o enfocar una ventana de la app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Buscar si ya hay una ventana abierta
                for (let client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        // Si la ventana ya está abierta, enfocarla y navegar
                        return client.focus().then(client => {
                            if ('navigate' in client) {
                                return client.navigate(urlToOpen);
                            }
                        });
                    }
                }

                // Si no hay ventana abierta, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .then(() => {
                // Marcar notificación como leída
                if (notificationId) {
                    return fetch(`/api/notificaciones/${notificationId}/marcar-leida`, {
                        method: 'PUT',
                        credentials: 'include',
                    });
                }
            })
            .catch(error => {
                console.error('[Service Worker] Error handling notification click:', error);
            })
    );
});

/**
 * Evento NOTIFICATIONCLOSE - Se ejecuta cuando se cierra una notificación
 */
self.addEventListener('notificationclose', function (event) {
    console.log('[Service Worker] Notification closed:', event);

    // Opcional: Registrar que la notificación fue cerrada sin interacción
    // Útil para analytics
    const notificationId = event.notification.data?.notificationId;
    if (notificationId) {
        // Puedes enviar analytics o logs aquí
    }
});

/**
 * Evento MESSAGE - Para comunicación entre la app y el service worker
 */
self.addEventListener('message', function (event) {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: '1.0.0' });
    }

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        self.registration.showNotification(
            event.data.title,
            event.data.options
        );
    }
});

/**
 * Evento SYNC - Para sincronización en segundo plano (Background Sync)
 * Útil para enviar datos cuando se recupera la conexión
 */
self.addEventListener('sync', function (event) {
    console.log('[Service Worker] Sync event:', event.tag);

    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            // Sincronizar notificaciones pendientes
            fetch('/api/notificaciones/mis-notificaciones/no-leidas', {
                credentials: 'include',
            })
                .then(response => response.json())
                .then(notifications => {
                    console.log('[Service Worker] Synced notifications:', notifications.length);
                })
                .catch(error => {
                    console.error('[Service Worker] Error syncing:', error);
                })
        );
    }
});

/**
 * Evento PUSHSUBSCRIPTIONCHANGE - Se ejecuta cuando la suscripción cambia
 */
self.addEventListener('pushsubscriptionchange', function (event) {
    console.log('[Service Worker] Push subscription changed');

    event.waitUntil(
        // Re-suscribir automáticamente
        self.registration.pushManager.subscribe(event.oldSubscription.options)
            .then(function (subscription) {
                // Enviar nueva suscripción al servidor
                return fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(subscription.toJSON()),
                    credentials: 'include',
                });
            })
            .catch(error => {
                console.error('[Service Worker] Error re-subscribing:', error);
            })
    );
});

console.log('[Service Worker] INIA Custom Service Worker loaded');
