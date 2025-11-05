"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Scale, Search, Filter, Plus, Eye, Edit, Trash2, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import Pagination from "@/components/pagination"
import { obtenerPmsPaginadas, desactivarPms, activarPms } from "@/app/services/pms-service"
import { EstadoAnalisis } from "@/app/models"
import { useAuth } from "@/components/auth-provider"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"

interface PmsListadoDTO {
  analisisID: number
  estado: EstadoAnalisis
  fechaInicio: string
  fechaFin?: string
  lote: string
  idLote?: number
  especie?: string
  activo?: boolean
  pms_g?: number
  coeficienteVariacion?: number
  usuarioCreador?: string
  usuarioModificador?: string
}

export default function ListadoPMSPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [pms, setPms] = useState<PmsListadoDTO[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(0)
    fetchPms(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroActivo, selectedStatus]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchPms(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchPms(0)
  }

  // Fetch paginated PMS
  const fetchPms = async (page: number = 0) => {
    try {
      setLoading(true)
      // Convert filtroActivo string to boolean
      const activoFilter = filtroActivo === "todos" ? undefined : filtroActivo === "activos"
      
      const data = await obtenerPmsPaginadas(
        page,
        pageSize,
        searchTerm,
        activoFilter,
        selectedStatus !== "all" ? selectedStatus : undefined,
        undefined
      )
      
      // Extraer metadata de paginación usando helper
      const pageData = extractPageMetadata<PmsListadoDTO>(data, page)
      
      setPms(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
    } catch (err) {
      console.error("Error fetching PMS paginadas:", err)
      setError("Error al cargar los análisis PMS")
    } finally {
      setLoading(false)
    }
  }

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de desactivar este análisis PMS?")) return
    try {
      await desactivarPms(id)
      toast.success("Análisis PMS desactivado exitosamente")
      await fetchPms(currentPage)
    } catch (error) {
      console.error("Error al desactivar PMS:", error)
      toast.error("Error al desactivar el análisis")
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarPms(id)
      toast.success("Análisis PMS reactivado exitosamente")
      await fetchPms(currentPage)
    } catch (error) {
      console.error("Error al reactivar PMS:", error)
      toast.error("Error al reactivar el análisis")
    }
  }

  // Estadísticas calculadas
  const filteredAnalysis = pms
  const totalAnalysis = totalElements
  const completedAnalysis = pms.filter(p => p.estado === "APROBADO").length
  const inProgressAnalysis = pms.filter(p => p.estado === "EN_PROCESO" || p.estado === "REGISTRADO").length
  
  const promedioPMS = pms.length > 0 
    ? pms.reduce((sum, p) => sum + (p.pms_g || 0), 0) / pms.length 
    : 0

  const promedioCV = pms.length > 0
    ? pms.reduce((sum, p) => sum + (p.coeficienteVariacion || 0), 0) / pms.length
    : 0

  // Helper functions
  const getEstadoBadgeVariant = (estado: string) => {
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

  const formatEstado = (estado: string) => {
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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">Peso de Mil Semillas</h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">
              Consulta y administra todas las determinaciones del peso de mil semillas
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end gap-2 sm:gap-2">
          <Link href="/registro/analisis?tipo=PMS" className="w-full sm:w-auto">
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Análisis</p>
                <p className="text-2xl font-bold">{totalAnalysis}</p>
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
                <p className="text-2xl font-bold">{completedAnalysis}</p>
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
                <p className="text-2xl font-bold">{inProgressAnalysis}</p>
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
                  {promedioPMS > 0 ? promedioPMS.toFixed(2) : "0"} g
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
          <CardTitle>Lista de Análisis de Peso de Mil Semillas</CardTitle>
          <CardDescription>
            {totalElements} análisis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-md border overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Lote</TableHead>
                  <TableHead className="whitespace-nowrap">Especie</TableHead>
                  <TableHead className="whitespace-nowrap">Estado</TableHead>
                  <TableHead className="whitespace-nowrap">PMS (g)</TableHead>
                  <TableHead className="whitespace-nowrap">Coef. Variación (%)</TableHead>
                  <TableHead className="whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span className="text-muted-foreground">Cargando análisis...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : pms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron análisis de PMS.
                    </TableCell>
                  </TableRow>
                ) : (
                  pms.map((item) => (
                    <TableRow key={item.analisisID}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {item.analisisID}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.lote || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.especie || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={getEstadoBadgeVariant(item.estado)}>
                          {formatEstado(item.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {item.pms_g ? item.pms_g.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {item.coeficienteVariacion ? item.coeficienteVariacion.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/listado/analisis/pms/${item.analisisID}`}>
                            <Button variant="ghost" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/listado/analisis/pms/${item.analisisID}/editar`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user?.role === "administrador" && (
                            item.activo ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Desactivar"
                                onClick={() => handleDesactivar(item.analisisID)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Reactivar"
                                onClick={() => handleReactivar(item.analisisID)}
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
    </div>
  )
}
