// Este archivo desactiva cualquier service worker existente
// y evita que se registren nuevos service workers

// Comprobar si estamos en el navegador y si service workers están soportados
if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    // Desregistrar cualquier service worker existente
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            registration.unregister();
            console.log('Service Worker desregistrado con éxito');
        }
    }).catch(err => {
        console.error('Error al desregistrar service workers:', err);
    });

    // Prevenir que el navegador registre service workers automáticamente
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        return false;
    });
}