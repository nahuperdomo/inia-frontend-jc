"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Search, Filter, Plus, ArrowLeft, Eye, Edit, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { obtenerGerminacionesPaginadas } from "@/app/services/germinacion-service"
import { GerminacionListadoDTO } from "@/app/models/interfaces/germinacion"
import { EstadoAnalisis } from "@/app/models/types/enums"
import Pagination from "@/components/pagination"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [germinaciones, setGerminaciones] = useState<GerminacionListadoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const pageSize = 10

  const fetchGerminaciones = async (page: number = 0) => {
    try {
      setLoading(true)
      const data = await obtenerGerminacionesPaginadas(page, pageSize)
      // data may contain 'content' and a nested 'page' meta like the DOSN endpoint
      setGerminaciones((data as any).content || [])
      const meta = (data as any).page || {}
      setTotalPages(meta.totalPages ?? 1)
      setTotalElements(meta.totalElements ?? ((data as any).content?.length ?? 0))
      setCurrentPage(meta.number ?? page)
      setIsFirst((meta.number ?? 0) === 0)
      setIsLast((meta.number ?? 0) >= (meta.totalPages ?? 1) - 1)
    } catch (err) {
      setError("Error al cargar los análisis de germinación")
      console.error("Error fetching germinaciones:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGerminaciones(0)
  }, [])

  const filteredAnalysis = germinaciones.filter((analysis) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      analysis.analisisID.toString().includes(searchLower) ||
      (analysis.lote && analysis.lote.toLowerCase().includes(searchLower)) ||
      (analysis.usuarioCreador && analysis.usuarioCreador.toLowerCase().includes(searchLower)) ||
      `germ-${analysis.analisisID}`.includes(searchLower)
    const matchesStatus = selectedStatus === "all" || analysis.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats from current page data
  const totalAnalysis = totalElements
  const completedAnalysis = germinaciones.filter(g => g.estado === "FINALIZADO" || g.estado === "APROBADO").length
  const inProgressAnalysis = germinaciones.filter(g => g.estado === "EN_PROCESO" || g.estado === "REGISTRADO").length
  const pendingAnalysis = germinaciones.filter(g => g.estado === "PENDIENTE_APROBACION").length
  const complianceRate = germinaciones.length > 0 ? Math.round((germinaciones.filter(g => g.cumpleNorma === true).length / germinaciones.length) * 100) : 0

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "FINALIZADO":
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
      case "FINALIZADO":
        return "Finalizado"
      case "EN_PROCESO":
        return "En Proceso"
      case "REGISTRADO":
        return "Registrado"
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchGerminaciones(newPage)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando análisis de germinación...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Error al cargar</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchGerminaciones(currentPage)}>Reintentar</Button>
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis de Germinación</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Consulta los análisis de germinación de semillas</p>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Link href="/registro/analisis?tipo=GERMINACION">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Análisis
            </Button>
          </Link>
        </div>
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
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, lote o usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="REGISTRADO">Registrado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="APROBADO">Aprobado</option>
                <option value="PENDIENTE_APROBACION">Pend. Aprobación</option>
                <option value="A_REPETIR">A Repetir</option>
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
          <CardTitle>Lista de Análisis de Germinación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID Análisis</TableHead>
                  <TableHead className="min-w-[150px]">Lote</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Inicio</TableHead>
                  <TableHead className="min-w-[120px]">Inicio Germ.</TableHead>
                  <TableHead className="min-w-[120px]">Último Conteo</TableHead>
                  <TableHead className="min-w-[80px]">Días</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px]">Cumple Norma</TableHead>
                  <TableHead className="min-w-[150px]">Usuario</TableHead>
                  <TableHead className="min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalysis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No se encontraron análisis de germinación</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalysis.map((analysis) => (
                    <TableRow key={analysis.analisisID}>
                      <TableCell className="font-medium">GERM-{analysis.analisisID}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{analysis.lote || "-"}</div>
                          {analysis.idLote && (
                            <div className="text-sm text-muted-foreground">ID: {analysis.idLote}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatearFechaHora(analysis.fechaInicio)}</TableCell>
                      <TableCell>{formatearFechaLocal(analysis.fechaInicioGerm)}</TableCell>
                      <TableCell>{formatearFechaLocal(analysis.fechaUltConteo)}</TableCell>
                      <TableCell>
                        {analysis.numDias ? `${analysis.numDias} días` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                          {formatEstado(analysis.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={analysis.cumpleNorma ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {analysis.cumpleNorma ? "Sí" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{analysis.usuarioCreador || "-"}</div>
                          {analysis.usuarioModificador && analysis.usuarioModificador !== analysis.usuarioCreador && (
                            <div className="text-muted-foreground">Mod: {analysis.usuarioModificador}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/listado/analisis/germinacion/${analysis.analisisID}`}>
                            <Button variant="ghost" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/listado/analisis/germinacion/${analysis.analisisID}/editar`}>
                            <Button variant="ghost" size="sm" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" title="Eliminar">
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
           onPageChange={(p) => fetchGerminaciones(p)}
           showRange={1}
           alwaysShow={true}
         />
       </div>
        </CardContent>
      </Card>
    </div>
  )
}