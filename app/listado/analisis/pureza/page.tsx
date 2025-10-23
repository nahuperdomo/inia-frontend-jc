"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FlaskConical, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { obtenerPurezasPaginadas, desactivarPureza, activarPureza } from "@/app/services/pureza-service"
import { obtenerPerfil } from "@/app/services/auth-service"
import Pagination from "@/components/pagination"
import { PurezaDTO, EstadoAnalisis } from "@/app/models"
import { toast } from "sonner"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filtroActivo, setFiltroActivo] = useState("todos") // nuevo filtro
  const [purezas, setPurezas] = useState<PurezaDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const pageSize = 10

  // Fetch user profile to get role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const perfil = await obtenerPerfil()
        const role = perfil?.roles?.[0] || ''
        const cleanRole = role.replace('ROLE_', '')
        setUserRole(cleanRole)
      } catch (error) {
        console.error("Error obteniendo rol de usuario:", error)
      }
    }
    fetchUserRole()
  }, [])

  const fetchPurezas = async (page: number = 0, filtro: string = filtroActivo) => {
    try {
      setLoading(true);
  const data = await obtenerPurezasPaginadas(page, pageSize, filtro);
  console.log("DEBUG obtenerPurezasPaginadas response:", data);

  // Datos principales
  const content = data.content || [];
  setPurezas(content);

  // Metadata: soportar dos formas que puede devolver el backend
  // 1) { content: [...], page: { totalPages, totalElements, number, ... } }
  // 2) Página Spring Data directamente: { content: [...], totalPages, totalElements, number, ... }
  const pageMeta = (data as any).page ? (data as any).page : (data as any);
  const totalPagesFrom = pageMeta.totalPages ?? 1;
  const totalElementsFrom = pageMeta.totalElements ?? (content.length || 0);
  const numberFrom = pageMeta.number ?? page;

  setTotalPages(totalPagesFrom);
  setTotalElements(totalElementsFrom);
  setCurrentPage(numberFrom);
  setIsFirst(numberFrom === 0);
  setIsLast(numberFrom >= totalPagesFrom - 1);
    } catch (err) {
      setError("Error al cargar los análisis de pureza");
      console.error("Error fetching purezas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurezas(0, filtroActivo)
  }, [filtroActivo])

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este análisis?")) return
    try {
      await desactivarPureza(id)
      toast.success("Análisis desactivado exitosamente")
      await fetchPurezas(currentPage, filtroActivo)
    } catch (error: any) {
      toast.error("Error al desactivar análisis", { description: error?.message })
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarPureza(id)
      toast.success("Análisis reactivado exitosamente")
      await fetchPurezas(currentPage, filtroActivo)
    } catch (error: any) {
      toast.error("Error al reactivar análisis", { description: error?.message })
    }
  }

  const filteredAnalysis = purezas.filter((analysis) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      analysis.analisisID.toString().includes(searchLower) ||
      analysis.lote.toLowerCase().includes(searchLower) ||
      (analysis.comentarios && analysis.comentarios.toLowerCase().includes(searchLower)) ||
      `pf-${analysis.analisisID}`.includes(searchLower)
    const matchesStatus = selectedStatus === "all" || analysis.estado === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats from current page data and total
  const totalAnalysis = totalElements
  const completedAnalysis = purezas.filter(p => p.estado === "APROBADO").length
  const inProgressAnalysis = purezas.filter(p => p.estado === "EN_PROCESO").length
  const pendingAnalysis = purezas.filter(p => p.estado === "REGISTRADO" || p.estado === "PENDIENTE_APROBACION").length
  
  // Calcular promedio de pureza
  const purezasConDatos = purezas.filter(p => p.semillaPura_g > 0 && p.pesoInicial_g > 0)
  const promedioPureza = purezasConDatos.length > 0
    ? purezasConDatos.reduce((sum, p) => {
        const pureza = (p.semillaPura_g / p.pesoInicial_g) * 100
        return sum + pureza
      }, 0) / purezasConDatos.length
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

  if (loading) {
    return (
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando análisis de pureza...</p>
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
            <Button onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        </div>
      </div>
    )
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Análisis de Pureza Física</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Consulta la pureza física de las semillas</p>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Link href="/registro/analisis?tipo=PUREZA">
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por ID, lote o comentarios..."
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
                  <TableHead className="min-w-[100px]">ID Análisis</TableHead>
                  <TableHead className="min-w-[150px]">Lote</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Inicio</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Fin</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[100px]">Pureza (%)</TableHead>
                  <TableHead className="min-w-[120px]">Cumple Estándar</TableHead>
                  <TableHead className="min-w-[150px]">Comentarios</TableHead>
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
                    const purezaPercent = analysis.pesoInicial_g > 0
                      ? ((analysis.semillaPura_g / analysis.pesoInicial_g) * 100).toFixed(1)
                      : "0.0"
                    
                    return (
                      <TableRow key={analysis.analisisID}>
                        <TableCell className="font-medium">PF-{analysis.analisisID}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{analysis.lote}</div>
                            {analysis.idLote && (
                              <div className="text-sm text-muted-foreground">ID: {analysis.idLote}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatearFechaLocal(analysis.fechaInicio)}</TableCell>
                        <TableCell>
                          {analysis.fechaFin ? formatearFechaLocal(analysis.fechaFin) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(analysis.estado)}>
                            {formatEstado(analysis.estado)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{purezaPercent}%</span>
                        </TableCell>
                        <TableCell>
                          {analysis.cumpleEstandar !== undefined ? (
                            <Badge
                              variant={analysis.cumpleEstandar ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {analysis.cumpleEstandar ? "Sí" : "No"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">No evaluado</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {analysis.comentarios ? (
                            <div className="truncate" title={analysis.comentarios}>
                              {analysis.comentarios}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Link href={`/listado/analisis/pureza/${analysis.analisisID}`}>
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/listado/analisis/pureza/${analysis.analisisID}/editar`}>
                              <Button variant="ghost" size="sm" title="Editar">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {userRole === "ADMIN" && (
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
