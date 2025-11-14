"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Scale,
  ArrowLeft,
  Edit,
  Hash,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { PmsDTO, RepPmsDTO } from "@/app/models"
import { obtenerPmsPorId, finalizarAnalisis, aprobarAnalisis, marcarParaRepetir } from "@/app/services/pms-service"
import { obtenerRepeticionesPorPms, eliminarRepPms } from "@/app/services/repeticiones-service"
import { AnalysisHistoryCard } from "@/components/analisis/analysis-history-card"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"
import { AnalisisInfoGeneralCard } from "@/components/analisis/analisis-info-general-card"
import { formatearEstado } from "@/lib/utils/format-estado"

export default function DetallePMSPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
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
    return formatearEstado(estado)
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
                <span className="text-xs sm:text-sm">Volver</span>
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold">Análisis PMS #{analisis.analisisID}</h1>
                  <Badge variant={getEstadoBadgeVariant(analisis.estado)} className="text-xs px-2 py-0.5">
                    {formatearEstado(analisis.estado)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Ficha:</span>
                    <span>{analisis.idLote || analisis.analisisID}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Lote:</span>
                    <span>{analisis.lote || 'N/A'}</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role !== "observador" && (
                  <Link href={`/listado/analisis/pms/${id}/editar`}>
                    <Button size="sm" className="gap-1.5 h-9">
                      <Edit className="h-3.5 w-3.5" />
                      <span className="text-xs sm:text-sm">Editar análisis</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex justify-end mb-6">
          <TablaToleranciasButton
            pdfPath="/tablas-tolerancias/tabla-pms.pdf"
            title="Tabla de Tolerancias"
            className="w-full sm:w-auto"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
            <AnalisisInfoGeneralCard
              analisisID={analisis.analisisID}
              estado={analisis.estado}
              lote={analisis.lote}
              ficha={analisis.ficha}
              cultivarNombre={analisis.cultivarNombre}
              especieNombre={analisis.especieNombre}
              fechaInicio={analisis.fechaInicio}
              fechaFin={analisis.fechaFin}
              comentarios={analisis.comentarios}
            />

            {/* Repeticiones */}
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
                    <span className={`font-bold text-lg ${analisis.coefVariacion && analisis.coefVariacion <= 4
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
                  <div className={`p-3 rounded text-sm ${analisis.coefVariacion <= 4
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

            {/* Repeticiones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Repeticiones ({repeticiones.length})
                </CardTitle>
                <CardDescription>
                  Datos de pesaje por repetición y tanda
                </CardDescription>
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
                          <TableHead className="whitespace-nowrap">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {repeticiones.map((rep) => (
                          <TableRow key={rep.repPMSID}>
                            <TableCell className="font-medium whitespace-nowrap">#{rep.numRep}</TableCell>
                            <TableCell className="whitespace-nowrap">{rep.numTanda}</TableCell>
                            <TableCell className="whitespace-nowrap">{rep.peso ? `${rep.peso.toFixed(3)}g` : "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge variant={rep.valido ? "default" : rep.valido === false ? "destructive" : "secondary"}>
                                {rep.valido === true ? "✓ Válido" : rep.valido === false ? "✗ Inválido" : "Pendiente"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Historial de Actividades */}
            <AnalysisHistoryCard
              analisisId={analisis.analisisID}
              analisisTipo="pms"
              historial={analisis.historial}
            />
          </div>
        </div>
      </div>
    </div>
  )
}