// Parche de estabilidad para Next.js - Compatible con ES Modules
// Este archivo se utiliza en package.json como un script independiente

// Detectar entorno
const isServer = typeof window === 'undefined';
const isBrowser = !isServer;

// Polyfills y arreglos para el entorno de servidor
if (isServer) {
    console.log('Inicializando polyfills para entorno de servidor...');

    // Crear objetos globales para el servidor
    if (typeof global !== 'undefined') {
        // Objeto window vacío
        if (typeof global.window === 'undefined') {
            global.window = {};
        }

        // Objeto navigator vacío
        if (typeof global.navigator === 'undefined') {
            global.navigator = {};
        }

        // Objeto document con métodos simulados
        if (typeof global.document === 'undefined') {
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
        }

        // Otros objetos del navegador
        global.location = global.location || { pathname: '/', href: 'http://localhost' };
        global.localStorage = global.localStorage || {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null
        };
        global.sessionStorage = global.sessionStorage || {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null
        };

        console.log('Polyfills para servidor inicializados correctamente');
    }
}

// No necesitamos hacer nada especial para el navegador aquí,
// ya que eso se maneja con los scripts que se cargan en el navegador

export { };