"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { obtenerGerminacionesPaginadas, desactivarGerminacion, activarGerminacion } from "@/app/services/germinacion-service"
import { GerminacionListadoDTO } from "@/app/models/interfaces/germinacion"
import Pagination from "@/components/pagination"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"
import { formatearFechaLocal, getEstadoBadgeVariant, formatEstado } from "@/lib/utils/format-helpers"
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

const formatearFechaHora = (fechaString: string): string => {
  if (!fechaString) return ''

  try {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn("Error al formatear fecha y hora:", fechaString, error)
    return fechaString
  }
}

export default function ListadoGerminacionPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [germinaciones, setGerminaciones] = useState<GerminacionListadoDTO[]>([])
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
    fetchGerminaciones(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroActivo, selectedStatus]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchGerminaciones(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchGerminaciones(0)
  }

  const fetchGerminaciones = async (page: number = 0) => {
    try {
      setLoading(true)
      // Convert filtroActivo string to boolean
      const activoFilter = filtroActivo === "todos" ? undefined : filtroActivo === "activos"

      const data = await obtenerGerminacionesPaginadas(
        page,
        pageSize,
        searchTerm,
        activoFilter,
        selectedStatus !== "all" ? selectedStatus : undefined,
        undefined
      )

      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<GerminacionListadoDTO>(data, page)

      // Log para debug      if (pageData.content.length > 0) {      }

      setGerminaciones(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
      setIsFirst(pageData.isFirst)
      setIsLast(pageData.isLast)
    } catch (err) {
      setError("Error al cargar los análisis de germinación")
      console.error("Error fetching germinaciones:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de desactivar este análisis de Germinación?")) return
    try {
      await desactivarGerminacion(id)
      toast.success("Análisis de Germinación desactivado exitosamente")
      await fetchGerminaciones(currentPage)
    } catch (error) {
      console.error("Error al desactivar Germinación:", error)
      toast.error("Error al desactivar el análisis")
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarGerminacion(id)
      toast.success("Análisis de Germinación reactivado exitosamente")
      await fetchGerminaciones(currentPage)
    } catch (error) {
      console.error("Error al reactivar Germinación:", error)
      toast.error("Error al reactivar el análisis")
    }
  }
  // No client-side filtering - all filtering done on backend
  const filteredAnalysis = germinaciones

  // Calculate stats from current page data
  const totalAnalysis = totalElements
  const completedAnalysis = germinaciones.filter(g => g.estado === "APROBADO").length
  const inProgressAnalysis = germinaciones.filter(g => g.estado === "EN_PROCESO" || g.estado === "REGISTRADO").length
  const pendingAnalysis = germinaciones.filter(g => g.estado === "PENDIENTE_APROBACION").length
  const complianceRate = germinaciones.length > 0 ? Math.round((germinaciones.filter(g => g.cumpleNorma === true).length / germinaciones.length) * 100) : 0

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchGerminaciones(newPage)
    }
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis de Germinación</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Consulta los análisis de germinación de semillas</p>
            </div>
          </div>
          {user?.role !== "observador" && (
            <div className="flex justify-center sm:justify-end">
              <Link href="/registro/analisis?tipo=GERMINACION">
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
                <Activity className="h-8 w-8 text-green-600" />
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
                <Activity className="h-8 w-8 text-blue-600" />
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
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cumplen Norma</p>
                  <p className="text-2xl font-bold">{complianceRate}%</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchClick()
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por ID, Lote o Ficha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 text-sm"
                  />
                </div>
                <Button type="button" onClick={handleSearchClick} variant="secondary" size="sm" className="px-3 flex-shrink-0">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 sm:flex-initial px-2 sm:px-3 py-2 border border-input bg-background rounded-md text-xs sm:text-sm"
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
                  className="flex-1 sm:flex-initial px-2 sm:px-3 py-2 border border-input bg-background rounded-md text-xs sm:text-sm"
                >
                  <option value="todos">Todos</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Filtros</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Lista de Análisis de Germinación</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {filteredAnalysis.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No se encontraron análisis de germinación</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredAnalysis.map((analysis) => (
                    <div key={analysis.analisisID} className="p-3 sm:p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">ID: {analysis.analisisID}</span>
                            <Badge variant={getEstadoBadgeVariant(analysis.estado)} className="text-xs">
                              {formatEstado(analysis.estado)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div><span className="font-medium">Lote:</span> {analysis.lote || "-"}</div>
                            {analysis.idLote && <div><span className="font-medium">ID Lote:</span> {analysis.idLote}</div>}
                            <div><span className="font-medium">Especie:</span> {analysis.especie || "-"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-muted-foreground text-[10px] uppercase mb-0.5">Germ. INIA</div>
                          <div className="font-semibold">
                            {analysis.valorGerminacionINIA != null ? `${analysis.valorGerminacionINIA.toFixed(1)}%` : "-"}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-muted-foreground text-[10px] uppercase mb-0.5">Germ. INASE</div>
                          <div className="font-semibold">
                            {analysis.valorGerminacionINASE != null ? `${analysis.valorGerminacionINASE.toFixed(1)}%` : "-"}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-muted-foreground text-[10px] uppercase mb-0.5">Inicio</div>
                          <div className="font-medium">{analysis.fechaInicioGerm ? formatearFechaLocal(analysis.fechaInicioGerm) : "-"}</div>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <div className="text-muted-foreground text-[10px] uppercase mb-0.5">Final</div>
                          <div className="font-medium">{analysis.fechaFinal ? formatearFechaLocal(analysis.fechaFinal) : "-"}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant={analysis.tienePrefrio ? "default" : "secondary"} className="text-xs flex-1 justify-center">
                          Prefrío: {analysis.tienePrefrio ? "Sí" : "No"}
                        </Badge>
                        <Badge variant={analysis.tienePretratamiento ? "default" : "secondary"} className="text-xs flex-1 justify-center">
                          Pretrat: {analysis.tienePretratamiento ? "Sí" : "No"}
                        </Badge>
                      </div>

                      <div className="flex gap-1 pt-2 border-t">
                        <Link href={`/listado/analisis/germinacion/${analysis.analisisID}`} className="flex-1">
                          <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                        </Link>
                        {user?.role !== "observador" && (
                          <Link href={`/listado/analisis/germinacion/${analysis.analisisID}/editar`} className="flex-1">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        )}
                        {user?.role === "administrador" && (
                          analysis.activo ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 text-xs h-8 px-2"
                              onClick={() => handleDesactivar(analysis.analisisID)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 text-xs h-8 px-2"
                              onClick={() => handleReactivar(analysis.analisisID)}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[120px]">Lote</TableHead>
                    <TableHead className="min-w-[150px]">Especie</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="min-w-[100px]">Germ. INIA</TableHead>
                    <TableHead className="min-w-[100px]">Germ. INASE</TableHead>
                    <TableHead className="min-w-[120px]">Inicio Germ.</TableHead>
                    <TableHead className="min-w-[120px]">Fecha Final</TableHead>
                    <TableHead className="min-w-[80px]">Prefrío</TableHead>
                    <TableHead className="min-w-[110px]">Pretratamiento</TableHead>
                    <TableHead className="min-w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalysis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron análisis de germinación</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalysis.map((analysis) => (
                      <TableRow key={analysis.analisisID}>
                        <TableCell className="font-medium">{analysis.analisisID}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{analysis.lote || "-"}</div>
                            {analysis.idLote && (
                              <div className="text-sm text-muted-foreground">ID: {analysis.idLote}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{analysis.especie || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                            {formatEstado(analysis.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {analysis.valorGerminacionINIA != null
                            ? `${analysis.valorGerminacionINIA.toFixed(1)}%`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {analysis.valorGerminacionINASE != null
                            ? `${analysis.valorGerminacionINASE.toFixed(1)}%`
                            : "-"}
                        </TableCell>
                        <TableCell>{analysis.fechaInicioGerm ? formatearFechaLocal(analysis.fechaInicioGerm) : "-"}</TableCell>
                        <TableCell>{analysis.fechaFinal ? formatearFechaLocal(analysis.fechaFinal) : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={analysis.tienePrefrio ? "default" : "secondary"} className="text-xs">
                            {analysis.tienePrefrio ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={analysis.tienePretratamiento ? "default" : "secondary"} className="text-xs">
                            {analysis.tienePretratamiento ? "Sí" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/listado/analisis/germinacion/${analysis.analisisID}`}>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {user?.role !== "observador" && (
                              <Link href={`/listado/analisis/germinacion/${analysis.analisisID}/editar`}>
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
                                  title="Desactivar"
                                  onClick={() => handleDesactivar(analysis.analisisID)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Reactivar"
                                  onClick={() => handleReactivar(analysis.analisisID)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-center mt-4 sm:mt-6 gap-2 text-center px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {totalElements === 0 ? (
                  <>Mostrando 0 de 0 resultados</>
                ) : (
                  <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
                )}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(totalPages, 1)}
                onPageChange={(p) => fetchGerminaciones(p)}
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
