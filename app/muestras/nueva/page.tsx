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
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, TestTube } from "lucide-react"
import Link from "next/link"

interface MuestraFormData {
  cliente: string
  lote: string
  especie: string
  cultivar: string
  fechaRecepcion: string
  pesoMuestra: string
  procedencia: string
  observaciones: string
  analisisPureza: boolean
  analisisGerminacion: boolean
  analisisPMS: boolean
  analisisTetrazolio: boolean
  analisisDOSN: boolean
}

export default function NuevaMuestraPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<MuestraFormData>({
    cliente: "",
    lote: "",
    especie: "",
    cultivar: "",
    fechaRecepcion: "",
    pesoMuestra: "",
    procedencia: "",
    observaciones: "",
    analisisPureza: false,
    analisisGerminacion: false,
    analisisPMS: false,
    analisisTetrazolio: false,
    analisisDOSN: false,
  })

  const handleInputChange = (field: keyof MuestraFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Generate unique analysis number
    const numeroAnalisis = `AN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/muestras")
    }, 2000)
  }

  const especies = [
    "Glycine max (Soja)",
    "Zea mays (Maíz)",
    "Triticum aestivum (Trigo)",
    "Helianthus annuus (Girasol)",
    "Sorghum bicolor (Sorgo)",
    "Hordeum vulgare (Cebada)",
    "Oryza sativa (Arroz)",
  ]

  const clientes = [
    "Cooperativa Norte",
    "Semillas del Sur",
    "AgroTech",
    "Instituto Semillas",
    "Productores Unidos",
    "Semillas Premium",
    "Cooperativa Central",
  ]

  const selectedAnalysis = [
    formData.analisisPureza && "Pureza",
    formData.analisisGerminacion && "Germinación",
    formData.analisisPMS && "PMS",
    formData.analisisTetrazolio && "Tetrazolio",
    formData.analisisDOSN && "DOSN",
  ].filter(Boolean)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/muestras">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Muestras
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Registrar Nueva Muestra</h1>
            <p className="text-muted-foreground text-pretty">Ingresa una nueva muestra al sistema de laboratorio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TestTube className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Muestra</CardTitle>
                <CardDescription>Datos básicos de identificación de la muestra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente">Cliente *</Label>
                    <Select value={formData.cliente} onValueChange={(value) => handleInputChange("cliente", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente} value={cliente}>
                            {cliente}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lote">Lote *</Label>
                    <Input
                      id="lote"
                      placeholder="LT-2024-001"
                      value={formData.lote}
                      onChange={(e) => handleInputChange("lote", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="especie">Especie *</Label>
                    <Select value={formData.especie} onValueChange={(value) => handleInputChange("especie", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar especie" />
                      </SelectTrigger>
                      <SelectContent>
                        {especies.map((especie) => (
                          <SelectItem key={especie} value={especie}>
                            {especie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cultivar">Cultivar *</Label>
                    <Input
                      id="cultivar"
                      placeholder="Don Mario 4.2"
                      value={formData.cultivar}
                      onChange={(e) => handleInputChange("cultivar", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="fechaRecepcion">Fecha de Recepción *</Label>
                    <Input
                      id="fechaRecepcion"
                      type="date"
                      value={formData.fechaRecepcion}
                      onChange={(e) => handleInputChange("fechaRecepcion", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pesoMuestra">Peso de la Muestra (g)</Label>
                    <Input
                      id="pesoMuestra"
                      type="number"
                      placeholder="500"
                      value={formData.pesoMuestra}
                      onChange={(e) => handleInputChange("pesoMuestra", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="procedencia">Procedencia</Label>
                    <Input
                      id="procedencia"
                      placeholder="Campo Norte - Sector A"
                      value={formData.procedencia}
                      onChange={(e) => handleInputChange("procedencia", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Solicitados</CardTitle>
                <CardDescription>Selecciona los análisis que se realizarán sobre esta muestra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pureza"
                      checked={formData.analisisPureza}
                      onCheckedChange={(checked) => handleInputChange("analisisPureza", checked as boolean)}
                    />
                    <Label
                      htmlFor="pureza"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Análisis de Pureza Física
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="germinacion"
                      checked={formData.analisisGerminacion}
                      onCheckedChange={(checked) => handleInputChange("analisisGerminacion", checked as boolean)}
                    />
                    <Label
                      htmlFor="germinacion"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ensayo de Germinación
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pms"
                      checked={formData.analisisPMS}
                      onCheckedChange={(checked) => handleInputChange("analisisPMS", checked as boolean)}
                    />
                    <Label
                      htmlFor="pms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Peso de Mil Semillas (PMS)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tetrazolio"
                      checked={formData.analisisTetrazolio}
                      onCheckedChange={(checked) => handleInputChange("analisisTetrazolio", checked as boolean)}
                    />
                    <Label
                      htmlFor="tetrazolio"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ensayo de Tetrazolio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="dosn"
                      checked={formData.analisisDOSN}
                      onCheckedChange={(checked) => handleInputChange("analisisDOSN", checked as boolean)}
                    />
                    <Label
                      htmlFor="dosn"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Determinación de Otras Semillas Nocivas (DOSN)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
                <CardDescription>Información adicional relevante para el análisis</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ingrese observaciones sobre la muestra, condiciones especiales, tratamientos previos, etc."
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
                <CardTitle>Resumen de la Muestra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{formData.cliente || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="font-medium">{formData.lote || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Especie:</span>
                    <span className="font-medium">{formData.especie || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cultivar:</span>
                    <span className="font-medium">{formData.cultivar || "-"}</span>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Análisis Seleccionados:</p>
                    {selectedAnalysis.length > 0 ? (
                      <div className="space-y-1">
                        {selectedAnalysis.map((analisis, i) => (
                          <div key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {analisis}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Ningún análisis seleccionado</p>
                    )}
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
                <Button type="submit" className="w-full" disabled={isLoading || selectedAnalysis.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Registrando..." : "Registrar Muestra"}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Guardar como Borrador
                </Button>
                <Button type="button" variant="ghost" className="w-full">
                  Limpiar Formulario
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Los campos marcados con * son obligatorios</p>
                  <p>• Debe seleccionar al menos un análisis</p>
                  <p>• Se generará un número de análisis único</p>
                  <p>• La muestra quedará en estado "En curso"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
