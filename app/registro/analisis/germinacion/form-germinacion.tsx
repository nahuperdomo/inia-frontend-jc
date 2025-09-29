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
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Plus,
  Trash2,
  Hash,
  Clock,
  CalendarDays,
  Repeat,
  BarChart3,
  Sprout,
} from "lucide-react"

type Props = {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function GerminacionFields({ formData, handleInputChange }: Props) {
  const data = formData || {}
  
  const handleFechaConteoChange = (index: number, value: string) => {
    const fechaConteos = data.fechaConteos || []
    const newFechas = [...fechaConteos]
    newFechas[index] = value
    handleInputChange("fechaConteos", newFechas)
  }

  const addFechaConteo = () => {
    const fechaConteos = data.fechaConteos || []
    const newFechas = [...fechaConteos, ""]
    handleInputChange("fechaConteos", newFechas)
    handleInputChange("numeroConteos", newFechas.length)
  }

  const removeFechaConteo = (index: number) => {
    const fechaConteos = data.fechaConteos || []
    if (fechaConteos.length > 1) {
      const newFechas = fechaConteos.filter((_: any, i: number) => i !== index)
      handleInputChange("fechaConteos", newFechas)
      handleInputChange("numeroConteos", newFechas.length)
    }
  }

  // Calcular numDias automáticamente
  React.useEffect(() => {
    if (data.fechaInicioGerm && data.fechaUltConteo) {
      const fechaInicio = new Date(data.fechaInicioGerm)
      const fechaFin = new Date(data.fechaUltConteo)
      const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Solo actualizar si el valor cambió
      if (data.numDias !== diffDays.toString()) {
        handleInputChange("numDias", diffDays.toString())
      }
    }
  }, [data.fechaInicioGerm, data.fechaUltConteo]) // Remover handleInputChange de las dependencias

  // Sincronizar fechaConteos con numeroConteos
  React.useEffect(() => {
    if (data.numeroConteos && data.numeroConteos > 0) {
      const currentFechas = data.fechaConteos || []
      if (currentFechas.length !== data.numeroConteos) {
        const newFechas = Array(data.numeroConteos).fill("").map((_, index) => 
          currentFechas[index] || ""
        )
        handleInputChange("fechaConteos", newFechas)
      }
    }
  }, [data.numeroConteos]) // Remover handleInputChange de las dependencias

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <Sprout className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Análisis de Germinación
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configura las fechas, repeticiones y conteos para el análisis de germinación
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Fechas de análisis */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Fechas del Análisis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fechaInicioGerm" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Fecha Inicio Germinación *
              </Label>
              <Input
                id="fechaInicioGerm"
                type="date"
                value={data.fechaInicioGerm || ""}
                onChange={(e) => handleInputChange("fechaInicioGerm", e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaUltConteo" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Fecha Último Conteo *
              </Label>
              <Input
                id="fechaUltConteo"
                type="date"
                value={data.fechaUltConteo || ""}
                onChange={(e) => handleInputChange("fechaUltConteo", e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numDias" className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Duración (días)
              </Label>
              <Input
                id="numDias"
                type="text"
                value={data.numDias || ""}
                placeholder="Calculado automáticamente"
                className="h-11 bg-gray-50 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Configuración de repeticiones y conteos */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Configuración de Análisis</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numeroRepeticiones" className="text-sm font-medium flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                Número de Repeticiones *
              </Label>
              <Input
                id="numeroRepeticiones"
                type="number"
                min="1"
                max="20"
                value={data.numeroRepeticiones || ""}
                onChange={(e) => handleInputChange("numeroRepeticiones", parseInt(e.target.value) || 1)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200"
                required
              />
              <p className="text-xs text-muted-foreground">
                Controla cuántas repeticiones se podrán crear (1-20)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroConteos" className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Número de Conteos *
              </Label>
              <Input
                id="numeroConteos"
                type="number"
                min="1"
                max="10"
                value={data.numeroConteos || ""}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 1
                  handleInputChange("numeroConteos", newValue)
                }}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200"
                required
              />
              <p className="text-xs text-muted-foreground">
                Controla el tamaño del array "normales" por repetición (1-10)
              </p>
            </div>
          </div>
        </div>

        {/* Fechas de conteo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Fechas de Conteo *</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFechaConteo}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Fecha
            </Button>
          </div>
          
          <div className="space-y-3">
            {(data.fechaConteos || []).map((fecha: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Label htmlFor={`fechaConteo-${index}`} className="text-sm font-medium">
                    Conteo {index + 1}
                  </Label>
                  <Input
                    id={`fechaConteo-${index}`}
                    type="date"
                    value={fecha}
                    onChange={(e) => handleFechaConteoChange(index, e.target.value)}
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200"
                    required
                  />
                </div>
                {(data.fechaConteos || []).length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFechaConteo(index)}
                    className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>• Cada fecha de conteo representa una evaluación de las semillas germinadas</p>
            <p>• El número de fechas determina el tamaño del array "normales" en cada repetición</p>
          </div>
        </div>

        {/* Información de resumen */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200">
                <Sprout className="h-4 w-4 text-green-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-2">Resumen de Configuración</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>• Se crearán <strong>{data.numeroRepeticiones || 0} repeticiones</strong></p>
                  <p>• Cada repetición tendrá <strong>{data.numeroConteos || 0} conteos</strong> en el array "normales"</p>
                  <p>• Total de evaluaciones: <strong>{(data.numeroRepeticiones || 0) * (data.numeroConteos || 0)}</strong></p>
                  {data.numDias && (
                    <p>• Duración del análisis: <strong>{data.numDias} días</strong></p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}