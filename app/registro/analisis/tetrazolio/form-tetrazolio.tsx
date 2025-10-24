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
} from "lucide-react"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
  mostrarValidacion?: boolean
}

export default function TetrazolioFields({ formData, handleInputChange, mostrarValidacion }: Props) {
  const data = formData || {}
  const showErrors = !!mostrarValidacion

  // ✅ Validaciones
  const validarNumRepeticiones = (): boolean => {
    const num = parseInt(data.numRepeticionesEsperadas)
    return !isNaN(num) && num >= 2 && num <= 8
  }

  const validarFecha = () => !!data.fecha
  
  const validarConcentracion = () => {
    if (!data.concentracion || data.concentracion === "") return false
    if (data.concentracion === "Otro (especificar)" && !data.concentracionOtro) return false
    return true
  }

  const validarPretratamiento = () => {
    if (!data.pretratamiento || data.pretratamiento === "") return false
    if (data.pretratamiento === "Otro (especificar)" && !data.pretratamientoOtro) return false
    return true
  }

  const validarTemp = () => {
    const usarOtro = data.tincionTemp === 0 || data.tincionTemp === "0"
    
    console.log("🔍 VALIDAR TEMP:", {
      tincionTemp: data.tincionTemp,
      tincionTempOtro: data.tincionTempOtro,
      usarOtro: usarOtro,
      tipo: typeof data.tincionTemp,
      tipoOtro: typeof data.tincionTempOtro
    })
    
    if (usarOtro) {
      // Si usa "Otro", debe haber un valor en tincionTempOtro
      const valorOtro = data.tincionTempOtro
      if (valorOtro === "" || valorOtro === null || valorOtro === undefined) {
        console.log("❌ tincionTempOtro vacío")
        return false
      }
      const valor = Number(valorOtro)
      const esValido = !isNaN(valor) && valor >= 15 && valor <= 45
      console.log("✅ tincionTempOtro:", valor, "válido:", esValido)
      return esValido
    }
    
    // Si no usa "Otro", debe tener tincionTemp válido
    if (!data.tincionTemp) {
      console.log("❌ tincionTemp vacío")
      return false
    }
    const valor = Number(data.tincionTemp)
    const esValido = !isNaN(valor) && valor >= 15 && valor <= 45
    console.log("✅ tincionTemp:", valor, "válido:", esValido)
    return esValido
  }



  const validarTincionHs = () => {
    const hs = data.tincionHs === "Otra (especificar)"
      ? parseFloat(data.tincionHsOtro)
      : parseFloat(data.tincionHs)
    return !isNaN(hs) && hs >= 1 && hs <= 72
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
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                  showErrors && !validarFecha() ? "border-red-300 bg-red-50" : ""
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
              >
                <SelectTrigger
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                    showErrors &&
                    ![25, 50, 100].includes(Number(data.numSemillasPorRep))
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Seleccionar cantidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
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
              value={data.numRepeticionesEsperadas || ""}
              onChange={(e) =>
                handleInputChange("numRepeticionesEsperadas", parseInt(e.target.value) || "")
              }
              className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                showErrors && !validarNumRepeticiones() ? "border-red-300 bg-red-50" : ""
              }`}
            />
            <p className="text-xs text-muted-foreground">
              Se esperan entre <strong>2 y 8 repeticiones</strong> para un resultado confiable.
            </p>
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
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                  showErrors && !validarPretratamiento() ? "border-red-300 bg-red-50" : ""
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
              <Input
                value={data.pretratamientoOtro || ""}
                onChange={(e) => handleInputChange("pretratamientoOtro", e.target.value)}
                placeholder="Ingresar pretratamiento manualmente"
                className="h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200"
              />
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
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                    showErrors && !validarConcentracion() ? "border-red-300 bg-red-50" : ""
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
                <Input
                  value={data.concentracionOtro || ""}
                  onChange={(e) => handleInputChange("concentracionOtro", e.target.value)}
                  placeholder="Ingresar concentración manualmente"
                  className="h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200"
                />
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
    value={
      data.tincionTemp === 0 || data.tincionTemp === "0"
        ? "Otro (especificar)"
        : data.tincionTemp?.toString() || ""
    }
    onValueChange={(value) => {
      if (value === "Otro (especificar)") {
        handleInputChange("tincionTemp", 0)
        handleInputChange("tincionTempOtro", "")
      } else {
        handleInputChange("tincionTemp", Number(value))
        handleInputChange("tincionTempOtro", "")
      }
    }}
  >
    <SelectTrigger
      className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
        showErrors && !validarTemp() ? "border-red-300 bg-red-50" : ""
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
      <SelectItem value="Otro (especificar)">Otro (especificar)</SelectItem>
    </SelectContent>
  </Select>

  {(data.tincionTemp === 0 || data.tincionTemp === "0") && (
    <Input
      type="number"
      inputMode="numeric"
      step="any"
      value={data.tincionTempOtro ?? ""}
      onChange={(e) => {
        const val = e.target.value
        handleInputChange(
          "tincionTempOtro",
          val === "" ? "" : val
        )
      }}
      placeholder="Ingresar temperatura (15–45°C)"
      className="h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200"
    />
  )}

  {showErrors && !validarTemp() && (
    <p className="text-xs text-red-600 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Debe seleccionar o ingresar una temperatura válida (15–45°C)
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
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-200 ${
                    showErrors && !validarTincionHs() ? "border-red-300 bg-red-50" : ""
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
                <Input
                  type="number"
                  value={data.tincionHsOtro || ""}
                  onChange={(e) => handleInputChange("tincionHsOtro", e.target.value)}
                  placeholder="Ingresar horas (1-72 hs)"
                  className="h-11 mt-2 transition-all duration-200 focus:ring-2 focus:ring-orange-200"
                />
              )}
              {showErrors && !validarTincionHs() && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Debe seleccionar o ingresar horas de tinción válidas (1–72 hs)
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
