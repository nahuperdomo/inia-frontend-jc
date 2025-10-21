"use client"

import { useState, useEffect, useCallback } from 'react';
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

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    showToasts?: boolean;
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
        refreshInterval = 30000, // 30 segundos
        showToasts = true
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
        } catch (err) {
            const errorMessage = 'Error al cargar notificaciones';
            setError(errorMessage);
            if (showToasts) {
                toast.error(errorMessage);
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
        } catch (err: any) {
            console.error('Error loading unread notifications:', err);
            // No mostrar toast si es un error de autenticación (403/401)
            // ya que el error-handler ya lo maneja
            if (showToasts && err?.status !== 403 && err?.status !== 401) {
                toast.error('Error al cargar notificaciones no leídas');
            }
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

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            loadUnreadNotifications(); // Solo actualizamos no leídas para no interferir con la paginación
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, loadUnreadNotifications]);

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