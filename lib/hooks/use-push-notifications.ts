// lib/hooks/use-push-notifications.ts

"use client"

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BIA_X-nLqRSqPcqMsa8Imn3XHgamqRNeEZHeCwbx8YfXw_9oIwWRjeLzN6n_C-G-EDqL6SH_A4WOLnKf0jUM7so';

interface UsePushNotificationsReturn {
    isSupported: boolean;
    isSubscribed: boolean;
    isPermissionGranted: boolean;
    permission: NotificationPermission | null;
    requestPermission: () => Promise<boolean>;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
    loading: boolean;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [isSupported, setIsSupported] = useState<boolean>(false);
    const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
    const [permission, setPermission] = useState<NotificationPermission | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Verificar soporte del navegador
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const supported =
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window;

        console.log('🔍 [Hook] Push notifications supported:', supported);
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
            waitForServiceWorker();
        }
    }, []);

    // Esperar a que el Service Worker esté activo CON TIMEOUT
    const waitForServiceWorker = async () => {
        console.log('⏳ [Hook] Esperando a que Service Worker esté activo...');

        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Service Worker timeout después de 10 segundos'));
                }, 10000);
            });

            const swPromise = navigator.serviceWorker.ready;
            await Promise.race([swPromise, timeoutPromise]);

            console.log('✅ [Hook] Service Worker está ready');

            // Esperar un poco más para asegurar
            await new Promise(resolve => setTimeout(resolve, 500));

            await checkSubscription();
        } catch (error) {
            console.error('❌ [Hook] Error esperando Service Worker:', error);

            if (error instanceof Error && error.message.includes('timeout')) {
                console.error('⚠️ [Hook] El Service Worker no se activó a tiempo');
                console.error('💡 [Hook] Intenta recargar la página (Ctrl+Shift+R)');
                toast.error('El Service Worker tardó demasiado. Recarga la página.');
            }

            setIsSubscribed(false);
        }
    };

    // Verificar si ya está suscrito
    const checkSubscription = useCallback(async () => {
        try {
            console.log('🔍 [Hook] Verificando suscripción existente...');

            const registration = await navigator.serviceWorker.ready;
            console.log('✅ [Hook] Registration obtenida:', registration.scope);

            const subscription = await registration.pushManager.getSubscription();
            const subscribed = !!subscription;

            console.log('📊 [Hook] Estado de suscripción:', subscribed ? 'Activa ✅' : 'No activa ❌');

            if (subscription) {
                console.log('📝 [Hook] Detalles de suscripción:', {
                    endpoint: subscription.endpoint.substring(0, 50) + '...',
                    expirationTime: subscription.expirationTime
                });
            }

            setIsSubscribed(subscribed);
        } catch (error) {
            console.error('❌ [Hook] Error verificando suscripción:', error);
            setIsSubscribed(false);
        }
    }, []);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            toast.error('Tu navegador no soporta notificaciones push');
            return false;
        }

        try {
            console.log('🔔 [Hook] Solicitando permisos...');
            const result = await Notification.requestPermission();
            console.log('📋 [Hook] Resultado permisos:', result);

            setPermission(result);

            if (result === 'granted') {
                toast.success('Permisos de notificación concedidos');
                await subscribe();
                return true;
            } else if (result === 'denied') {
                toast.error('Permisos de notificación denegados');
                return false;
            } else {
                toast.info('Permisos de notificación pendientes');
                return false;
            }
        } catch (error) {
            console.error('❌ [Hook] Error requesting permission:', error);
            toast.error('Error al solicitar permisos');
            return false;
        }
    }, [isSupported]);

    const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = useCallback(async (): Promise<void> => {
        if (!isSupported) {
            toast.error('Tu navegador no soporta notificaciones push');
            return;
        }

        if (Notification.permission !== 'granted') {
            toast.warning('Primero debes conceder permisos de notificación');
            return;
        }

        setLoading(true);

        try {
            console.log('📝 [Hook] Iniciando suscripción...');

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout esperando Service Worker')), 10000);
            });

            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                timeoutPromise
            ]) as ServiceWorkerRegistration;

            console.log('✅ [Hook] Service Worker listo para suscripción');

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
            });

            console.log('✅ [Hook] Suscripción local creada');
            console.log('📍 [Hook] Endpoint:', subscription.endpoint.substring(0, 50) + '...');

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            console.log('🌐 [Hook] Enviando suscripción al backend:', API_BASE_URL);

            const response = await fetch(`${API_BASE_URL}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify(subscription.toJSON()),
                // ❌ QUITADO: credentials: 'include' - causa problemas con CORS cross-domain
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [Hook] Error del servidor:', errorText);
                throw new Error('Error al guardar suscripción en el servidor');
            }

            console.log('✅ [Hook] Respuesta del backend:', response.status);

            setIsSubscribed(true);
            toast.success('✅ Notificaciones push activadas');

            console.log('🎉 [Hook] Suscripción completada exitosamente');
        } catch (error) {
            console.error('❌ [Hook] Error subscribing to push:', error);

            if (error instanceof Error && error.message.includes('Timeout')) {
                toast.error('Service Worker no responde. Recarga la página e intenta de nuevo.');
            } else {
                toast.error('Error al activar notificaciones push');
            }

            setIsSubscribed(false);
        } finally {
            setLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!isSupported) return;

        setLoading(true);

        try {
            console.log('🗑️ [Hook] Desuscribiendo...');

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const endpoint = subscription.endpoint;

                // Primero desuscribir localmente
                await subscription.unsubscribe();
                console.log('✅ [Hook] Suscripción local eliminada');

                // Luego notificar al backend
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

                const response = await fetch(`${API_BASE_URL}/api/push/unsubscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({ endpoint }),
                    // ❌ QUITADO: credentials: 'include'
                });

                if (response.ok) {
                    console.log('✅ [Hook] Backend notificado');
                } else {
                    console.warn('⚠️ [Hook] Error notificando al backend, pero desuscripción local exitosa');
                }

                setIsSubscribed(false);
                toast.success('Notificaciones push desactivadas');

                console.log('✅ [Hook] Desuscripción completada');
            }
        } catch (error) {
            console.error('❌ [Hook] Error unsubscribing from push:', error);
            toast.error('Error al desactivar notificaciones push');
        } finally {
            setLoading(false);
        }
    }, [isSupported]);

    return {
        isSupported,
        isSubscribed,
        isPermissionGranted: permission === 'granted',
        permission,
        requestPermission,
        subscribe,
        unsubscribe,
        loading,
    };
}