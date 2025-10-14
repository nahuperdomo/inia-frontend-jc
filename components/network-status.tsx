"use client"

import { useOnlineStatus } from '@/lib/hooks/use-online-status'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

export function NetworkStatusIndicator() {
    const isOnline = useOnlineStatus()
    const [showOnlineMessage, setShowOnlineMessage] = useState(false)
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true)
        } else if (wasOffline) {
            // Mostrar mensaje temporal cuando se restaura la conexión
            setShowOnlineMessage(true)
            const timer = setTimeout(() => {
                setShowOnlineMessage(false)
                setWasOffline(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [isOnline, wasOffline])

    if (showOnlineMessage) {
        return (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                <Alert className="border-green-500 bg-green-50">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">
                        Conexión restaurada
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!isOnline) {
        return (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                <Alert className="border-orange-500 bg-orange-50">
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-600">
                        Sin conexión - Modo offline
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return null
}

export function NetworkStatusBadge() {
    const isOnline = useOnlineStatus()

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className="text-xs text-muted-foreground">
                {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
        </div>
    )
}