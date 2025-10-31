"use client"

import { useEffect, useRef, useCallback } from 'react';
import type { NotificacionDTO } from '@/app/models';

interface UseNotificationStreamOptions {
    enabled?: boolean; // 🔥 NUEVO: Habilitar/deshabilitar el hook
    onNotification?: (notification: NotificacionDTO) => void;
    onConnected?: () => void;
    onError?: (error: Event) => void;
    autoReconnect?: boolean;
    reconnectDelay?: number;
}

interface UseNotificationStreamReturn {
    isConnected: boolean;
    disconnect: () => void;
    reconnect: () => void;
}

/**
 * Hook para conexión SSE (Server-Sent Events) con notificaciones en tiempo real
 */
export function useNotificationStream(
    options: UseNotificationStreamOptions = {}
): UseNotificationStreamReturn {
    const {
        enabled = true, // 🔥 NUEVO: Por defecto habilitado
        onNotification,
        onConnected,
        onError,
        autoReconnect = true,
        reconnectDelay = 3000 // 3 segundos
    } = options;

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectedRef = useRef<boolean>(false);
    const reconnectAttemptsRef = useRef<number>(0);
    const maxReconnectAttempts = 5;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (eventSourceRef.current) {
            console.log('🔌 Desconectando SSE...');
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            isConnectedRef.current = false;
        }
    }, []);

    const connect = useCallback(() => {
        // Si ya hay una conexión activa, no crear otra
        if (eventSourceRef.current?.readyState === EventSource.OPEN) {
            console.log('✅ SSE ya conectado');
            return;
        }

        // Limpiar conexión anterior si existe
        disconnect();

        try {
            console.log('🔄 Conectando a SSE...');

            // Crear conexión SSE con credentials para enviar cookies (JSESSIONID)
            const eventSource = new EventSource(
                `${API_BASE_URL}/v1/notifications/stream`,
                { withCredentials: true }
            );

            eventSourceRef.current = eventSource;

            // Evento: Conexión establecida
            eventSource.addEventListener('connected', (event) => {
                console.log('✅ SSE Conectado:', event.data);
                isConnectedRef.current = true;
                reconnectAttemptsRef.current = 0; // Reset contador de reintentos
                onConnected?.();
            });

            // Evento: Nueva notificación
            eventSource.addEventListener('notification', (event) => {
                try {
                    const notification: NotificacionDTO = JSON.parse(event.data);
                    console.log('🔔 Nueva notificación SSE:', notification);
                    onNotification?.(notification);
                } catch (error) {
                    console.error('❌ Error al parsear notificación SSE:', error);
                }
            });

            // Evento: Heartbeat (mantener conexión viva)
            eventSource.addEventListener('heartbeat', (event) => {
                console.log('💓 Heartbeat SSE');
            });

            // Evento: Error de conexión
            eventSource.onerror = (error) => {
                console.error('❌ Error en SSE:', error);
                isConnectedRef.current = false;
                onError?.(error);

                // Auto-reconectar si está habilitado
                if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current += 1;
                    const delay = reconnectDelay * reconnectAttemptsRef.current;

                    console.log(
                        `🔄 Reintentando conexión SSE en ${delay}ms (intento ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
                    );

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.error('❌ Máximo de reintentos SSE alcanzado');
                    disconnect();
                }
            };

        } catch (error) {
            console.error('❌ Error al crear conexión SSE:', error);
            isConnectedRef.current = false;
        }
    }, [API_BASE_URL, onNotification, onConnected, onError, autoReconnect, reconnectDelay, disconnect]);

    // Conectar al montar el componente solo si está habilitado
    useEffect(() => {
        // 🔥 CRÍTICO: No conectar si el hook está deshabilitado
        if (!enabled) {
            console.log('🚫 SSE deshabilitado, no se conectará');
            return;
        }

        connect();

        // Cleanup al desmontar
        return () => {
            disconnect();
        };
    }, [enabled, connect, disconnect]);

    // Detectar visibilidad del tab para reconectar (solo si está habilitado)
    useEffect(() => {
        // 🔥 CRÍTICO: No configurar listener si está deshabilitado
        if (!enabled) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Si el tab vuelve a estar visible y no hay conexión, reconectar
                if (!isConnectedRef.current) {
                    console.log('👁️ Tab visible - Reconectando SSE');
                    reconnectAttemptsRef.current = 0; // Reset intentos
                    connect();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [enabled, connect]);

    return {
        isConnected: isConnectedRef.current,
        disconnect,
        reconnect: connect
    };
}
