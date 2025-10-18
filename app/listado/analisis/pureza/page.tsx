"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { FlaskConical, Search, Filter, Plus, Eye, Edit, Trash2, Download, ArrowLeft, MessageCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { obtenerTodasPurezasActivas, obtenerPurezaPorId, actualizarPureza, obtenerPurezasPaginadas } from "@/app/services/pureza-service"
import Pagination from "@/components/pagination"
import { PurezaDTO, EstadoAnalisis } from "@/app/models"

interface AnalisisPureza {
  id: string
  loteId: string
  loteName: string
  analyst: string
  fechaInicio: string
  fechaFin: string | null
  estado: "Completado" | "En Proceso" | "Pendiente"
  prioridad: "Alta" | "Media" | "Baja"
  pesoInicial: number
  semillaPura: number
  materiaInerte: number
  otrosCultivos: number
  malezas: number
  pureza: number
  comentarios: string
  idLote?: number // ID numérico del lote
  purezaOriginal?: PurezaDTO // Objeto original del backend
}

export default function ListadoPurezaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [filterPrioridad, setFilterPrioridad] = useState<string>("todos")
  const [comentariosDialogOpen, setComentariosDialogOpen] = useState(false)
  const [selectedAnalisis, setSelectedAnalisis] = useState<AnalisisPureza | null>(null)
  const [editingComentarios, setEditingComentarios] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [analisis, setAnalisis] = useState<AnalisisPureza[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFirst, setIsFirst] = useState(true)
  const [lastResponse, setLastResponse] = useState<any>(null)
  const pageSize = 10
  const fetchPurezas = async (page: number = 0) => {
    try {
      setIsLoading(true)
      console.log("🔍 Iniciando petición para obtener purezas...")
      const res = await obtenerPurezasPaginadas(page, pageSize)
      setLastResponse(res)
      const purezasData = res.content || []
      console.log("📊 Datos de purezas recibidos:", purezasData)
      console.log("📊 Respuesta completa:", res)

      const purezasTransformed = purezasData.map((pureza: PurezaDTO) => {
        const purezaPercent = pureza.semillaPura_g > 0 && pureza.pesoInicial_g > 0
          ? Math.round((pureza.semillaPura_g / pureza.pesoInicial_g) * 100 * 10) / 10
          : 0

        let estadoMapped: "Completado" | "En Proceso" | "Pendiente" = "Pendiente"
        switch (pureza.estado) {
          case 'FINALIZADO':
          case 'APROBADO':
            estadoMapped = "Completado"
            break
          case 'EN_PROCESO':
            estadoMapped = "En Proceso"
            break
          default:
            estadoMapped = "Pendiente"
        }

        const prioridad: "Alta" | "Media" | "Baja" =
          pureza.estado === 'EN_PROCESO' ? "Alta" :
            pureza.estado === 'PENDIENTE' ? "Media" : "Baja"

        return {
          id: `PF${pureza.analisisID}`,
          loteId: pureza.lote || `#${pureza.analisisID}`,
          loteName: pureza.lote || "No especificado",
          analyst: "No especificado",
          fechaInicio: pureza.fechaInicio,
          fechaFin: pureza.fechaFin || null,
          estado: estadoMapped,
          prioridad,
          pesoInicial: pureza.pesoInicial_g,
          semillaPura: pureza.semillaPura_g,
          materiaInerte: pureza.materiaInerte_g,
          otrosCultivos: pureza.otrosCultivos_g,
          malezas: pureza.malezas_g,
          pureza: purezaPercent,
          comentarios: pureza.comentarios || "Sin comentarios registrados",
          idLote: pureza.idLote, // Guardamos el idLote original
          purezaOriginal: pureza, // Guardamos el objeto completo para usar en actualizaciones
        }
      })

      setAnalisis(purezasTransformed)

      // Extraer metadatos de paginación directamente de la respuesta
      setTotalPages(res.totalPages ?? 1)
      setTotalElements(res.totalElements ?? (purezasData.length || 0))
      setCurrentPage(page)
      setIsFirst(res.first ?? (page === 0))
      setIsLast(res.last ?? (page >= (res.totalPages ?? 1) - 1))
    } catch (err) {
      console.error("❌ Error al obtener purezas:", err)
      console.error("⚠️ Detalles completos:", err instanceof Error ? err.message : JSON.stringify(err))
      setError(`Error al cargar los análisis de pureza: ${err instanceof Error ? err.message : 'Error desconocido'}. Intente nuevamente más tarde.`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchPurezas(0) }, [])

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
        return "default"
      case "En Proceso":
        return "secondary"
      case "Pendiente":
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

  const handleOpenComentarios = (item: AnalisisPureza) => {
    setSelectedAnalisis(item)
    setEditingComentarios(item.comentarios)
    setIsEditing(false)
    setComentariosDialogOpen(true)
  }

  const handleCloseComentarios = () => {
    setComentariosDialogOpen(false)
    setSelectedAnalisis(null)
    setEditingComentarios("")
    setIsEditing(false)
  }

  const handleEditComentarios = () => {
    setIsEditing(true)
  }

  const handleSaveComentarios = async () => {
    if (selectedAnalisis) {
      try {
        // Extract the numeric ID from the PF### format
        const purezaId = parseInt(selectedAnalisis.id.replace('PF', ''), 10)

        console.log("💾 Guardando comentarios para pureza ID:", purezaId)
        console.log("💬 Nuevos comentarios:", editingComentarios)

        // Fetch the full pureza data to get all required fields
        const pureza = await obtenerPurezaPorId(purezaId)
        console.log("📦 Datos completos de pureza obtenidos:", pureza)

        // Validate we have the idLote
        if (!pureza.idLote) {
          throw new Error("No se pudo obtener el ID del lote")
        }

        // Create the update request DTO with all required fields
        const updateRequest = {
          idLote: pureza.idLote,
          comentarios: editingComentarios,
          fecha: pureza.fecha,
          pesoInicial_g: pureza.pesoInicial_g,
          semillaPura_g: pureza.semillaPura_g,
          materiaInerte_g: pureza.materiaInerte_g,
          otrosCultivos_g: pureza.otrosCultivos_g,
          malezas_g: pureza.malezas_g,
          malezasToleradas_g: pureza.malezasToleradas_g,
          pesoTotal_g: pureza.pesoTotal_g,
          cumpleEstandar: pureza.cumpleEstandar,
          // Optional redon fields
          redonSemillaPura: pureza.redonSemillaPura,
          redonMateriaInerte: pureza.redonMateriaInerte,
          redonOtrosCultivos: pureza.redonOtrosCultivos,
          redonMalezas: pureza.redonMalezas,
          redonMalezasToleradas: pureza.redonMalezasToleradas,
          redonPesoTotal: pureza.redonPesoTotal,
          // Optional inase fields
          inasePura: pureza.inasePura,
          inaseMateriaInerte: pureza.inaseMateriaInerte,
          inaseOtrosCultivos: pureza.inaseOtrosCultivos,
          inaseMalezas: pureza.inaseMalezas,
          inaseMalezasToleradas: pureza.inaseMalezasToleradas,
          inaseFecha: pureza.inaseFecha,
          // Transform otrasSemillas to match ListadoRequestDTO[]
          otrasSemillas: (pureza.otrasSemillas || []).map(item => ({
            listadoTipo: item.listadoTipo,
            listadoInsti: item.listadoInsti,
            listadoNum: item.listadoNum,
            idCatalogo: item.catalogo.catalogoID
          }))
        }

        console.log("📤 Request de actualización:", updateRequest)

        // Update pureza in the backend
        const updatedPureza = await actualizarPureza(purezaId, updateRequest)
        console.log("✅ Pureza actualizada:", updatedPureza)

        // Update local state
        setAnalisis(prevAnalisis =>
          prevAnalisis.map(item =>
            item.id === selectedAnalisis.id
              ? { ...item, comentarios: editingComentarios, purezaOriginal: updatedPureza }
              : item
          )
        )

        setIsEditing(false)

        // Update the selectedAnalisis to reflect changes
        setSelectedAnalisis({
          ...selectedAnalisis,
          comentarios: editingComentarios
        })

        // Show success message
        const successMessage = document.createElement('div')
        successMessage.className = 'bg-green-50 text-green-700 p-2 rounded-md text-sm mt-2'
        successMessage.innerText = 'Comentarios guardados exitosamente'

        // Add to DOM temporarily
        const notificationContainer = document.getElementById('notification-container')
        if (notificationContainer) {
          // Clear any existing notifications
          notificationContainer.innerHTML = ''

          // Add new notification
          notificationContainer.appendChild(successMessage)

          // Remove after 3 seconds
          setTimeout(() => {
            if (successMessage.parentNode) {
              successMessage.remove()
            }
          }, 3000)
        }
      } catch (err) {
        console.error("❌ Error al actualizar comentarios de pureza:", err)
        console.error("❌ Detalles del error:", err instanceof Error ? err.message : JSON.stringify(err))

        // Show error message
        const errorMessage = document.createElement('div')
        errorMessage.className = 'bg-red-50 text-red-700 p-2 rounded-md text-sm mt-2'
        errorMessage.innerText = `Error al guardar los comentarios: ${err instanceof Error ? err.message : 'Error desconocido'}. Intente nuevamente.`

        // Add to DOM temporarily
        const notificationContainer = document.getElementById('notification-container')
        if (notificationContainer) {
          // Clear any existing notifications
          notificationContainer.innerHTML = ''

          // Add new notification
          notificationContainer.appendChild(errorMessage)

          // Remove after 5 seconds
          setTimeout(() => {
            if (errorMessage.parentNode) {
              errorMessage.remove()
            }
          }, 5000)
        }
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
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
            <h1 className="text-3xl font-bold text-balance">Análisis de Pureza Física</h1>
            <p className="text-muted-foreground text-pretty">
              Consulta y administra todos los análisis de pureza física realizados
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/registro/analisis">
            <Button>
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
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{analisis.length}</p>
                )}
              </div>
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
          <div className="flex items-center justify-between mt-4 px-4">
            <div className="text-sm text-muted-foreground">
              {totalElements === 0 ? (
                <>Mostrando 0 de 0 resultados</>
              ) : (
                <>Mostrando {currentPage * pageSize + 1} a {Math.min((currentPage + 1) * pageSize, totalElements)} de {totalElements} resultados</>
              )}
            </div>
            <div className="flex items-center gap-2">&nbsp;</div>
          </div>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completados</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "Completado").length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">{analisis.filter((a) => a.estado === "En Proceso").length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Promedio Pureza</p>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {analisis.filter((a) => a.pureza > 0).length > 0
                      ? (
                        analisis.filter((a) => a.pureza > 0).reduce((sum, a) => sum + a.pureza, 0) /
                        analisis.filter((a) => a.pureza > 0).length
                      ).toFixed(1)
                      : "0"}
                    %
                  </p>
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
                <SelectItem value="Completado">Completado</SelectItem>
                <SelectItem value="En Proceso">En Proceso</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Análisis de Pureza Física</CardTitle>
          <CardDescription>
            {isLoading
              ? "Cargando análisis..."
              : `${filteredAnalisis.length} análisis encontrado${filteredAnalisis.length !== 1 ? "s" : ""}`
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
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Análisis</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Nombre Lote</TableHead>
                    <TableHead>Analista</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Pureza (%)</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                          <p className="text-muted-foreground">Cargando datos de análisis de pureza...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAnalisis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-muted-foreground">No se encontraron análisis de pureza que coincidan con los criterios de búsqueda.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnalisis.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.loteId}</TableCell>
                        <TableCell>{item.loteName}</TableCell>
                        <TableCell>{item.analyst}</TableCell>
                        <TableCell>{new Date(item.fechaInicio).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>
                          <Badge variant={getEstadoBadgeVariant(item.estado)}>{item.estado}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPrioridadBadgeVariant(item.prioridad)}>{item.prioridad}</Badge>
                        </TableCell>
                        <TableCell>{item.pureza > 0 ? `${item.pureza}%` : "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenComentarios(item)}>
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Link href={`/analisis/pureza/${item.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/analisis/pureza/${item.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
          )}
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

      {/* Diálogo de Comentarios */}
      <Dialog open={comentariosDialogOpen} onOpenChange={setComentariosDialogOpen}>
        <DialogContent className="sm:max-w-[500px] DialogContent">
          <DialogHeader>
            <DialogTitle>Comentarios del Análisis {selectedAnalisis?.id}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edita los comentarios para este análisis de pureza física"
                : "Visualiza los comentarios registrados para este análisis"}
            </DialogDescription>
          </DialogHeader>

          {selectedAnalisis && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lote</p>
                  <p className="font-medium">{selectedAnalisis.loteId} - {selectedAnalisis.loteName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={getEstadoBadgeVariant(selectedAnalisis.estado)}>{selectedAnalisis.estado}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Comentarios</p>
                {isEditing ? (
                  <Textarea
                    value={editingComentarios}
                    onChange={(e) => setEditingComentarios(e.target.value)}
                    placeholder="Ingrese comentarios sobre este análisis..."
                    className="min-h-[120px]"
                  />
                ) : (
                  <div className="rounded-md border p-4 text-sm">
                    {selectedAnalisis.comentarios || "No hay comentarios registrados."}
                  </div>
                )}
              </div>
            </div>
          )}

          <div id="notification-container" className="mt-2"></div>

          <DialogFooter className="DialogFooter">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSaveComentarios}>Guardar Comentarios</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseComentarios}>Cerrar</Button>
                <Button onClick={handleEditComentarios}>Editar Comentarios</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
