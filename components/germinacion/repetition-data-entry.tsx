"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, AlertTriangle, CheckCircle, Calendar } from "lucide-react"

interface RepGerm {
  id: string
  numRep: number
  numSemillasPRep: number
  normales: number[] // Array de conteos por fecha
  totalNormales: number
  totalAnormales: number
  totalNoGerminadas: number
  promedioGerminacion: number
}

interface TablaGerm {
  id: string
  numeroTabla: number
  finalizada: boolean
  temperatura: string
  humedad: string
  sustrato: string
  repeticiones: RepGerm[]
}

interface RepetitionDataEntryProps {
  tables: TablaGerm[]
  fechaConteos: string[]
  onRepetitionChange?: (tableId: string, repetitionId: string, data: RepGerm) => void
  onSave?: () => void
}

export function RepetitionDataEntry({ tables, fechaConteos, onRepetitionChange, onSave }: RepetitionDataEntryProps) {
  const [activeTable, setActiveTable] = useState<string>(tables[0]?.id || "")
  const [editingData, setEditingData] = useState<{ [key: string]: RepGerm }>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Initialize editing data
  useEffect(() => {
    const initialData: { [key: string]: RepGerm } = {}
    tables.forEach((table) => {
      table.repeticiones.forEach((rep) => {
        initialData[rep.id] = { ...rep }
      })
    })
    setEditingData(initialData)
  }, [tables])

  const handleConteoChange = (repId: string, conteoIndex: number, value: string) => {
    const numValue = Number.parseInt(value) || 0
    const currentRep = editingData[repId]
    if (!currentRep) return

    // Validate that the value doesn't exceed numSemillasPRep
    if (numValue > currentRep.numSemillasPRep) {
      return // Don't allow values greater than total seeds
    }

    const newNormales = [...currentRep.normales]
    newNormales[conteoIndex] = numValue

    // Ensure cumulative values don't decrease
    for (let i = conteoIndex + 1; i < newNormales.length; i++) {
      if (newNormales[i] < numValue) {
        newNormales[i] = numValue
      }
    }

    const updatedRep = {
      ...currentRep,
      normales: newNormales,
    }

    setEditingData((prev) => ({
      ...prev,
      [repId]: updatedRep,
    }))
    setHasUnsavedChanges(true)
  }

  const handleAdditionalDataChange = (repId: string, field: "totalAnormales" | "totalNoGerminadas", value: string) => {
    const numValue = Number.parseInt(value) || 0
    const currentRep = editingData[repId]
    if (!currentRep) return

    const updatedRep = {
      ...currentRep,
      [field]: numValue,
    }

    setEditingData((prev) => ({
      ...prev,
      [repId]: updatedRep,
    }))
    setHasUnsavedChanges(true)
  }

  const saveChanges = () => {
    Object.entries(editingData).forEach(([repId, repData]) => {
      const table = tables.find((t) => t.repeticiones.some((r) => r.id === repId))
      if (table) {
        onRepetitionChange?.(table.id, repId, repData)
      }
    })
    setHasUnsavedChanges(false)
    onSave?.()
  }

  const getRepetitionProgress = (rep: RepGerm) => {
    const filledConteos = rep.normales.filter((n) => n > 0).length
    return (filledConteos / rep.normales.length) * 100
  }

  const validateConteoSequence = (normales: number[]) => {
    for (let i = 1; i < normales.length; i++) {
      if (normales[i] < normales[i - 1]) {
        return false
      }
    }
    return true
  }

  const getTableProgress = (table: TablaGerm) => {
    const totalReps = table.repeticiones.length
    const completedReps = table.repeticiones.filter((rep) => {
      const editedRep = editingData[rep.id] || rep
      return editedRep.normales.every((n) => n >= 0) && editedRep.normales.some((n) => n > 0)
    }).length
    return (completedReps / totalReps) * 100
  }

  if (tables.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay tablas disponibles</h3>
          <p className="text-muted-foreground">
            Primero debes crear tablas en el paso anterior para poder ingresar datos de repeticiones.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Registro de Repeticiones</h3>
          <p className="text-sm text-muted-foreground">Ingresa los conteos por fecha para cada repetición</p>
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
            Tienes cambios sin guardar. Recuerda guardar antes de cambiar de paso.
          </AlertDescription>
        </Alert>
      )}

      {/* Tables Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progreso por Tabla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeTable === table.id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setActiveTable(table.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Tabla {table.numeroTabla}</h4>
                  <Badge variant={table.finalizada ? "default" : "outline"}>
                    {table.finalizada ? "Finalizada" : "Activa"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">{table.repeticiones.length} repeticiones</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${getTableProgress(table)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(getTableProgress(table))}% completado
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Table Data Entry */}
      {activeTable && (
        <Tabs defaultValue="data-entry" className="space-y-4">
          <TabsList>
            <TabsTrigger value="data-entry">Ingreso de Datos</TabsTrigger>
            <TabsTrigger value="summary">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="data-entry" className="space-y-4">
            {tables
              .filter((table) => table.id === activeTable)
              .map((table) => (
                <div key={table.id} className="space-y-4">
                  {/* Table Info */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tabla:</span> {table.numeroTabla}
                        </div>
                        <div>
                          <span className="font-medium">Temperatura:</span> {table.temperatura}
                        </div>
                        <div>
                          <span className="font-medium">Humedad:</span> {table.humedad}
                        </div>
                        <div>
                          <span className="font-medium">Sustrato:</span> {table.sustrato.replace("-", " ")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Repetitions Data Entry */}
                  {table.repeticiones.map((rep) => {
                    const editedRep = editingData[rep.id] || rep
                    const isValidSequence = validateConteoSequence(editedRep.normales)

                    return (
                      <Card key={rep.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Repetición {rep.numRep}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{rep.numSemillasPRep} semillas</Badge>
                              {!isValidSequence && <Badge variant="destructive">Secuencia inválida</Badge>}
                            </div>
                          </div>
                          <CardDescription>Progreso: {Math.round(getRepetitionProgress(editedRep))}%</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Conteos por fecha */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-3 block">Conteos Normales por Fecha</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {fechaConteos.map((fecha, index) => (
                                  <div key={index}>
                                    <Label htmlFor={`conteo-${rep.id}-${index}`} className="text-xs">
                                      <Calendar className="h-3 w-3 inline mr-1" />
                                      {new Date(fecha).toLocaleDateString("es-ES", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </Label>
                                    <Input
                                      id={`conteo-${rep.id}-${index}`}
                                      type="number"
                                      min="0"
                                      max={rep.numSemillasPRep}
                                      value={editedRep.normales[index] || 0}
                                      onChange={(e) => handleConteoChange(rep.id, index, e.target.value)}
                                      className={`text-center ${
                                        index > 0 && editedRep.normales[index] < editedRep.normales[index - 1]
                                          ? "border-red-300 bg-red-50"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>
                              {!isValidSequence && (
                                <p className="text-xs text-red-600 mt-2">
                                  Los conteos deben ser cumulativos (no pueden disminuir)
                                </p>
                              )}
                            </div>

                            {/* Additional data */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                              <div>
                                <Label htmlFor={`anormales-${rep.id}`}>Plántulas Anormales</Label>
                                <Input
                                  id={`anormales-${rep.id}`}
                                  type="number"
                                  min="0"
                                  value={editedRep.totalAnormales}
                                  onChange={(e) => handleAdditionalDataChange(rep.id, "totalAnormales", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`no-germinadas-${rep.id}`}>Semillas No Germinadas</Label>
                                <Input
                                  id={`no-germinadas-${rep.id}`}
                                  type="number"
                                  min="0"
                                  value={editedRep.totalNoGerminadas}
                                  onChange={(e) =>
                                    handleAdditionalDataChange(rep.id, "totalNoGerminadas", e.target.value)
                                  }
                                />
                              </div>
                            </div>

                            {/* Validation info */}
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div>
                                  <span className="text-muted-foreground">Total semillas:</span>
                                  <span className="ml-2 font-medium">{rep.numSemillasPRep}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Último conteo:</span>
                                  <span className="ml-2 font-medium">
                                    {editedRep.normales[editedRep.normales.length - 1] || 0}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Anormales:</span>
                                  <span className="ml-2 font-medium">{editedRep.totalAnormales}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">No germinadas:</span>
                                  <span className="ml-2 font-medium">{editedRep.totalNoGerminadas}</span>
                                </div>
                              </div>

                              {/* Validation warning */}
                              {(() => {
                                const lastConteo = editedRep.normales[editedRep.normales.length - 1] || 0
                                const total = lastConteo + editedRep.totalAnormales + editedRep.totalNoGerminadas
                                if (total !== rep.numSemillasPRep && total > 0) {
                                  return (
                                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                                      <AlertTriangle className="h-4 w-4 inline mr-2" />
                                      Total ({total}) no coincide con semillas por repetición ({rep.numSemillasPRep})
                                    </div>
                                  )
                                }
                                return null
                              })()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ))}
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            {tables
              .filter((table) => table.id === activeTable)
              .map((table) => (
                <Card key={table.id}>
                  <CardHeader>
                    <CardTitle>Resumen - Tabla {table.numeroTabla}</CardTitle>
                    <CardDescription>Vista general de todas las repeticiones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rep.</TableHead>
                            <TableHead>Semillas</TableHead>
                            {fechaConteos.map((fecha, index) => (
                              <TableHead key={index} className="text-center">
                                {new Date(fecha).toLocaleDateString("es-ES", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableHead>
                            ))}
                            <TableHead>Anormales</TableHead>
                            <TableHead>No Germ.</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.repeticiones.map((rep) => {
                            const editedRep = editingData[rep.id] || rep
                            const hasData = editedRep.normales.some((n) => n > 0)

                            return (
                              <TableRow key={rep.id}>
                                <TableCell className="font-medium">{rep.numRep}</TableCell>
                                <TableCell>{rep.numSemillasPRep}</TableCell>
                                {editedRep.normales.map((conteo, index) => (
                                  <TableCell key={index} className="text-center">
                                    {conteo || "-"}
                                  </TableCell>
                                ))}
                                <TableCell>{editedRep.totalAnormales || "-"}</TableCell>
                                <TableCell>{editedRep.totalNoGerminadas || "-"}</TableCell>
                                <TableCell>
                                  {hasData ? (
                                    <Badge variant="secondary">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Con datos
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Pendiente</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
