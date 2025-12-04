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
    BellRing,
    BellOff
} from 'lucide-react';
import type { TipoNotificacion } from '@/app/models';
import { getNotificationTypeConfig } from '@/lib/utils/notification-utils';
import { cn } from '@/lib/utils';

// Mapeo de iconos
const iconMap = {
    User,
    UserCheck,
    UserX,
    FileText,
    CheckCircle,
    AlertTriangle,
    Bell,
    BellRing,
    BellOff
};

interface NotificationIconProps {
    type?: TipoNotificacion;
    variant?: 'default' | 'active' | 'muted' | 'custom';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    customIcon?: keyof typeof iconMap;
    customColor?: string;
    withBackground?: boolean;
    animated?: boolean;
    className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
    type,
    variant = 'default',
    size = 'md',
    customIcon,
    customColor,
    withBackground = false,
    animated = false,
    className
}) => {
    // Determinar el icono a usar
    let IconComponent: React.ComponentType<any>;
    let colorClasses: string;
    let bgClasses: string;

    if (customIcon) {
        IconComponent = iconMap[customIcon];
        colorClasses = customColor || 'text-gray-600';
        bgClasses = 'bg-gray-50';
    } else if (type) {
        const config = getNotificationTypeConfig(type);
        IconComponent = iconMap[config.icon as keyof typeof iconMap] || Bell;
        colorClasses = config.color;
        bgClasses = config.bgColor;
    } else {
        // Iconos por defecto según variante
        switch (variant) {
            case 'active':
                IconComponent = BellRing;
                colorClasses = 'text-blue-600';
                bgClasses = 'bg-blue-50';
                break;
            case 'muted':
                IconComponent = BellOff;
                colorClasses = 'text-gray-400';
                bgClasses = 'bg-gray-50';
                break;
            default:
                IconComponent = Bell;
                colorClasses = 'text-gray-600';
                bgClasses = 'bg-gray-50';
                break;
        }
    }

    // Clases de tamaño
    const sizeClasses = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };

    // Clases de padding para background
    const paddingClasses = {
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
        xl: 'p-3'
    };

    // Contenedor con background opcional
    const containerClasses = cn(
        withBackground && [
            'rounded-full inline-flex items-center justify-center',
            bgClasses,
            paddingClasses[size]
        ],
        animated && 'transition-all duration-200',
        className
    );

    // Clases del icono
    const iconClasses = cn(
        sizeClasses[size],
        colorClasses,
        animated && 'transition-colors duration-200'
    );

    if (withBackground) {
        return (
            <div className={containerClasses}>
                <IconComponent className={iconClasses} />
            </div>
        );
    }

    return <IconComponent className={cn(iconClasses, className)} />;
};

// Componente especializado para tipos específicos de notificación
interface TypedNotificationIconProps {
    type: TipoNotificacion;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withBackground?: boolean;
    withLabel?: boolean;
    animated?: boolean;
    className?: string;
}

export const TypedNotificationIcon: React.FC<TypedNotificationIconProps> = ({
    type,
    size = 'md',
    withBackground = true,
    withLabel = false,
    animated = true,
    className
}) => {
    const config = getNotificationTypeConfig(type);

    if (withLabel) {
        return (
            <div className="flex items-center gap-2">
                <NotificationIcon
                    type={type}
                    size={size}
                    withBackground={withBackground}
                    animated={animated}
                    className={className}
                />
                <span className={cn(
                    'text-sm font-medium',
                    config.color
                )}>
                    {config.label}
                </span>
            </div>
        );
    }

    return (
        <NotificationIcon
            type={type}
            size={size}
            withBackground={withBackground}
            animated={animated}
            className={className}
        />
    );
};

// Componente de icono con estado interactivo
interface InteractiveNotificationIconProps {
    hasNotifications: boolean;
    hasUnread: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    animated?: boolean;
    onClick?: () => void;
    className?: string;
}

export const InteractiveNotificationIcon: React.FC<InteractiveNotificationIconProps> = ({
    hasNotifications,
    hasUnread,
    size = 'md',
    animated = true,
    onClick,
    className
}) => {
    const variant = hasUnread ? 'active' : hasNotifications ? 'default' : 'muted';

    
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={cn(
                'relative p-2 rounded-lg transition-all duration-200',
                'hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                hasUnread && 'text-blue-600 hover:bg-blue-50',
                animated && 'hover:scale-105 active:scale-95',
                className
            )}
        >
            <NotificationIcon
                variant={variant}
                size={size}
                animated={animated}
            />

            {/* Pulso para notificaciones no leídas */}
            {hasUnread && animated && (
                <span className="absolute inset-0 rounded-lg bg-blue-400 opacity-20 animate-ping" />
            )}
        </div>
    );
};

// Componente de lista de iconos por tipo
interface NotificationTypeListProps {
    types: TipoNotificacion[];
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withLabels?: boolean;
    withBackground?: boolean;
    layout?: 'horizontal' | 'vertical';
    className?: string;
}

export const NotificationTypeList: React.FC<NotificationTypeListProps> = ({
    types,
    size = 'sm',
    withLabels = false,
    withBackground = true,
    layout = 'horizontal',
    className
}) => {
    const containerClasses = cn(
        'flex gap-2',
        layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
    );

    return (
        <div className={containerClasses}>
            {types.map((type) => (
                <TypedNotificationIcon
                    key={type}
                    type={type}
                    size={size}
                    withBackground={withBackground}
                    withLabel={withLabels}
                    animated
                />
            ))}
        </div>
    );
};

export default NotificationIcon;
