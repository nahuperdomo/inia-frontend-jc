"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, Eye, Download, Plus, Beaker } from "lucide-react"

interface OtrasSemillas {
  id: string
  loteId: string
  cultivo: string
  tipoMaterial: "INIA" | "INASE" | "Otro"
  fechaAnalisis: string
  estado: "Completado" | "En proceso" | "Pendiente"
  detalles: {
    materiaInerte: number
    semillaPura: number
    otrosCultivos: number
    malezas: number
  }
  observaciones: string
}

export default function PurezaOtrasSemillasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [selectedItem, setSelectedItem] = useState<OtrasSemillas | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  const [otrasSemillas] = useState<OtrasSemillas[]>([
    {
      id: "OS-001",
      loteId: "RG-LE-ex-0018",
      cultivo: "Soja",
      tipoMaterial: "INIA",
      fechaAnalisis: "2024-12-10",
      estado: "Completado",
      detalles: {
        materiaInerte: 1.2,
        semillaPura: 98.5,
        otrosCultivos: 0.2,
        malezas: 0.1,
      },
      observaciones: "Análisis completado según normas ISTA",
    },
    {
      id: "OS-002",
      loteId: "RG-LE-ex-0019",
      cultivo: "Maíz",
      tipoMaterial: "INASE",
      fechaAnalisis: "2024-12-12",
      estado: "En proceso",
      detalles: {
        materiaInerte: 1.8,
        semillaPura: 97.2,
        otrosCultivos: 0.8,
        malezas: 0.2,
      },
      observaciones: "Análisis en curso, resultados preliminares",
    },
    {
      id: "OS-003",
      loteId: "RG-LE-ex-0020",
      cultivo: "Trigo",
      tipoMaterial: "INIA",
      fechaAnalisis: "2024-12-08",
      estado: "Completado",
      detalles: {
        materiaInerte: 0.7,
        semillaPura: 99.1,
        otrosCultivos: 0.1,
        malezas: 0.1,
      },
      observaciones: "Excelente calidad, cumple estándares",
    },
  ])

  const filteredItems = otrasSemillas.filter((item) => {
    const matchesSearch =
      item.loteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cultivo.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "todos" || item.tipoMaterial === filterTipo

    return matchesSearch && matchesTipo
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "default"
      case "En proceso":
        return "secondary"
      case "Pendiente":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Pureza Física en Otras Semillas</h1>
          <p className="text-muted-foreground text-pretty">
            Análisis específico de pureza física para diferentes tipos de materiales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Análisis
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{otrasSemillas.length}</p>
              </div>
              <Beaker className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Material INIA</p>
                <p className="text-2xl font-bold">{otrasSemillas.filter((s) => s.tipoMaterial === "INIA").length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Material INASE</p>
                <p className="text-2xl font-bold">{otrasSemillas.filter((s) => s.tipoMaterial === "INASE").length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por lote o cultivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo de material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="INIA">INIA</SelectItem>
                <SelectItem value="INASE">INASE</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados de Análisis</CardTitle>
          <CardDescription>
            {filteredItems.length} análisis encontrado{filteredItems.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Cultivo</TableHead>
                  <TableHead>Tipo Material</TableHead>
                  <TableHead>Fecha Análisis</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pureza (%)</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.loteId}</TableCell>
                    <TableCell>{item.cultivo}</TableCell>
                    <TableCell>
                      <Badge variant={item.tipoMaterial === "INIA" ? "default" : "secondary"}>
                        {item.tipoMaterial}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.fechaAnalisis).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(item.estado)}>{item.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.estado === "Completado" ? (
                        <span className="font-semibold text-green-600">{item.detalles.semillaPura}%</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                              disabled={item.estado === "Pendiente"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Análisis {selectedItem?.id}</DialogTitle>
                              <DialogDescription>Pureza física en otras semillas</DialogDescription>
                            </DialogHeader>
                            {selectedItem && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Lote</label>
                                    <p className="text-lg font-semibold">{selectedItem.loteId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Cultivo</label>
                                    <p className="text-lg">{selectedItem.cultivo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tipo Material</label>
                                    <Badge variant={selectedItem.tipoMaterial === "INIA" ? "default" : "secondary"}>
                                      {selectedItem.tipoMaterial}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                    <Badge variant={getEstadoBadgeVariant(selectedItem.estado)}>
                                      {selectedItem.estado}
                                    </Badge>
                                  </div>
                                </div>

                                {selectedItem.estado === "Completado" && (
                                  <div>
                                    <h4 className="font-semibold mb-4">Resultados Detallados</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                          {selectedItem.detalles.semillaPura}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Semilla Pura</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-gray-600">
                                          {selectedItem.detalles.materiaInerte}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Materia Inerte</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                          {selectedItem.detalles.otrosCultivos}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Otros Cultivos</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">
                                          {selectedItem.detalles.malezas}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Malezas</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedItem.observaciones}</p>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" disabled={item.estado === "Pendiente"}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Analysis Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Análisis de Pureza</DialogTitle>
            <DialogDescription>Configurar nuevo análisis de pureza en otras semillas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materia-inerte">Materia inerte</SelectItem>
                  <SelectItem value="otros-cultivos">Otros cultivos</SelectItem>
                  <SelectItem value="malezas">Malezas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lote">Lote</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lote" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inia">INIA</SelectItem>
                  <SelectItem value="inase">INASE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input placeholder="Observaciones adicionales" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setShowDialog(false)} className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
