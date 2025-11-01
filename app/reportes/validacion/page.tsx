"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertTriangle, Clock, User, FileText, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { obtenerPurezasPaginadas } from "@/app/services/pureza-service"
import { obtenerGerminacionesPaginadas } from "@/app/services/germinacion-service"
import { obtenerTetrazoliosPaginadas } from "@/app/services/tetrazolio-service"
import { obtenerPmsPaginadas } from "@/app/services/pms-service"
import { obtenerDosnPaginadas } from "@/app/services/dosn-service"
import { cambiarEstadoAnalisis } from "@/app/services/analisis-service"
import { toast, Toaster } from "sonner"

interface ValidationItem {
  id: number
  tipo: "Pureza" | "Germinación" | "Tetrazolio" | "PMS" | "DOSN"
  numeroAnalisis: string
  muestra: string
  cliente: string
  responsable: string
  fechaAnalisis: string
  estado: string
  observaciones?: string
  loteID?: number
}

export default function ValidacionPage() {
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])
  const [selectedItem, setSelectedItem] = useState<ValidationItem | null>(null)
  const [validationNotes, setValidationNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    cargarAnalisis()
  }, [])

  const cargarAnalisis = async () => {
    setIsLoading(true)
    try {
      const [purezasResp, germinacionesResp, tetrazoliosResp, pmsResp, dosnResp] = await Promise.all([
        obtenerPurezasPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
        obtenerGerminacionesPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
        obtenerTetrazoliosPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
        obtenerPmsPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
        obtenerDosnPaginadas(0, 9999).catch(() => ({ content: [], totalElements: 0 })),
      ])

      const items: ValidationItem[] = []

      // Procesar Purezas
      purezasResp.content?.forEach((p: any) => {
        items.push({
          id: p.id,
          tipo: "Pureza",
          numeroAnalisis: `AN-${p.id}`,
          muestra: p.lote?.ficha || `Lote ${p.loteID}`,
          cliente: p.lote?.cliente?.nombre || "N/A",
          responsable: p.responsable || "N/A",
          fechaAnalisis: p.fechaInicio || p.fechaCreacion,
          estado: mapEstado(p.estado),
          observaciones: p.observaciones,
          loteID: p.loteID
        })
      })

      // Procesar Germinaciones
      germinacionesResp.content?.forEach((g: any) => {
        items.push({
          id: g.id,
          tipo: "Germinación",
          numeroAnalisis: `AN-${g.id}`,
          muestra: g.lote?.ficha || `Lote ${g.loteID}`,
          cliente: g.lote?.cliente?.nombre || "N/A",
          responsable: g.responsable || "N/A",
          fechaAnalisis: g.fechaCreacion,
          estado: mapEstado(g.estado),
          observaciones: g.observaciones,
          loteID: g.loteID
        })
      })

      // Procesar Tetrazolios
      tetrazoliosResp.content?.forEach((t: any) => {
        items.push({
          id: t.id,
          tipo: "Tetrazolio",
          numeroAnalisis: `AN-${t.id}`,
          muestra: t.lote?.ficha || `Lote ${t.loteID}`,
          cliente: t.lote?.cliente?.nombre || "N/A",
          responsable: t.responsable || "N/A",
          fechaAnalisis: t.fechaCreacion,
          estado: mapEstado(t.estado),
          observaciones: t.observaciones,
          loteID: t.loteID
        })
      })

      // Procesar PMS
      pmsResp.content?.forEach((p: any) => {
        items.push({
          id: p.id,
          tipo: "PMS",
          numeroAnalisis: `AN-${p.id}`,
          muestra: p.lote?.ficha || `Lote ${p.loteID}`,
          cliente: p.lote?.cliente?.nombre || "N/A",
          responsable: p.responsable || "N/A",
          fechaAnalisis: p.fechaCreacion,
          estado: mapEstado(p.estado),
          observaciones: p.observaciones,
          loteID: p.loteID
        })
      })

      // Procesar DOSN
      dosnResp.content?.forEach((d: any) => {
        items.push({
          id: d.id,
          tipo: "DOSN",
          numeroAnalisis: `AN-${d.id}`,
          muestra: d.lote?.ficha || `Lote ${d.loteID}`,
          cliente: d.lote?.cliente?.nombre || "N/A",
          responsable: d.responsable || "N/A",
          fechaAnalisis: d.fechaCreacion,
          estado: mapEstado(d.estado),
          observaciones: d.observaciones,
          loteID: d.loteID
        })
      })

      // Ordenar por fecha más reciente
      items.sort((a, b) => new Date(b.fechaAnalisis).getTime() - new Date(a.fechaAnalisis).getTime())

      setValidationItems(items)
    } catch (error) {
      console.error("Error al cargar análisis:", error)
      toast.error("Error al cargar análisis")
    } finally {
      setIsLoading(false)
    }
  }

  const mapEstado = (estado: string): string => {
    switch (estado) {
      case "PENDIENTE":
      case "EN_PROCESO":
        return "Pendiente"
      case "FINALIZADO":
      case "PENDIENTE_APROBACION":
        return "En revisión"
      case "APROBADO":
        return "Aprobado"
      case "PARA_REPETIR":
        return "Rechazado"
      default:
        return estado
    }
  }

  const handleValidation = async (item: ValidationItem, action: "aprobar" | "repetir") => {
    setIsSubmitting(true)
    try {
      const tipoMap: Record<string, string> = {
        "Pureza": "pureza",
        "Germinación": "germinacion",
        "Tetrazolio": "tetrazolio",
        "PMS": "pms",
        "DOSN": "dosn"
      }

      await cambiarEstadoAnalisis(tipoMap[item.tipo], item.id, action)
      
      toast.success(`Análisis ${action === "aprobar" ? "aprobado" : "marcado para repetir"} exitosamente`)
      
      // Recargar análisis
      await cargarAnalisis()
      setSelectedItem(null)
    } catch (error: any) {
      console.error("Error al validar análisis:", error)
      toast.error(error?.message || "Error al validar análisis")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return "bg-green-100 text-green-800"
      case "Rechazado":
        return "bg-red-100 text-red-800"
      case "En revisión":
        return "bg-blue-100 text-blue-800"
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Aprobado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Rechazado":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "En revisión":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "Pendiente":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredItems = validationItems.filter((item) => {
    if (filterStatus === "all") return true
    return item.estado === filterStatus
  })

  const stats = {
    total: validationItems.length,
    pendientes: validationItems.filter((item) => item.estado === "Pendiente").length,
    aprobados: validationItems.filter((item) => item.estado === "Aprobado").length,
    rechazados: validationItems.filter((item) => item.estado === "Rechazado").length,
    enRevision: validationItems.filter((item) => item.estado === "En revisión").length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Link href="/reportes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Reportes
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-balance">Sistema de Validación</h1>
          <p className="text-muted-foreground text-pretty">
            Validación y autorización de lotes y análisis del laboratorio
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Revisión</p>
                <p className="text-3xl font-bold text-blue-600">{stats.enRevision}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                <p className="text-3xl font-bold text-green-600">{stats.aprobados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                <p className="text-3xl font-bold text-red-600">{stats.rechazados}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input placeholder="Buscar por número de análisis, muestra o cliente..." />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En revisión">En revisión</SelectItem>
                    <SelectItem value="Aprobado">Aprobado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Validation Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items para Validación ({filteredItems.length})</CardTitle>
              <CardDescription>Lista de análisis y lotes pendientes de validación</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-muted-foreground">Cargando análisis...</p>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay análisis para validar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedItem?.id === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{item.numeroAnalisis}</h3>
                              <p className="text-sm text-muted-foreground">{item.tipo}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Cliente</p>
                              <p className="font-medium">{item.cliente}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Muestra</p>
                              <p className="font-medium">{item.muestra}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Responsable</p>
                              <p className="font-medium flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.responsable}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Fecha Análisis</p>
                              <p className="font-medium">
                                {new Date(item.fechaAnalisis).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </div>

                          {item.observaciones && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">Observaciones</p>
                              <p className="font-medium text-red-600">{item.observaciones}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={getStatusColor(item.estado)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(item.estado)}
                              {item.estado}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Validation Panel */}
        <div className="space-y-6">
          {selectedItem ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de Validación</CardTitle>
                  <CardDescription>{selectedItem.numeroAnalisis}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo</p>
                      <p className="font-medium">{selectedItem.tipo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedItem.cliente}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Muestra</p>
                      <p className="font-medium">{selectedItem.muestra}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Responsable</p>
                      <p className="font-medium">{selectedItem.responsable}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha Análisis</p>
                      <p className="font-medium">
                        {new Date(selectedItem.fechaAnalisis).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado Actual</p>
                      <Badge className={getStatusColor(selectedItem.estado)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedItem.estado)}
                          {selectedItem.estado}
                        </div>
                      </Badge>
                    </div>
                    {selectedItem.observaciones && (
                      <div>
                        <p className="text-sm text-muted-foreground">Observaciones</p>
                        <p className="font-medium text-red-600">{selectedItem.observaciones}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(selectedItem.estado === "Pendiente" || selectedItem.estado === "En revisión") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones de Validación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Observaciones</label>
                      <Textarea
                        placeholder="Ingrese observaciones sobre la validación..."
                        value={validationNotes}
                        onChange={(e) => setValidationNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleValidation(selectedItem, "aprobar")}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleValidation(selectedItem, "repetir")}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Rechazar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Selecciona un item</h3>
                <p className="text-muted-foreground">
                  Selecciona un análisis o lote de la lista para ver los detalles y realizar la validación.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster richColors />
    </div>
  )
}
