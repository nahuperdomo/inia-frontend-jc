"use client"

import { useContext } from 'react'
import { useNotificationBadge as useOriginalBadge } from './NotificationProvider'

/**
 * Hook seguro para obtener el badge de notificaciones.
 * Retorna valores por defecto si no está dentro del NotificationProvider.
 */
export function useSafeNotificationBadge() {
    try {
        return useOriginalBadge()
    } catch (error) {
        // No estamos dentro del NotificationProvider, retornar valores por defecto
        return {
            unreadCount: 0,
            totalCount: 0,
            hasUnread: false,
            hasNotifications: false,
            loading: false
        }
    }
}
