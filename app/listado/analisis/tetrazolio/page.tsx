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

interface AnalisisTetrazolio {
  id: string
  loteId: string
  loteName: string
  analyst: string
  fechaInicio: string
  fechaFin: string | null
  estado: "Completado" | "En Proceso" | "Pendiente"
  prioridad: "Alta" | "Media" | "Baja"
  concentracion: string
  temperatura: string
  duracion: string
  viabilidad: number
  vigor: string
  semillasViables: number
  semillasNoViables: number
  activo?: boolean
}

export default function ListadoTetrazolioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroActivo, setFiltroActivo] = useState("todos")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todos")

  const [analisis, setAnalisis] = useState<AnalisisTetrazolio[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const pageSize = 10

  // Obtener rol del usuario
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUserRole(payload.rol)
      } catch (error) {
        console.error("Error al decodificar el token:", error)
      }
    }
  }, [])
  
  const fetchTetrazolio = async (page: number = 0, filtro: string = "todos") => {
    try {
      setLoading(true)
      setError("")
      const data = await obtenerTetrazoliosPaginadas(page, pageSize, filtro)
      setLastResponse(data)

      const content = data.content || []
      const mapped = (content || []).map((t: any) => ({
        id: t.analisisID?.toString() || t.id?.toString() || "-",
        loteId: t.loteID?.toString() || "-",
        loteName: t.lote || t.ficha || "-",
        analyst: t.analista || t.usuario || "-",
        fechaInicio: t.fecha || new Date().toISOString(),
        fechaFin: t.fechaFin || null,
        estado: t.estado || "Pendiente",
        prioridad: t.prioridad || "Media",
        concentracion: t.concentracion || "-",
        temperatura: t.tincionTemp ? `${t.tincionTemp}°C` : "-",
        duracion: t.tincionHs ? `${t.tincionHs} horas` : "-",
        viabilidad: t.porcViablesRedondeo || t.porcViables || 0,
        vigor: t.vigor || "",
        semillasViables: t.semillasViables || 0,
        semillasNoViables: t.semillasNoViables || 0,
        activo: t.activo ?? true,
      })) as AnalisisTetrazolio[]

      setAnalisis(mapped)

      const pageMeta = (data as any).page ? (data as any).page : (data as any);
      const totalPagesFrom = pageMeta.totalPages ?? 1;
      const totalElementsFrom = pageMeta.totalElements ?? (content.length || 0);
      const numberFrom = pageMeta.number ?? page;

      setTotalPages(totalPagesFrom);
      setTotalElements(totalElementsFrom);
      setCurrentPage(numberFrom);
      setIsFirst(numberFrom === 0);
      setIsLast(numberFrom >= totalPagesFrom - 1);
    } catch (err: any) {
      console.error("Error fetching Tetrazolio paginadas:", err)
      setError("Error al cargar los análisis Tetrazolio")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTetrazolio(0)
  }, [])

  // Actualizar cuando cambia el filtro de activo
  useEffect(() => {
    fetchTetrazolio(0, filtroActivo)
  }, [filtroActivo])

  // Handlers para desactivar/reactivar
  const handleDesactivar = async (id: number) => {
    if (!confirm("¿Está seguro de desactivar este análisis Tetrazolio?")) return
    try {
      await desactivarTetrazolio(id)
      toast.success("Análisis Tetrazolio desactivado exitosamente")
      await fetchTetrazolio(currentPage, filtroActivo)
    } catch (error) {
      console.error("Error al desactivar Tetrazolio:", error)
      toast.error("Error al desactivar el análisis")
    }
  }

  const handleReactivar = async (id: number) => {
    try {
      await activarTetrazolio(id)
      toast.success("Análisis Tetrazolio reactivado exitosamente")
      await fetchTetrazolio(currentPage, filtroActivo)
    } catch (error) {
      console.error("Error al reactivar Tetrazolio:", error)
      toast.error("Error al reactivar el análisis")
    }
  }

  const filteredAnalisis = analisis.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.loteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analyst.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "todos" || item.estado === filterEstado
    const matchesPrioridad = filterPrioridad === "todos" || item.prioridad === filterPrioridad

    return matchesSearch && matchesEstado && matchesPrioridad
  })

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "Completado":
      case "Aprobado":
        return "default"
      case "En Proceso":
        return "secondary"
      case "Pendiente":
      case "A Repetir":
        return "destructive"
      default:
        return "outline"
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

  if (loading) {
    return (
      <div className="space-y-6 p-3 sm:p-4 md:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando análisis de Tetrazolio...</p>
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
            <Button onClick={() => void fetchTetrazolio(currentPage)}>Reintentar</Button>
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
                <p className="text-2xl font-bold">{analisis.length}</p>
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
                <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "Completado").length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
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
                <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "En Proceso").length}</p>
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
                <p className="text-2xl font-bold">
                  {analisis.filter((a) => a.viabilidad > 0).length > 0
                    ? (
                      analisis.filter((a) => a.viabilidad > 0).reduce((sum, a) => sum + a.viabilidad, 0) /
                      analisis.filter((a) => a.viabilidad > 0).length
                    ).toFixed(1)
                    : "0"}
                  %
                </p>
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
                  placeholder="Buscar por ID, lote, nombre o analista..."
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
                <SelectItem value="Registrado">Registrado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Aprobado">Aprobado</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="A Repetir">A Repetir</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las prioridades</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Baja">Baja</SelectItem>
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
          <CardTitle>Lista de Análisis de Tetrazolio</CardTitle>
          <CardDescription>
           {filteredAnalisis.length} análisis encontrado{filteredAnalisis.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[100px]">ID Análisis</TableHead>
                  <TableHead className="min-w-[150px]">Lote</TableHead>
                  <TableHead className="min-w-[120px]">Nombre Lote</TableHead>
                  <TableHead className="min-w-[120px]">Analista</TableHead>
                  <TableHead className="min-w-[120px]">Fecha Inicio</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px]">Prioridad</TableHead>
                  <TableHead className="min-w-[120px]">Viabilidad (%)</TableHead>
                  <TableHead className="min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalisis.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">TETRA-{item.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.loteName}</div>
                        {item.loteId && (
                          <div className="text-sm text-muted-foreground">ID: {item.loteId}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.loteName}</TableCell>
                    <TableCell>{item.analyst}</TableCell>
                    <TableCell>{new Date(item.fechaInicio).toLocaleDateString("es-ES")}</TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadgeVariant(item.estado)}>{item.estado}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPrioridadBadgeVariant(item.prioridad)}>{item.prioridad}</Badge>
                    </TableCell>
                    <TableCell>{item.viabilidad > 0 ? `${item.viabilidad}%` : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/listado/analisis/tetrazolio/${item.id}`}>
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/listado/analisis/tetrazolio/${item.id}`}>
                          <Button variant="ghost" size="sm" title="Editar análisis">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        {userRole === "ADMIN" && (
                          item.activo ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Desactivar"
                              onClick={() => handleDesactivar(parseInt(item.id))}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Reactivar"
                              onClick={() => handleReactivar(parseInt(item.id))}
                              className="text-green-600 hover:text-green-700"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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


