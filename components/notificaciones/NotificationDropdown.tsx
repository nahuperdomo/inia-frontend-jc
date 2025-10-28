"use client"

import React, { useRef, useEffect } from 'react';
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    Trash2,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Settings,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useNotificationDropdown,
    useNotificationBadge
} from './NotificationProvider';
import NotificationItem from './NotificationItem';
import { NotificationCountBadge } from './NotificationBadge';
import { InteractiveNotificationIcon } from './NotificationIcon';
import type { NotificacionDTO } from '@/app/models';

interface NotificationDropdownProps {
    className?: string;
    triggerClassName?: string;
    dropdownClassName?: string;
    maxHeight?: string;
    showViewAllButton?: boolean;
    onViewAll?: () => void;
    onNotificationClick?: (notification: NotificacionDTO) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    className,
    triggerClassName,
    dropdownClassName,
    maxHeight = 'max-h-96',
    showViewAllButton = true,
    onViewAll,
    onNotificationClick
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Hooks del contexto
    const { unreadCount, hasUnread, hasNotifications } = useNotificationBadge();
    const {
        notifications,
        loading,
        error,
        pagination,
        actions,
        dropdown
    } = useNotificationDropdown();

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                dropdown.setOpen(false);
            }
        };

        if (dropdown.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [dropdown.isOpen, dropdown.setOpen]);

    // Manejar tecla Escape
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && dropdown.isOpen) {
                dropdown.setOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [dropdown.isOpen, dropdown.setOpen]);

    const handleNotificationClick = (notification: NotificacionDTO) => {
        if (onNotificationClick) {
            onNotificationClick(notification);
        }

        // Auto marcar como leída si no está leída
        if (!notification.leido) {
            actions.markAsRead(notification.id);
        }
    };

    const handleMarkAllAsRead = async () => {
        await actions.markAllAsRead();
        // Opcional: cerrar dropdown después de marcar todas
        // dropdown.setOpen(false);
    };

    const handleRefresh = async () => {
        await actions.refresh();
    };

    const handleViewAll = () => {
        if (onViewAll) {
            onViewAll();
        }
        dropdown.setOpen(false);
    };

    return (
        <div className={cn('relative', className)}>
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={dropdown.toggle}
                className={cn(
                    'relative p-2 rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 active:bg-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    hasUnread && 'text-blue-600 hover:bg-blue-50',
                    triggerClassName
                )}
                aria-label={`Notificaciones${hasUnread ? ` (${unreadCount} no leídas)` : ''}`}
            >
                <NotificationCountBadge unreadCount={unreadCount}>
                    <InteractiveNotificationIcon
                        hasNotifications={hasNotifications}
                        hasUnread={hasUnread}
                        size="md"
                        animated
                    />
                </NotificationCountBadge>
            </button>

            {/* Dropdown Panel */}
            {dropdown.isOpen && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        'absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50',
                        'animate-in slide-in-from-top-5 fade-in duration-200',
                        dropdownClassName
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                            {hasUnread && (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {unreadCount} nuevas
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Refresh button */}
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className={cn(
                                    'p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors',
                                    loading && 'animate-spin'
                                )}
                                title="Actualizar"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>

                            {/* Mark all as read */}
                            {hasUnread && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Marcar todas como leídas"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => dropdown.setOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className={cn('overflow-hidden', maxHeight)}>
                        {error && (
                            <div className="p-4 text-center text-red-600 bg-red-50 border-b border-red-200">
                                <p className="text-sm">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="mt-2 text-xs underline hover:no-underline"
                                >
                                    Intentar de nuevo
                                </button>
                            </div>
                        )}

                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-400 animate-spin" />
                                <p className="text-sm text-gray-500">Cargando notificaciones...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm text-gray-500 mb-1">No hay notificaciones</p>
                                <p className="text-xs text-gray-400">Te notificaremos cuando tengas nuevas actualizaciones</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-80">
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={actions.markAsRead}
                                            onDelete={actions.deleteNotification}
                                            onViewDetails={handleNotificationClick}
                                            compact
                                            className="hover:bg-gray-50 cursor-pointer"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => pagination.goToPage(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 0}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>

                                        <span className="text-xs text-gray-500">
                                            {pagination.currentPage + 1} de {pagination.totalPages}
                                        </span>

                                        <button
                                            onClick={() => pagination.goToPage(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* View All Button */}
                                {showViewAllButton && (
                                    <button
                                        onClick={handleViewAll}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Ver todas
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente simplificado para casos básicos
interface SimpleNotificationDropdownProps {
    onNotificationClick?: (notification: NotificacionDTO) => void;
    className?: string;
}

export const SimpleNotificationDropdown: React.FC<SimpleNotificationDropdownProps> = ({
    onNotificationClick,
    className
}) => {
    return (
        <NotificationDropdown
            className={className}
            onNotificationClick={onNotificationClick}
            maxHeight="max-h-64"
            showViewAllButton={false}
        />
    );
};

export default NotificationDropdown;
