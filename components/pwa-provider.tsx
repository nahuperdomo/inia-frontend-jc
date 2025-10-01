"use client";

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

// Componente para registrar el Service Worker
export default function PWAProvider({
    children
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        // Registramos el Service Worker siempre que esté soportado (desarrollo o producción)
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator
        ) {
            const wb = new Workbox('/sw.js');

            // Lógica para actualización de contenido
            wb.addEventListener('installed', (event) => {
                console.log(`PWA instalada: ${event.isUpdate ? 'actualización' : 'nueva instalación'}`);
            });

            // Notificar al usuario cuando hay una nueva versión disponible
            wb.addEventListener('waiting', (event) => {
                // Aquí podrías mostrar un diálogo al usuario para actualizar
                if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
                    wb.messageSkipWaiting();
                    window.location.reload();
                }
            });

            // Cuando el service worker toma el control, recargar para asegurarse de que el nuevo SW está activo
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });

            // Registrar el service worker
            wb.register().catch(error => console.error('Error al registrar el service worker:', error));

            console.log('Service Worker registrado correctamente');
        }
    }, []);

    return <>{children}</>;
};