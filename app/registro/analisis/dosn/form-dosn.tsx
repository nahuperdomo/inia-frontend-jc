"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Microscope,
  Calendar,
  Weight,
  FileText,
  Building2,
  ClipboardList,
} from "lucide-react"

import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza"
import BrassicaFields from "@/app/registro/analisis/dosn/fields/fields-brassica"
import CuscutaFields from "@/app/registro/analisis/dosn/fields/fileds-cuscuta"
import CumplimientoEstandarFields from "@/app/registro/analisis/dosn/fields/fields-cumplio-estandar"
import OtrosCultivosFields from "../../../../components/malezas-u-otros-cultivos/fields-otros-cultivos"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
  dosn?: any
  modoDetalle?: boolean
  onChangeListadosMalezas?: (list: any[]) => void
  onChangeListadosCultivos?: (list: any[]) => void
  onChangeListadosBrassicas?: (list: any[]) => void
  errors?: Record<string, string>
  mostrarValidacion?: boolean // ✅ NUEVO: Controla cuándo mostrar errores y cuadro de validación
}

// ✅ Helpers de validación
const validarFecha = (fecha: string) => {
  if (!fecha) return false
  const f = new Date(fecha)
  const hoy = new Date()
  return !isNaN(f.getTime()) && f <= hoy
}

const validarGramos = (valor: number | string) => {
  const n = parseFloat(valor as string)
  return !isNaN(n) && n > 0
}

const validarTiposAnalisis = (data: any, prefix: string) => {
  return (
    data[`${prefix}Completo`] ||
    data[`${prefix}Reducido`] ||
    data[`${prefix}Limitado`] ||
    data[`${prefix}ReducidoLimitado`]
  )
}

export default function DosnFields({
  formData,
  handleInputChange,
  dosn,
  modoDetalle,
  onChangeListadosMalezas,
  onChangeListadosCultivos,
  onChangeListadosBrassicas,
  errors = {},
  mostrarValidacion = false, // ✅ Controlado por el padre
}: Props) {
  const data = dosn || formData || {}
  const isReadOnly = !!modoDetalle
  const [activeTab, setActiveTab] = useState("generales")

  // ❌ NO persistir datos generales - solo usar el estado del formulario padre
  // Los datos generales (fechas, gramos, tipos de análisis) NO deben guardarse en sessionStorage
  
  // Función simple para manejar cambios - sin persistencia
  const handleFieldChange = (field: string, value: any) => {
    if (handleInputChange) {
      handleInputChange(field, value)
    }
  }

  const analysisTypes = [
    { key: "Completo", field: "Completo", description: "Análisis exhaustivo de todas las categorías" },
    { key: "Reducido", field: "Reducido", description: "Análisis de categorías principales" },
    { key: "Limitado", field: "Limitado", description: "Análisis básico de categorías críticas" },
    { key: "Reducido - Limitado", field: "ReducidoLimitado", description: "Análisis híbrido optimizado" },
  ]

  const listados = dosn?.listados || []
  const malezas = listados.filter(
    (l: any) =>
      l.listadoTipo === "MAL_TOLERANCIA_CERO" ||
      l.listadoTipo === "MAL_TOLERANCIA" ||
      l.listadoTipo === "MAL_COMUNES"
  )
  const cultivos = listados.filter((l: any) => l.listadoTipo === "OTROS")
  const brassicas = listados.filter((l: any) => l.listadoTipo === "BRASSICA")

  const renderInstitutionSection = (
    institution: "INIA" | "INASE",
    icon: React.ReactNode,
    color: string
  ) => {
    const prefix = institution.toLowerCase()
    const hayAnalisisSeleccionado = validarTiposAnalisis(data, prefix)
    const fechaValida = validarFecha(data[`${prefix}Fecha`])
    const gramosValidos = validarGramos(data[`${prefix}Gramos`])

    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{institution}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {institution === "INIA"
                    ? "Instituto Nacional de Investigación Agropecuaria"
                    : "Instituto Nacional de Semillas"}
                </p>
              </div>
            </div>
            {institution === "INIA" && (
              <TablaToleranciasButton
                pdfPath="/tablas-tolerancias/tabla-dosn.pdf"
                title="Ver Tabla de Tolerancias"
                variant="outline"
                size="sm"
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor={`${prefix}Fecha`} className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Fecha de análisis *
              </Label>
              <Input
                id={`${prefix}Fecha`}
                type="date"
                value={data[`${prefix}Fecha`] || ""}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => handleFieldChange(`${prefix}Fecha`, e.target.value)
                }
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                  mostrarValidacion && !fechaValida ? "border-red-500 bg-red-50" : ""
                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isReadOnly}
              />
              {mostrarValidacion && !fechaValida && (
                <p className="text-xs text-red-600 mt-1">Ingrese una fecha válida (no futura)</p>
              )}
            </div>

            {/* Gramos */}
            <div className="space-y-2">
              <Label htmlFor={`${prefix}Gramos`} className="text-sm font-medium flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                Gramos analizados *
              </Label>
              <Input
                id={`${prefix}Gramos`}
                type="number"
                step="0.01"
                placeholder="0.00"
                value={data[`${prefix}Gramos`] || ""}
                onChange={
                  isReadOnly
                    ? undefined
                    : (e) => handleFieldChange(`${prefix}Gramos`, e.target.value)
                }
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${
                  mostrarValidacion && !gramosValidos ? "border-red-500 bg-red-50" : ""
                } ${isReadOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                readOnly={isReadOnly}
              />
              {mostrarValidacion && !gramosValidos && (
                <p className="text-xs text-red-600 mt-1">
                  Debe ingresar una cantidad válida de gramos (&gt; 0)
                </p>
              )}
            </div>
          </div>

          {/* Tipos de análisis */}
          <div className="space-y-2">
            <Label
              className={`text-sm font-medium flex items-center gap-2 ${
                mostrarValidacion && !hayAnalisisSeleccionado ? "text-red-600" : ""
              }`}
            >
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Tipo de análisis *
            </Label>

            <div className="space-y-3">
              {analysisTypes.map(({ key, field, description }) => {
                const fieldName = `${prefix}${field}`
                return (
                  <div
                    key={field}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      id={fieldName}
                      checked={data[fieldName] || false}
                      onCheckedChange={
                        isReadOnly
                          ? undefined
                          : (checked) => handleFieldChange(fieldName, checked)
                      }
                      disabled={isReadOnly}
                      className="mt-1 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <label htmlFor={fieldName} className="text-sm font-medium cursor-pointer">
                        {key}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {mostrarValidacion && !hayAnalisisSeleccionado && (
              <p className="text-xs text-red-600 mt-1">
                Debe seleccionar al menos un tipo de análisis
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const configuracionValida =
    validarTiposAnalisis(data, "inia") &&
    validarTiposAnalisis(data, "inase") &&
    validarFecha(data.iniaFecha) &&
    validarFecha(data.inaseFecha) &&
    validarGramos(data.iniaGramos) &&
    validarGramos(data.inaseGramos)

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Microscope className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Determinación de Otras Semillas en Número (DOSN)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Análisis cuantitativo de semillas no deseadas en muestras
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 w-full mb-6">
            <TabsTrigger value="generales" className="flex items-center gap-2 px-3 py-2 text-sm">
              <FileText className="h-4 w-4" />
              Datos generales
            </TabsTrigger>
            <TabsTrigger value="registros" className="flex items-center gap-2 px-3 py-2 text-sm">
              <ClipboardList className="h-4 w-4" />
              Registros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generales" className="space-y-6">
            {renderInstitutionSection("INIA", <Building2 className="h-5 w-5 text-emerald-600" />, "bg-emerald-50")}
            {renderInstitutionSection("INASE", <Building2 className="h-5 w-5 text-blue-600" />, "bg-blue-50")}
          </TabsContent>

          <TabsContent value="registros" className="space-y-6 mt-6">
            <MalezaFields titulo="Malezas" contexto="dosn" registros={malezas} onChangeListados={onChangeListadosMalezas} />
            <OtrosCultivosFields contexto="dosn" registros={cultivos} onChangeListados={onChangeListadosCultivos} />
            <BrassicaFields contexto="dosn" registros={brassicas} onChangeListados={onChangeListadosBrassicas} />
            <CuscutaFields formData={formData} handleInputChange={handleInputChange ?? (() => {})} />
            <Separator />
            <CumplimientoEstandarFields formData={formData} handleInputChange={handleInputChange ?? (() => {})} />
          </TabsContent>
        </Tabs>

        {/* Cuadro de validación (solo visible si mostrarValidacion = true) */}
        {mostrarValidacion && (
          <Card
            className={`mt-6 border-2 ${
              configuracionValida ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    configuracionValida ? "bg-green-200" : "bg-red-200"
                  }`}
                >
                  <Microscope
                    className={`h-4 w-4 ${
                      configuracionValida ? "text-green-700" : "text-red-700"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-medium mb-2 ${
                      configuracionValida ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {configuracionValida
                      ? "Configuración válida"
                      : "Configuración incompleta o inválida"}
                  </h4>
                  <ul className="text-sm list-disc list-inside space-y-1">
                    {!validarTiposAnalisis(data, "inia") && (
                      <li>Seleccione al menos un tipo de análisis para INIA.</li>
                    )}
                    {!validarTiposAnalisis(data, "inase") && (
                      <li>Seleccione al menos un tipo de análisis para INASE.</li>
                    )}
                    {!validarFecha(data.iniaFecha) && <li>Ingrese una fecha válida para INIA.</li>}
                    {!validarFecha(data.inaseFecha) && <li>Ingrese una fecha válida para INASE.</li>}
                    {!validarGramos(data.iniaGramos) && <li>Ingrese gramos válidos (&gt; 0) para INIA.</li>}
                    {!validarGramos(data.inaseGramos) && <li>Ingrese gramos válidos (&gt; 0) para INASE.</li>}
                    {configuracionValida && <li>Todos los datos requeridos son correctos</li>}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
