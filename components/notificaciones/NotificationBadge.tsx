"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
    count: number;
    maxCount?: number;
    variant?: 'default' | 'dot' | 'outline' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
    showZero?: boolean;
    pulse?: boolean;
    className?: string;
    children?: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    maxCount = 99,
    variant = 'default',
    size = 'md',
    position = 'top-right',
    showZero = false,
    pulse = false,
    className,
    children
}) => {
    // Si no hay count y no se debe mostrar zero, no renderizar
    if (count === 0 && !showZero) {
        return children ? <>{children}</> : null;
    }

    // Determinar el texto a mostrar
    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
    const isDot = variant === 'dot';
    const hasContent = !isDot && count > 0;

    // Clases base del badge
    const badgeBaseClasses = cn(
        "flex items-center justify-center font-semibold text-white rounded-full",
        "transition-all duration-200 ease-in-out",
        pulse && count > 0 && "animate-pulse",

        // Variantes de color
        {
            'bg-blue-600 text-white': variant === 'default',
            'bg-transparent': variant === 'dot',
            'border-2 border-blue-600 bg-white text-blue-600': variant === 'outline',
            'bg-green-600 text-white': variant === 'success',
            'bg-orange-600 text-white': variant === 'warning',
            'bg-red-600 text-white': variant === 'error',
        },

        // Tamaños
        {
            // Small
            'w-4 h-4 text-xs min-w-[16px]': size === 'sm' && hasContent,
            'w-2 h-2': size === 'sm' && isDot,

            // Medium
            'w-5 h-5 text-xs min-w-[20px]': size === 'md' && hasContent,
            'w-2.5 h-2.5': size === 'md' && isDot,

            // Large
            'w-6 h-6 text-sm min-w-[24px]': size === 'lg' && hasContent,
            'w-3 h-3': size === 'lg' && isDot,
        },

        // Posicionamiento absoluto
        position !== 'inline' && "absolute z-10",
        {
            '-top-1 -right-1': position === 'top-right',
            '-top-1 -left-1': position === 'top-left',
            '-bottom-1 -right-1': position === 'bottom-right',
            '-bottom-1 -left-1': position === 'bottom-left',
        },

        className
    );

    // Si hay children, envolver en contenedor relativo
    if (children) {
        return (
            <div className="relative inline-block">
                {children}
                <span className={badgeBaseClasses}>
                    {hasContent && displayCount}
                </span>
            </div>
        );
    }

    // Badge standalone
    return (
        <span className={cn(badgeBaseClasses, position === 'inline' && "relative")}>
            {hasContent && displayCount}
        </span>
    );
};

// Componente especializado para notificaciones
interface NotificationCountBadgeProps {
    unreadCount: number;
    totalCount?: number;
    showTotal?: boolean;
    pulse?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    children?: React.ReactNode;
}

export const NotificationCountBadge: React.FC<NotificationCountBadgeProps> = ({
    unreadCount,
    totalCount,
    showTotal = false,
    pulse = true,
    size = 'md',
    className,
    children
}) => {
    const displayCount = showTotal && totalCount ? totalCount : unreadCount;
    const variant = unreadCount > 0 ? 'default' : 'outline';

    return (
        <NotificationBadge
            count={displayCount}
            variant={variant}
            size={size}
            pulse={pulse && unreadCount > 0}
            className={className}
        >
            {children}
        </NotificationBadge>
    );
};

// Componente para mostrar estado de notificaciones
interface NotificationStatusBadgeProps {
    hasUnread: boolean;
    count: number;
    className?: string;
}

export const NotificationStatusBadge: React.FC<NotificationStatusBadgeProps> = ({
    hasUnread,
    count,
    className
}) => {
    if (count === 0) return null;

    return (
        <NotificationBadge
            count={count}
            variant={hasUnread ? 'error' : 'success'}
            size="sm"
            position="inline"
            pulse={hasUnread}
            className={className}
        />
    );
};

// Componente de punto de notificación simple
interface NotificationDotProps {
    active: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const NotificationDot: React.FC<NotificationDotProps> = ({
    active,
    variant = 'default',
    size = 'md',
    pulse = false,
    className,
    children
}) => {
    if (!active) {
        return children ? <>{children}</> : null;
    }

    return (
        <NotificationBadge
            count={1}
            variant={variant === 'default' ? 'dot' : variant}
            size={size}
            pulse={pulse}
            className={cn(
                variant === 'default' && 'bg-blue-600',
                variant === 'success' && 'bg-green-600',
                variant === 'warning' && 'bg-orange-600',
                variant === 'error' && 'bg-red-600',
                className
            )}
        >
            {children}
        </NotificationBadge>
    );
};

export default NotificationBadge;
