// Custom Service Worker para Push Notifications
/* eslint-disable no-undef */

// Event listener para notificaciones push
self.addEventListener('push', function (event) {
    console.log('[Service Worker] Push recibido:', event);

    if (!event.data) {
        console.log('[Service Worker] Push sin datos');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[Service Worker] Datos del push:', data);

        const title = data.title || 'INIA Notificación';
        const options = {
            body: data.body || 'Nueva notificación',
            icon: data.icon || '/icons/icon-192x192.png',
            badge: data.badge || '/icons/badge-72x72.png',
            image: data.image,
            vibrate: [200, 100, 200],
            tag: data.analisisId ? `analisis-${data.analisisId}` : 'notification',
            requireInteraction: false,
            data: {
                url: data.url || '/',
                analisisId: data.analisisId,
                dateOfArrival: Date.now(),
            },
            actions: [
                {
                    action: 'open',
                    title: 'Abrir',
                    icon: '/icons/icon-96x96.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: '/icons/icon-96x96.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (error) {
        console.error('[Service Worker] Error al procesar push:', error);
    }
});

// Event listener para clicks en notificaciones
self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notificación clickeada:', event);

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Obtener la URL de destino
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Buscar si ya hay una ventana abierta
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus().then(() => {
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
    );
});

// Event listener para cerrar notificaciones
self.addEventListener('notificationclose', function (event) {
    console.log('[Service Worker] Notificación cerrada:', event.notification.tag);
});

// Event listener para cambios en la suscripción
self.addEventListener('pushsubscriptionchange', function (event) {
    console.log('[Service Worker] Suscripción push cambió');

    event.waitUntil(
        // Resubscribirse automáticamente
        self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            )
        }).then(function (subscription) {
            console.log('[Service Worker] Resuscripción exitosa');
            // Aquí deberías enviar la nueva suscripción al servidor
            return fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription)
            });
        })
    );
});

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

console.log('[Service Worker] Custom SW cargado con soporte para Push Notifications');
