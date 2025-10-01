// Script para verificar entorno del navegador
// Este script se ejecuta en el navegador para proporcionar información de depuración
// y ayudar a diagnosticar problemas con Docker

(function () {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') return;

    console.log('=== Información del entorno ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Window objeto disponible:', typeof window !== 'undefined');
    console.log('Navigator objeto disponible:', typeof navigator !== 'undefined');
    console.log('Document objeto disponible:', typeof document !== 'undefined');
    console.log('ServiceWorker API disponible:',
        typeof navigator !== 'undefined' && 'serviceWorker' in navigator);

    // Verificar si hay service workers activos
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then(function (registrations) {
                console.log('Service Workers activos:', registrations.length);
                if (registrations.length > 0) {
                    console.log('Desregistrando Service Workers...');
                    Promise.all(registrations.map(reg => reg.unregister()))
                        .then(function () {
                            console.log('Todos los Service Workers han sido desregistrados');
                        });
                }
            })
            .catch(function (error) {
                console.error('Error al verificar Service Workers:', error);
            });
    }

    // Verificar carga de recursos
    window.addEventListener('load', function () {
        console.log('Página cargada completamente');
        console.log('=== Fin de información del entorno ===');
    });
})();