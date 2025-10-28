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

// Función para validar que una fecha esté en el rango permitido
const validarFechaEnRango = (fecha: string, fechaInicio: string, fechaFin: string): boolean => {
  if (!fecha || !fechaInicio || !fechaFin) return true // Si no hay fechas, no validar
  
  const fechaValidar = new Date(fecha)
  const fechaMin = new Date(fechaInicio)
  const fechaMax = new Date(fechaFin)
  
  return fechaValidar >= fechaMin && fechaValidar <= fechaMax
}

// Función para generar fechas de conteo automáticamente
const generarFechasConteo = (fechaInicio: string, fechaUltConteo: string, numeroConteos: number): string[] => {
  if (!fechaInicio || !fechaUltConteo || numeroConteos <= 0) return []
  
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaUltConteo)
  
  // Validar que las fechas sean válidas
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return []
  
  if (inicio >= fin) return []
  
  const diferenciaDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  
  // Si hay menos de 1 día de diferencia o no hay suficientes días para los conteos, no generar
  if (diferenciaDias < 1 || diferenciaDias < (numeroConteos - 1)) return []
  
  const intervaloDias = Math.floor(diferenciaDias / (numeroConteos - 1))
  
  const fechas: string[] = []
  for (let i = 0; i < numeroConteos; i++) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + (i * intervaloDias))
    
    // Validar que la fecha generada sea válida
    if (!isNaN(fecha.getTime())) {
      fechas.push(fecha.toISOString().split('T')[0])
    }
  }
  
  // Asegurar que la última fecha sea exactamente la fecha del último conteo
  if (fechas.length > 0) {
    fechas[fechas.length - 1] = fechaUltConteo
  }
  
  return fechas
}

export default function GerminacionFields({ formData, handleInputChange }: Props) {
  const data = formData || {}
  
  // Funciones de validación (exactamente como en el backend)
  const validarFechaInicio = (): boolean => {
    if (!data.fechaInicioGerm || !data.fechaUltConteo) return true
    
    // Validar que la fecha sea válida
    const fechaInicio = new Date(data.fechaInicioGerm)
    const fechaFin = new Date(data.fechaUltConteo)
    
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) return true
    
    return fechaInicio < fechaFin
  }

  const validarFechaUltimoConteo = (): boolean => {
    if (!data.fechaInicioGerm || !data.fechaUltConteo) return true
    
    // Validar que las fechas sean válidas
    const fechaInicio = new Date(data.fechaInicioGerm)
    const fechaFin = new Date(data.fechaUltConteo)
    
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) return true
    
    return fechaFin > fechaInicio
  }

  const validarNumeroRepeticiones = (): boolean => {
    return data.numeroRepeticiones != null && data.numeroRepeticiones > 0
  }

  const validarNumeroConteos = (): boolean => {
    return data.numeroConteos != null && data.numeroConteos > 0
  }

  const validarFechaConteo = (fecha: string): boolean => {
    return validarFechaEnRango(fecha, data.fechaInicioGerm, data.fechaUltConteo)
  }

  const sonTodasLasFechasValidas = (): boolean => {
    const fechaInicioValida = validarFechaInicio()
    const fechaFinValida = validarFechaUltimoConteo()
    const fechasConteosValidas = (data.fechaConteos || []).every((fecha: string) => validarFechaConteo(fecha))
    const repeticionesValidas = validarNumeroRepeticiones()
    const conteosValidos = validarNumeroConteos()
    
    return fechaInicioValida && fechaFinValida && fechasConteosValidas && repeticionesValidas && conteosValidos
  }
  
  const handleFechaConteoChange = (index: number, value: string) => {
    const fechaConteos = data.fechaConteos || []
    const esUltimoConteo = index === fechaConteos.length - 1
    
    // No permitir editar la última fecha, ya que es automática
    if (!esUltimoConteo) {
      const newFechas = [...fechaConteos]
      newFechas[index] = value
      handleInputChange("fechaConteos", newFechas)
    }
  }

  const removeFechaConteo = (index: number) => {
    const fechaConteos = data.fechaConteos || []
    const esUltimoConteo = index === fechaConteos.length - 1
    
    // No permitir eliminar la última fecha (que es la del último conteo)
    if (fechaConteos.length > 1 && !esUltimoConteo) {
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
      
      // Validar que las fechas sean válidas
      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        // Validar que la fecha de fin sea posterior a la de inicio
        if (fechaFin > fechaInicio) {
          const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          // Solo actualizar si el valor cambió
          if (data.numDias !== diffDays.toString()) {
            handleInputChange("numDias", diffDays.toString())
          }
        }
      }
    }
  }, [data.fechaInicioGerm, data.fechaUltConteo])

  // Efecto para validar que la fecha de último conteo no sea menor que la de inicio
  React.useEffect(() => {
    const { fechaInicioGerm, fechaUltConteo } = data
    
    if (fechaInicioGerm && fechaUltConteo) {
      const fechaInicio = new Date(fechaInicioGerm)
      const fechaFin = new Date(fechaUltConteo)
      
      // Validar que las fechas sean válidas
      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        if (fechaFin <= fechaInicio) {
          // Ajustar automáticamente la fecha de último conteo
          const fechaMinima = new Date(fechaInicio)
          fechaMinima.setDate(fechaMinima.getDate() + 7) // Mínimo 7 días después
          
          handleInputChange("fechaUltConteo", fechaMinima.toISOString().split('T')[0])
        }
      }
    }
  }, [data.fechaInicioGerm, data.fechaUltConteo])

  // Solo establecer la fecha del último conteo automáticamente
  React.useEffect(() => {
    const { fechaUltConteo, numeroConteos } = data
    
    if (fechaUltConteo && numeroConteos && numeroConteos > 0) {
      const fechasActuales = data.fechaConteos || []
      
      // Solo establecer la fecha del último conteo si hay fechas y el último está vacío o es diferente
      if (fechasActuales.length === numeroConteos) {
        const ultimoIndice = numeroConteos - 1
        if (fechasActuales[ultimoIndice] !== fechaUltConteo) {
          const nuevasFechas = [...fechasActuales]
          nuevasFechas[ultimoIndice] = fechaUltConteo
          handleInputChange("fechaConteos", nuevasFechas)
        }
      }
    }
  }, [data.fechaUltConteo, data.numeroConteos])

  // Sincronizar fechaConteos con numeroConteos (crear array con fechas indeterminadas)
  React.useEffect(() => {
    if (data.numeroConteos && data.numeroConteos > 0) {
      const currentFechas = data.fechaConteos || []
      if (currentFechas.length !== data.numeroConteos) {
        const newFechas = Array(data.numeroConteos).fill("").map((_, index) => {
          const esUltimaFecha = index === data.numeroConteos - 1
          
          // La última fecha siempre es la del último conteo, las demás se mantienen vacías a menos que ya tengan valor
          if (esUltimaFecha) {
            return data.fechaUltConteo || ""
          } else {
            // Solo conservar fechas que ya existían, las nuevas quedan vacías (indeterminadas)
            return currentFechas[index] || ""
          }
        })
        
        handleInputChange("fechaConteos", newFechas)
      }
    } else if (data.numeroConteos === undefined || data.numeroConteos === 0) {
      // Asegurar que siempre haya al menos 1 conteo
      handleInputChange("numeroConteos", 1)
      const inicialFechas = [data.fechaUltConteo || ""]
      handleInputChange("fechaConteos", inicialFechas)
    }
  }, [data.numeroConteos, data.fechaUltConteo])

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
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                  !validarFechaInicio() ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!validarFechaInicio() && (
                <p className="text-xs text-red-600">
                  La fecha de inicio debe ser anterior a la fecha de último conteo
                </p>
              )}
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
                min={data.fechaInicioGerm || undefined}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                  !validarFechaUltimoConteo() ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!validarFechaUltimoConteo() && (
                <p className="text-xs text-red-600">
                  La fecha de último conteo debe ser posterior a la fecha de inicio
                </p>
              )}
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
                value={data.numeroRepeticiones || ""}
                onChange={(e) => handleInputChange("numeroRepeticiones", parseInt(e.target.value) || 1)}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                  !validarNumeroRepeticiones() ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!validarNumeroRepeticiones() && (
                <p className="text-xs text-red-600">
                  Debe especificar un número válido de repeticiones (mayor a 0)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Controla cuántas repeticiones se podrán crear (mayor a 0)
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
                value={data.numeroConteos || 1}
                onChange={(e) => {
                  const newValue = Math.max(1, parseInt(e.target.value) || 1)
                  handleInputChange("numeroConteos", newValue)
                }}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                  !validarNumeroConteos() ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!validarNumeroConteos() && (
                <p className="text-xs text-red-600">
                  Debe especificar un número válido de conteos (mayor a 0)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Controla el tamaño del array "normales" por repetición (mayor a 0)
              </p>
            </div>
          </div>
        </div>

        {/* Fechas de conteo */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">
              Fechas de Conteo *
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Solo el último conteo se establece automáticamente)
              </span>
            </h3>
          </div>
          </div>
          
          <div className="space-y-3">
            {(data.fechaConteos || []).map((fecha: string, index: number) => {
              const esValida = validarFechaConteo(fecha)
              const esUltimoConteo = index === (data.fechaConteos || []).length - 1
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`fechaConteo-${index}`} className="text-sm font-medium">
                      Conteo {index + 1}
                      {esUltimoConteo && " (Último - Automático)"}
                    </Label>
                    <Input
                      id={`fechaConteo-${index}`}
                      type="date"
                      value={fecha}
                      onChange={(e) => handleFechaConteoChange(index, e.target.value)}
                      min={data.fechaInicioGerm || undefined}
                      max={data.fechaUltConteo || undefined}
                      className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-green-200 ${
                        !esValida ? 'border-red-500 bg-red-50' : ''
                      } ${esUltimoConteo ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                      readOnly={esUltimoConteo}
                      disabled={esUltimoConteo}
                      required
                    />
                    {!esValida && !esUltimoConteo && (
                      <p className="text-xs text-red-600 mt-1">
                        Debe estar entre la fecha de inicio y último conteo
                      </p>
                    )}
                    {esUltimoConteo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Esta fecha se establece automáticamente igual a la fecha de último conteo
                      </p>
                    )}
                  </div>
                  {(data.fechaConteos || []).length > 1 && !esUltimoConteo && (
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
              )
            })}
          </div>
          
      
        

        {/* Información de resumen */}
        <Card className={`border-2 ${sonTodasLasFechasValidas() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                sonTodasLasFechasValidas() ? 'bg-green-200' : 'bg-red-200'
              }`}>
                <Sprout className={`h-4 w-4 ${sonTodasLasFechasValidas() ? 'text-green-700' : 'text-red-700'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium mb-2 ${
                  sonTodasLasFechasValidas() ? 'text-green-900' : 'text-red-900'
                }`}>
                  {sonTodasLasFechasValidas() ? 'Configuración Válida' : 'Configuración Inválida'}
                </h4>
                <div className={`space-y-1 text-sm ${
                  sonTodasLasFechasValidas() ? 'text-green-800' : 'text-red-800'
                }`}>
                  <p>• Se crearán <strong>{data.numeroRepeticiones || 0} repeticiones</strong></p>
                  <p>• Cada repetición tendrá <strong>{data.numeroConteos || 0} conteos</strong> de "normales"</p>
                  {data.numDias && (
                    <p>• Duración del análisis: <strong>{data.numDias} días</strong></p>
                  )}
                  {!sonTodasLasFechasValidas() && (
                    <p className="font-medium">Por favor, corrige las fechas inválidas antes de crear el análisis</p>
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
