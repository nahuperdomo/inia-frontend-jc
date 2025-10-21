"use client"

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// VAPID Public Key - Debe coincidir con la del backend
// IMPORTANTE: Reemplaza esto con tu VAPID public key real
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

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

/**
 * Hook para manejar notificaciones push en la PWA
 * 
 * Features:
 * - Detecta soporte del navegador
 * - Solicita permisos de notificación
 * - Suscribe/desuscribe del servicio push
 * - Sincroniza con el backend
 */
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

        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    // Verificar si ya está suscrito
    const checkSubscription = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription:', error);
            setIsSubscribed(false);
        }
    }, []);

    /**
     * Solicitar permisos de notificación
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            toast.error('Tu navegador no soporta notificaciones push');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                toast.success('Permisos de notificación concedidos');
                // Automáticamente suscribir después de obtener permisos
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
            console.error('Error requesting permission:', error);
            toast.error('Error al solicitar permisos');
            return false;
        }
    }, [isSupported]);

    /**
     * Convertir VAPID key de base64 a Uint8Array
     */
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

    /**
     * Suscribir al servicio push
     */
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
            // Esperar a que el service worker esté listo
            const registration = await navigator.serviceWorker.ready;

            // Suscribir al push manager
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
            });

            // Enviar suscripción al backend
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(subscription.toJSON()),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Error al guardar suscripción en el servidor');
            }

            setIsSubscribed(true);
            toast.success('Notificaciones push activadas');

            console.log('✅ Push subscription successful:', subscription);
        } catch (error) {
            console.error('Error subscribing to push:', error);
            toast.error('Error al activar notificaciones push');
            setIsSubscribed(false);
        } finally {
            setLoading(false);
        }
    }, [isSupported]);

    /**
     * Desuscribir del servicio push
     */
    const unsubscribe = useCallback(async (): Promise<void> => {
        if (!isSupported) return;

        setLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Desuscribir del push manager
                await subscription.unsubscribe();

                // Notificar al backend
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    credentials: 'include',
                });

                setIsSubscribed(false);
                toast.success('Notificaciones push desactivadas');

                console.log('✅ Push unsubscription successful');
            }
        } catch (error) {
            console.error('Error unsubscribing from push:', error);
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
