"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Pagination from "@/components/pagination"
import { obtenerPmsPaginadas } from "@/app/services/pms-service"

interface AnalisisPMS {
  id: string
  loteId: string
  loteName: string
  analyst: string
  fechaInicio: string
  fechaFin: string | null
  estado: "Completado" | "En Proceso" | "Pendiente"
  prioridad: "Alta" | "Media" | "Baja"
  repeticiones: number
  semillasPorRep: number
  humedad: string
  pesoPromedio: number
  desviacionEstandar: number
  coeficienteVariacion: number
  pesoCorregido: number
}

export default function ListadoPMSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todos")
  const [analisis, setAnalisis] = useState<AnalisisPMS[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Fetch paginated PMS
  const fetchPms = async (page: number = 0) => {
    try {
      setLoading(true)
      const data = await obtenerPmsPaginadas(page, pageSize)
      // data.content expected
      setAnalisis((data.content || []).map((p: any) => ({
        id: `PMS${p.analisisID}`,
        loteId: p.lote || `#${p.analisisID}`,
        loteName: p.lote || "No especificado",
        analyst: p.analista || "-",
        fechaInicio: p.fecha || new Date().toISOString(),
        fechaFin: p.fechaFin || null,
        estado: p.estado === 'FINALIZADO' || p.estado === 'APROBADO' ? 'Completado' : (p.estado === 'EN_PROCESO' ? 'En Proceso' : 'Pendiente'),
        prioridad: 'Media',
        repeticiones: p.repeticiones || 0,
        semillasPorRep: p.semillasPorRepeticion || 100,
        humedad: p.humedad || "-",
        pesoPromedio: p.pesoPromedio || 0,
        desviacionEstandar: p.desviacionEstandar || 0,
        coeficienteVariacion: p.coeficienteVariacion || 0,
        pesoCorregido: p.pesoCorregido || 0,
      })))

      const meta = (data as any).page || {}
      setTotalPages(meta.totalPages ?? 1)
      setTotalElements(meta.totalElements ?? (data.content?.length || 0))
      setCurrentPage(meta.number ?? page)
    } catch (err) {
      console.error("Error fetching PMS paginadas:", err)
      setError("Error al cargar los análisis PMS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPms(0) }, [])

  const filteredAnalisis = analisis.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analyst.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado
    const matchesPrioridad = filterPrioridad === "todos" || item.prioridad === filterPrioridad

    return matchesSearch && matchesEstado && matchesPrioridad
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Completado":
        return "default"
      case "En Proceso":
        return "secondary"
      case "Pendiente":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPrioridadBadgeVariant = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "destructive"
      case "Media":
        return "default"
      case "Baja":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/listado">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Listados
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Peso de Mil Semillas</h1>
            <p className="text-muted-foreground text-pretty">
              Consulta y administra todas las determinaciones del peso de mil semillas
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/registro/analisis">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
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
              <Scale className="h-8 w-8 text-primary" />
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
                <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "En Proceso").length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Peso Promedio</p>
                <p className="text-2xl font-bold">
                  {analisis.filter((a) => a.pesoPromedio > 0).length > 0
                    ? (
                        analisis.filter((a) => a.pesoPromedio > 0).reduce((sum, a) => sum + a.pesoPromedio, 0) /
                        analisis.filter((a) => a.pesoPromedio > 0).length
                      ).toFixed(1)
                    : "0"}
                  g
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
                  placeholder="Buscar por ID, lote, nombre o analista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Análisis de Peso de Mil Semillas</CardTitle>
          <CardDescription>
            {totalElements} análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Análisis</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Nombre Lote</TableHead>
                  <TableHead>Analista</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Peso Promedio (g)</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalisis.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.loteId}</TableCell>
                    <TableCell>{item.loteName}</TableCell>
                    <TableCell>{item.analyst}</TableCell>
                    <TableCell>{new Date(item.fechaInicio).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(item.estado)}>{item.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPrioridadBadgeVariant(item.prioridad)}>{item.prioridad}</Badge>
                    </TableCell>
                    <TableCell>{item.pesoPromedio > 0 ? `${item.pesoPromedio}g` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/analisis/pms/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/analisis/pms/${item.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
            <div className="text-sm text-muted-foreground">
              {totalElements === 0 ? (
                <>Mostrando 0 de 0 resultados</>
              ) : (
                <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
              )}
            </div>
          
            <Pagination
              currentPage={currentPage}
              totalPages={Math.max(totalPages, 1)}
              onPageChange={(p) => fetchPms(p)}
              showRange={1}
              alwaysShow={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
