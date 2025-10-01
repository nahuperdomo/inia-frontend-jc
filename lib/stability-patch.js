// Parche de estabilidad para Next.js - Versión mejorada
// Este archivo soluciona errores comunes en entornos de Docker
// Optimizado para evitar errores de navegador vs. servidor

// Detectar entorno
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;

// SECCIÓN SERVIDOR: Crear objetos mínimos necesarios para el SSR
if (isServer) {
    // Proporcionar implementaciones mínimas para objetos del navegador en el servidor
    global.window = {};
    global.navigator = {};
    global.document = {
        querySelector: () => null,
        addEventListener: () => null,
        removeEventListener: () => null,
        getElementById: () => null,
        createElement: () => ({
            setAttribute: () => null,
            style: {}
        })
    };
    global.location = { pathname: '/', href: 'http://localhost' };
    global.localStorage = {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
    };
    global.sessionStorage = {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
    };

    // Métodos de consola mejorados para depuración
    console.debug('Ejecutando stability-patch.js en SERVIDOR');
}

// SECCIÓN NAVEGADOR: Mejorar estabilidad en cliente
if (isBrowser) {
    console.debug('Ejecutando stability-patch.js en NAVEGADOR');

    // Prevenir errores de hidratación
    window.__NEXT_HYDRATION_MARK_MS = Date.now();

    // Función para desactivar service workers de forma segura
    const safelyUnregisterServiceWorkers = () => {
        try {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations()
                    .then(registrations => {
                        registrations.forEach(registration => {
                            console.debug('Desregistrando service worker');
                            registration.unregister();
                        });
                    })
                    .catch(error => {
                        console.error('Error al desregistrar service workers:', error);
                    });
            }
        } catch (e) {
            console.error('Error al acceder a navigator.serviceWorker:', e);
        }
    };

    // Ejecutar desregistro de service workers
    safelyUnregisterServiceWorkers();

    // Desactivar PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        return false;
    });
}