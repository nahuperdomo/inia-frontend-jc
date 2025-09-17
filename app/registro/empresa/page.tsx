"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Building } from "lucide-react"
import Link from "next/link"

interface EmpresaFormData {
  nombre: string
  rut: string
  direccion: string
  telefono: string
  email: string
  contactoPrincipal: string
  tipoEmpresa: string
  sector: string
  observaciones: string
}

export default function RegistroEmpresaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<EmpresaFormData>({
    nombre: "",
    rut: "",
    direccion: "",
    telefono: "",
    email: "",
    contactoPrincipal: "",
    tipoEmpresa: "",
    sector: "",
    observaciones: "",
  })

  const handleInputChange = (field: keyof EmpresaFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
            <h1 className="text-3xl font-bold text-balance">Registro de Empresa</h1>
            <p className="text-muted-foreground text-pretty">Registra una nueva empresa en el sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>Datos principales de la empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                    <Input
                      id="nombre"
                      placeholder="Nombre completo de la empresa"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      placeholder="12.345.678-9"
                      value={formData.rut}
                      onChange={(e) => handleInputChange("rut", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipoEmpresa">Tipo de Empresa *</Label>
                    <Select
                      value={formData.tipoEmpresa}
                      onValueChange={(value) => handleInputChange("tipoEmpresa", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publica">Pública</SelectItem>
                        <SelectItem value="privada">Privada</SelectItem>
                        <SelectItem value="cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="instituto">Instituto de Investigación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      placeholder="Dirección completa"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Datos de contacto y persona responsable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      placeholder="+598 2xxx xxxx"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@empresa.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactoPrincipal">Contacto Principal *</Label>
                    <Input
                      id="contactoPrincipal"
                      placeholder="Nombre del responsable"
                      value={formData.contactoPrincipal}
                      onChange={(e) => handleInputChange("contactoPrincipal", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector de Actividad</Label>
                    <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agricultura">Agricultura</SelectItem>
                        <SelectItem value="ganaderia">Ganadería</SelectItem>
                        <SelectItem value="investigacion">Investigación</SelectItem>
                        <SelectItem value="comercializacion">Comercialización</SelectItem>
                        <SelectItem value="procesamiento">Procesamiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
                <CardDescription>Observaciones y notas relevantes</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Información adicional sobre la empresa, servicios, especialidades, etc."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Empresa:</span>
                    <span className="font-medium">{formData.nombre || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RUT:</span>
                    <span className="font-medium">{formData.rut || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{formData.tipoEmpresa || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Contacto:</span>
                    <span className="font-medium">{formData.contactoPrincipal || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Registrando..." : "Registrar Empresa"}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Guardar como Borrador
                </Button>
                <Button type="button" variant="ghost" className="w-full">
                  Limpiar Formulario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
