// Exportar todos los componentes de notificaciones
export { default as NotificationProvider } from './NotificationProvider';
export {
    useNotificationContext,
    useNotificationBadge,
    useNotificationDropdown,
    useNotificationStats
} from './NotificationProvider';

// Hook seguro que no lanza error si no está en el contexto
export { useSafeNotificationBadge } from './safe-notification-hooks';

export { default as NotificationDropdown } from './NotificationDropdown';
export { SimpleNotificationDropdown } from './NotificationDropdown';

export { default as NotificationItem } from './NotificationItem';

export { default as NotificationBadge } from './NotificationBadge';
export {
    NotificationCountBadge,
    NotificationStatusBadge,
    NotificationDot
} from './NotificationBadge';

export { default as NotificationIcon } from './NotificationIcon';
export {
    TypedNotificationIcon,
    InteractiveNotificationIcon,
    NotificationTypeList
} from './NotificationIcon';

// Re-exportar utilidades
export * from '@/lib/utils/notification-utils';
export { useNotifications } from '@/lib/hooks/use-notifications';
