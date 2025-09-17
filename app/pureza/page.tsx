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
import { Search, Filter, BarChart3, Eye, Download, FileText, Beaker } from "lucide-react"
import Link from "next/link"

interface PurezaAnalysis {
  id: string
  loteId: string
  fechaAnalisis: string
  tipoAnalisis: "Pureza física" | "Pureza en otras semillas" | "Análisis completo"
  estado: "Completado" | "En proceso" | "Pendiente"
  semillaPura: number
  materiaInerte: number
  otrosCultivos: number
  malezas: number
  cultivo: string
  responsable: string
  observaciones: string
}

export default function PurezaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [selectedAnalysis, setSelectedAnalysis] = useState<PurezaAnalysis | null>(null)

  const [analisis] = useState<PurezaAnalysis[]>([
    {
      id: "PUR-001",
      loteId: "RG-LE-ex-0018",
      fechaAnalisis: "2024-12-10",
      tipoAnalisis: "Pureza física",
      estado: "Completado",
      semillaPura: 98.5,
      materiaInerte: 1.2,
      otrosCultivos: 0.2,
      malezas: 0.1,
      cultivo: "Soja",
      responsable: "Dr. Juan Pérez",
      observaciones: "Análisis realizado según normas ISTA. Resultados dentro de parámetros esperados.",
    },
    {
      id: "PUR-002",
      loteId: "RG-LE-ex-0019",
      fechaAnalisis: "2024-12-12",
      tipoAnalisis: "Pureza en otras semillas",
      estado: "En proceso",
      semillaPura: 97.2,
      materiaInerte: 1.8,
      otrosCultivos: 0.8,
      malezas: 0.2,
      cultivo: "Maíz",
      responsable: "Dra. María González",
      observaciones: "Análisis en curso. Se detectaron trazas de otras variedades.",
    },
    {
      id: "PUR-003",
      loteId: "RG-LE-ex-0020",
      fechaAnalisis: "2024-12-08",
      tipoAnalisis: "Análisis completo",
      estado: "Completado",
      semillaPura: 99.1,
      materiaInerte: 0.7,
      otrosCultivos: 0.1,
      malezas: 0.1,
      cultivo: "Trigo",
      responsable: "Dr. Carlos Rodríguez",
      observaciones: "Excelente calidad de semilla. Cumple con todos los estándares de certificación.",
    },
    {
      id: "PUR-004",
      loteId: "RG-LE-ex-0021",
      fechaAnalisis: "2024-12-14",
      tipoAnalisis: "Pureza física",
      estado: "Pendiente",
      semillaPura: 0,
      materiaInerte: 0,
      otrosCultivos: 0,
      malezas: 0,
      cultivo: "Soja",
      responsable: "Dr. Juan Pérez",
      observaciones: "Análisis programado para inicio la próxima semana.",
    },
    {
      id: "PUR-005",
      loteId: "RG-LE-ex-0022",
      fechaAnalisis: "2024-12-13",
      tipoAnalisis: "Pureza en otras semillas",
      estado: "Completado",
      semillaPura: 96.8,
      materiaInerte: 2.1,
      otrosCultivos: 0.9,
      malezas: 0.2,
      cultivo: "Arroz",
      responsable: "Dra. Ana Martínez",
      observaciones: "Se encontraron semillas de malezas comunes. Requiere tratamiento adicional.",
    },
  ])

  const filteredAnalisis = analisis.filter((item) => {
    const matchesSearch =
      item.loteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cultivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.responsable.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "todos" || item.tipoAnalisis === filterTipo
    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado

    return matchesSearch && matchesTipo && matchesEstado
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

  const getPurezaColor = (pureza: number) => {
    if (pureza >= 98) return "text-green-600"
    if (pureza >= 95) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Consulta de Pureza</h1>
          <p className="text-muted-foreground text-pretty">
            Consulta y analiza los resultados de pureza física de las semillas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resultados
          </Button>
          <Link href="/pureza/nuevo">
            <Button>
              <Beaker className="h-4 w-4 mr-2" />
              Nuevo Análisis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{analisis.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "Completado").length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "En proceso").length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Pureza</p>
                <p className="text-2xl font-bold">
                  {(
                    analisis.filter((a) => a.estado === "Completado").reduce((acc, a) => acc + a.semillaPura, 0) /
                    analisis.filter((a) => a.estado === "Completado").length
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                  placeholder="Buscar por lote, cultivo o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Tipo de análisis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="Pureza física">Pureza física</SelectItem>
                <SelectItem value="Pureza en otras semillas">Pureza en otras semillas</SelectItem>
                <SelectItem value="Análisis completo">Análisis completo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En proceso">En proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
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
            {filteredAnalisis.length} análisis encontrado{filteredAnalisis.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Análisis</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Cultivo</TableHead>
                  <TableHead>Tipo Análisis</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pureza (%)</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalisis.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>
                      <Link href={`/lotes/${item.loteId}`} className="text-primary hover:underline">
                        {item.loteId}
                      </Link>
                    </TableCell>
                    <TableCell>{item.cultivo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.tipoAnalisis}</Badge>
                    </TableCell>
                    <TableCell>{new Date(item.fechaAnalisis).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(item.estado)}>{item.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.estado === "Completado" ? (
                        <span className={`font-semibold ${getPurezaColor(item.semillaPura)}`}>{item.semillaPura}%</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{item.responsable}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAnalysis(item)}
                              disabled={item.estado === "Pendiente"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Análisis {selectedAnalysis?.id}</DialogTitle>
                              <DialogDescription>Resultados completos del análisis de pureza física</DialogDescription>
                            </DialogHeader>
                            {selectedAnalysis && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Lote</label>
                                    <p className="text-lg font-semibold">{selectedAnalysis.loteId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Cultivo</label>
                                    <p className="text-lg">{selectedAnalysis.cultivo}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Tipo de Análisis
                                    </label>
                                    <p className="text-lg">{selectedAnalysis.tipoAnalisis}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Responsable</label>
                                    <p className="text-lg">{selectedAnalysis.responsable}</p>
                                  </div>
                                </div>

                                {selectedAnalysis.estado === "Completado" && (
                                  <div>
                                    <h4 className="font-semibold mb-4">Resultados de Pureza</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                          {selectedAnalysis.semillaPura}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Semilla Pura</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-gray-600">
                                          {selectedAnalysis.materiaInerte}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Materia Inerte</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">
                                          {selectedAnalysis.otrosCultivos}%
                                        </p>
                                        <p className="text-sm text-muted-foreground">Otros Cultivos</p>
                                      </div>
                                      <div className="text-center p-4 border rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">{selectedAnalysis.malezas}%</p>
                                        <p className="text-sm text-muted-foreground">Malezas</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
                                  <p className="mt-1 p-3 bg-muted rounded-lg">{selectedAnalysis.observaciones}</p>
                                </div>

                                <div className="flex gap-2">
                                  <Button variant="outline" className="flex-1 bg-transparent">
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar Reporte
                                  </Button>
                                  <Button variant="outline" className="flex-1 bg-transparent">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Ver Certificado
                                  </Button>
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
    </div>
  )
}
