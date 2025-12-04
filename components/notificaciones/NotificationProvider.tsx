"use client"

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import { useNotificationWebSocket } from '@/lib/hooks/use-notification-websocket';
import type { NotificacionDTO, TipoNotificacion } from '@/app/models';

// Tipos para el contexto
interface NotificationContextType {
    // Estado de notificaciones
    notifications: NotificacionDTO[];
    unreadCount: number;
    totalCount: number;
    loading: boolean;
    error: string | null;

    // Paginación
    currentPage: number;
    totalPages: number;

    // Acciones principales
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
    refreshNotifications: () => Promise<void>;

    // Filtros y navegación
    goToPage: (page: number) => Promise<void>;
    filterByType: (type: TipoNotificacion | 'all') => void;
    filterByReadStatus: (status: 'all' | 'read' | 'unread') => void;

    // Estado de UI
    isDropdownOpen: boolean;
    setDropdownOpen: (open: boolean) => void;
    autoRefresh: boolean;
    setAutoRefresh: (enabled: boolean) => void;

    // NUEVO: Estado WebSocket
    isWebSocketConnected: boolean;
    webSocketError: string | null;
    reconnectWebSocket: () => Promise<void>;
}

// Crear el contexto
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook para usar el contexto
export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext debe usarse dentro de NotificationProvider');
    }
    return context;
};

// Props del provider
interface NotificationProviderProps {
    children: ReactNode;
    autoRefreshInterval?: number; // en milisegundos
    enableAutoRefresh?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    autoRefreshInterval = 60000, //  Aumentado a 60s (fallback cuando WS falla)
    enableAutoRefresh = true
}) => {
    // Estado del dropdown
    const [isDropdownOpen, setDropdownOpen] = React.useState(false);
    const [autoRefresh, setAutoRefresh] = React.useState(enableAutoRefresh);

    // Hook de notificaciones
    const {
        notifications,
        unreadCount,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications: refresh,
        goToPage,
        // NUEVO: Métodos para WebSocket
        addNotification,
        updateUnreadCount,
        removeNotification,
    } = useNotifications({
        autoRefresh: enableAutoRefresh,
        refreshInterval: autoRefreshInterval,
        showToasts: false //  Desactivar toasts del polling (los maneja WebSocket)
    });

    // NUEVO: Obtener token y userId de localStorage
    const [token, setToken] = React.useState<string | null>(null);
    const [userId, setUserId] = React.useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedUserData = localStorage.getItem('usuario');
            if (savedUserData) {
                try {
                    const parsedUser = JSON.parse(savedUserData);
                    setToken(parsedUser.token || null);
                    setUserId(parsedUser.id?.toString() || parsedUser.usuarioID?.toString() || null);
                } catch (err) {
                    console.error('Error parsing user data:', err);
                }
            }
        }
    }, []);

    //  NUEVO: Hook de WebSocket
    const { 
        isConnected: isWebSocketConnected, 
        error: webSocketError,
        reconnect: reconnectWebSocket 
    } = useNotificationWebSocket({
        token: token || undefined,
        userId: userId || undefined,
        
        // Callback cuando llega una notificación
        onNotification: useCallback((notification: NotificacionDTO) => {
            addNotification(notification);
        }, [addNotification]),
        
        // Callback cuando se actualiza el contador
        onCountUpdate: useCallback((count: number) => {
            updateUnreadCount(count);
        }, [updateUnreadCount]),
        
        // Callback cuando se marca como leída
        onMarkAsRead: useCallback((notificationId: number) => {
            // Actualizar localmente
            updateUnreadCount(prev => Math.max(0, prev - 1));
        }, [updateUnreadCount]),
        
        // Callback cuando se elimina
        onDelete: useCallback((notificationId: number) => {
            removeNotification(notificationId);
        }, [removeNotification]),
        
        // Mostrar toasts para nuevas notificaciones
        showToasts: true
    });

    // Estado local para filtros
    const [typeFilter, setTypeFilter] = React.useState<TipoNotificacion | 'all'>('all');
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'read' | 'unread'>('all');

    //  Auto-refresh solo si WebSocket NO está conectado (fallback)
    useEffect(() => {
        if (!autoRefresh || isWebSocketConnected) return;
        const interval = setInterval(() => {
            refresh();
        }, autoRefreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, autoRefreshInterval, refresh, isWebSocketConnected]);

    // Refresh cuando se abre el dropdown
    useEffect(() => {
        if (isDropdownOpen) {
            refresh();
        }
    }, [isDropdownOpen, refresh]);

    // Funciones de filtrado
    const filterByType = React.useCallback((type: TipoNotificacion | 'all') => {
        setTypeFilter(type);
        goToPage(0); // Reset a primera página
        // Aquí podrías implementar lógica adicional de filtrado si el backend lo soporta
    }, [goToPage]);

    const filterByReadStatus = React.useCallback((status: 'all' | 'read' | 'unread') => {
        setStatusFilter(status);
        goToPage(0); // Reset a primera página
        // Aquí podrías implementar lógica adicional de filtrado si el backend lo soporta
    }, [goToPage]);

    // Refresh wrapper
    const refreshNotifications = React.useCallback(async () => {
        await refresh();
    }, [refresh]);

    // Wrapper para acciones con feedback
    const handleMarkAsRead = React.useCallback(async (id: number) => {
        await markAsRead(id);
        // Opcional: mantener dropdown abierto o cerrarlo
    }, [markAsRead]);

    const handleMarkAllAsRead = React.useCallback(async () => {
        await markAllAsRead();
        // Opcional: cerrar dropdown después de marcar todas como leídas
    }, [markAllAsRead]);

    const handleDeleteNotification = React.useCallback(async (id: number) => {
        await deleteNotification(id);
        // Opcional: feedback visual o manejo de errores adicional
    }, [deleteNotification]);

    // Valor del contexto
    const contextValue: NotificationContextType = {
        // Estado
        notifications,
        unreadCount,
        totalCount: totalElements,
        loading,
        error,

        // Paginación
        currentPage,
        totalPages,

        // Acciones
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        deleteNotification: handleDeleteNotification,
        refreshNotifications,

        // Filtros y navegación
        goToPage,
        filterByType,
        filterByReadStatus,

        // UI State
        isDropdownOpen,
        setDropdownOpen,
        autoRefresh,
        setAutoRefresh,
        
        //  NUEVO: Estado WebSocket
        isWebSocketConnected,
        webSocketError,
        reconnectWebSocket,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

// Hook especializado para el badge de notificaciones
export const useNotificationBadge = () => {
    const { unreadCount, totalCount, loading } = useNotificationContext();

    return {
        unreadCount,
        totalCount,
        hasUnread: unreadCount > 0,
        hasNotifications: totalCount > 0,
        loading
    };
};

// Hook especializado para el dropdown
export const useNotificationDropdown = () => {
    const {
        notifications,
        loading,
        error,
        currentPage,
        totalPages,
        goToPage,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        isDropdownOpen,
        setDropdownOpen,
        //  NUEVO: WebSocket
        isWebSocketConnected,
        webSocketError,
        reconnectWebSocket
    } = useNotificationContext();

    return {
        notifications,
        loading,
        error,
        pagination: {
            currentPage,
            totalPages,
            goToPage
        },
        actions: {
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refresh: refreshNotifications
        },
        dropdown: {
            isOpen: isDropdownOpen,
            setOpen: setDropdownOpen,
            toggle: () => setDropdownOpen(!isDropdownOpen)
        },
        //  NUEVO: Estado WebSocket
        websocket: {
            isConnected: isWebSocketConnected,
            error: webSocketError,
            reconnect: reconnectWebSocket
        }
    };
};

// Hook para estadísticas de notificaciones
export const useNotificationStats = () => {
    const { notifications, unreadCount, totalCount } = useNotificationContext();

    const stats = React.useMemo(() => {
        const byType = notifications.reduce((acc, notification) => {
            acc[notification.tipo] = (acc[notification.tipo] || 0) + 1;
            return acc;
        }, {} as Record<TipoNotificacion, number>);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = notifications.filter(n =>
            new Date(n.fechaCreacion) >= today
        ).length;

        return {
            total: totalCount,
            unread: unreadCount,
            read: totalCount - unreadCount,
            unreadPercentage: totalCount > 0 ? Math.round((unreadCount / totalCount) * 100) : 0,
            byType,
            todayCount
        };
    }, [notifications, unreadCount, totalCount]);

    return stats;
};

export default NotificationProvider;
