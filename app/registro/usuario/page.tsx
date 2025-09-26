"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Users } from "lucide-react"
import Link from "next/link"

interface UsuarioFormData {
  nombre: string
  nombres: string
  apellidos: string
  email: string
  rol: "analista" | "administrador" | "observador" | ""
  estado: "activo" | "inactivo" | "pendiente" | ""
  activo: boolean
  password: string
  confirmPassword: string
}

export default function RegistroUsuarioPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UsuarioFormData>({
    nombre: "",
    nombres: "",
    apellidos: "",
    email: "",
    rol: "",
    estado: "",
    activo: true,
    password: "",
    confirmPassword: "",
  })

  const handleInputChange = (field: keyof UsuarioFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/registro")
    }, 2000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/registro">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Registro
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Registro de Usuario</h1>
            <p className="text-muted-foreground text-pretty">Registra un nuevo usuario en el sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="max-w-4xl space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>Datos personales del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre de Usuario *</Label>
                  <Input
                    id="nombre"
                    placeholder="nombre.usuario"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Nombre único para iniciar sesión</p>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@inia.org.uy"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    placeholder="Juan Carlos"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange("nombres", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    placeholder="García López"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange("apellidos", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Access */}
          <Card>
            <CardHeader>
              <CardTitle>Acceso al Sistema</CardTitle>
              <CardDescription>Configuración de rol y permisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rol">Rol del Usuario *</Label>
                  <Select value={formData.rol} onValueChange={(value) => handleInputChange("rol", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analista">Analista</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="observador">Observador</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.rol === "analista" && "Puede registrar muestras y cargar resultados"}
                    {formData.rol === "administrador" && "Acceso completo al sistema"}
                    {formData.rol === "observador" && "Solo puede ver resultados y reportes"}
                  </p>
                </div>
                <div>
                  <Label htmlFor="estado">Estado del Usuario *</Label>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => handleInputChange("activo", checked)}
                    />
                    <Label htmlFor="activo">Usuario activo</Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Los usuarios inactivos no pueden acceder al sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Contraseña</CardTitle>
              <CardDescription>Establece la contraseña inicial del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repetir contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-destructive">Las contraseñas no coinciden</p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
