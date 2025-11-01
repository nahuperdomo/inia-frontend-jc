"use client"

import { ReactNode } from 'react'
import { NotificationProvider } from '@/components/notificaciones'
import { useAuth } from '@/components/auth-provider'

interface SafeNotificationWrapperProps {
    children: ReactNode
}

/**
 * Wrapper seguro para NotificationProvider que solo se activa
 * cuando el usuario está completamente cargado.
 * Previene errores de "Application error" en rutas públicas.
 */
export function SafeNotificationWrapper({ children }: SafeNotificationWrapperProps) {
    const { user, isLoading } = useAuth()

    // Mientras está cargando, renderizar children sin NotificationProvider
    if (isLoading) {
        return <>{children}</>
    }

    // Si no hay usuario o es observador, renderizar sin notificaciones
    if (!user || user.role === 'observador') {
        return <>{children}</>
    }

    // Usuario cargado y con permisos: activar NotificationProvider
    return (
        <NotificationProvider
            autoRefreshInterval={30000}
            enableAutoRefresh={true}
            enableSmartPolling={true}
        >
            {children}
        </NotificationProvider>
    )
}
