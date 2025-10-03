"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Leaf, ArrowLeft, CheckCircle, Clock } from "lucide-react"
import { toast } from 'sonner'
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UsuarioFormData {
    nombre: string
    nombres: string
    apellidos: string
    email: string
    password: string
    confirmPassword: string
}

interface FormErrors {
    nombre?: string
    nombres?: string
    apellidos?: string
    email?: string
    password?: string
    confirmPassword?: string
}

export default function RegistroUsuarioPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [formData, setFormData] = useState<UsuarioFormData>({
        nombre: "",
        nombres: "",
        apellidos: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Record<keyof UsuarioFormData, boolean>>({
        nombre: false,
        nombres: false,
        apellidos: false,
        email: false,
        password: false,
        confirmPassword: false,
    })

    // Función para marcar un campo como tocado cuando pierde el foco
    const handleBlur = (field: keyof UsuarioFormData) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        validateField(field, formData[field])
    }

    // Función para validar un campo específico
    const validateField = (field: keyof UsuarioFormData, value: string): string => {
        let errorMessage = ""

        switch (field) {
            case "nombre":
                if (!value.trim()) {
                    errorMessage = "El nombre de usuario es obligatorio"
                } else if (value.length < 3) {
                    errorMessage = "El nombre de usuario debe tener al menos 3 caracteres"
                } else if (!/^[a-zA-Z0-9._]+$/.test(value)) {
                    errorMessage = "El nombre de usuario solo puede contener letras, números, puntos y guiones bajos"
                }
                break

            case "nombres":
                if (!value.trim()) {
                    errorMessage = "El nombre es obligatorio"
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    errorMessage = "El nombre solo puede contener letras"
                }
                break

            case "apellidos":
                if (!value.trim()) {
                    errorMessage = "El apellido es obligatorio"
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    errorMessage = "El apellido solo puede contener letras"
                }
                break

            case "email":
                if (!value.trim()) {
                    errorMessage = "El correo electrónico es obligatorio"
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = "Introduce un correo electrónico válido"
                }
                break

            case "password":
                if (!value) {
                    errorMessage = "La contraseña es obligatoria"
                } else if (value.length < 6) {
                    errorMessage = "La contraseña debe tener al menos 6 caracteres"
                } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) {
                    errorMessage = "La contraseña debe contener al menos una letra y un número"
                }
                break

            case "confirmPassword":
                if (!value) {
                    errorMessage = "Confirma tu contraseña"
                } else if (value !== formData.password) {
                    errorMessage = "Las contraseñas no coinciden"
                }
                break
        }

        // Actualizar el estado de errores para este campo
        setErrors(prev => ({ ...prev, [field]: errorMessage }))
        return errorMessage
    }

    // Función para validar todo el formulario
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        let isValid = true

        // Marcar todos los campos como tocados
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            return { ...acc, [key]: true }
        }, {}) as Record<keyof UsuarioFormData, boolean>

        setTouched(allTouched)

        // Validar cada campo
        Object.entries(formData).forEach(([field, value]) => {
            const error = validateField(field as keyof UsuarioFormData, value)
            if (error) {
                isValid = false
            }
        })

        return isValid
    }

    const handleInputChange = (field: keyof UsuarioFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        // Si el campo ya ha sido tocado, validarlo en tiempo real
        if (touched[field]) {
            validateField(field, value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar todo el formulario
        if (!validateForm()) {
            toast.error("Formulario incompleto o con errores", {
                description: "Por favor revisa los campos marcados en rojo"
            })
            return
        }

        setIsLoading(true)

        try {
            // Aquí iría la llamada a la API para registrar el usuario
            // De momento simulamos un retardo para mostrar el estado de carga
            await new Promise(resolve => setTimeout(resolve, 1500))

            toast.success("Registro exitoso", {
                description: "Se ha enviado una solicitud de registro"
            })

            // Mostrar el diálogo de éxito en lugar de redirigir inmediatamente
            setShowSuccessDialog(true)

        } catch (error) {
            toast.error("Error al registrar usuario", {
                description: "Ha ocurrido un problema. Por favor intenta nuevamente."
            })
            setIsLoading(false)
        }
    }

    // Función para manejar el cierre del diálogo y redirección
    const handleDialogClose = () => {
        setShowSuccessDialog(false)
        router.push("/login")
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-100 p-4">
            <div className="w-full max-w-lg">
                <Card className="shadow-lg border-t-4 border-t-primary">
                    <CardHeader className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-primary rounded-full p-3">
                                <Leaf className="h-8 w-8 text-primary-foreground" />
                            </div>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-balance">Registro de Usuario</CardTitle>
                            <CardDescription className="text-pretty">
                                Crea tu cuenta para acceder al Sistema INIA
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="nombre">Nombre de Usuario *</Label>
                                    <Input
                                        id="nombre"
                                        placeholder="nombre.apellido"
                                        value={formData.nombre}
                                        onChange={(e) => handleInputChange("nombre", e.target.value)}
                                        onBlur={() => handleBlur("nombre")}
                                        className={errors.nombre && touched.nombre ? "border-red-500" : ""}
                                        required
                                        autoComplete="username"
                                    />
                                    {errors.nombre && touched.nombre && (
                                        <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="nombres">Nombres *</Label>
                                    <Input
                                        id="nombres"
                                        placeholder="Juan Carlos"
                                        value={formData.nombres}
                                        onChange={(e) => handleInputChange("nombres", e.target.value)}
                                        onBlur={() => handleBlur("nombres")}
                                        className={errors.nombres && touched.nombres ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.nombres && touched.nombres && (
                                        <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="apellidos">Apellidos *</Label>
                                    <Input
                                        id="apellidos"
                                        placeholder="García López"
                                        value={formData.apellidos}
                                        onChange={(e) => handleInputChange("apellidos", e.target.value)}
                                        onBlur={() => handleBlur("apellidos")}
                                        className={errors.apellidos && touched.apellidos ? "border-red-500" : ""}
                                        required
                                    />
                                    {errors.apellidos && touched.apellidos && (
                                        <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="usuario@ejemplo.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        onBlur={() => handleBlur("email")}
                                        className={errors.email && touched.email ? "border-red-500" : ""}
                                        required
                                        autoComplete="email"
                                    />
                                    {errors.email && touched.email && (
                                        <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password">Contraseña *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        onBlur={() => handleBlur("password")}
                                        className={errors.password && touched.password ? "border-red-500" : ""}
                                        required
                                        autoComplete="new-password"
                                    />
                                    {errors.password && touched.password && (
                                        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword">Confirmar *</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Repetir contraseña"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                        onBlur={() => handleBlur("confirmPassword")}
                                        className={errors.confirmPassword && touched.confirmPassword ? "border-red-500" : ""}
                                        required
                                        autoComplete="new-password"
                                    />
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <p className="text-xs text-muted-foreground">
                                    Al registrarte, tu solicitud será revisada por un administrador antes de
                                    poder acceder al sistema.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? "Registrando..." : "Registrar cuenta"}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center border-t pt-4">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al inicio de sesión
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            {/* Diálogo de éxito del registro */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Solicitud enviada con éxito</DialogTitle>
                        <DialogDescription className="text-center">
                            Tu solicitud de registro ha sido recibida correctamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col space-y-3 py-3">
                        <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Esperando aprobación</p>
                                <p className="text-xs text-muted-foreground">
                                    El/la administrador/a del sistema debe aprobar tu solicitud antes de que puedas acceder.
                                    Este proceso puede tomar algún tiempo.
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground text-center">
                            Una vez aprobada tu solicitud, recibirás una notificación
                            por correo electrónico.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleDialogClose} className="w-full">
                            Entendido, ir a inicio de sesión
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
