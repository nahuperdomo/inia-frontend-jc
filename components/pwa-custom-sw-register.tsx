'use client';

import { useEffect } from 'react';

export function PWACustomSWRegister() {
    useEffect(() => {
        console.log('🎬 [PWA] Componente montado');

        if (typeof window === 'undefined') {
            console.log('⚠️ [PWA] Window no definido (SSR)');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            console.error('❌ [PWA] Service Workers no soportados');
            return;
        }

        // Función para registrar el SW
        const registerSW = async () => {
            try {
                console.log('🔧 [PWA] Registrando Service Worker...');

                // Primero, desregistrar cualquier SW antiguo si existe
                const registrations = await navigator.serviceWorker.getRegistrations();
                console.log(`📋 [PWA] Service Workers existentes: ${registrations.length}`);

                const registration = await navigator.serviceWorker.register('/custom-sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                console.log('✅ [PWA] Service Worker registrado');
                console.log('📍 [PWA] Scope:', registration.scope);
                console.log('📊 [PWA] Estado:', {
                    installing: !!registration.installing,
                    waiting: !!registration.waiting,
                    active: !!registration.active
                });

                // Manejar diferentes estados del SW
                if (registration.installing) {
                    console.log('⏳ [PWA] SW instalando...');
                    trackSWState(registration.installing);
                } else if (registration.waiting) {
                    console.log('⏳ [PWA] SW esperando activación...');
                    trackSWState(registration.waiting);
                } else if (registration.active) {
                    console.log('✅ [PWA] SW ya está activo');
                }

                // Verificar si ya hay un controlador
                if (navigator.serviceWorker.controller) {
                    console.log('✅ [PWA] Página controlada por SW');
                } else {
                    console.log('⚠️ [PWA] Página aún no controlada por SW');
                }

                // Esperar a que esté completamente listo
                await navigator.serviceWorker.ready;
                console.log('✅ [PWA] Service Worker completamente listo para notificaciones push');

                // Verificar soporte de Push API
                if ('PushManager' in window) {
                    console.log('✅ [PWA] Push API soportada');

                    // Verificar permisos
                    console.log('🔔 [PWA] Permiso de notificaciones:', Notification.permission);
                } else {
                    console.error('❌ [PWA] Push API no soportada');
                }

            } catch (error) {
                console.error('❌ [PWA] Error registrando SW:', error);

                // Detalles adicionales del error
                if (error instanceof Error) {
                    console.error('📝 [PWA] Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                }
            }
        };

        // Función para rastrear cambios de estado del SW
        function trackSWState(worker: ServiceWorker) {
            worker.addEventListener('statechange', function () {
                console.log('🔄 [PWA] Estado del SW cambió a:', this.state);

                if (this.state === 'activated') {
                    console.log('✅ [PWA] SW activado completamente');

                    // Si no hay controlador, sugerir recarga
                    if (!navigator.serviceWorker.controller) {
                        console.log('💡 [PWA] Se recomienda recargar la página para activar el control');

                        // Opcional: recargar automáticamente (descomenta si lo deseas)
                        // console.log('🔄 [PWA] Recargando automáticamente...');
                        // window.location.reload();
                    }
                }
            });
        }

        // Escuchar mensajes del Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('📨 [PWA] Mensaje del SW:', event.data);
        });

        // Escuchar cambios en el controlador
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 [PWA] Controlador del SW cambió');
        });

        // Registrar el SW cuando el documento esté listo
        if (document.readyState === 'complete') {
            registerSW();
        } else {
            window.addEventListener('load', registerSW);
        }

        // Cleanup
        return () => {
            console.log('🧹 [PWA] Componente desmontado');
        };
    }, []);

    return null;
}