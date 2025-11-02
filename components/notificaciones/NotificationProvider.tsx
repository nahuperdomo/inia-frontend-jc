"use client"

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import type { NotificacionDTO, TipoNotificacion } from '@/app/models';
import { useAuth } from '@/components/auth-provider';

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
    enableSmartPolling?: boolean; // Nueva prop para polling inteligente
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
    children,
    autoRefreshInterval = 60000, // 60 segundos
    enableAutoRefresh = true,
    enableSmartPolling = true // Habilitado por defecto
}) => {
    // Estado del dropdown
    const [isDropdownOpen, setDropdownOpen] = React.useState(false);
    const [autoRefresh, setAutoRefresh] = React.useState(enableAutoRefresh);

    // Verificar rol del usuario
    const { user, isLoading: authLoading } = useAuth();
    const shouldLoadNotifications = !authLoading && !!user && user.role !== 'observador';

    // Opciones de notificación - simplificadas sin useMemo problemático
    const notificationOptions = {
        autoRefresh: shouldLoadNotifications && enableAutoRefresh,
        refreshInterval: autoRefreshInterval,
        showToasts: shouldLoadNotifications,
        enableSmartPolling: shouldLoadNotifications && enableSmartPolling
    };

    // Hook de notificaciones - solo se activa si el usuario puede recibir notificaciones
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
        goToPage
    } = useNotifications(notificationOptions);

    // Estado local para filtros
    const [typeFilter, setTypeFilter] = React.useState<TipoNotificacion | 'all'>('all');
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'read' | 'unread'>('all');

    // Ya no necesitamos auto-refresh manual aquí porque el hook lo maneja
    // useEffect(() => {
    //     if (!autoRefresh) return;
    //     const interval = setInterval(() => {
    //         refresh();
    //     }, autoRefreshInterval);
    //     return () => clearInterval(interval);
    // }, [autoRefresh, autoRefreshInterval, refresh]);

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
        setAutoRefresh
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
        setDropdownOpen
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
