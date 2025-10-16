"use client"

import { useState, useEffect } from 'react'

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        // Verificar estado inicial
        setIsOnline(navigator.onLine)

        const handleOnline = () => {
            setIsOnline(true)
            console.log('🟢 Conexión restaurada')
        }

        const handleOffline = () => {
            setIsOnline(false)
            console.log('🔴 Sin conexión a internet')
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

export function useNetworkStatus() {
    const [networkStatus, setNetworkStatus] = useState({
        online: true,
        effectiveType: '4g',
        downlink: 0,
        rtt: 0,
    })

    useEffect(() => {
        const updateNetworkStatus = () => {
            const connection = (navigator as any).connection ||
                (navigator as any).mozConnection ||
                (navigator as any).webkitConnection

            setNetworkStatus({
                online: navigator.onLine,
                effectiveType: connection?.effectiveType || '4g',
                downlink: connection?.downlink || 0,
                rtt: connection?.rtt || 0,
            })
        }

        updateNetworkStatus()

        window.addEventListener('online', updateNetworkStatus)
        window.addEventListener('offline', updateNetworkStatus)

        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection

        if (connection) {
            connection.addEventListener('change', updateNetworkStatus)
        }

        return () => {
            window.removeEventListener('online', updateNetworkStatus)
            window.removeEventListener('offline', updateNetworkStatus)

            if (connection) {
                connection.removeEventListener('change', updateNetworkStatus)
            }
        }
    }, [])

    return networkStatus
}