"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FlaskConical, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { obtenerPurezasPaginadas, desactivarPureza, activarPureza } from "@/app/services/pureza-service"
import Pagination from "@/components/pagination"
import { EstadoAnalisis } from "@/app/models"

interface PurezaListadoDTO {
  analisisID: number
  estado: EstadoAnalisis
  fechaInicio: string
  fechaFin?: string
  lote: string
  idLote?: number
  especie?: string
  activo?: boolean
  redonSemillaPura?: number
  inasePura?: number
  usuarioCreador?: string
  usuarioModificador?: string
}
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"
import { formatearFechaLocal, getEstadoBadgeVariant, formatEstado, formatEstado as formatearEstado } from "@/lib/utils/format-helpers"

// Función utilitaria para formatear fechas correctamente
const formatearFechaLocal = (fechaString: string): string => {
  if (!fechaString) return ''

  try {
    // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
      const [year, month, day] = fechaString.split('-').map(Number)
      const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // Si viene en otro formato, parsearlo de manera segura
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    console.warn("Error al formatear fecha:", fechaString, error)
    return fechaString
  }
}

export default function ListadoPurezaPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [purezas, setPurezas] = useState<PurezaListadoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(0)
    fetchPurezas(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroActivo, selectedStatus]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchPurezas(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchPurezas(0)
  }

  const fetchPurezas = async (page: number = 0) => {
    try {
      setLoading(true)
      // Convert filtroActivo string to boolean
      const activoFilter = filtroActivo === "todos" ? undefined : filtroActivo === "activos"

      const data = await obtenerPurezasPaginadas(
        page,
        pageSize,
        searchTerm,
        activoFilter,
        selectedStatus !== "all" ? selectedStatus : undefined,
        undefined
      )      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<PurezaListadoDTO>(data, page)

      setPurezas(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
      setIsFirst(pageData.isFirst)
      setIsLast(pageData.isLast)
    } catch (err) {
      setError("Error al cargar los análisis de pureza")
      console.error("Error fetching purezas:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este análisis?")) return
    try {
      await desactivarPureza(id)
      toast.success("Análisis desactivado exitosamente")
      await fetchPurezas(currentPage)
    } catch (error: any) {
      toast.error("Error al desactivar análisis", { description: error?.message })
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarPureza(id)
      toast.success("Análisis reactivado exitosamente")
      await fetchPurezas(currentPage)
    } catch (error: any) {
      toast.error("Error al reactivar análisis", { description: error?.message })
    }
  }

  // No client-side filtering - all filtering done on backend
  const filteredAnalysis = purezas

  // Calculate stats from current page data and total
  const totalAnalysis = totalElements
  const completedAnalysis = purezas.filter(p => p.estado === "APROBADO").length
  const inProgressAnalysis = purezas.filter(p => p.estado === "EN_PROCESO").length
  const pendingAnalysis = purezas.filter(p => p.estado === "REGISTRADO" || p.estado === "PENDIENTE_APROBACION").length

  // Calcular promedio de pureza INIA (con redondeo)
  const purezasConDatos = purezas.filter(p => p.redonSemillaPura !== undefined && p.redonSemillaPura !== null)
  const promedioPureza = purezasConDatos.length > 0
    ? purezasConDatos.reduce((sum, p) => sum + (p.redonSemillaPura || 0), 0) / purezasConDatos.length
    : 0

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link href="/listado" className="sm:self-start">
              <Button variant="ghost" size="sm" className="w-fit">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Volver a Listados</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis de Pureza Física</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Consulta la pureza física de las semillas</p>
            </div>
          </div>
          {user?.role !== "observador" && (
            <div className="flex justify-center sm:justify-end">
              <Link href="/registro/analisis?tipo=PUREZA">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Análisis
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                  <p className="text-2xl font-bold">{totalAnalysis}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completados</p>
                  <p className="text-2xl font-bold">{completedAnalysis}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                  <p className="text-2xl font-bold">{inProgressAnalysis}</p>
                </div>
                <FlaskConical className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pureza Promedio</p>
                  <p className="text-2xl font-bold">{promedioPureza.toFixed(1)}%</p>
                </div>
                <FlaskConical className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchClick()
                }}
                className="flex-1 flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID análisis, Lote o Ficha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button type="button" onClick={handleSearchClick} variant="secondary" size="sm" className="px-4">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="REGISTRADO">Registrado</option>
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="PENDIENTE_APROBACION">Pend. Aprobación</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="A_REPETIR">A Repetir</option>
                </select>
                <select
                  value={filtroActivo}
                  onChange={(e) => setFiltroActivo(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Análisis de Pureza Física</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto max-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[150px]">Lote</TableHead>
                    <TableHead className="min-w-[150px]">Especie</TableHead>
                    <TableHead className="min-w-[120px]">Estado</TableHead>
                    <TableHead className="min-w-[120px]">Pureza INIA (%)</TableHead>
                    <TableHead className="min-w-[120px]">Pureza INASE (%)</TableHead>
                    <TableHead className="min-w-[120px]">Fecha Inicio</TableHead>
                    <TableHead className="min-w-[120px]">Fecha Fin</TableHead>
                    <TableHead className="min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalysis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron análisis de pureza</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalysis.map((analysis) => {
                      // Pureza INIA (con redondeo)
                      const purezaINIA = analysis.redonSemillaPura !== undefined && analysis.redonSemillaPura !== null
                        ? analysis.redonSemillaPura.toFixed(1)
                        : "N/A"

                      // Pureza INASE
                      const purezaINASE = analysis.inasePura !== undefined && analysis.inasePura !== null
                        ? analysis.inasePura.toFixed(1)
                        : "N/A"

                      return (
                        <TableRow key={analysis.analisisID}>
                          <TableCell className="font-medium">{analysis.analisisID}</TableCell>
                          <TableCell>
                            <div className="font-medium">{analysis.lote}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{analysis.especie || "N/A"}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                              {formatearEstado(analysis.estado)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{purezaINIA}%</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{purezaINASE}%</span>
                          </TableCell>
                          <TableCell>{formatearFechaLocal(analysis.fechaInicio)}</TableCell>
                          <TableCell>
                            {analysis.fechaFin ? formatearFechaLocal(analysis.fechaFin) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/listado/analisis/pureza/${analysis.analisisID}`}>
                                <Button variant="ghost" size="sm" title="Ver detalles">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {user?.role !== "observador" && (
                                <Link href={`/listado/analisis/pureza/${analysis.analisisID}/editar`}>
                                  <Button variant="ghost" size="sm" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {user?.role === "administrador" && (
                                analysis.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDesactivar(analysis.analisisID)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivar(analysis.analisisID)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Reactivar"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Paginación: centrada en el listado */}
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
                onPageChange={(p) => fetchPurezas(p)}
                showRange={1}
                alwaysShow={true}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
