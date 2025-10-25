"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Scale, 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Hash, 
  BarChart3, 
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Calculator
} from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { PmsDTO, RepPmsDTO } from "@/app/models"
import { obtenerPmsPorId, finalizarAnalisis, aprobarAnalisis, marcarParaRepetir } from "@/app/services/pms-service"
import { obtenerRepeticionesPorPms, eliminarRepPms } from "@/app/services/repeticiones-service"

export default function DetallePMSPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [analisis, setAnalisis] = useState<PmsDTO | null>(null)
  const [repeticiones, setRepeticiones] = useState<RepPmsDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Cargar datos del análisis
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [analisisData, repeticionesData] = await Promise.all([
          obtenerPmsPorId(parseInt(id)),
          obtenerRepeticionesPorPms(parseInt(id))
        ])
        
        setAnalisis(analisisData)
        setRepeticiones(repeticionesData)
      } catch (err: any) {
        const errorMsg = err?.message || "No se pudo cargar el análisis"
        setError(errorMsg)
        toast.error('Error al cargar análisis', {
          description: errorMsg,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleFinalizarAnalisis = async () => {
    if (!analisis?.analisisID) return
    
    setActionLoading("finalizar")
    try {
      const result = await finalizarAnalisis(analisis.analisisID)
      setAnalisis(result)
      toast.success('Análisis finalizado exitosamente')
    } catch (err: any) {
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAprobarAnalisis = async () => {
    if (!analisis?.analisisID) return
    
    setActionLoading("aprobar")
    try {
      const result = await aprobarAnalisis(analisis.analisisID)
      setAnalisis(result)
      toast.success('Análisis aprobado exitosamente')
    } catch (err: any) {
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarcarParaRepetir = async () => {
    if (!analisis?.analisisID) return
    
    setActionLoading("repetir")
    try {
      const result = await marcarParaRepetir(analisis.analisisID)
      setAnalisis(result)
      toast.success('Análisis marcado para repetir')
    } catch (err: any) {
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis para repetir",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEliminarRepeticion = async (repId: number) => {
    if (!analisis?.analisisID) return
    
    if (!confirm("¿Estás seguro de que deseas eliminar esta repetición?")) {
      return
    }

    try {
      await eliminarRepPms(analisis.analisisID, repId)
      const nuevasRepeticiones = await obtenerRepeticionesPorPms(analisis.analisisID)
      setRepeticiones(nuevasRepeticiones)
      toast.success('Repetición eliminada exitosamente')
    } catch (err: any) {
      toast.error('Error al eliminar repetición', {
        description: err?.message || "No se pudo eliminar la repetición",
      })
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
      case "FINALIZADO":
      case "PENDIENTE_APROBACION":
        return "secondary"
      case "PENDIENTE":
      case "PARA_REPETIR":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getEstadoDisplay = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado"
      case "EN_PROCESO":
        return "En Proceso"
      case "FINALIZADO":
        return "Finalizado"
      case "PENDIENTE_APROBACION":
        return "Pendiente Aprobación"
      case "PENDIENTE":
        return "Pendiente"
      case "PARA_REPETIR":
        return "Para Repetir"
      default:
        return estado
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return <CheckCircle className="h-4 w-4" />
      case "EN_PROCESO":
      case "FINALIZADO":
      case "PENDIENTE_APROBACION":
        return <Clock className="h-4 w-4" />
      case "PENDIENTE":
      case "PARA_REPETIR":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando análisis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analisis) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/listado/analisis/pms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Listado
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="h-8 w-8" />
              <div>
                <h4 className="font-medium">Error al cargar análisis</h4>
                <p className="text-sm">{error || "Análisis no encontrado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-right" richColors closeButton />
      
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <Link href="/listado/analisis/pms">
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-8">
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs sm:text-sm">Volver al Listado</span>
              </Button>
            </Link>

            <div className="flex flex-col gap-2">
              <div className="space-y-1 text-center lg:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Análisis PMS #{analisis.analisisID}</h1>
                  <Badge variant={getEstadoBadgeVariant(analisis.estado)} className="text-xs px-2 py-0.5">
                    {getEstadoDisplay(analisis.estado)}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Detalle del análisis de peso de mil semillas • Lote {analisis.lote || 'N/A'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-end flex-wrap">
                <Link href={`/listado/analisis/pms/${id}/editar`} className="w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="w-full h-9">
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    <span className="text-xs sm:text-sm">Editar</span>
                  </Button>
                </Link>
                {analisis.estado === "PENDIENTE_APROBACION" && (
                  <Button 
                    onClick={handleFinalizarAnalisis}
                    disabled={actionLoading === "finalizar"}
                    size="sm"
                    className="h-9"
                  >
                    <span className="text-xs sm:text-sm">{actionLoading === "finalizar" ? "Finalizando..." : "Finalizar"}</span>
                  </Button>
                )}
                {(analisis.estado === "EN_PROCESO" || analisis.estado === "APROBADO") && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleMarcarParaRepetir}
                      disabled={actionLoading === "repetir"}
                      size="sm"
                      className="h-9"
                    >
                      <span className="text-xs sm:text-sm">{actionLoading === "repetir" ? "Marcando..." : "Marcar para Repetir"}</span>
                    </Button>
                    <Button 
                      onClick={handleAprobarAnalisis}
                      disabled={actionLoading === "aprobar"}
                      size="sm"
                      className="h-9"
                    >
                      <span className="text-xs sm:text-sm">{actionLoading === "aprobar" ? "Aprobando..." : "Aprobar"}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Información del Análisis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID:</span>
                  <span className="font-medium">PMS-{analisis.analisisID}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lote:</span>
                  <span className="font-medium">{analisis.lote || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Lote:</span>
                  <span className="font-medium">{analisis.idLote || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cultivar:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Especie:</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={getEstadoBadgeVariant(analisis.estado || "")}>
                    <div className="flex items-center gap-1">
                      {getEstadoIcon(analisis.estado || "")}
                      {getEstadoDisplay(analisis.estado || "")}
                    </div>
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha Inicio:</span>
                  <span className="font-medium">
                    {analisis.fechaInicio 
                      ? new Date(analisis.fechaInicio).toLocaleDateString("es-ES")
                      : "-"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fecha Fin:</span>
                  <span className="font-medium">
                    {analisis.fechaFin 
                      ? new Date(analisis.fechaFin).toLocaleDateString("es-ES")
                      : "-"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Semilla Brozosa:</span>
                  <Badge variant={analisis.esSemillaBrozosa ? "destructive" : "default"}>
                    {analisis.esSemillaBrozosa ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {analisis.comentarios && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Observaciones:</span>
                <p className="text-sm bg-gray-50 p-3 rounded">{analisis.comentarios}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Repeticiones Esperadas:</span>
                <span className="font-bold text-lg">{analisis.numRepeticionesEsperadas || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Número de Tandas:</span>
                <span className="font-bold text-lg">{analisis.numTandas || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Promedio 100g:</span>
                <span className="font-bold text-lg text-blue-600">
                  {analisis.promedio100g ? `${analisis.promedio100g.toFixed(2)}g` : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Desviación Estándar:</span>
                <span className="font-bold text-lg">
                  {analisis.desvioStd ? `${analisis.desvioStd.toFixed(3)}` : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Coef. Variación:</span>
                <span className={`font-bold text-lg ${
                  analisis.coefVariacion && analisis.coefVariacion <= 4 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {analisis.coefVariacion ? `${analisis.coefVariacion.toFixed(2)}%` : "-"}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">PMS Final:</span>
                  <span className="font-bold text-xl text-green-600">
                    {analisis.pmsconRedon ? `${analisis.pmsconRedon.toFixed(2)}g` : "-"}
                  </span>
                </div>
              </div>
            </div>

            {analisis.coefVariacion && (
              <div className={`p-3 rounded text-sm ${
                analisis.coefVariacion <= 4 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {analisis.coefVariacion <= 4 ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {analisis.coefVariacion <= 4 ? "Criterio Cumplido" : "Criterio No Cumplido"}
                  </span>
                </div>
                <p className="text-xs mt-1">
                  El coeficiente de variación debe ser ≤ 4% para ser válido
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Repeticiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Repeticiones ({repeticiones.length})
              </CardTitle>
              <CardDescription>
                Datos de pesaje por repetición y tanda
              </CardDescription>
            </div>
            {analisis.estado !== "APROBADO" && (
              <Link href={`/listado/analisis/pms/${id}/editar`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Repetición
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {repeticiones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay repeticiones registradas aún.</p>
              {analisis.estado !== "APROBADO" && (
                <p className="text-sm mt-2">
                  Puedes agregar repeticiones editando el análisis.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Repetición</TableHead>
                    <TableHead className="whitespace-nowrap">Tanda</TableHead>
                    <TableHead className="whitespace-nowrap">Peso (g)</TableHead>
                    <TableHead className="whitespace-nowrap">Válido</TableHead>
                    {analisis.estado !== "APROBADO" && <TableHead className="whitespace-nowrap">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repeticiones.map((rep) => (
                    <TableRow key={rep.repPMSID}>
                      <TableCell className="font-medium whitespace-nowrap">#{rep.numRep}</TableCell>
                      <TableCell className="whitespace-nowrap">{rep.numTanda}</TableCell>
                      <TableCell className="whitespace-nowrap">{rep.peso ? `${rep.peso.toFixed(3)}g` : "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant={rep.valido ? "default" : "destructive"}>
                          {rep.valido ? "Válido" : "Inválido"}
                        </Badge>
                      </TableCell>
                      {analisis.estado !== "APROBADO" && (
                        <TableCell className="whitespace-nowrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleEliminarRepeticion(rep.repPMSID)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados Calculados */}
      {analisis.promedio100g && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resultados Calculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Promedio 100g</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analisis.promedio100g.toFixed(4)}g
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Desviación Estándar</p>
                <p className="text-2xl font-bold">
                  {analisis.desvioStd?.toFixed(4) || "-"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Coef. Variación</p>
                <p className={`text-2xl font-bold ${
                  analisis.coefVariacion && analisis.coefVariacion <= (analisis.esSemillaBrozosa ? 6 : 4)
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {analisis.coefVariacion?.toFixed(4)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Repeticiones</p>
                <p className="text-2xl font-bold text-purple-600">
                  {repeticiones.length}
                </p>
              </div>
            </div>

            {/* PMS Final - Solo mostrar si hay repeticiones válidas */}
            {analisis.pmssinRedon && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Peso de Mil Semillas (PMS)
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PMS Sin Redondeo */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        PMS sin Redondeo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {analisis.pmssinRedon.toFixed(4)}g
                        </div>
                        <p className="text-sm text-blue-700">
                          Valor calculado automáticamente
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* PMS Con Redondeo */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        PMS con Redondeo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analisis.pmsconRedon ? (
                        <div className="text-center p-4 bg-green-100 rounded-md border border-green-300">
                          <div className="text-2xl font-bold text-green-800 mb-1">
                            {analisis.pmsconRedon}g
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            ✓ Valor Final Confirmado
                          </span>
                        </div>
                      ) : (
                        <div className="text-center p-4 border-2 border-dashed border-green-300 rounded-md">
                          <p className="text-muted-foreground font-medium mb-2">Valor no establecido</p>
                          <p className="text-sm text-muted-foreground">
                            El valor final debe ser establecido en modo edición.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}