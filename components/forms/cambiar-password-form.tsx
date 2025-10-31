"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useState } from "react"

interface CambiarPasswordFormProps {
    contraseniaActual: string
    contraseniaNueva: string
    contraseniaConfirmar: string
    onChangeContraseniaActual: (value: string) => void
    onChangeContraseniaNueva: (value: string) => void
    onChangeContraseniaConfirmar: (value: string) => void
    errors?: {
        contraseniaActual?: string
        contraseniaNueva?: string
        contraseniaConfirmar?: string
    }
    touched?: {
        contraseniaActual?: boolean
        contraseniaNueva?: boolean
        contraseniaConfirmar?: boolean
    }
    showLabels?: boolean
    className?: string
}

export function CambiarPasswordForm({
    contraseniaActual,
    contraseniaNueva,
    contraseniaConfirmar,
    onChangeContraseniaActual,
    onChangeContraseniaNueva,
    onChangeContraseniaConfirmar,
    errors = {},
    touched = {},
    showLabels = true,
    className = ""
}: CambiarPasswordFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className={`space-y-4 ${className}`}>
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Por seguridad, necesitas ingresar tu contraseña actual para realizar cambios.
                </AlertDescription>
            </Alert>

            {/* Contraseña Actual */}
            <div className="space-y-2">
                {showLabels && (
                    <Label htmlFor="contraseniaActual">
                        Contraseña Actual
                    </Label>
                )}
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="contraseniaActual"
                        type={showPassword ? "text" : "password"}
                        value={contraseniaActual}
                        onChange={(e) => onChangeContraseniaActual(e.target.value)}
                        className={`pl-9 pr-10 ${errors.contraseniaActual && touched.contraseniaActual ? "border-red-500" : ""}`}
                        placeholder="••••••••"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.contraseniaActual && touched.contraseniaActual && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.contraseniaActual}
                    </p>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Nueva Contraseña */}
                <div className="space-y-2">
                    {showLabels && (
                        <Label htmlFor="contraseniaNueva">
                            Nueva Contraseña
                        </Label>
                    )}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="contraseniaNueva"
                            type={showNewPassword ? "text" : "password"}
                            value={contraseniaNueva}
                            onChange={(e) => onChangeContraseniaNueva(e.target.value)}
                            className={`pl-9 pr-10 ${errors.contraseniaNueva && touched.contraseniaNueva ? "border-red-500" : ""}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.contraseniaNueva && touched.contraseniaNueva && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.contraseniaNueva}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Mínimo 6 caracteres
                    </p>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                    {showLabels && (
                        <Label htmlFor="contraseniaConfirmar">
                            Confirmar Nueva Contraseña
                        </Label>
                    )}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="contraseniaConfirmar"
                            type={showConfirmPassword ? "text" : "password"}
                            value={contraseniaConfirmar}
                            onChange={(e) => onChangeContraseniaConfirmar(e.target.value)}
                            className={`pl-9 pr-10 ${errors.contraseniaConfirmar && touched.contraseniaConfirmar ? "border-red-500" : ""}`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.contraseniaConfirmar && touched.contraseniaConfirmar && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.contraseniaConfirmar}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
