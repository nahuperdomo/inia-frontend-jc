"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, TestTube, Sprout, Scale, Microscope } from "lucide-react"
import Link from "next/link"

import DosnFields from "@/app/registro/analisis/dosn/form-dosn"

// Mock data for lotes
const mockLotes = [
  { id: "L001", codigo: "TRIGO-2024-001", especie: "Trigo", variedad: "Klein Guerrero", ubicacion: "Sector A-1" },
  { id: "L002", codigo: "SOJA-2024-002", especie: "Soja", variedad: "DM 4670", ubicacion: "Sector B-2" },
  { id: "L003", codigo: "MAIZ-2024-003", especie: "Maíz", variedad: "AX 7721", ubicacion: "Sector C-1" },
]

const analysisTypes = [
  {
    id: "pureza",
    name: "Pureza Física",
    description: "Análisis de pureza física de semillas",
    icon: Search,
    color: "blue",
  },
  {
    id: "germinacion",
    name: "Germinación",
    description: "Ensayos de germinación estándar",
    icon: Sprout,
    color: "green",
  },
  {
    id: "pms",
    name: "Peso de Mil Semillas",
    description: "Determinación del peso de mil semillas",
    icon: Scale,
    color: "purple",
  },
  {
    id: "tetrazolio",
    name: "Tetrazolio",
    description: "Ensayo de viabilidad y vigor",
    icon: TestTube,
    color: "orange",
  },
  {
    id: "dosn",
    name: "DOSN",
    description: "Determinación de otras semillas nocivas",
    icon: Microscope,
    color: "red",
  },
]

export default function RegistroAnalisisPage() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("")
  const [selectedLote, setSelectedLote] = useState("")
  const [formData, setFormData] = useState({
    fechaInicio: "",
    responsable: "",
    prioridad: "",
    observaciones: "",

    // Campos específicos de pureza física
    pesoInicial: "",
    semillaPura: "",
    materiaInerte: "",
    otrosCultivos: "",
    malezas: "",
    malezasToleridas: "",
    pesoTotal: "",

    // Campos específicos - DOSN (INIA)
    iniaFecha: "",
    iniaGramos: "",
    iniaCompleto: false,
    iniaReducido: false,
    iniaLimitado: false,
    iniaReducidoLimitado: false,

    // Campos específicos - DOSN (INASE)
    inaseFecha: "",
    inaseGramos: "",
    inaseCompleto: false,
    inaseReducido: false,
    inaseLimitado: false,
    inaseReducidoLimitado: false,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getAnalysisTypeColor = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50 hover:border-blue-300",
      green: "border-green-200 bg-green-50 hover:border-green-300",
      purple: "border-purple-200 bg-purple-50 hover:border-purple-300",
      orange: "border-orange-200 bg-orange-50 hover:border-orange-300",
      red: "border-red-200 bg-red-50 hover:border-red-300",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const selectedLoteInfo = selectedLote ? mockLotes.find((lote) => lote.id === selectedLote) : null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/registro">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Registro
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Registro de Análisis</h1>
          <p className="text-muted-foreground">Registra nuevos análisis para lotes existentes en el sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Tipo de Análisis</CardTitle>
          <p className="text-sm text-muted-foreground">Elige el tipo de análisis que deseas registrar</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = selectedAnalysisType === type.id
              return (
                <div
                  key={type.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? `${getAnalysisTypeColor(type.color)} border-${type.color}-400`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAnalysisType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`h-5 w-5 ${isSelected ? `text-${type.color}-600` : "text-gray-500"}`} />
                    <h3 className="font-semibold">{type.name}</h3>
                    {isSelected && (
                      <span className={`text-xs px-2 py-1 rounded-full bg-${type.color}-100 text-${type.color}-700`}>
                        Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Análisis</CardTitle>
          <p className="text-sm text-muted-foreground">Completa la información para registrar el análisis</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lote">Lote a Analizar</Label>
                <Select value={selectedLote} onValueChange={setSelectedLote}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lote existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLotes.map((lote) => (
                      <SelectItem key={lote.id} value={lote.id}>
                        {lote.codigo} - {lote.especie} {lote.variedad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => handleInputChange("fechaInicio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="responsable">Responsable</Label>
                  <Select
                    value={formData.responsable}
                    onValueChange={(value) => handleInputChange("responsable", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juan.perez">Juan Pérez</SelectItem>
                      <SelectItem value="maria.garcia">María García</SelectItem>
                      <SelectItem value="carlos.rodriguez">Carlos Rodríguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select value={formData.prioridad} onValueChange={(value) => handleInputChange("prioridad", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {selectedLoteInfo && (
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Información del Lote</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-medium">{selectedLoteInfo.codigo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Especie:</span>
                      <span>{selectedLoteInfo.especie}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Variedad:</span>
                      <span>{selectedLoteInfo.variedad}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span>{selectedLoteInfo.ubicacion}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales sobre el análisis..."
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {selectedAnalysisType === "pureza" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Campos Específicos - Pureza Física</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pesoInicial">Peso Inicial (g)</Label>
                    <Input
                      id="pesoInicial"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.pesoInicial}
                      onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="semillaPura">Semilla Pura (g)</Label>
                    <Input
                      id="semillaPura"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.semillaPura}
                      onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="materiaInerte">Materia Inerte (g)</Label>
                    <Input
                      id="materiaInerte"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.materiaInerte}
                      onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otrosCultivos">Otros Cultivos (g)</Label>
                    <Input
                      id="otrosCultivos"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.otrosCultivos}
                      onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="malezas">Malezas (g)</Label>
                    <Input
                      id="malezas"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.malezas}
                      onChange={(e) => handleInputChange("malezas", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="malezasToleridas">Malezas Toleradas</Label>
                    <Input
                      id="malezasToleridas"
                      placeholder="Especificar malezas toleradas"
                      value={formData.malezasToleridas}
                      onChange={(e) => handleInputChange("malezasToleridas", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pesoTotal">Peso Total</Label>
                  <Select value={formData.pesoTotal} onValueChange={(value) => handleInputChange("pesoTotal", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar peso total" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5g">5g</SelectItem>
                      <SelectItem value="10g">10g</SelectItem>
                      <SelectItem value="25g">25g</SelectItem>
                      <SelectItem value="50g">50g</SelectItem>
                      <SelectItem value="100g">100g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

            {selectedAnalysisType === "dosn" && (
            <DosnFields formData={formData} handleInputChange={handleInputChange} />
          )}

          <div className="flex gap-4 pt-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">Registrar Análisis</Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Guardar como Borrador
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
