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
  Info,
} from "lucide-react"
import { toast } from "react-toastify"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
  mostrarValidacion?: boolean
  modoEdicion?: boolean
  validationErrors?: {
    pretratamientoOtro?: string
    concentracionOtro?: string
    tincionHsOtro?: string
    tincionTempOtro?: string
  }
}

export default function TetrazolioFields({ formData, handleInputChange, mostrarValidacion, modoEdicion = false, validationErrors = {} }: Props) {
  const data = formData || {}
  const showErrors = !!mostrarValidacion

  // ✅ Validaciones
  const validarNumRepeticiones = (): boolean => {
    const num = parseInt(data.numRepeticionesEsperadas || data.numRepeticionesEsperadasTetrazolio)
    return !isNaN(num) && num >= 2 && num <= 8
  }

  const validarFecha = () => !!data.fecha

  const validarConcentracion = () => {
    if (!data.concentracion || data.concentracion.trim() === "") {
      toast.error("El campo 'Concentración' no puede estar vacío.")
      return false
    }
    if (data.concentracion === "Otro (especificar)" && !data.concentracionOtro) return false
    return true
  }

  const validarPretratamiento = () => {
    if (!data.pretratamiento || data.pretratamiento.trim() === "") {
      toast.error("El campo 'Pretratamiento' no puede estar vacío.")
      return false
    }
    if (data.pretratamiento === "Otro (especificar)" && !data.pretratamientoOtro) return false
    return true
  }

  const validarTemp = () => {
  const usarOtro = data.tincionTemp === 0 || data.tincionTemp === "0"

  if (usarOtro) {
    const valorOtro = data.tincionTempOtro
    if (valorOtro === "" || valorOtro === null || valorOtro === undefined) {
      return false  // ❌ Campo vacío → inválido
    }
    const valor = Number(valorOtro)
    return !isNaN(valor)  // ✅ Acepta cualquier número
  }

  if (!data.tincionTemp) return false  // ❌ Campo vacío → inválido

  const valor = Number(data.tincionTemp)
  return !isNaN(valor)  // ✅ Solo revisa que sea un número
}



const validarTincionHs = () => {
  const hs = data.tincionHs === "Otra (especificar)"
    ? parseFloat(data.tincionHsOtro)
    : parseFloat(data.tincionHs)
  return !isNaN(hs)
}

const validarViabilidadInase = () => {
  if (!data.viabilidadInase || isNaN(data.viabilidadInase)) {
    toast.error("El campo 'Viabilidad INASE' debe ser un número válido.")
    return false
  }
  return true
}

  // Opciones predefinidas
  const opcionesPretratamiento = [
    "EP 16 horas",
    "EP 18 horas",
    "S/Pretratamiento",
    "Agua 7 horas",
    "Agua 8 horas",
    "Otro (especificar)",
  ]

  const opcionesConcentracion = [
    "1%",
    "0%",
    "5%",
    "0,75%",
    "Otro (especificar)",
  ]

  const opcionesTincionHoras = [
    { value: "2", label: "2 horas" },
    { value: "3", label: "3 horas" },
    { value: "16", label: "16 horas" },
    { value: "18", label: "18 horas" },
    { value: "Otra (especificar)", label: "Otra (especificar)" },
  ]

  const opcionesTemperatura = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <TestTube className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-semibold text-foreground">
                Análisis de Tetrazolio
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configura los parámetros para el ensayo de viabilidad con tetrazolio.
              </p>
            </div>
          </div>
          <TablaToleranciasButton 
            pdfPath="/tablas-tolerancias/tabla-tetrazolio.pdf" 
            title="Tabla de Tolerancias"
          />
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
            {/* Fecha */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Fecha del Ensayo *
              </Label>
              <Input
                type="date"
                value={data.fecha || ""}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarFecha() ? "border-red-300 bg-red-50" : ""
                  }`}
              />
              {showErrors && !validarFecha() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Debe ingresar la fecha del ensayo
                </p>
              )}
            </div>

            {/* Semillas por repetición */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Semillas por Repetición *
              </Label>
              <Select
                value={data.numSemillasPorRep?.toString() || ""}
                onValueChange={(value) => handleInputChange("numSemillasPorRep", parseInt(value))}
                disabled={modoEdicion}
              >
                <SelectTrigger
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors &&
                      ![25, 50, 100].includes(Number(data.numSemillasPorRep))
                      ? "border-red-300 bg-red-50"
                      : ""
                    } ${modoEdicion ? "bg-gray-50 cursor-not-allowed" : ""}`}
                >
                  <SelectValue placeholder="Seleccionar cantidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              {modoEdicion && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  No se puede modificar una vez creado el análisis
                </p>
              )}
              {showErrors &&
                ![25, 50, 100].includes(Number(data.numSemillasPorRep)) && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Debe seleccionar 25, 50 o 100 semillas
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Repeticiones */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Repeat className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Repeticiones</h3>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              Número de Repeticiones Esperadas *
            </Label>
            <Input
              type="number"
              min="2"
              max="8"
              value={data.numRepeticionesEsperadas ?? data.numRepeticionesEsperadasTetrazolio ?? ""}
              onChange={(e) => {
                const fieldName = data.hasOwnProperty('numRepeticionesEsperadasTetrazolio')
                  ? 'numRepeticionesEsperadasTetrazolio'
                  : 'numRepeticionesEsperadas'

                const raw = e.target.value
                const parsed = parseInt(raw, 10)
                const value = Number.isNaN(parsed) ? raw === "" ? "" : 2 : parsed

                // Solo enviar números válidos al estado padre
                if (value === "") {
                  handleInputChange(fieldName, undefined)
                } else {
                  handleInputChange(fieldName, Math.min(8, Math.max(2, Number(value))))
                }
              }}
              className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarNumRepeticiones() ? "border-red-300 bg-red-50" : ""
                } ${modoEdicion ? "bg-gray-50 cursor-not-allowed" : ""}`}
              disabled={modoEdicion}
              readOnly={modoEdicion}
            />
            {modoEdicion && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                No se puede modificar una vez creado el análisis
              </p>
            )}
            {!modoEdicion && (
              <p className="text-xs text-muted-foreground">
                Se esperan entre <strong>2 y 8 repeticiones</strong> para un resultado confiable.
              </p>
            )}
            {showErrors && !validarNumRepeticiones() && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Debe estar entre 2 y 8 repeticiones
              </p>
            )}
          </div>
        </div>

        {/* Pretratamiento */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Pretratamiento</h3>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              Pretratamiento *
            </Label>
            <Select
              value={data.pretratamiento || ""}
              onValueChange={(value) => {
                handleInputChange("pretratamiento", value)
                if (value !== "Otro (especificar)") handleInputChange("pretratamientoOtro", "")
              }}
            >
              <SelectTrigger
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarPretratamiento() ? "border-red-300 bg-red-50" : ""
                  }`}
              >
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
              <div className="space-y-1">
                <Input
                  value={data.pretratamientoOtro || ""}
                  onChange={(e) => handleInputChange("pretratamientoOtro", e.target.value)}
                  placeholder="Ingresar pretratamiento manualmente"
                  className={`h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${validationErrors.pretratamientoOtro ? "border-red-500 bg-red-50" : ""}`}
                />
                {validationErrors.pretratamientoOtro && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" />
                    {validationErrors.pretratamientoOtro}
                  </p>
                )}
              </div>
            )}

            {showErrors && !validarPretratamiento() && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.pretratamiento === "Otro (especificar)"
                  ? "Debe especificar el pretratamiento"
                  : "Debe seleccionar un pretratamiento"}
              </p>
            )}
          </div>
        </div>

        {/* Condiciones de Tinción */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Beaker className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Condiciones de Tinción</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Concentración */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Beaker className="h-4 w-4 text-muted-foreground" />
                Concentración *
              </Label>
              <Select
                value={data.concentracion || ""}
                onValueChange={(value) => {
                  handleInputChange("concentracion", value)
                  if (value !== "Otro (especificar)") handleInputChange("concentracionOtro", "")
                }}
              >
                <SelectTrigger
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarConcentracion() ? "border-red-300 bg-red-50" : ""
                    }`}
                >
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
                <div className="space-y-1">
                  <Input
                    value={data.concentracionOtro || ""}
                    onChange={(e) => handleInputChange("concentracionOtro", e.target.value)}
                    placeholder="Ingresar concentración manualmente"
                    className={`h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${validationErrors.concentracionOtro ? "border-red-500 bg-red-50" : ""}`}
                  />
                  {validationErrors.concentracionOtro && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      {validationErrors.concentracionOtro}
                    </p>
                  )}
                </div>
              )}

              {showErrors && !validarConcentracion() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {data.concentracion === "Otro (especificar)"
                    ? "Debe especificar la concentración"
                    : "Debe seleccionar una concentración"}
                </p>
              )}
            </div>

            {/* Temperatura */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-muted-foreground" />
                Tinción (°C) *
              </Label>
              <Select
                value={data.tincionTemp?.toString() || ""}
                onValueChange={(value) => {
                  if (value === "0") {
                    handleInputChange("tincionTemp", 0)
                    handleInputChange("tincionTempOtro", "")
                  } else {
                    handleInputChange("tincionTemp", Number(value))
                    handleInputChange("tincionTempOtro", "")
                  }
                }}
              >
                <SelectTrigger
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarTemp() ? "border-red-300 bg-red-50" : ""
                    }`}
                >
                  <SelectValue placeholder="Seleccionar temperatura" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTemperatura.map((temp) => (
                    <SelectItem key={temp} value={temp.toString()}>
                      {temp}°C
                    </SelectItem>
                  ))}
                  <SelectItem value="0">Otra (especificar)</SelectItem>
                </SelectContent>
              </Select>

              {(data.tincionTemp === 0 || data.tincionTemp === "0") && (
                <div className="space-y-1">
                  <Input
                    type="number"
                    value={data.tincionTempOtro || ""}
                    onChange={(e) => handleInputChange("tincionTempOtro", e.target.value)}
                    placeholder="Ingresar temperatura (°C)"
                    className={`h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${validationErrors.tincionTempOtro ? "border-red-500 bg-red-50" : ""}`}
                  />
                  {validationErrors.tincionTempOtro && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      {validationErrors.tincionTempOtro}
                    </p>
                  )}
                </div>
              )}

              {showErrors && !validarTemp() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Debe seleccionar una temperatura válida
                </p>
              )}
            </div>


            {/* Tiempo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
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
                <SelectTrigger
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarTincionHs() ? "border-red-300 bg-red-50" : ""
                    }`}
                >
                  <SelectValue placeholder="Seleccionar horas de tinción" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesTincionHoras.map(opcion => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data.tincionHs === "Otra (especificar)" && (
                <div className="space-y-1">
                  <Input
                    type="number"
                    value={data.tincionHsOtro || ""}
                    onChange={(e) => handleInputChange("tincionHsOtro", e.target.value)}
                    placeholder="Ingresar horas"
                    className={`h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${validationErrors.tincionHsOtro ? "border-red-500 bg-red-50" : ""}`}
                  />
                  {validationErrors.tincionHsOtro && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      {validationErrors.tincionHsOtro}
                    </p>
                  )}
                </div>
              )}
              {showErrors && !validarTincionHs() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Debe seleccionar o ingresar horas de tinción válidas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Viabilidad INASE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Beaker className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Viabilidad INASE</h3>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Beaker className="h-4 w-4 text-muted-foreground" />
              Viabilidad INASE *
            </Label>
            <Input
              id="viabilidadInase"
              type="number"
              value={data.viabilidadInase || ""}
              onChange={(e) => handleInputChange("viabilidadInase", Number(e.target.value))}
              placeholder="Ingrese la viabilidad INASE"
              className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${showErrors && !validarViabilidadInase() ? "border-red-300 bg-red-50" : ""
                }`}
            />
            {showErrors && !validarViabilidadInase() && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Debe ingresar un valor numérico para la viabilidad INASE
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
