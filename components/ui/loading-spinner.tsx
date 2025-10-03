"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: number
    className?: string
    strokeWidth?: number
}

export function LoadingSpinner({
    size = 24,
    className = "",
    strokeWidth = 2
}: LoadingSpinnerProps) {
    return (
        <Loader2
            className={cn("animate-spin", className)}
            size={size}
            strokeWidth={strokeWidth}
        />
    )
}