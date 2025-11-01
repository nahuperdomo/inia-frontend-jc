"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, AlertCircle, CheckCircle2 } from "lucide-react"

interface UsuarioFieldProps {
    value: string
    onChange: (value: string) => void
    error?: string
    touched?: boolean
    showLabel?: boolean
    label?: string
    placeholder?: string
    helperText?: string
    required?: boolean
    disabled?: boolean
    className?: string
}

export function UsuarioField({
    value,
    onChange,
    error,
    touched,
    showLabel = true,
    label = "Nombre de Usuario",
    placeholder = "usuario123",
    helperText = "Debe ser único en el sistema",
    required = false,
    disabled = false,
    className = ""
}: UsuarioFieldProps) {
    const hasError = error && touched
    const isValid = !error && touched && value.length >= 3

    return (
        <div className={`space-y-2 ${className}`}>
            {showLabel && (
                <Label htmlFor="nombre">
                    {label} {required && "*"}
                </Label>
            )}
            <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="nombre"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`pl-9 pr-9 ${hasError ? "border-red-500" : ""} ${isValid ? "border-green-500" : ""}`}
                    placeholder={placeholder}
                />
                {isValid && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
            </div>
            {hasError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
            {!hasError && helperText && (
                <p className="text-xs text-muted-foreground">
                    {helperText}
                </p>
            )}
        </div>
    )
}
