"use client"

import { Leaf } from "lucide-react"
import { LoadingSpinner } from "./ui/loading-spinner"

interface PageLoadingProps {
    message?: string
    fullScreen?: boolean
}

export function PageLoading({
    message = "Cargando...",
    fullScreen = false
}: PageLoadingProps) {
    const containerClass = fullScreen
        ? "min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4"
        : "flex flex-col items-center justify-center min-h-[60vh]";

    return (
        <div className={containerClass}>
            <div className="mb-4">
                <div className="bg-primary rounded-full p-3">
                    <Leaf className="h-8 w-8 text-primary-foreground" />
                </div>
            </div>
            <LoadingSpinner size={40} className="text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        </div>
    )
}