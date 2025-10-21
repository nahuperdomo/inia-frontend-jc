"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { obtenerLotesPaginadas } from "@/app/services/lote-service"
import Pagination from "@/components/pagination"
import { LoteSimpleDTO } from "@/app/models"

export default function ListadoLotesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterCultivo, setFilterCultivo] = useState<string>("todos")
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    const fetchLotes = async (page: number = 0) => {
      try {
        setIsLoading(true)
        const loteResp = await obtenerLotesPaginadas(page, pageSize)
        const lotesData = loteResp.content || []

        // No necesitamos transformar los datos, ya vienen como LoteSimpleDTO
        setLotes(lotesData)

        setTotalPages(loteResp.totalPages ?? 1)
        setTotalElements(loteResp.totalElements ?? (lotesData.length || 0))
        setCurrentPage(loteResp.number ?? page)
      } catch (err) {
        console.error("Error fetching lotes:", err)
        setError("Error al cargar los lotes. Intente nuevamente más tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLotes(0)
  }, [])

  const filteredLotes = lotes.filter((lote) => {
    const matchesSearch =
      (lote.ficha || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lote.nomLote || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lote.cultivarNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lote.especieNombre || "").toLowerCase().includes(searchTerm.toLowerCase())

    const estadoLote = lote.activo ? "Activo" : "Inactivo"
    const matchesEstado = filterEstado === "todos" || estadoLote === filterEstado
    const matchesCultivo = filterCultivo === "todos" || (lote.cultivarNombre || "") === filterCultivo

    return matchesSearch && matchesEstado && matchesCultivo
  })

  const cultivos = [...new Set(lotes.map((lote) => lote.cultivarNombre || "").filter(Boolean))]

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
                  <p className="text-2xl font-bold">{lotes.length}</p>
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
                  <p className="text-2xl font-bold">{lotes.filter((l) => l.activo).length}</p>
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
                  <p className="text-2xl font-bold">{lotes.filter((l) => !l.activo).length}</p>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ficha, nombre de lote, cultivar o especie..."
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
              : `${filteredLotes.length} lote${filteredLotes.length !== 1 ? "s" : ""} encontrado${filteredLotes.length !== 1 ? "s" : ""}`
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
                  ) : filteredLotes.length === 0 ? (
                    <TableRow key="no-data-row">
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No se encontraron lotes que coincidan con los criterios de búsqueda.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLotes.map((lote) => (
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              title="Eliminar"
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
              {/* Paginación */}
              <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-muted-foreground">
                  {totalElements === 0 ? (
                    <>Mostrando 0 de 0 resultados</>
                  ) : (
                    <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Pagination currentPage={currentPage} totalPages={Math.max(totalPages, 1)} onPageChange={(p) => void (async () => {
                    setIsLoading(true)
                    try {
                      const resp = await obtenerLotesPaginadas(p, pageSize)
                      const data = resp.content || []

                      // Usar directamente los objetos LoteSimpleDTO devueltos por el backend
                      setLotes(data)

                      // Actualizar metadatos de paginación desde la respuesta
                      setTotalPages(resp.totalPages ?? 1)
                      setTotalElements(resp.totalElements ?? (data.length || 0))
                      setCurrentPage(resp.number ?? p)
                    } catch (err) {
                      console.error('Error recargando lotes paginados', err)
                      setError('Error al cargar los lote')
                    } finally {
                      setIsLoading(false)
                    }
                  })()} showRange={1} alwaysShow={true} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}