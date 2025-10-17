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
import { Toaster, toast } from "sonner"
import Pagination from "@/components/pagination"
import { obtenerPmsPaginadas, eliminarPms } from "@/app/services/pms-service"
import { PmsDTO } from "@/app/models"

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
      item.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado

    return matchesSearch && matchesEstado
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
      case "FINALIZADO":
      case "PENDIENTE_APROBACION":
        return "secondary"
      case "PENDIENTE":
      case "PARA_REPETIR":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado"
      case "EN_PROCESO":
        return "En Proceso"
      case "FINALIZADO":
        return "Finalizado"
      case "PENDIENTE_APROBACION":
        return "Pendiente Aprobación"
      case "PENDIENTE":
        return "Pendiente"
      case "PARA_REPETIR":
        return "Para Repetir"
      default:
        return estado
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este análisis?")) {
      return
    }

    try {
      await eliminarPms(id)
      toast.success('Análisis eliminado exitosamente')
      // Recargar la lista
      await fetchPms(currentPage)
    } catch (err: any) {
      toast.error('Error al eliminar análisis', {
        description: err?.message || "No se pudo eliminar el análisis",
      })
    }
  }

  // Estadísticas calculadas
  const totalAnalisis = analisis.length
  const completados = analisis.filter((a) => a.estado === "Completado").length
  const enProceso = analisis.filter((a) => a.estado === "En Proceso").length
  const promedioGeneral = analisis.filter((a) => a.pesoPromedio && a.pesoPromedio > 0)
    .reduce((sum, a, _, arr) => sum + (a.pesoPromedio || 0) / arr.length, 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando análisis de PMS...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />
      
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
                <p className="text-2xl font-bold">{totalAnalisis}</p>
              </div>
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                <p className="text-2xl font-bold">{completados}</p>
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
                <p className="text-2xl font-bold">{enProceso}</p>
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
                <p className="text-sm font-medium text-muted-foreground">PMS Promedio</p>
                <p className="text-2xl font-bold">
                  {promedioGeneral > 0 ? promedioGeneral.toFixed(1) : "0"}g
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-800">
              <div className="h-8 w-8 rounded-full bg-red-200 flex items-center justify-center">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">Error al cargar análisis</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  placeholder="Buscar por ID de análisis, lote o ID de lote..."
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
                <SelectItem value="APROBADO">Aprobado</SelectItem>
                <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                <SelectItem value="PENDIENTE_APROBACION">Pendiente Aprobación</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="PARA_REPETIR">Para Repetir</SelectItem>
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
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID Análisis</TableHead>
                  <TableHead className="whitespace-nowrap">Lote</TableHead>
                  <TableHead className="whitespace-nowrap">ID Lote</TableHead>
                  <TableHead className="whitespace-nowrap">Fecha Inicio</TableHead>
                  <TableHead className="whitespace-nowrap">Estado</TableHead>
                  <TableHead className="whitespace-nowrap">Repeticiones</TableHead>
                  <TableHead className="whitespace-nowrap">PMS (g)</TableHead>
                  <TableHead className="whitespace-nowrap">Coef. Variación</TableHead>
                  <TableHead className="whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalisis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterEstado !== "todos" 
                        ? "No se encontraron análisis que coincidan con los filtros."
                        : "No hay análisis de PMS registrados aún."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalisis.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium whitespace-nowrap">{item.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.loteName || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.loteId || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.fechaInicio 
                          ? new Date(item.fechaInicio).toLocaleDateString("es-ES")
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getEstadoBadgeVariant(item.estado || "")}>
                          {getEstadoDisplay(item.estado || "")}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{item.repeticiones || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.pesoPromedio && item.pesoPromedio > 0 
                          ? `${item.pesoPromedio.toFixed(2)}g` 
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.coeficienteVariacion && item.coeficienteVariacion > 0 
                          ? `${item.coeficienteVariacion.toFixed(2)}%` 
                          : "-"
                        }
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/listado/analisis/pms/${item.id.replace('PMS', '')}`}>
                            <Button variant="ghost" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/listado/analisis/pms/${item.id.replace('PMS', '')}/editar`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            title="Eliminar"
                            onClick={() => handleEliminar(parseInt(item.id.replace('PMS', '')))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
