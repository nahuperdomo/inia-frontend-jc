"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { obtenerDosnPaginadas, desactivarDosn, activarDosn } from "@/app/services/dosn-service"
import Pagination from "@/components/pagination"
import { EstadoAnalisis } from "@/app/models"
import { toast, Toaster } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"

interface DosnListadoDTO {
  analisisID: number
  estado: EstadoAnalisis
  fechaInicio: string
  fechaFin?: string
  lote: string
  idLote?: number
  especie?: string
  activo?: boolean
  cumpleEstandar?: boolean
  comentarios?: string
  usuarioCreador?: string
  usuarioModificador?: string
}

export default function ListadoDOSNPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [dosns, setDosns] = useState<DosnListadoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(0)
    fetchDosns(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroActivo, selectedStatus]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchDosns(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchDosns(0)
  }

  const fetchDosns = async (page: number = 0) => {
    try {
      setLoading(true)
      // Convert filtroActivo string to boolean
      const activoFilter = filtroActivo === "todos" ? undefined : filtroActivo === "activos"

      const data = await obtenerDosnPaginadas(
        page,
        pageSize,
        searchTerm,
        activoFilter,
        selectedStatus !== "all" ? selectedStatus : undefined,
        undefined
      )

      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<DosnListadoDTO>(data, page)

      setDosns(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
    } catch (err) {
      setError("Error al cargar los análisis DOSN")
      console.error("Error fetching DOSNs:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de desactivar este análisis DOSN?")) return
    try {
      await desactivarDosn(id)
      toast.success("Análisis DOSN desactivado exitosamente")
      await fetchDosns(currentPage)
    } catch (error) {
      console.error("Error al desactivar DOSN:", error)
      toast.error("Error al desactivar el análisis")
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarDosn(id)
      toast.success("Análisis DOSN reactivado exitosamente")
      await fetchDosns(currentPage)
    } catch (error) {
      console.error("Error al reactivar DOSN:", error)
      toast.error("Error al reactivar el análisis")
    }
  }

  // Estadísticas calculadas
  const filteredAnalysis = dosns
  const totalAnalysis = totalElements
  const completedAnalysis = dosns.filter(d => d.estado === "APROBADO").length
  const inProgressAnalysis = dosns.filter(d => d.estado === "EN_PROCESO" || d.estado === "REGISTRADO").length
  const complianceAnalysis = dosns.filter(d => d.cumpleEstandar === true).length
  const complianceRate = dosns.length > 0 ? Math.round((complianceAnalysis / dosns.length) * 100) : 0

  // Helper functions
  const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
      case "REGISTRADO":
        return "secondary"
      case "PENDIENTE_APROBACION":
        return "outline"
      case "A_REPETIR":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatEstado = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado"
      case "EN_PROCESO":
        return "En Proceso"
      case "REGISTRADO":
        return "Registrado"
      case "PENDIENTE_APROBACION":
        return "Pendiente Aprobación"
      case "A_REPETIR":
        return "A Repetir"
      default:
        return estado
    }
  }

  const formatearFechaLocal = (fechaStr: string | undefined) => {
    if (!fechaStr) return "-"
    const fecha = new Date(fechaStr)
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, "0")
    const day = String(fecha.getDate()).padStart(2, "0")
    return `${day}/${month}/${year}`
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <Toaster position="top-right" richColors closeButton />
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
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis DOSN</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Consulta la determinación de otras semillas en número</p>
            </div>
          </div>
          {user?.role !== "observador" && (
            <div className="flex justify-center sm:justify-end">
              <Link href="/registro/analisis?tipo=DOSN">
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
                <Activity className="h-8 w-8 text-red-600" />
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="REGISTRADO">Registrado</SelectItem>
                  <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                  <SelectItem value="PENDIENTE_APROBACION">Pendiente Aprobación</SelectItem>
                  <SelectItem value="APROBADO">Aprobado</SelectItem>
                  <SelectItem value="A_REPETIR">A Repetir</SelectItem>
                </SelectContent>
              </Select>
              <select
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm w-full md:w-48"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Análisis DOSN</CardTitle>
            <CardDescription>
              {totalElements} análisis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto max-w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead className="whitespace-nowrap">Lote</TableHead>
                    <TableHead className="whitespace-nowrap">Especie</TableHead>
                    <TableHead className="whitespace-nowrap">Estado</TableHead>
                    <TableHead className="whitespace-nowrap">Cumple Estándar</TableHead>
                    <TableHead className="whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-muted-foreground">Cargando análisis...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAnalysis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No se encontraron análisis DOSN</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalysis.map((analysis) => (
                      <TableRow key={analysis.analisisID}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {analysis.analisisID}
                        </TableCell>
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
                        <TableCell className="whitespace-nowrap">
                          {analysis.cumpleEstandar !== undefined ? (
                            <Badge
                              variant={analysis.cumpleEstandar ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {analysis.cumpleEstandar ? "Sí" : "No"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link href={`/listado/analisis/dosn/${analysis.analisisID}`}>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {user?.role !== "observador" && (
                              <Link href={`/listado/analisis/dosn/${analysis.analisisID}/editar`}>
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
            {/* Paginación: centrada en el listado DOSN */}
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
                onPageChange={(p) => fetchDosns(p)}
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
