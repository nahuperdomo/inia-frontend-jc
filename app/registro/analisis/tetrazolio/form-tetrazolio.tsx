"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TestTube,
  Calendar,
  Beaker,
  Thermometer,
  Timer,
  Hash,
  Repeat,
  FlaskConical,
  AlertTriangle,
} from "lucide-react"

type Props = {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function TetrazolioFields({ formData, handleInputChange }: Props) {
  const data = formData || {}
  
  // Validaciones específicas del tetrazolio
  const validarNumRepeticiones = (): boolean => {
    if (!data.numRepeticionesEsperadas) return true
    const numRep = parseInt(data.numRepeticionesEsperadas)
    return numRep >= 2 && numRep <= 8 // Rango estándar para tetrazolio
  }

  // Opciones predefinidas según especificaciones
  const opcionesPretratamiento = [
    "EP 16 horas",
    "EP 18 horas", 
    "S/Pretratamiento",
    "Agua 7 horas",
    "Agua 8 horas",
    "Otro (especificar)"
  ]

  const opcionesConcentracion = [
    
    "1%",
    "0%",
    "5%",
    "0,75%",
    "Otro (especificar)"
  ]

  const opcionesTincionHoras = [
    { value: "2", label: "2 horas" },
    { value: "3", label: "3 horas" },
    { value: "16", label: "16 horas" },
    { value: "18", label: "18 horas" },
    { value: "Otra (especificar)", label: "Otra (especificar)" }
  ]

  const opcionesTemperatura = [
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40
  ]

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
            <TestTube className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Análisis de Tetrazolio
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los parámetros para el ensayo de viabilidad con tetrazolio
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Información del ensayo */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Información del Ensayo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Fecha del Ensayo *
              </Label>
              <Input
                id="fecha"
                type="date"
                value={data.fecha || ""}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200"
                required
              />
              <p className="text-xs text-muted-foreground">
                Fecha de inicio del ensayo de tetrazolio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numSemillasPorRep" className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Número de semillas por repetición *
              </Label>
              <Select
                value={data.numSemillasPorRep?.toString() || ""}
                onValueChange={(value) => handleInputChange("numSemillasPorRep", parseInt(value))}
              >
                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200">
                  <SelectValue placeholder="Seleccionar cantidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cantidad de semillas por repetición
              </p>
            </div>
          </div>
        </div>

        {/* Configuración de repeticiones */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Configuración de Repeticiones</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numRepeticionesEsperadas" className="text-sm font-medium flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                Número de Repeticiones Esperadas *
              </Label>
              <Input
                id="numRepeticionesEsperadas"
                type="number"
                min="2"
                max="8"
                value={data.numRepeticionesEsperadas || ""}
                onChange={(e) => handleInputChange("numRepeticionesEsperadas", parseInt(e.target.value) || "")}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                  !validarNumRepeticiones() ? 'border-red-300 bg-red-50' : ''
                }`}
                required
              />
              <p className="text-xs text-muted-foreground">
                Número de repeticiones para el análisis (2-8 repeticiones)
              </p>
              {!validarNumRepeticiones() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Debe estar entre 2 y 8 repeticiones
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pretratamiento */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Pretratamiento de Semillas</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pretratamiento" className="text-sm font-medium flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
                Pretratamiento
              </Label>
              <Select
                value={data.pretratamiento || ""}
                onValueChange={(value) => {
                  handleInputChange("pretratamiento", value)
                  if (value !== "Otro (especificar)") {
                    handleInputChange("pretratamientoOtro", "")
                  }
                }}
              >
                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200">
                  <SelectValue placeholder="Seleccionar pretratamiento" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesPretratamiento.map((opcion) => (
                    <SelectItem key={opcion} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.pretratamiento === "Otro (especificar)" && (
                <Input
                  value={data.pretratamientoOtro || ""}
                  onChange={(e) => handleInputChange("pretratamientoOtro", e.target.value)}
                  placeholder="Ingresar pretratamiento manualmente"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Tratamiento aplicado a las semillas antes del ensayo
              </p>
            </div>
          </div>
        </div>

        {/* Condiciones de tinción */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Beaker className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Condiciones de Tinción</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="concentracion" className="text-sm font-medium flex items-center gap-2">
                <Beaker className="h-4 w-4 text-muted-foreground" />
                Concentración *
              </Label>
              <Select
                value={data.concentracion || ""}
                onValueChange={(value) => {
                  handleInputChange("concentracion", value)
                  if (value !== "Otro (especificar)") {
                    handleInputChange("concentracionOtro", "")
                  }
                }}
              >
                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200">
                  <SelectValue placeholder="Seleccionar concentración" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesConcentracion.map((opcion) => (
                    <SelectItem key={opcion} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.concentracion === "Otro (especificar)" && (
                <Input
                  value={data.concentracionOtro || ""}
                  onChange={(e) => handleInputChange("concentracionOtro", e.target.value)}
                  placeholder="Ingresar concentración manualmente"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Concentración de la solución de tetrazolio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tincionTemp" className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                Tinción (°C) *
              </Label>
              <Select
                value={data.tincionTemp?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "Otro (especificar)") {
                    handleInputChange("tincionTemp", 0)
                    handleInputChange("tincionTempOtro", "")
                  } else {
                    handleInputChange("tincionTemp", parseInt(value))
                    handleInputChange("tincionTempOtro", "")
                  }
                }}
              >
                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200">
                  <SelectValue placeholder="Seleccionar temperatura" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTemperatura.map(temp => (
                    <SelectItem key={temp} value={temp.toString()}>{temp}°C</SelectItem>
                  ))}
                  <SelectItem value="Otro (especificar)">Otro (especificar)</SelectItem>
                </SelectContent>
              </Select>
              {data.tincionTemp === 0 && (
                <Input
                  type="number"
                  value={data.tincionTempOtro || ""}
                  onChange={(e) => handleInputChange("tincionTempOtro", e.target.value)}
                  placeholder="Ingresar temperatura manualmente"
                  min="15"
                  max="45"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Temperatura durante la tinción (30-40°C típico)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tincionHs" className="text-sm font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                Tinción (hs) *
              </Label>
              <Select
                value={data.tincionHs?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "Otra (especificar)") {
                    handleInputChange("tincionHs", "Otra (especificar)")
                    handleInputChange("tincionHsOtro", "")
                  } else {
                    handleInputChange("tincionHs", parseFloat(value))
                    handleInputChange("tincionHsOtro", "")
                  }
                }}
              >
                <SelectTrigger className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200">
                  <SelectValue placeholder="Seleccionar tiempo de tinción" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTincionHoras.map(opcion => (
                    <SelectItem key={opcion.value} value={opcion.value}>{opcion.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.tincionHs === "Otra (especificar)" && (
                <Input
                  type="number"
                  value={data.tincionHsOtro || ""}
                  onChange={(e) => handleInputChange("tincionHsOtro", e.target.value)}
                  placeholder="Ingresar tiempo manualmente"
                  min="1"
                  max="72"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Duración de la tinción (2-18 horas típico)
              </p>
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Comentarios</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comentarios" className="text-sm font-medium">
              Comentarios
            </Label>
            <Textarea
              id="comentarios"
              value={data.comentarios || ""}
              onChange={(e) => handleInputChange("comentarios", e.target.value)}
              placeholder="Observaciones generales o particulares del análisis..."
              rows={3}
              className="resize-none transition-all duration-200 focus:ring-2 focus:ring-orange-200"
            />
            <p className="text-xs text-muted-foreground">
              Campo abierto para notas.
            </p>
          </div>
        </div>

        {/* Información de ayuda */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200">
              <TestTube className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-orange-800 mb-2">
                 <strong>Notas Generales del Análisis de Tetrazolio:</strong>
              </h4>
              <ul className="text-xs text-orange-700 space-y-1 ml-4 list-disc">
                <li>Si la suma total no coincide con el número de semillas, se ajusta ±1 en Viables</li>
                <li>Los campos 'Pretratamiento', 'Tinción (hs)' y 'Tinción (°C)' pueden modificarse según la especie analizada</li>
                <li>Se permite ajuste de redondeo de ±1 semilla en el conteo final</li>
                <li>Campo de comentarios disponible para observaciones</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}