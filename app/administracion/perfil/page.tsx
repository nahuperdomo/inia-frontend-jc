"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { ArrowLeft, User, Mail, Lock, Shield, Save, Eye, EyeOff, AlertCircle, CheckCircle2, Edit, X } from "lucide-react"
import { Toaster } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { obtenerPerfil, actualizarPerfil } from "@/app/services/auth-service"
import { type AuthUsuarioDTO, type ActualizarPerfilRequest } from "@/app/models"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

const ROLES_LABELS: Record<string, string> = {
    "ADMIN": "Administrador",
    "ANALISTA": "Analista",
    "OBSERVADOR": "Observador"
}

const ROLES_COLORS: Record<string, "default" | "destructive" | "secondary"> = {
    "ADMIN": "destructive",
    "ANALISTA": "default",
    "OBSERVADOR": "secondary"
}

export default function PerfilPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [perfil, setPerfil] = useState<AuthUsuarioDTO | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Formulario
    const [formData, setFormData] = useState({
        nombre: "",
        nombres: "",
        apellidos: "",
        email: "",
        contraseniaActual: "",
        contraseniaNueva: "",
        contraseniaConfirmar: ""
    })

    // Estados de validación
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    useEffect(() => {
        cargarPerfil()
    }, [])

    const cargarPerfil = async () => {
        setIsLoading(true)
        try {
            const data = await obtenerPerfil()
            setPerfil(data)
            setFormData({
                nombre: data.nombre || "",
                nombres: data.nombres || "",
                apellidos: data.apellidos || "",
                email: data.email || "",
                contraseniaActual: "",
                contraseniaNueva: "",
                contraseniaConfirmar: ""
            })
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cargar perfil", {
                description: "No se pudo cargar la información del perfil"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Marcar campo como tocado
        if (!touched[field]) {
            setTouched(prev => ({ ...prev, [field]: true }))
        }
        
        // Limpiar error del campo al escribir
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Validar nombre de usuario
        if (!formData.nombre.trim()) {
            newErrors.nombre = "El nombre de usuario es requerido"
        } else if (formData.nombre.trim().length < 3) {
            newErrors.nombre = "El nombre de usuario debe tener al menos 3 caracteres"
        }

        // Validar nombres
        if (!formData.nombres.trim()) {
            newErrors.nombres = "El nombre es requerido"
        }

        // Validar apellidos
        if (!formData.apellidos.trim()) {
            newErrors.apellidos = "Los apellidos son requeridos"
        }

        // Validar email
        if (!formData.email.trim()) {
            newErrors.email = "El email es requerido"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "El email no es válido"
        }

        // Validar contraseña solo si se intenta cambiar
        if (formData.contraseniaNueva || formData.contraseniaActual || formData.contraseniaConfirmar) {
            if (!formData.contraseniaActual) {
                newErrors.contraseniaActual = "Debe ingresar su contraseña actual"
            }

            if (!formData.contraseniaNueva) {
                newErrors.contraseniaNueva = "Debe ingresar una nueva contraseña"
            } else if (formData.contraseniaNueva.length < 6) {
                newErrors.contraseniaNueva = "La contraseña debe tener al menos 6 caracteres"
            }

            if (!formData.contraseniaConfirmar) {
                newErrors.contraseniaConfirmar = "Debe confirmar la nueva contraseña"
            } else if (formData.contraseniaNueva !== formData.contraseniaConfirmar) {
                newErrors.contraseniaConfirmar = "Las contraseñas no coinciden"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Marcar todos los campos como tocados
        setTouched({
            nombre: true,
            nombres: true,
            apellidos: true,
            email: true,
            contraseniaActual: true,
            contraseniaNueva: true,
            contraseniaConfirmar: true
        })

        if (!validateForm()) {
            toast.error("Por favor corrija los errores en el formulario")
            return
        }

        setIsSaving(true)
        try {
            const request: ActualizarPerfilRequest = {
                nombre: formData.nombre,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                email: formData.email
            }

            // Solo incluir contraseña si se está cambiando
            if (formData.contraseniaNueva) {
                request.contraseniaActual = formData.contraseniaActual
                request.contraseniaNueva = formData.contraseniaNueva
            }

            const response = await actualizarPerfil(request)

            toast.success("Perfil actualizado", {
                description: "Sus datos han sido actualizados correctamente. Recargando sesión..."
            })

            // Actualizar el perfil local
            setPerfil(response.usuario)
            
            // Limpiar campos de contraseña
            setFormData(prev => ({
                ...prev,
                nombre: response.usuario.nombre,
                nombres: response.usuario.nombres,
                apellidos: response.usuario.apellidos,
                email: response.usuario.email,
                contraseniaActual: "",
                contraseniaNueva: "",
                contraseniaConfirmar: ""
            }))

            // Limpiar estados de validación
            setErrors({})
            setTouched({})
            
            // Desactivar modo edición
            setIsEditMode(false)
            
            // Recargar la página para refrescar el token y los permisos
            setTimeout(() => {
                window.location.reload()
            }, 1000)
            setErrors({})
            setTouched({})

        } catch (error: any) {
            console.error("Error:", error)
            const errorMessage = error?.message || "No se pudo actualizar el perfil"
            toast.error("Error al actualizar perfil", {
                description: errorMessage
            })
        } finally {
            setIsSaving(false)
        }
    }

    const hasChanges = (): boolean => {
        if (!perfil) return false
        
        return (
            formData.nombre !== perfil.nombre ||
            formData.nombres !== perfil.nombres ||
            formData.apellidos !== perfil.apellidos ||
            formData.email !== perfil.email ||
            formData.contraseniaNueva !== ""
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <User className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando perfil...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <div className="flex items-center gap-3 flex-1">
                        <Link href="/administracion">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div className="bg-primary rounded-full p-2">
                            <User className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">Mi Perfil</h1>
                            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                                Administra tu información personal y configuración
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                {/* Información del Usuario */}
                {perfil && (
                    <Card className="border-2">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                                            {perfil.nombres.charAt(0)}{perfil.apellidos.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                {perfil.nombres} {perfil.apellidos}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">@{perfil.nombre}</p>
                                        </div>
                                    </div>
                                    {!isEditMode && (
                                        <Button onClick={() => setIsEditMode(true)} variant="outline" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar Perfil
                                        </Button>
                                    )}
                                    {isEditMode && (
                                        <Button onClick={() => {
                                            setIsEditMode(false)
                                            cargarPerfil() // Recargar datos originales
                                        }} variant="outline" size="sm">
                                            <X className="h-4 w-4 mr-2" />
                                            Cancelar Edición
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Rol</p>
                                        <Badge 
                                            variant={ROLES_COLORS[perfil.roles?.[0]] || "default"}
                                            className="mt-1"
                                        >
                                            <Shield className="h-3 w-3 mr-1" />
                                            {ROLES_LABELS[perfil.roles?.[0]] || perfil.roles?.[0]}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Estado</p>
                                        <Badge 
                                            variant={perfil.activo ? "default" : "secondary"}
                                            className="mt-1"
                                        >
                                            {perfil.activo ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium mt-1">{perfil.email}</p>
                                    </div>
                                    {perfil.fechaRegistro && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Miembro desde</p>
                                            <p className="text-sm font-medium mt-1">
                                                {new Date(perfil.fechaRegistro).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                )}

                {/* Formulario de Edición */}
                {isEditMode && (
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>
                                    Actualiza tu información de perfil. Los campos marcados con * son obligatorios.
                                </CardDescription>
                            </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Información Básica */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Datos Personales
                                </h3>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Nombre de Usuario */}
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre">
                                            Nombre de Usuario *
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="nombre"
                                                value={formData.nombre}
                                                onChange={(e) => handleInputChange("nombre", e.target.value)}
                                                className={`pl-9 ${errors.nombre && touched.nombre ? "border-red-500" : ""}`}
                                                placeholder="usuario123"
                                            />
                                        </div>
                                        {errors.nombre && touched.nombre && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.nombre}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Debe ser único en el sistema
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Correo Electrónico *
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                className={`pl-9 ${errors.email && touched.email ? "border-red-500" : ""}`}
                                                placeholder="usuario@example.com"
                                            />
                                        </div>
                                        {errors.email && touched.email && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.email}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Debe ser único en el sistema
                                        </p>
                                    </div>

                                    {/* Nombres */}
                                    <div className="space-y-2">
                                        <Label htmlFor="nombres">
                                            Nombres *
                                        </Label>
                                        <Input
                                            id="nombres"
                                            value={formData.nombres}
                                            onChange={(e) => handleInputChange("nombres", e.target.value)}
                                            className={errors.nombres && touched.nombres ? "border-red-500" : ""}
                                            placeholder="Juan Carlos"
                                        />
                                        {errors.nombres && touched.nombres && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.nombres}
                                            </p>
                                        )}
                                    </div>

                                    {/* Apellidos */}
                                    <div className="space-y-2">
                                        <Label htmlFor="apellidos">
                                            Apellidos *
                                        </Label>
                                        <Input
                                            id="apellidos"
                                            value={formData.apellidos}
                                            onChange={(e) => handleInputChange("apellidos", e.target.value)}
                                            className={errors.apellidos && touched.apellidos ? "border-red-500" : ""}
                                            placeholder="Pérez García"
                                        />
                                        {errors.apellidos && touched.apellidos && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.apellidos}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Cambio de Contraseña */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Lock className="h-5 w-5" />
                                        Cambiar Contraseña
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Deja estos campos en blanco si no deseas cambiar tu contraseña
                                    </p>
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Por seguridad, necesitas ingresar tu contraseña actual para realizar cambios en tu contraseña.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid gap-4 md:grid-cols-1">
                                    {/* Contraseña Actual */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contraseniaActual">
                                            Contraseña Actual
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="contraseniaActual"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.contraseniaActual}
                                                onChange={(e) => handleInputChange("contraseniaActual", e.target.value)}
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
                                            <Label htmlFor="contraseniaNueva">
                                                Nueva Contraseña
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="contraseniaNueva"
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={formData.contraseniaNueva}
                                                    onChange={(e) => handleInputChange("contraseniaNueva", e.target.value)}
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
                                            <Label htmlFor="contraseniaConfirmar">
                                                Confirmar Nueva Contraseña
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="contraseniaConfirmar"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.contraseniaConfirmar}
                                                    onChange={(e) => handleInputChange("contraseniaConfirmar", e.target.value)}
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
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cargarPerfil}
                                    disabled={isSaving || !hasChanges()}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving || !hasChanges()}
                                    className="w-full sm:w-auto"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </Button>
                            </div>

                            {hasChanges() && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Tienes cambios sin guardar. Haz clic en "Guardar Cambios" para aplicarlos.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </form>
                )}

                {/* Información Adicional */}
                {perfil && (
                    <Card className="border-muted">
                        <CardHeader>
                            <CardTitle className="text-sm">Información de la Cuenta</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <div className="flex justify-between">
                                <span>ID de Usuario:</span>
                                <span className="font-mono">{perfil.usuarioID}</span>
                            </div>
                            {perfil.fechaRegistro && (
                                <div className="flex justify-between">
                                    <span>Miembro desde:</span>
                                    <span>{new Date(perfil.fechaRegistro).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Toaster richColors />
        </div>
    )
}
