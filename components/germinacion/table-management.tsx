"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Settings, Trash2, CheckCircle, AlertCircle, Thermometer, Droplets, FileText } from "lucide-react"

interface TablaGerm {
  id: string
  numeroTabla: number
  finalizada: boolean
  // Parámetros de tratamiento
  temperatura: string
  humedad: string
  sustrato: string
  duracion: string
  observaciones?: string
  // Configuración de repeticiones
  numeroRepeticiones: number
  numSemillasPorRep: number
  repeticiones: RepGerm[]
}

interface RepGerm {
  id: string
  numRep: number
  numSemillasPRep: number
  normales: number[]
  totalNormales: number
  totalAnormales: number
  totalNoGerminadas: number
  promedioGerminacion: number
}

interface TableManagementProps {
  analysisId: string
  numeroRepeticiones: number
  numeroConteos: number
  onTablesChange?: (tables: TablaGerm[]) => void
}

export function TableManagement({
  analysisId,
  numeroRepeticiones,
  numeroConteos,
  onTablesChange,
}: TableManagementProps) {
  const [tables, setTables] = useState<TablaGerm[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<TablaGerm | null>(null)
  const [newTable, setNewTable] = useState({
    temperatura: "20",
    humedad: "85",
    sustrato: "papel-filtro",
    duracion: "7",
    observaciones: "",
    numSemillasPorRep: 100,
  })

  const sustratoOptions = [
    { value: "papel-filtro", label: "Papel filtro" },
    { value: "arena", label: "Arena" },
    { value: "tierra", label: "Tierra" },
    { value: "perlita", label: "Perlita" },
    { value: "vermiculita", label: "Vermiculita" },
  ]

  const createTable = () => {
    const newTableData: TablaGerm = {
      id: `tabla-${Date.now()}`,
      numeroTabla: tables.length + 1,
      finalizada: false,
      temperatura: `${newTable.temperatura}°C`,
      humedad: `${newTable.humedad}%`,
      sustrato: newTable.sustrato,
      duracion: `${newTable.duracion} días`,
      observaciones: newTable.observaciones,
      numeroRepeticiones,
      numSemillasPorRep: newTable.numSemillasPorRep,
      repeticiones: Array.from({ length: numeroRepeticiones }, (_, i) => ({
        id: `rep-${Date.now()}-${i}`,
        numRep: i + 1,
        numSemillasPRep: newTable.numSemillasPorRep,
        normales: new Array(numeroConteos).fill(0),
        totalNormales: 0,
        totalAnormales: 0,
        totalNoGerminadas: 0,
        promedioGerminacion: 0,
      })),
    }

    const updatedTables = [...tables, newTableData]
    setTables(updatedTables)
    onTablesChange?.(updatedTables)
    setIsCreateDialogOpen(false)

    // Reset form
    setNewTable({
      temperatura: "20",
      humedad: "85",
      sustrato: "papel-filtro",
      duracion: "7",
      observaciones: "",
      numSemillasPorRep: 100,
    })
  }

  const deleteTable = (tableId: string) => {
    const updatedTables = tables.filter((t) => t.id !== tableId)
    setTables(updatedTables)
    onTablesChange?.(updatedTables)
  }

  const toggleTableFinalized = (tableId: string) => {
    const updatedTables = tables.map((table) =>
      table.id === tableId ? { ...table, finalizada: !table.finalizada } : table,
    )
    setTables(updatedTables)
    onTablesChange?.(updatedTables)
  }

  const getTableStatusBadge = (table: TablaGerm) => {
    if (table.finalizada) {
      return (
        <Badge variant="default" className="bg-green-600">
          Finalizada
        </Badge>
      )
    }

    const hasData = table.repeticiones.some((rep) => rep.totalNormales > 0)
    if (hasData) {
      return <Badge variant="secondary">En Proceso</Badge>
    }

    return <Badge variant="outline">Pendiente</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestión de Tablas</h3>
          <p className="text-sm text-muted-foreground">
            Administra las tablas de germinación con sus parámetros de tratamiento
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tabla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tabla de Germinación</DialogTitle>
              <DialogDescription>Configura los parámetros de tratamiento para la nueva tabla</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="temperatura">Temperatura (°C)</Label>
                <Input
                  id="temperatura"
                  type="number"
                  value={newTable.temperatura}
                  onChange={(e) => setNewTable({ ...newTable, temperatura: e.target.value })}
                  placeholder="20"
                />
              </div>

              <div>
                <Label htmlFor="humedad">Humedad (%)</Label>
                <Input
                  id="humedad"
                  type="number"
                  value={newTable.humedad}
                  onChange={(e) => setNewTable({ ...newTable, humedad: e.target.value })}
                  placeholder="85"
                />
              </div>

              <div>
                <Label htmlFor="sustrato">Sustrato</Label>
                <Select
                  value={newTable.sustrato}
                  onValueChange={(value) => setNewTable({ ...newTable, sustrato: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sustrato" />
                  </SelectTrigger>
                  <SelectContent>
                    {sustratoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duracion">Duración (días)</Label>
                <Input
                  id="duracion"
                  type="number"
                  value={newTable.duracion}
                  onChange={(e) => setNewTable({ ...newTable, duracion: e.target.value })}
                  placeholder="7"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="numSemillasPorRep">Número de Semillas por Repetición</Label>
                <Select
                  value={newTable.numSemillasPorRep.toString()}
                  onValueChange={(value) => setNewTable({ ...newTable, numSemillasPorRep: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cantidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 semillas</SelectItem>
                    <SelectItem value="50">50 semillas</SelectItem>
                    <SelectItem value="100">100 semillas</SelectItem>
                    <SelectItem value="200">200 semillas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={newTable.observaciones}
                  onChange={(e) => setNewTable({ ...newTable, observaciones: e.target.value })}
                  placeholder="Observaciones adicionales sobre el tratamiento..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createTable}>Crear Tabla</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Configuration Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-sm">Configuración del Análisis</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Repeticiones por tabla:</span> {numeroRepeticiones}
            </div>
            <div>
              <span className="font-medium">Conteos por repetición:</span> {numeroConteos}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables List */}
      {tables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay tablas creadas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera tabla de germinación para comenzar el análisis</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Tabla
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Tabla {table.numeroTabla}</CardTitle>
                    <CardDescription>
                      {table.numeroRepeticiones} repeticiones • {table.numSemillasPorRep} semillas/rep
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTableStatusBadge(table)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTableFinalized(table.id)}
                      disabled={table.repeticiones.every((rep) => rep.totalNormales === 0)}
                    >
                      {table.finalizada ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTable(table.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{table.temperatura}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{table.humedad}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm capitalize">{table.sustrato.replace("-", " ")}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Duración:</span> {table.duracion}
                  </div>
                </div>

                {table.observaciones && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Observaciones:</span> {table.observaciones}
                    </p>
                  </div>
                )}

                {/* Repetitions Summary */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rep.</TableHead>
                        <TableHead>Semillas</TableHead>
                        <TableHead>Normales</TableHead>
                        <TableHead>Anormales</TableHead>
                        <TableHead>No Germinadas</TableHead>
                        <TableHead>% Germinación</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.repeticiones.map((rep) => (
                        <TableRow key={rep.id}>
                          <TableCell className="font-medium">{rep.numRep}</TableCell>
                          <TableCell>{rep.numSemillasPRep}</TableCell>
                          <TableCell>{rep.totalNormales}</TableCell>
                          <TableCell>{rep.totalAnormales}</TableCell>
                          <TableCell>{rep.totalNoGerminadas}</TableCell>
                          <TableCell>{rep.promedioGerminacion}%</TableCell>
                          <TableCell>
                            {rep.totalNormales > 0 ? (
                              <Badge variant="secondary">Con datos</Badge>
                            ) : (
                              <Badge variant="outline">Pendiente</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {tables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen de Tablas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{tables.length}</div>
                <div className="text-sm text-muted-foreground">Total Tablas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{tables.filter((t) => t.finalizada).length}</div>
                <div className="text-sm text-muted-foreground">Finalizadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {tables.filter((t) => !t.finalizada && t.repeticiones.some((r) => r.totalNormales > 0)).length}
                </div>
                <div className="text-sm text-muted-foreground">En Proceso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {tables.filter((t) => t.repeticiones.every((r) => r.totalNormales === 0)).length}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
