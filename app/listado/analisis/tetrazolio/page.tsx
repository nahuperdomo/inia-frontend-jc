"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Microscope, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { obtenerTodosTetrazolio, obtenerTetrazoliosPaginadas, desactivarTetrazolio, activarTetrazolio } from '@/app/services/tetrazolio-service'
import Pagination from "@/components/pagination"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { EstadoAnalisis } from "@/app/models"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"

interface TetrazolioListadoDTO {
  analisisID: number
  estado: EstadoAnalisis
  fechaInicio: string
  fechaFin?: string
  lote: string
  idLote?: number
  especie?: string
  activo?: boolean
  fecha?: string
  viabilidadConRedondeo?: number
  viabilidadInase?: number
  viabilidadInaseRedondeo?: number
  usuarioCreador?: string
  usuarioModificador?: string
}

export default function ListadoTetrazolioPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [tetrazolios, setTetrazolios] = useState<TetrazolioListadoDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(0)
    fetchTetrazolio(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroActivo, selectedStatus]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchTetrazolio(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchTetrazolio(0)
  }

  const fetchTetrazolio = async (page: number = 0) => {
    try {
      setLoading(true)
      setError("")
      // Convert filtroActivo string to boolean
      const activoFilter = filtroActivo === "todos" ? undefined : filtroActivo === "activos"

      const data = await obtenerTetrazoliosPaginadas(
        page,
        pageSize,
        searchTerm,
        activoFilter,
        selectedStatus !== "all" ? selectedStatus : undefined,
        undefined
      )

      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<TetrazolioListadoDTO>(data, page)
      
      setTetrazolios(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
      setIsFirst(pageData.isFirst)
      setIsLast(pageData.isLast)
    } catch (err: any) {
      console.error("Error fetching Tetrazolio paginadas:", err)
      setError("Error al cargar los análisis Tetrazolio")
    } finally {
      setLoading(false)
    }
  }

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de desactivar este análisis Tetrazolio?")) return
    try {
      await desactivarTetrazolio(id)
      toast.success("Análisis Tetrazolio desactivado exitosamente")
      await fetchTetrazolio(currentPage)
    } catch (error) {
      console.error("Error al desactivar Tetrazolio:", error)
      toast.error("Error al desactivar el análisis")
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarTetrazolio(id)
      toast.success("Análisis Tetrazolio reactivado exitosamente")
      await fetchTetrazolio(currentPage)
    } catch (error) {
      console.error("Error al reactivar Tetrazolio:", error)
      toast.error("Error al reactivar el análisis")
    }
  }

  // No client-side filtering - all filtering done on backend
  const filteredAnalysis = tetrazolios

  // Calculate stats from current page data
  const totalAnalysis = totalElements
  const completedAnalysis = tetrazolios.filter(t => t.estado === "APROBADO").length
  const inProgressAnalysis = tetrazolios.filter(t => t.estado === "EN_PROCESO" || t.estado === "REGISTRADO").length
  const pendingAnalysis = tetrazolios.filter(t => t.estado === "PENDIENTE_APROBACION").length
  
  // Promedio de viabilidad
  const tetrazoliosConDatos = tetrazolios.filter(t => t.viabilidadConRedondeo !== undefined && t.viabilidadConRedondeo !== null)
  const promedioViabilidad = tetrazoliosConDatos.length > 0
    ? tetrazoliosConDatos.reduce((sum, t) => sum + (t.viabilidadConRedondeo || 0), 0) / tetrazoliosConDatos.length
    : 0

  const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
        return "secondary"
      case "REGISTRADO":
        return "outline"
      case "PENDIENTE_APROBACION":
        return "destructive"
      case "A_REPETIR":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatEstado = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "REGISTRADO":
        return "Registrado"
      case "EN_PROCESO":
        return "En Proceso"
      case "APROBADO":
        return "Aprobado"
      case "PENDIENTE_APROBACION":
        return "Pend. Aprobación"
      case "A_REPETIR":
        return "A Repetir"
      default:
        return estado
    }
  }

  const formatearFechaLocal = (fechaString: string | undefined): string => {
    if (!fechaString) return '-'
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
        const [year, month, day] = fechaString.split('-').map(Number)
        const fecha = new Date(year, month - 1, day)
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }
      const fecha = new Date(fechaString)
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      return fechaString
    }
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTetrazolio(newPage)
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
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">Análisis de Tetrazolio</h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">
              Consulta y administra todos los ensayos de viabilidad y vigor
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end gap-2 sm:gap-2">
          <Link href="/registro/analisis?tipo=TETRAZOLIO" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Análisis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{totalAnalysis}</p>
              </div>
              <Microscope className="h-8 w-8 text-primary" />
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
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-between">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
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
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Viabilidad</p>
                <p className="text-2xl font-bold">{promedioViabilidad.toFixed(1)}%</p>
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
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                handleSearchClick()
              }}
              className="flex-1 flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Análisis de Tetrazolio</CardTitle>
          <CardDescription>
           {filteredAnalysis.length} análisis encontrado{filteredAnalysis.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Lote</TableHead>
                  <TableHead className="whitespace-nowrap">Especie</TableHead>
                  <TableHead className="whitespace-nowrap">Estado</TableHead>
                  <TableHead className="whitespace-nowrap text-center">Viabilidad INIA (%)</TableHead>
                  <TableHead className="whitespace-nowrap text-center">Viabilidad INASE (%)</TableHead>
                  <TableHead className="whitespace-nowrap">Fecha Inicio</TableHead>
                  <TableHead className="whitespace-nowrap">Fecha Fin</TableHead>
                  <TableHead className="whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalysis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron análisis de tetrazolio</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalysis.map((analysis) => {
                    const viabilidadINIA = analysis.viabilidadConRedondeo !== undefined && analysis.viabilidadConRedondeo !== null
                      ? analysis.viabilidadConRedondeo.toFixed(1)
                      : "N/A"
                    
                    // Intentar primero viabilidadInase (valor manual), luego viabilidadInaseRedondeo (calculado)
                    const valorInase = (analysis as any).viabilidadInase ?? (analysis as any).viabilidadInaseRedondeo
                    const viabilidadINASE = valorInase !== undefined && valorInase !== null && valorInase !== ''
                      ? Number(valorInase).toFixed(1)
                      : "N/A"
                    
                    return (
                      <TableRow key={analysis.analisisID}>
                        <TableCell className="font-medium whitespace-nowrap">{analysis.analisisID}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {analysis.lote || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {analysis.especie || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                            {formatEstado(analysis.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          {viabilidadINIA}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          {viabilidadINASE}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatearFechaLocal(analysis.fechaInicio)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatearFechaLocal(analysis.fechaFin)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/listado/analisis/tetrazolio/${analysis.analisisID}`}>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/listado/analisis/tetrazolio/${analysis.analisisID}/editar`}>
                              <Button variant="ghost" size="sm" title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
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
                    )
                  })
                )}
              </TableBody>
            </Table>
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
                onPageChange={(p) => fetchTetrazolio(p)}
                showRange={1}
                alwaysShow={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}


