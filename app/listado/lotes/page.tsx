"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Combobox from "@/components/ui/combobox"
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"
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
  const [filterCultivar, setFilterCultivar] = useState<string>("todos")
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [cultivares, setCultivares] = useState<string[]>([])
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
        setCultivares(nombresCultivares)
      } catch (error) {
        console.error("Error obteniendo cultivares:", error)
      }
    }
    fetchCultivares()
  }, [])

  useEffect(() => {
    setCurrentPage(0)
    fetchLotes(0)
  }, [filterEstado, filterCultivar]) // Recargar cuando cambien los filtros (sin searchTerm)

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
        filterCultivar
      )


      const pageData = extractPageMetadata<LoteSimpleDTO>(data, page)

      setLotes(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)

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

  // Opciones para el combobox de cultivares (incluye "todos")
  const cultivarOptions = [
    { id: "todos", nombre: "Todos los cultivares" },
    ...cultivares.map((c) => ({ id: c, nombre: c }))
  ]

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/listado">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Listado de Lotes</h1>
              <p className="text-sm text-muted-foreground text-pretty">
                Consulta y administra todos los lotes registrados
              </p>
            </div>
          </div>
          {user?.role !== "observador" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Link href="/registro/lotes" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Lote
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Lotes</p>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  )}
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Activos</p>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold">{stats.activos}</p>
                  )}
                </div>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Inactivos</p>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold">{stats.inactivos}</p>
                  )}
                </div>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-yellow-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Con Análisis</p>
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : (
                    <p className="text-xl sm:text-2xl font-bold">0</p>
                  )}
                </div>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-500"></div>
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
              <div className="w-full md:w-64">
                <Combobox
                  value={filterCultivar}
                  onValueChange={setFilterCultivar}
                  options={cultivarOptions}
                  placeholder="Filtrar por cultivar"
                  searchPlaceholder="Buscar cultivar..."
                />
              </div>
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
                <div className="rounded-md border overflow-x-auto w-full">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Ficha</TableHead>
                        <TableHead className="whitespace-nowrap">Lote</TableHead>
                        <TableHead className="whitespace-nowrap">Cultivar</TableHead>
                        <TableHead className="whitespace-nowrap">Especie</TableHead>
                        <TableHead className="whitespace-nowrap">Estado</TableHead>
                        <TableHead className="whitespace-nowrap">Acciones</TableHead>
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
                              <Badge variant={lote.activo ? "default" : "destructive"} className="text-xs whitespace-nowrap">
                                {lote.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <Link href={`/listado/lotes/${lote.loteID}`}>
                                  <Button variant="ghost" size="sm" title="Ver detalles">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                {lote.activo && user?.role !== "observador" && (
                                  <Link href={`/listado/lotes/${lote.loteID}/editar`}>
                                    <Button variant="ghost" size="sm" title="Editar">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}
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
