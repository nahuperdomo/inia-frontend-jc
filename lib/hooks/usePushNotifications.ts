'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';

// Función auxiliar para convertir la clave VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface PushSubscriptionState {
    isSupported: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    error: string | null;
    permission: NotificationPermission;
}

interface UsePushNotificationsReturn extends PushSubscriptionState {
    requestPermission: () => Promise<boolean>;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    getSubscription: () => Promise<PushSubscription | null>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [state, setState] = useState<PushSubscriptionState>({
        isSupported: false,
        isSubscribed: false,
        isLoading: true,
        error: null,
        permission: 'default',
    });

    // Verificar si las notificaciones push están soportadas
    useEffect(() => {
        const checkSupport = async () => {
            const supported =
                'serviceWorker' in navigator &&
                'PushManager' in window &&
                'Notification' in window;

            setState(prev => ({
                ...prev,
                isSupported: supported,
                permission: supported ? Notification.permission : 'denied',
            }));

            if (supported) {
                await checkSubscriptionStatus();
            }

            setState(prev => ({ ...prev, isLoading: false }));
        };

        checkSupport();
    }, []);

    // Verificar el estado actual de la suscripción
    const checkSubscriptionStatus = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            setState(prev => ({
                ...prev,
                isSubscribed: subscription !== null,
            }));

            return subscription !== null;
        } catch (error) {
            console.error('Error al verificar estado de suscripción:', error);
            return false;
        }
    };

    // Solicitar permiso para notificaciones
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!state.isSupported) {
            setState(prev => ({
                ...prev,
                error: 'Las notificaciones push no están soportadas en este navegador'
            }));
            return false;
        }

        try {
            const permission = await Notification.requestPermission();

            setState(prev => ({
                ...prev,
                permission,
                error: permission === 'denied'
                    ? 'Permisos de notificación denegados'
                    : null,
            }));

            return permission === 'granted';
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            setState(prev => ({
                ...prev,
                error: 'Error al solicitar permisos de notificación'
            }));
            return false;
        }
    }, [state.isSupported]);

    // Obtener la suscripción actual
    const getSubscription = useCallback(async (): Promise<PushSubscription | null> => {
        try {
            const registration = await navigator.serviceWorker.ready;
            return await registration.pushManager.getSubscription();
        } catch (error) {
            console.error('Error al obtener suscripción:', error);
            return null;
        }
    }, []);

    // Suscribirse a notificaciones push
    const subscribe = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Verificar permisos
            if (Notification.permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    setState(prev => ({ ...prev, isLoading: false }));
                    return false;
                }
            }

            // Obtener la clave pública VAPID del servidor
            const response = await apiFetch<{ success: boolean; data: string }>(
                '/api/push/vapid-public-key'
            );

            if (!response.success || !response.data) {
                throw new Error('No se pudo obtener la clave pública VAPID');
            }

            const vapidPublicKey = response.data;

            // Registrar el service worker
            const registration = await navigator.serviceWorker.ready;

            // Crear la suscripción
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
            });

            // Enviar la suscripción al servidor
            const subscriptionObject = subscription.toJSON();

            await apiFetch('/api/push/subscribe', {
                method: 'POST',
                body: JSON.stringify({
                    endpoint: subscriptionObject.endpoint,
                    p256dh: subscriptionObject.keys?.p256dh || '',
                    auth: subscriptionObject.keys?.auth || '',
                    userAgent: navigator.userAgent,
                }),
            });

            setState(prev => ({
                ...prev,
                isSubscribed: true,
                isLoading: false,
                error: null,
            }));

            console.log('Suscripción a push notifications exitosa');
            return true;

        } catch (error: any) {
            console.error('Error al suscribirse:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Error al suscribirse a notificaciones push',
            }));
            return false;
        }
    }, [requestPermission]);

    // Desuscribirse de notificaciones push
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const subscription = await getSubscription();

            if (!subscription) {
                setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
                return true;
            }

            const subscriptionObject = subscription.toJSON();

            // Notificar al servidor
            if (subscriptionObject.endpoint) {
                await apiFetch(`/api/push/unsubscribe?endpoint=${encodeURIComponent(subscriptionObject.endpoint)}`, {
                    method: 'DELETE',
                });
            }

            // Desuscribirse localmente
            await subscription.unsubscribe();

            setState(prev => ({
                ...prev,
                isSubscribed: false,
                isLoading: false,
                error: null,
            }));

            console.log('Desuscripción exitosa');
            return true;

        } catch (error: any) {
            console.error('Error al desuscribirse:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Error al desuscribirse de notificaciones push',
            }));
            return false;
        }
    }, [getSubscription]);

    return {
        ...state,
        requestPermission,
        subscribe,
        unsubscribe,
        getSubscription,
    };
}
