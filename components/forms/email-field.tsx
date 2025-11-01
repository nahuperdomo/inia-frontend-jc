"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react"

interface EmailFieldProps {
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

export function EmailField({
    value,
    onChange,
    error,
    touched,
    showLabel = true,
    label = "Correo Electrónico",
    placeholder = "usuario@example.com",
    helperText = "Debe ser único en el sistema",
    required = false,
    disabled = false,
    className = ""
}: EmailFieldProps) {
    const hasError = error && touched
    const isValid = !error && touched && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

    return (
        <div className={`space-y-2 ${className}`}>
            {showLabel && (
                <Label htmlFor="email">
                    {label} {required && "*"}
                </Label>
            )}
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id="email"
                    type="email"
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
