"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ArrowLeft, Search, Eye, AlertTriangle, Database, Loader2, Filter } from "lucide-react"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"
import { obtenerLegadosPaginadas, obtenerEspeciesUnicas } from "@/app/services/legado-service"
import type { LegadoListadoDTO } from "@/app/models/interfaces/legado"
import Pagination from "@/components/pagination"

export default function ListadoLegadoPage() {
  const [legados, setLegados] = useState<LegadoListadoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEspecie, setFilterEspecie] = useState<string>("todos")
  const [especies, setEspecies] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  // Fetch legados paginados
  const fetchLegados = async (page: number = 0) => {
    try {
      setLoading(true)
      setError(null)

      const data = await obtenerLegadosPaginadas(
        page,
        pageSize,
        searchTerm,
        filterEspecie
      )


      const pageData = extractPageMetadata<LegadoListadoDTO>(data, page)
      
      setLegados(pageData.content)
      setTotalPages(pageData.totalPages)
      setTotalElements(pageData.totalElements)
      setCurrentPage(pageData.currentPage)
    } catch (err) {
      console.error("Error fetching legados:", err)
      setError("Error al cargar los datos legados. Intente nuevamente más tarde.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLegados(0)
    fetchEspecies()
  }, [])

  // Cargar especies únicas
  const fetchEspecies = async () => {
    try {
      const especiesData = await obtenerEspeciesUnicas()
      setEspecies(especiesData)
    } catch (err) {
      console.error("Error fetching especies:", err)
    }
  }

  // Handler para búsqueda
  const handleSearchClick = () => {
    fetchLegados(0)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchLegados(0)
    }
  }

  // Handler para cambio de filtro de especie
  const handleFilterEspecieChange = (value: string) => {
    setFilterEspecie(value)
  }

  // Aplicar filtros
  useEffect(() => {
    if (!loading) {
      fetchLegados(0)
    }
  }, [filterEspecie])

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error al cargar</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchLegados(currentPage)}>Reintentar</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-balance">Datos Legados</h1>
            <p className="text-sm sm:text-base text-muted-foreground text-pretty">
              Consulta los datos históricos importados desde Excel
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{totalElements}</p>
                )}
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Página Actual</p>
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{currentPage + 1} / {Math.max(totalPages, 1)}</p>
                )}
              </div>
              <Database className="h-8 w-8 text-green-600" />
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
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID o ficha..."
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
            <div className="flex gap-2">
              <Select value={filterEspecie} onValueChange={handleFilterEspecieChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las especies</SelectItem>
                  {especies.map((especie) => (
                    <SelectItem key={especie} value={especie}>
                      {especie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Datos Legados ({loading ? "..." : totalElements})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando datos...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[80px]">ID</TableHead>
                      <TableHead className="min-w-[120px]">Ficha</TableHead>
                      <TableHead className="min-w-[150px]">Especie</TableHead>
                      <TableHead className="min-w-[120px]">Fecha Recibo</TableHead>
                      <TableHead className="min-w-[100px]">Germ C</TableHead>
                      <TableHead className="min-w-[100px]">Germ SC</TableHead>
                      <TableHead className="min-w-[100px]">Peso 1000</TableHead>
                      <TableHead className="min-w-[100px]">Pureza INIA</TableHead>
                      <TableHead className="min-w-[100px]">Pureza INASE</TableHead>
                      <TableHead className="min-w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legados.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {searchTerm ? "No se encontraron resultados" : "No hay datos legados registrados"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      legados.map((legado) => (
                        <TableRow key={legado.legadoID}>
                          <TableCell className="font-medium">LEG-{legado.legadoID}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{legado.ficha || "-"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{legado.especie || "-"}</div>
                          </TableCell>
                          <TableCell>
                            {legado.fechaRecibo ? new Date(legado.fechaRecibo).toLocaleDateString("es-ES") : "-"}
                          </TableCell>
                          <TableCell>{legado.germC ?? "-"}</TableCell>
                          <TableCell>{legado.germSC ?? "-"}</TableCell>
                          <TableCell>{legado.peso1000 ? legado.peso1000.toFixed(2) : "-"}</TableCell>
                          <TableCell>{legado.pura ? legado.pura.toFixed(2) : "-"}</TableCell>
                          <TableCell>{legado.puraI ? legado.puraI.toFixed(2) : "-"}</TableCell>
                          <TableCell>
                            <Link href={`/listado/legado/${legado.legadoID}`}>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {totalElements === 0 ? (
                    <>No hay resultados</>
                  ) : (
                    <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
                  )}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(totalPages, 1)}
                  onPageChange={(p) => fetchLegados(p)}
                  showRange={1}
                  alwaysShow={true}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
