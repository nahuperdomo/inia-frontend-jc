"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { obtenerLotesPaginadas, eliminarLote, activarLote, obtenerEstadisticasLotes } from "@/app/services/lote-service"
import { obtenerTodosCultivares } from "@/app/services/cultivar-service"
import Pagination from "@/components/pagination"
import { LoteSimpleDTO } from "@/app/models"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"

export default function ListadoLotesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterCultivo, setFilterCultivo] = useState<string>("todos")
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [cultivos, setCultivos] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10
  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    inactivos: 0
  })

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const estadisticas = await obtenerEstadisticasLotes()
        setStats(estadisticas)
      } catch (error) {
        console.error("Error obteniendo estadísticas:", error)
      }
    }
    fetchStats()
  }, [])

  // Cargar todos los cultivares para el select
  useEffect(() => {
    const fetchCultivares = async () => {
      try {
        const todosLosCultivares = await obtenerTodosCultivares(true) // Solo activos
        const nombresCultivares = [...new Set(todosLosCultivares.map(c => c.nombre).filter(Boolean))] as string[]
        setCultivos(nombresCultivares)
      } catch (error) {
        console.error("Error obteniendo cultivares:", error)
      }
    }
    fetchCultivares()
  }, [])

  useEffect(() => {
    setCurrentPage(0)
    fetchLotes(0)
  }, [filterEstado, filterCultivo]) // Recargar cuando cambien los filtros (sin searchTerm)

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setCurrentPage(0)
      fetchLotes(0)
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    setCurrentPage(0)
    fetchLotes(0)
  }

  const fetchLotes = async (page: number = 0) => {
    try {
      setIsLoading(true)
      
      // Convertir filterEstado a boolean o null
      let activoFilter: boolean | null = null
      if (filterEstado === "Activo") {
        activoFilter = true
      } else if (filterEstado === "Inactivo") {
        activoFilter = false
      }
      
      // Enviar filtros al backend
      const data = await obtenerLotesPaginadas(
        page, 
        pageSize, 
        searchTerm, 
        activoFilter, 
        filterCultivo
      )
      
      console.log("DEBUG obtenerLotesPaginadas response:", data)
      
      // Manejar respuesta: puede venir con o sin el objeto 'page'
      const content = data.content || []
      setLotes(content)
      
      // Verificar si la metadata viene en data.page o directamente en data
      const pageInfo = (data as any).page || data
      const totalPagesFrom = pageInfo.totalPages ?? 1
      const totalElementsFrom = pageInfo.totalElements ?? 0
      const numberFrom = pageInfo.number ?? page
      
      setTotalPages(totalPagesFrom)
      setTotalElements(totalElementsFrom)
      setCurrentPage(numberFrom)

      // Obtener estadísticas para las cards
      const estadisticas = await obtenerEstadisticasLotes()
      setStats(estadisticas)
    } catch (err) {
      console.error("Error fetching lotes:", err)
      setError("Error al cargar los lotes. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handler para desactivar lote
  const handleDesactivarLote = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este lote?")) {
      return
    }

    try {
      await eliminarLote(id)
      toast.success("Lote desactivado exitosamente")
      // Recargar lotes
      await fetchLotes(currentPage)
    } catch (error: any) {
      toast.error("Error al desactivar lote", {
        description: error?.message
      })
    }
  }

  // Handler para reactivar lote
  const handleReactivarLote = async (id: number) => {
    try {
      await activarLote(id)
      toast.success("Lote reactivado exitosamente")
      // Recargar lotes
      await fetchLotes(currentPage)
    } catch (error: any) {
      toast.error("Error al reactivar lote", {
        description: error?.message
      })
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
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
            <h1 className="text-3xl font-bold text-balance">Listado de Lotes</h1>
            <p className="text-muted-foreground text-pretty">
              Consulta y administra todos los lotes registrados en el sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/registro/lotes">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Lote
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
                <p className="text-sm font-medium text-muted-foreground">Total Lotes</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.total}</p>
                )}
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.activos}</p>
                )}
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
                <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{stats.inactivos}</p>
                )}
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
                <p className="text-sm font-medium text-muted-foreground">Con Análisis</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">0</p>
                )}
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
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ficha, nombre de lote, cultivar o especie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearchClick} variant="secondary" size="sm" className="px-4">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCultivo} onValueChange={setFilterCultivo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por cultivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los cultivos</SelectItem>
                {cultivos.map((cultivo, index) => (
                  <SelectItem key={`cultivo-${index}-${cultivo}`} value={cultivo}>
                    {cultivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Lotes</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando lotes..."
              : `${totalElements} lote${totalElements !== 1 ? "s" : ""} encontrado${totalElements !== 1 ? "s" : ""}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center p-6 text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto max-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ficha</TableHead>
                      <TableHead>Nombre Lote</TableHead>
                      <TableHead>Cultivar</TableHead>
                      <TableHead>Especie</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow key="loading-row">
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-muted-foreground">Cargando datos de lotes...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : lotes.length === 0 ? (
                      <TableRow key="no-data-row">
                        <TableCell colSpan={6} className="text-center py-8">
                          <p className="text-muted-foreground">No se encontraron lotes que coincidan con los criterios de búsqueda.</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lotes.map((lote) => (
                        <TableRow key={lote.loteID}>
                          <TableCell className="font-medium">{lote.ficha || "-"}</TableCell>
                          <TableCell className="font-medium">{lote.nomLote || "-"}</TableCell>
                          <TableCell>{lote.cultivarNombre || "-"}</TableCell>
                          <TableCell>{lote.especieNombre || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={lote.activo ? "default" : "destructive"}>
                              {lote.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`/listado/lotes/${lote.loteID}`}>
                                <Button variant="ghost" size="sm" title="Ver detalles">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/listado/lotes/${lote.loteID}/editar`}>
                                <Button variant="ghost" size="sm" title="Editar">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              {user?.role === "administrador" && (
                                lote.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDesactivarLote(lote.loteID)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivarLote(lote.loteID)}
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Paginación: centrada en el listado (como pureza) */}
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
                  onPageChange={(p) => fetchLotes(p)}
                  showRange={1}
                  alwaysShow={true}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
