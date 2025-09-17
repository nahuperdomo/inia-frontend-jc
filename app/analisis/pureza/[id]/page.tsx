"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Calculator, Search } from "lucide-react"
import Link from "next/link"

interface PurezaResults {
  pesoInicial: string
  semillaPura: string
  materiaInerte: string
  otrosCultivos: string
  malezas: string
  observaciones: string
}

export default function PurezaAnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PurezaResults>({
    pesoInicial: "100.0",
    semillaPura: "",
    materiaInerte: "",
    otrosCultivos: "",
    malezas: "",
    observaciones: "",
  })

  // Mock analysis data
  const analysisData = {
    id: params.id,
    muestra: "RG-LE-ex-0021",
    cliente: "Instituto Semillas",
    especie: "Helianthus annuus",
    cultivar: "Paraíso 20",
    lote: "LT-2024-004",
    fechaInicio: "2024-12-13",
    responsable: "Dr. Juan Pérez",
    estado: "En progreso",
  }

  const handleInputChange = (field: keyof PurezaResults, value: string) => {
    setResults((prev) => ({ ...prev, [field]: value }))
  }

  const calculatePercentages = () => {
    const pesoInicial = Number.parseFloat(results.pesoInicial) || 0
    const semillaPura = Number.parseFloat(results.semillaPura) || 0
    const materiaInerte = Number.parseFloat(results.materiaInerte) || 0
    const otrosCultivos = Number.parseFloat(results.otrosCultivos) || 0
    const malezas = Number.parseFloat(results.malezas) || 0

    const total = semillaPura + materiaInerte + otrosCultivos + malezas
    const diferencia = pesoInicial - total

    return {
      porcentajeSemillaPura: pesoInicial > 0 ? ((semillaPura / pesoInicial) * 100).toFixed(2) : "0.00",
      porcentajeMateriaInerte: pesoInicial > 0 ? ((materiaInerte / pesoInicial) * 100).toFixed(2) : "0.00",
      porcentajeOtrosCultivos: pesoInicial > 0 ? ((otrosCultivos / pesoInicial) * 100).toFixed(2) : "0.00",
      porcentajeMalezas: pesoInicial > 0 ? ((malezas / pesoInicial) * 100).toFixed(2) : "0.00",
      totalPeso: total.toFixed(2),
      diferencia: diferencia.toFixed(2),
      totalPorcentaje: pesoInicial > 0 ? ((total / pesoInicial) * 100).toFixed(2) : "0.00",
    }
  }

  const calculations = calculatePercentages()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/analisis/pureza")
    }, 2000)
  }

  const isFormValid = () => {
    return (
      results.pesoInicial && results.semillaPura && results.materiaInerte && results.otrosCultivos && results.malezas
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/analisis/pureza">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Pureza
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Análisis de Pureza - {analysisData.id}</h1>
            <p className="text-muted-foreground text-pretty">Registro de resultados de pureza física</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{analysisData.estado}</Badge>
          <Search className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sample Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Muestra</CardTitle>
                <CardDescription>Datos de la muestra en análisis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Muestra</Label>
                    <p className="font-medium">{analysisData.muestra}</p>
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <p className="font-medium">{analysisData.cliente}</p>
                  </div>
                  <div>
                    <Label>Especie</Label>
                    <p className="font-medium">{analysisData.especie}</p>
                  </div>
                  <div>
                    <Label>Cultivar</Label>
                    <p className="font-medium">{analysisData.cultivar}</p>
                  </div>
                  <div>
                    <Label>Lote</Label>
                    <p className="font-medium">{analysisData.lote}</p>
                  </div>
                  <div>
                    <Label>Responsable</Label>
                    <p className="font-medium">{analysisData.responsable}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>Ingrese los pesos obtenidos en el análisis de pureza</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pesoInicial">Peso Inicial (g) *</Label>
                    <Input
                      id="pesoInicial"
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={results.pesoInicial}
                      onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalcular
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semillaPura">Semilla Pura (g) *</Label>
                    <Input
                      id="semillaPura"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={results.semillaPura}
                      onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-green-50 rounded border">
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-bold text-green-600">{calculations.porcentajeSemillaPura}%</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="materiaInerte">Materia Inerte (g) *</Label>
                    <Input
                      id="materiaInerte"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={results.materiaInerte}
                      onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-gray-50 rounded border">
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-bold">{calculations.porcentajeMateriaInerte}%</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="otrosCultivos">Otros Cultivos (g) *</Label>
                    <Input
                      id="otrosCultivos"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={results.otrosCultivos}
                      onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-blue-50 rounded border">
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-bold text-blue-600">{calculations.porcentajeOtrosCultivos}%</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="malezas">Malezas (g) *</Label>
                    <Input
                      id="malezas"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={results.malezas}
                      onChange={(e) => handleInputChange("malezas", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <div className="w-full p-2 bg-red-50 rounded border">
                      <p className="text-sm text-muted-foreground">Porcentaje</p>
                      <p className="font-bold text-red-600">{calculations.porcentajeMalezas}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
                <CardDescription>Notas adicionales sobre el análisis</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ingrese observaciones sobre el análisis, anomalías encontradas, condiciones especiales, etc."
                  value={results.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calculations Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Cálculos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Peso Total:</span>
                    <span className="font-medium">{calculations.totalPeso} g</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Diferencia:</span>
                    <span
                      className={`font-medium ${Math.abs(Number.parseFloat(calculations.diferencia)) > 0.1 ? "text-red-600" : "text-green-600"}`}
                    >
                      {calculations.diferencia} g
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total %:</span>
                    <span className="font-medium">{calculations.totalPorcentaje}%</span>
                  </div>
                  <Separator />
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Semilla Pura:</span>
                      <span className="font-bold text-green-600">{calculations.porcentajeSemillaPura}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Materia Inerte:</span>
                      <span className="font-medium">{calculations.porcentajeMateriaInerte}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Otros Cultivos:</span>
                      <span className="font-medium text-blue-600">{calculations.porcentajeOtrosCultivos}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Malezas:</span>
                      <span className="font-medium text-red-600">{calculations.porcentajeMalezas}%</span>
                    </div>
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
                <Button type="submit" className="w-full" disabled={isLoading || !isFormValid()}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar Resultados"}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Guardar como Borrador
                </Button>
                <Button type="button" variant="ghost" className="w-full">
                  Limpiar Formulario
                </Button>
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle>Validación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div
                    className={`flex items-center gap-2 ${Math.abs(Number.parseFloat(calculations.diferencia)) <= 0.1 ? "text-green-600" : "text-red-600"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${Math.abs(Number.parseFloat(calculations.diferencia)) <= 0.1 ? "bg-green-600" : "bg-red-600"}`}
                    ></div>
                    <span>
                      Diferencia de peso:{" "}
                      {Math.abs(Number.parseFloat(calculations.diferencia)) <= 0.1 ? "Aceptable" : "Revisar"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${Number.parseFloat(calculations.totalPorcentaje) >= 99 && Number.parseFloat(calculations.totalPorcentaje) <= 101 ? "text-green-600" : "text-red-600"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${Number.parseFloat(calculations.totalPorcentaje) >= 99 && Number.parseFloat(calculations.totalPorcentaje) <= 101 ? "bg-green-600" : "bg-red-600"}`}
                    ></div>
                    <span>
                      Suma de porcentajes:{" "}
                      {Number.parseFloat(calculations.totalPorcentaje) >= 99 &&
                      Number.parseFloat(calculations.totalPorcentaje) <= 101
                        ? "Correcto"
                        : "Revisar"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
