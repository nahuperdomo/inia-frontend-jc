"use client"

import React from 'react';
import {
    User,
    UserCheck,
    UserX,
    FileText,
    CheckCircle,
    AlertTriangle,
    Bell,
    Eye,
    Trash2,
    ExternalLink
} from 'lucide-react';
import type { NotificacionDTO } from '@/app/models';
import {
    formatNotificationDate,
    getNotificationTypeConfig,
    truncateText
} from '@/lib/utils/notification-utils';
import { cn } from '@/lib/utils';

// Mapeo de iconos
const iconMap = {
    User,
    UserCheck,
    UserX,
    FileText,
    CheckCircle,
    AlertTriangle,
    Bell
};

interface NotificationItemProps {
    notification: NotificacionDTO;
    onMarkAsRead?: (id: number) => void;
    onDelete?: (id: number) => void;
    onViewDetails?: (notification: NotificacionDTO) => void;
    showActions?: boolean;
    compact?: boolean;
    className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onDelete,
    onViewDetails,
    showActions = true,
    compact = false,
    className
}) => {
    const config = getNotificationTypeConfig(notification.tipo);
    const IconComponent = iconMap[config.icon as keyof typeof iconMap] || Bell;

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!notification.leido && onMarkAsRead) {
            onMarkAsRead(notification.id);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(notification.id);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(notification);
        }
    };

    return (
        <div
            className={cn(
                "group relative p-3 border-l-4 transition-all duration-200 hover:shadow-sm cursor-pointer",
                config.borderColor,
                config.bgColor,
                !notification.leido && "ring-1 ring-blue-200 bg-blue-50/50",
                compact && "p-2",
                className
            )}
            onClick={handleViewDetails}
        >
            {/* Indicador de no leído */}
            {!notification.leido && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></div>
            )}

            <div className="flex items-start gap-3">
                {/* Icono del tipo de notificación */}
                <div className={cn(
                    "flex-shrink-0 p-2 rounded-full",
                    config.bgColor,
                    compact && "p-1.5"
                )}>
                    <IconComponent
                        className={cn(
                            "w-4 h-4",
                            config.color,
                            compact && "w-3 h-3"
                        )}
                    />
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className={cn(
                                "font-medium text-gray-900 truncate",
                                !notification.leido && "font-semibold",
                                compact && "text-sm"
                            )}>
                                {notification.nombre}
                            </h4>

                            <p className={cn(
                                "text-gray-600 mt-1",
                                compact ? "text-xs" : "text-sm"
                            )}>
                                {compact
                                    ? truncateText(notification.mensaje, 60)
                                    : truncateText(notification.mensaje, 120)
                                }
                            </p>

                            {/* Información adicional */}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                    "px-2 py-1 text-xs font-medium rounded-full",
                                    config.color,
                                    config.bgColor,
                                    "border",
                                    config.borderColor
                                )}>
                                    {config.label}
                                </span>

                                <span className="text-xs text-gray-500">
                                    {formatNotificationDate(notification.fechaCreacion)}
                                </span>

                                {notification.analisisId && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Análisis #{notification.analisisId}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Acciones */}
                        {showActions && (
                            <div className={cn(
                                "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                compact && "gap-0.5"
                            )}>
                                {!notification.leido && onMarkAsRead && (
                                    <button
                                        onClick={handleMarkAsRead}
                                        className={cn(
                                            "p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors",
                                            compact && "p-1"
                                        )}
                                        title="Marcar como leído"
                                    >
                                        <Eye className={cn("w-4 h-4", compact && "w-3 h-3")} />
                                    </button>
                                )}

                                {onViewDetails && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails();
                                        }}
                                        className={cn(
                                            "p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors",
                                            compact && "p-1"
                                        )}
                                        title="Ver detalles"
                                    >
                                        <ExternalLink className={cn("w-4 h-4", compact && "w-3 h-3")} />
                                    </button>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className={cn(
                                            "p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors",
                                            compact && "p-1"
                                        )}
                                        title="Eliminar notificación"
                                    >
                                        <Trash2 className={cn("w-4 h-4", compact && "w-3 h-3")} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Estado de lectura visual */}
            <div className={cn(
                "absolute inset-0 pointer-events-none",
                !notification.leido && "bg-blue-50/20"
            )} />
        </div>
    );
};

export default NotificationItem;