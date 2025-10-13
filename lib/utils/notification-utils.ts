import type { NotificacionDTO, TipoNotificacion } from '@/app/models';

// Utilidades para formateo de fechas
export const formatNotificationDate = (fecha: string): string => {
    const now = new Date();
    const notificationDate = new Date(fecha);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Ahora';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Hace ${minutes} min`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Hace ${hours}h`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Hace ${days}d`;
    } else {
        return notificationDate.toLocaleDateString('es-UY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
};

export const formatNotificationDateTime = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Configuración de iconos y colores por tipo
export const notificationTypeConfig = {
    USUARIO_REGISTRO: {
        icon: 'User',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Registro de Usuario'
    },
    USUARIO_APROBADO: {
        icon: 'UserCheck',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Usuario Aprobado'
    },
    USUARIO_RECHAZADO: {
        icon: 'UserX',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Usuario Rechazado'
    },
    ANALISIS_FINALIZADO: {
        icon: 'FileText',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'Análisis Finalizado'
    },
    ANALISIS_APROBADO: {
        icon: 'CheckCircle',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Análisis Aprobado'
    },
    ANALISIS_REPETIR: {
        icon: 'AlertTriangle',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Análisis a Repetir'
    }
} as const;

// Obtener configuración por tipo
export const getNotificationTypeConfig = (tipo: TipoNotificacion) => {
    return notificationTypeConfig[tipo] || {
        icon: 'Bell',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        label: 'Notificación'
    };
};

// Filtros para notificaciones
export const filterNotifications = {
    all: (notifications: NotificacionDTO[]) => notifications,
    unread: (notifications: NotificacionDTO[]) => notifications.filter(n => !n.leido),
    read: (notifications: NotificacionDTO[]) => notifications.filter(n => n.leido),
    byType: (notifications: NotificacionDTO[], tipo: TipoNotificacion) =>
        notifications.filter(n => n.tipo === tipo),
    byAnalysis: (notifications: NotificacionDTO[]) =>
        notifications.filter(n => n.analisisId !== undefined && n.analisisId !== null),
    recent: (notifications: NotificacionDTO[], hours: number = 24) => {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);
        return notifications.filter(n => new Date(n.fechaCreacion) > cutoff);
    }
};

// Ordenar notificaciones
export const sortNotifications = {
    byDate: (notifications: NotificacionDTO[], ascending: boolean = false) => {
        return [...notifications].sort((a, b) => {
            const dateA = new Date(a.fechaCreacion).getTime();
            const dateB = new Date(b.fechaCreacion).getTime();
            return ascending ? dateA - dateB : dateB - dateA;
        });
    },
    byReadStatus: (notifications: NotificacionDTO[]) => {
        return [...notifications].sort((a, b) => {
            if (a.leido === b.leido) return 0;
            return a.leido ? 1 : -1; // No leídas primero
        });
    },
    byType: (notifications: NotificacionDTO[]) => {
        const typeOrder = [
            'ANALISIS_REPETIR',
            'ANALISIS_FINALIZADO',
            'ANALISIS_APROBADO',
            'USUARIO_REGISTRO',
            'USUARIO_APROBADO',
            'USUARIO_RECHAZADO'
        ];

        return [...notifications].sort((a, b) => {
            const indexA = typeOrder.indexOf(a.tipo);
            const indexB = typeOrder.indexOf(b.tipo);
            return indexA - indexB;
        });
    }
};

// Agrupar notificaciones
export const groupNotifications = {
    byDate: (notifications: NotificacionDTO[]) => {
        const groups: Record<string, NotificacionDTO[]> = {};

        notifications.forEach(notification => {
            const date = new Date(notification.fechaCreacion).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(notification);
        });

        return groups;
    },
    byType: (notifications: NotificacionDTO[]) => {
        const groups: Record<TipoNotificacion, NotificacionDTO[]> = {} as any;

        notifications.forEach(notification => {
            if (!groups[notification.tipo]) {
                groups[notification.tipo] = [];
            }
            groups[notification.tipo].push(notification);
        });

        return groups;
    },
    byReadStatus: (notifications: NotificacionDTO[]) => {
        return {
            unread: notifications.filter(n => !n.leido),
            read: notifications.filter(n => n.leido)
        };
    }
};

// Validaciones
export const validateNotification = (notification: Partial<NotificacionDTO>): string[] => {
    const errors: string[] = [];

    if (!notification.nombre || notification.nombre.trim() === '') {
        errors.push('El nombre es requerido');
    }

    if (!notification.mensaje || notification.mensaje.trim() === '') {
        errors.push('El mensaje es requerido');
    }

    if (!notification.tipo) {
        errors.push('El tipo de notificación es requerido');
    }

    if (!notification.usuarioId || notification.usuarioId <= 0) {
        errors.push('El ID de usuario es requerido');
    }

    return errors;
};

// Truncar texto para previews
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

// Generar estadísticas de notificaciones
export const getNotificationStats = (notifications: NotificacionDTO[]) => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.leido).length;
    const read = total - unread;

    const byType = Object.entries(
        notifications.reduce((acc, n) => {
            acc[n.tipo] = (acc[n.tipo] || 0) + 1;
            return acc;
        }, {} as Record<TipoNotificacion, number>)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = notifications.filter(n =>
        new Date(n.fechaCreacion) >= today
    ).length;

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weekCount = notifications.filter(n =>
        new Date(n.fechaCreacion) >= thisWeek
    ).length;

    return {
        total,
        unread,
        read,
        unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0,
        byType,
        todayCount,
        weekCount
    };
};

// Constantes útiles
export const NOTIFICATION_CONSTANTS = {
    MAX_PREVIEW_LENGTH: 100,
    AUTO_REFRESH_INTERVAL: 30000, // 30 segundos
    PAGE_SIZES: [5, 10, 20, 50],
    DEFAULT_PAGE_SIZE: 10,
    RECENT_HOURS_THRESHOLD: 24
} as const;