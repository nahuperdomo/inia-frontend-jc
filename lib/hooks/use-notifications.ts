"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
    obtenerMisNotificaciones,
    obtenerMisNotificacionesNoLeidas,
    contarMisNotificacionesNoLeidas,
    marcarComoLeida,
    marcarTodasMisNotificacionesComoLeidas,
    eliminarNotificacion
} from '@/app/services/notificacion-service';
import type { NotificacionDTO, PaginatedNotificaciones } from '@/app/models/interfaces/notificacion';
import { useNotificationStream } from './useNotificationStream';

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    showToasts?: boolean;
    enableSmartPolling?: boolean; // Habilitar polling inteligente
    enableRealtime?: boolean; // 🔥 NUEVO: Habilitar SSE para tiempo real
}

interface UseNotificationsReturn {
    // Estado
    notifications: NotificacionDTO[];
    unreadNotifications: NotificacionDTO[];
    unreadCount: number;
    loading: boolean;
    error: string | null;

    // Paginación
    currentPage: number;
    totalPages: number;
    totalElements: number;

    // Acciones
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    loadMore: () => Promise<void>;
    goToPage: (page: number) => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
    const {
        autoRefresh = true,
        refreshInterval = 60000, // 60 segundos (cambiado de 30)
        showToasts = true,
        enableSmartPolling = true, // Habilitado por defecto
        enableRealtime = true // 🔥 NUEVO: SSE habilitado por defecto
    } = options;

    // Estado local
    const [notifications, setNotifications] = useState<NotificacionDTO[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<NotificacionDTO[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [pageSize] = useState<number>(10);

    // Control de polling inteligente
    const isTabVisible = useRef<boolean>(true);
    const lastFetchTime = useRef<number>(Date.now());
    const consecutiveErrors = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // 🔥 NUEVO: Manejo de notificaciones en tiempo real via SSE
    const handleRealtimeNotification = useCallback((notification: NotificacionDTO) => {
        console.log('🔥 Nueva notificación en tiempo real:', notification);

        // Agregar a la lista de no leídas
        setUnreadNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Si estamos en la primera página, agregar a la lista principal
        if (currentPage === 0) {
            setNotifications(prev => [notification, ...prev]);
        }

        // Mostrar toast si está habilitado
        if (showToasts) {
            toast.info(notification.nombre, {
                description: notification.mensaje,
                duration: 5000
            });
        }
    }, [currentPage, showToasts]);

    // Conectar a SSE si está habilitado
    useNotificationStream(
        enableRealtime ? {
            onNotification: handleRealtimeNotification,
            onConnected: () => {
                console.log('✅ Conectado a notificaciones en tiempo real');
            },
            onError: (error) => {
                console.error('❌ Error en conexión de tiempo real:', error);
            },
            autoReconnect: true
        } : {}
    );

    // Función para cargar notificaciones paginadas
    const loadNotifications = useCallback(async (page: number = 0, append: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const response: PaginatedNotificaciones = await obtenerMisNotificaciones(page, pageSize);

            if (append) {
                setNotifications(prev => [...prev, ...response.content]);
            } else {
                setNotifications(response.content);
            }

            setCurrentPage(response.number);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            // Si el error es 403 (no autenticado), no mostrar toast ni setear error visible
            const is403 = err?.message?.includes('403') || err?.message?.includes('Forbidden');

            if (!is403) {
                const errorMessage = 'Error al cargar notificaciones';
                setError(errorMessage);
                if (showToasts) {
                    toast.error(errorMessage);
                }
            }
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [pageSize, showToasts]);

    // Función para cargar notificaciones no leídas
    const loadUnreadNotifications = useCallback(async () => {
        try {
            const [unreadData, countData] = await Promise.all([
                obtenerMisNotificacionesNoLeidas(),
                contarMisNotificacionesNoLeidas()
            ]);

            setUnreadNotifications(unreadData);
            setUnreadCount(countData);

            // Reset de contador de errores si tiene éxito
            consecutiveErrors.current = 0;
            lastFetchTime.current = Date.now();
        } catch (err: any) {
            // Incrementar contador de errores
            consecutiveErrors.current += 1;

            // Si el error es 403 (no autenticado), no mostrar toast
            const is403 = err?.message?.includes('403') || err?.message?.includes('Forbidden');

            if (!is403 && showToasts) {
                toast.error('Error al cargar notificaciones no leídas');
            }
            console.error('Error loading unread notifications:', err);
        }
    }, [showToasts]);

    // Función principal de refresh
    const refreshNotifications = useCallback(async () => {
        await Promise.all([
            loadNotifications(0, false),
            loadUnreadNotifications()
        ]);
    }, [loadNotifications, loadUnreadNotifications]);

    // Marcar como leída
    const markAsRead = useCallback(async (id: number) => {
        try {
            await marcarComoLeida(id);

            // Actualizar estado local
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, leido: true } : notif
                )
            );

            setUnreadNotifications(prev =>
                prev.filter(notif => notif.id !== id)
            );

            setUnreadCount(prev => Math.max(0, prev - 1));

            if (showToasts) {
                toast.success('Notificación marcada como leída');
            }
        } catch (err) {
            const errorMessage = 'Error al marcar como leída';
            if (showToasts) {
                toast.error(errorMessage);
            }
            console.error('Error marking as read:', err);
            throw err;
        }
    }, [showToasts]);

    // Marcar todas como leídas
    const markAllAsRead = useCallback(async () => {
        try {
            await marcarTodasMisNotificacionesComoLeidas();

            // Actualizar estado local
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, leido: true }))
            );

            setUnreadNotifications([]);
            setUnreadCount(0);

            if (showToasts) {
                toast.success('Todas las notificaciones marcadas como leídas');
            }
        } catch (err) {
            const errorMessage = 'Error al marcar todas como leídas';
            if (showToasts) {
                toast.error(errorMessage);
            }
            console.error('Error marking all as read:', err);
            throw err;
        }
    }, [showToasts]);

    // Eliminar notificación
    const deleteNotification = useCallback(async (id: number) => {
        try {
            await eliminarNotificacion(id);

            // Actualizar estado local
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            setUnreadNotifications(prev => prev.filter(notif => notif.id !== id));
            setUnreadCount(prev => {
                const deletedNotif = notifications.find(n => n.id === id);
                return deletedNotif && !deletedNotif.leido ? Math.max(0, prev - 1) : prev;
            });

            if (showToasts) {
                toast.success('Notificación eliminada');
            }
        } catch (err) {
            const errorMessage = 'Error al eliminar notificación';
            if (showToasts) {
                toast.error(errorMessage);
            }
            console.error('Error deleting notification:', err);
            throw err;
        }
    }, [notifications, showToasts]);

    // Cargar más (para infinite scroll)
    const loadMore = useCallback(async () => {
        if (currentPage < totalPages - 1) {
            await loadNotifications(currentPage + 1, true);
        }
    }, [currentPage, totalPages, loadNotifications]);

    // Ir a página específica
    const goToPage = useCallback(async (page: number) => {
        if (page >= 0 && page < totalPages) {
            await loadNotifications(page, false);
        }
    }, [totalPages, loadNotifications]);

    // Cargar datos iniciales
    useEffect(() => {
        refreshNotifications();
    }, []);

    // Detectar visibilidad del tab para optimizar polling
    useEffect(() => {
        if (!enableSmartPolling) return;

        const handleVisibilityChange = () => {
            isTabVisible.current = !document.hidden;

            // Si el tab vuelve a estar visible y ha pasado tiempo, refrescar
            if (isTabVisible.current) {
                const timeSinceLastFetch = Date.now() - lastFetchTime.current;
                const minTimeBetweenFetches = refreshInterval / 2;

                if (timeSinceLastFetch > minTimeBetweenFetches) {
                    console.log('🔄 Tab visible - Refrescando notificaciones');
                    loadUnreadNotifications();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [enableSmartPolling, refreshInterval, loadUnreadNotifications]);

    // Auto-refresh con polling inteligente
    useEffect(() => {
        // 🔥 Si SSE está habilitado, reducir frecuencia de polling (solo como fallback)
        if (!autoRefresh || enableRealtime) {
            // Con SSE activo, hacer polling muy ocasional solo como backup
            if (!enableRealtime) return;
        }

        // Limpiar intervalo previo
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Calcular intervalo dinámico basado en errores consecutivos
        const calculateInterval = () => {
            // Si SSE está activo, hacer polling cada 5 minutos solo como backup
            const baseInterval = enableRealtime ? 5 * 60 * 1000 : refreshInterval;

            if (consecutiveErrors.current === 0) {
                return baseInterval;
            }
            // Backoff exponencial: duplicar el intervalo por cada error (máx 10 minutos)
            const backoffInterval = Math.min(
                baseInterval * Math.pow(2, consecutiveErrors.current),
                10 * 60 * 1000 // Máximo 10 minutos
            );
            return backoffInterval;
        };

        const startPolling = () => {
            const currentInterval = calculateInterval();

            intervalRef.current = setInterval(() => {
                // Solo hacer polling si:
                // 1. El tab está visible (o no usamos smart polling)
                // 2. No hay errores consecutivos mayores a 3
                if ((!enableSmartPolling || isTabVisible.current) && consecutiveErrors.current < 3) {
                    console.log('📡 Polling notificaciones no leídas (fallback)');
                    loadUnreadNotifications();
                } else if (consecutiveErrors.current >= 3) {
                    console.warn('⚠️ Polling pausado por errores consecutivos');
                }
            }, currentInterval);
        };

        startPolling();

        // Reconfigurar intervalo cuando cambian los errores
        const recheckInterval = setInterval(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                startPolling();
            }
        }, 60000); // Revisar cada minuto si necesitamos cambiar el intervalo

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            clearInterval(recheckInterval);
        };
    }, [autoRefresh, refreshInterval, loadUnreadNotifications, enableSmartPolling, enableRealtime]);

    return {
        // Estado
        notifications,
        unreadNotifications,
        unreadCount,
        loading,
        error,

        // Paginación
        currentPage,
        totalPages,
        totalElements,

        // Acciones
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        goToPage
    };
}