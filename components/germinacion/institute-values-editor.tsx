"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Save, AlertTriangle, CheckCircle, Edit, RotateCcw } from "lucide-react"

interface ValoresGerm {
  id: string
  instituto: "INIA" | "INASE"
  porcentajeGerminacion: number
  porcentajePlantulasNormales: number
  porcentajePlantulasAnormales: number
  porcentajeSemillasNoGerminadas: number
  esManual: boolean // Indica si los valores fueron editados manualmente
  fechaEdicion?: string
  usuarioEdicion?: string
}

interface TableSummary {
  tableId: string
  numeroTabla: number
  promedioGeneral: number
  desviacionEstandar: number
  coeficienteVariacion: number
  isComplete: boolean
}

interface InstituteValuesEditorProps {
  tableSummaries: TableSummary[]
  valoresGerm: ValoresGerm[]
  onValuesChange?: (valores: ValoresGerm[]) => void
  onSave?: () => void
}

export function InstituteValuesEditor({
  tableSummaries,
  valoresGerm,
  onValuesChange,
  onSave,
}: InstituteValuesEditorProps) {
  const [editingValues, setEditingValues] = useState<ValoresGerm[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeInstitute, setActiveInstitute] = useState<"INIA" | "INASE">("INIA")

  // Initialize editing values
  useEffect(() => {
    if (valoresGerm.length > 0) {
      setEditingValues([...valoresGerm])
    } else {
      // Create initial values from table summaries
      const initialValues: ValoresGerm[] = [][("INIA", "INASE")].forEach((instituto) => {
        tableSummaries.forEach((summary) => {
          const baseValues = {
            id: `${instituto.toLowerCase()}-${summary.tableId}`,
            instituto: instituto as "INIA" | "INASE",
            porcentajeGerminacion: summary.promedioGeneral,
            porcentajePlantulasNormales: summary.promedioGeneral,
            porcentajePlantulasAnormales: 0,
            porcentajeSemillasNoGerminadas: 100 - summary.promedioGeneral,
            esManual: false,
            fechaEdicion: new Date().toISOString(),
            usuarioEdicion: "Sistema",
          }
          initialValues.push(baseValues)
        })
      })

      setEditingValues(initialValues)
    }
  }, [valoresGerm, tableSummaries])

  const handleValueChange = (instituto: "INIA" | "INASE", tableId: string, field: keyof ValoresGerm, value: any) => {
    const updatedValues = editingValues.map((val) => {
      if (val.instituto === instituto && val.id.includes(tableId)) {
        return {
          ...val,
          [field]: field.includes("porcentaje") ? Number.parseFloat(value) || 0 : value,
          esManual: field.includes("porcentaje") ? true : val.esManual,
          fechaEdicion: field.includes("porcentaje") ? new Date().toISOString() : val.fechaEdicion,
          usuarioEdicion: field.includes("porcentaje") ? "Usuario Actual" : val.usuarioEdicion,
        }
      }
      return val
    })

    setEditingValues(updatedValues)
    setHasUnsavedChanges(true)
  }

  const resetToCalculated = (instituto: "INIA" | "INASE", tableId: string) => {
    const summary = tableSummaries.find((s) => s.tableId === tableId)
    if (!summary) return

    const updatedValues = editingValues.map((val) => {
      if (val.instituto === instituto && val.id.includes(tableId)) {
        return {
          ...val,
          porcentajeGerminacion: summary.promedioGeneral,
          porcentajePlantulasNormales: summary.promedioGeneral,
          porcentajePlantulasAnormales: 0,
          porcentajeSemillasNoGerminadas: 100 - summary.promedioGeneral,
          esManual: false,
          fechaEdicion: new Date().toISOString(),
          usuarioEdicion: "Sistema",
        }
      }
      return val
    })

    setEditingValues(updatedValues)
    setHasUnsavedChanges(true)
  }

  const validatePercentages = (values: ValoresGerm) => {
    const total =
      values.porcentajePlantulasNormales + values.porcentajePlantulasAnormales + values.porcentajeSemillasNoGerminadas
    return Math.abs(total - 100) < 0.01 // Allow small rounding differences
  }

  const saveChanges = () => {
    onValuesChange?.(editingValues)
    setHasUnsavedChanges(false)
    onSave?.()
  }

  const getInstituteValues = (instituto: "INIA" | "INASE") => {
    return editingValues.filter((val) => val.instituto === instituto)
  }

  const getOverallSummary = (instituto: "INIA" | "INASE") => {
    const values = getInstituteValues(instituto)
    if (values.length === 0) return null

    const validValues = values.filter((v) => validatePercentages(v))
    const avgGerminacion =
      validValues.length > 0 ? validValues.reduce((sum, v) => sum + v.porcentajeGerminacion, 0) / validValues.length : 0

    return {
      totalTablas: values.length,
      tablasValidas: validValues.length,
      promedioGerminacion: Math.round(avgGerminacion * 100) / 100,
      tablasEditadas: values.filter((v) => v.esManual).length,
    }
  }

  if (tableSummaries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay datos calculados</h3>
          <p className="text-muted-foreground">
            Primero debes completar los cálculos automáticos para poder editar los valores por instituto.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Editor de Valores por Instituto</h3>
          <p className="text-sm text-muted-foreground">Edita los porcentajes finales para INIA e INASE</p>
        </div>
        <Button
          onClick={saveChanges}
          disabled={!hasUnsavedChanges}
          className={hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700" : ""}
        >
          <Save className="h-4 w-4 mr-2" />
          {hasUnsavedChanges ? "Guardar Cambios" : "Guardado"}
        </Button>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Tienes cambios sin guardar en los valores por instituto.
          </AlertDescription>
        </Alert>
      )}

      {/* Institute Tabs */}
      <Tabs value={activeInstitute} onValueChange={(value) => setActiveInstitute(value as "INIA" | "INASE")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="INIA" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            INIA
          </TabsTrigger>
          <TabsTrigger value="INASE" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            INASE
          </TabsTrigger>
        </TabsList>

        {["INIA", "INASE"].map((instituto) => (
          <TabsContent key={instituto} value={instituto} className="space-y-4">
            {/* Institute Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 text-sm">Resumen {instituto}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                {(() => {
                  const summary = getOverallSummary(instituto as "INIA" | "INASE")
                  if (!summary) return <p>No hay datos disponibles</p>

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="font-medium">Total tablas:</span> {summary.totalTablas}
                      </div>
                      <div>
                        <span className="font-medium">Tablas válidas:</span> {summary.tablasValidas}
                      </div>
                      <div>
                        <span className="font-medium">Promedio germinación:</span> {summary.promedioGerminacion}%
                      </div>
                      <div>
                        <span className="font-medium">Editadas manualmente:</span> {summary.tablasEditadas}
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Values Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Valores por Tabla - {instituto}</CardTitle>
                <CardDescription>Los porcentajes deben sumar exactamente 100%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tabla</TableHead>
                        <TableHead>% Germinación</TableHead>
                        <TableHead>% Plántulas Normales</TableHead>
                        <TableHead>% Plántulas Anormales</TableHead>
                        <TableHead>% No Germinadas</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getInstituteValues(instituto as "INIA" | "INASE").map((valores) => {
                        const tableId = valores.id.split("-")[1]
                        const summary = tableSummaries.find((s) => s.tableId === tableId)
                        const isValid = validatePercentages(valores)
                        const total =
                          valores.porcentajePlantulasNormales +
                          valores.porcentajePlantulasAnormales +
                          valores.porcentajeSemillasNoGerminadas

                        return (
                          <TableRow key={valores.id} className={!isValid ? "bg-red-50" : ""}>
                            <TableCell className="font-medium">Tabla {summary?.numeroTabla}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={valores.porcentajeGerminacion}
                                onChange={(e) =>
                                  handleValueChange(
                                    instituto as "INIA" | "INASE",
                                    tableId,
                                    "porcentajeGerminacion",
                                    e.target.value,
                                  )
                                }
                                className="w-20 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={valores.porcentajePlantulasNormales}
                                onChange={(e) =>
                                  handleValueChange(
                                    instituto as "INIA" | "INASE",
                                    tableId,
                                    "porcentajePlantulasNormales",
                                    e.target.value,
                                  )
                                }
                                className="w-20 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={valores.porcentajePlantulasAnormales}
                                onChange={(e) =>
                                  handleValueChange(
                                    instituto as "INIA" | "INASE",
                                    tableId,
                                    "porcentajePlantulasAnormales",
                                    e.target.value,
                                  )
                                }
                                className="w-20 text-center"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={valores.porcentajeSemillasNoGerminadas}
                                onChange={(e) =>
                                  handleValueChange(
                                    instituto as "INIA" | "INASE",
                                    tableId,
                                    "porcentajeSemillasNoGerminadas",
                                    e.target.value,
                                  )
                                }
                                className="w-20 text-center"
                              />
                            </TableCell>
                            <TableCell className={`font-medium ${!isValid ? "text-red-600" : "text-green-600"}`}>
                              {Math.round(total * 100) / 100}%
                            </TableCell>
                            <TableCell>
                              {isValid ? (
                                <Badge variant="secondary">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Válido
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                              {valores.esManual && (
                                <Badge variant="outline" className="ml-1">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Manual
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resetToCalculated(instituto as "INIA" | "INASE", tableId)}
                                title="Restaurar valores calculados"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Validation Errors */}
            {getInstituteValues(instituto as "INIA" | "INASE").some((v) => !validatePercentages(v)) && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Errores de validación encontrados:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {getInstituteValues(instituto as "INIA" | "INASE")
                      .filter((v) => !validatePercentages(v))
                      .map((valores, index) => {
                        const tableId = valores.id.split("-")[1]
                        const summary = tableSummaries.find((s) => s.tableId === tableId)
                        const total =
                          valores.porcentajePlantulasNormales +
                          valores.porcentajePlantulasAnormales +
                          valores.porcentajeSemillasNoGerminadas
                        return (
                          <li key={index}>
                            Tabla {summary?.numeroTabla}: Los porcentajes suman {Math.round(total * 100) / 100}% (debe
                            ser 100%)
                          </li>
                        )
                      })}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Instructions */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-1">
            <li>• Los valores se inicializan automáticamente con los resultados calculados</li>
            <li>• Puedes editar manualmente cualquier porcentaje según los criterios del instituto</li>
            <li>• Los porcentajes de cada tabla deben sumar exactamente 100%</li>
            <li>• Usa el botón de restaurar para volver a los valores calculados automáticamente</li>
            <li>• Los cambios se marcan como "Manual" para trazabilidad</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
