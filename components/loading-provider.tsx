"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageLoading } from './page-loading'

// Crear contexto para el estado de carga
const LoadingContext = createContext<{
    isLoading: boolean
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}>({
    isLoading: false,
    setIsLoading: () => { },
})

// Hook para usar el contexto de carga
export const useLoading = () => useContext(LoadingContext)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Efecto para manejar el estado de carga en navegación
    useEffect(() => {
        setIsLoading(true)

        // Simular un mínimo de tiempo de carga para una mejor UX
        const minLoadingTime = setTimeout(() => {
            setIsLoading(false)
        }, 800)

        return () => clearTimeout(minLoadingTime)
    }, [pathname, searchParams])

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {isLoading && (
                <div className="fixed inset-0 z-50">
                    <PageLoading message="Cargando aplicación..." fullScreen={true} />
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    )
}