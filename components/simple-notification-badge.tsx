"use client"

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { contarMisNotificacionesNoLeidas } from '@/app/services/notificacion-service'
import { useAuth } from '@/components/auth-provider'

/**
 * Badge simple de notificaciones sin dependencias complejas.
 * Solo muestra el contador, sin SSE ni polling.
 */
export function SimpleNotificationBadge() {
    const { user, isLoading } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Solo cargar si hay usuario autenticado y no es observador
        if (!isLoading && user && user.role !== 'observador') {
            loadUnreadCount()

            // Polling cada 30 segundos
            const interval = setInterval(() => {
                loadUnreadCount()
            }, 30000)

            return () => clearInterval(interval)
        }
    }, [user, isLoading])

    const loadUnreadCount = async () => {
        try {
            const count = await contarMisNotificacionesNoLeidas()
            setUnreadCount(count)
        } catch (error) {
            console.error('Error cargando contador de notificaciones:', error)
            // No mostrar error al usuario, simplemente no actualizar el contador
        }
    }

    // No mostrar nada si está cargando o no hay usuario o es observador
    if (isLoading || !user || user.role === 'observador') {
        return null
    }

    return (
        <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </div>
    )
}
