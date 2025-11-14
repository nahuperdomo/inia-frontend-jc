"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  ArrowLeft,
  Edit,
  Calendar,
  BarChart3,
  AlertTriangle,
  Loader2,
  Sprout,
  Target,
  Thermometer,
  Calculator,
  Building,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { obtenerGerminacionPorId, obtenerTablasGerminacion } from "@/app/services/germinacion-service"
import type { GerminacionDTO } from "@/app/models/interfaces/germinacion"
import type { TablaGermDTO } from "@/app/models/interfaces/repeticiones"
import type { EstadoAnalisis } from "@/app/models/types/enums"
import { AnalysisHistoryCard } from "@/components/analisis/analysis-history-card"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"
import { AnalisisInfoGeneralCard } from "@/components/analisis/analisis-info-general-card"
import { formatearEstado } from "@/lib/utils/format-estado"

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
        month: 'long',
        day: 'numeric'
      })
    }

    // Si viene en otro formato, parsearlo de manera segura
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.warn("Error al formatear fecha:", fechaString, error)
    return fechaString
  }
}

export default function GerminacionDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const germinacionId = params.id as string
  const [germinacion, setGerminacion] = useState<GerminacionDTO | null>(null)
  const [tablas, setTablas] = useState<TablaGermDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar datos en paralelo
        const [germinacionData, tablasData] = await Promise.all([
          obtenerGerminacionPorId(Number.parseInt(germinacionId)),
          obtenerTablasGerminacion(Number.parseInt(germinacionId)).catch(() => []) // Si no hay tablas, devolver array vacío
        ])

        setGerminacion(germinacionData)
        setTablas(tablasData)
      } catch (err) {
        setError("Error al cargar los detalles del análisis de germinación")
        console.error("Error fetching germinacion:", err)
      } finally {
        setLoading(false)
      }
    }

    if (germinacionId) {
      fetchData()
    }
  }, [germinacionId])

  const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "REGISTRADO":
        return "default"
      case "EN_PROCESO":
        return "secondary"
      case "APROBADO":
        return "outline"
      case "PENDIENTE_APROBACION":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando análisis</p>
            <p className="text-sm text-muted-foreground">Obteniendo detalles de germinación...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !germinacion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el análisis</h2>
            <p className="text-muted-foreground text-pretty">{error || "El análisis solicitado no existe"}</p>
          </div>
          <Link href="/listado/analisis/germinacion">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calcular estadísticas de las tablas
  const tablasFinalizadas = tablas.filter(tabla => tabla.finalizada).length

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <Link href="/listado/analisis/germinacion">
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-8">
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs sm:text-sm">Volver</span>
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-balance">Análisis de Germinación #{germinacion.analisisID}</h1>
                  <Badge variant={getEstadoBadgeVariant(germinacion.estado)} className="text-xs px-2 py-0.5">
                    {formatearEstado(germinacion.estado)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Ficha:</span>
                    <span>{germinacion.idLote || germinacion.analisisID}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Lote:</span>
                    <span>{germinacion.lote}</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role !== "observador" && (
                  <Link href={`/listado/analisis/germinacion/${germinacion.analisisID}/editar`}>
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

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de Tabla de Tolerancias */}
        <div className="mb-6 flex justify-end">
          <TablaToleranciasButton
            pdfPath="/tablas-tolerancias/tabla-germinacion.pdf"
            title="Ver Tabla de Tolerancias"
            variant="outline"
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnalisisInfoGeneralCard
              analisisID={germinacion.analisisID}
              estado={germinacion.estado}
              lote={germinacion.lote}
              ficha={germinacion.ficha}
              cultivarNombre={germinacion.cultivarNombre}
              especieNombre={germinacion.especieNombre}
              fechaInicio={germinacion.fechaInicio}
              fechaFin={germinacion.fechaFin}
              comentarios={germinacion.comentarios}
            />

            {/* Resumen de Tablas de Germinación */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Sprout className="h-5 w-5 text-green-600" />
                  </div>
                  Tablas de Germinación Detalladas
                  <Badge variant="secondary" className="ml-auto">
                    {tablas.length} tablas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {tablas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay tablas de germinación registradas</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Estadísticas generales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{tablasFinalizadas}</p>
                        <p className="text-sm text-muted-foreground">Tablas Finalizadas</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{tablas.length}</p>
                        <p className="text-sm text-muted-foreground">Total de Tablas</p>
                      </div>
                    </div>

                    {/* Lista detallada de tablas */}
                    <div className="space-y-6">
                      {tablas.map((tabla) => (
                        <Card key={tabla.tablaGermID} className="border-2">
                          <CardHeader className="bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <Target className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold">Tabla {tabla.numeroTabla}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {tabla.tratamiento || "Sin tratamiento especificado"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={tabla.finalizada ? "default" : "secondary"}>
                                  {tabla.finalizada ? "Finalizada" : "En Proceso"}
                                </Badge>
                                {tabla.fechaFinal && (
                                  <Badge variant="outline">
                                    {formatearFechaLocal(tabla.fechaFinal)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-6">
                            {/* Información de Fechas de la Tabla */}
                            {(tabla.fechaInicioGerm || tabla.fechaUltConteo || tabla.numDias) && (
                              <div className="mb-6 bg-blue-50/50 border border-blue-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  Fechas y Duración
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  {tabla.fechaInicioGerm && (
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha Inicio</label>
                                      <p className="text-sm font-medium mt-1">{formatearFechaLocal(tabla.fechaInicioGerm)}</p>
                                    </div>
                                  )}
                                  {tabla.fechaUltConteo && (
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha Último Conteo</label>
                                      <p className="text-sm font-medium mt-1">{formatearFechaLocal(tabla.fechaUltConteo)}</p>
                                    </div>
                                  )}
                                  {tabla.numDias && (
                                    <div>
                                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Días de Análisis</label>
                                      <p className="text-sm font-medium mt-1">{tabla.numDias} días</p>
                                    </div>
                                  )}
                                </div>

                                {/* Fechas de Conteos */}
                                {tabla.fechaConteos && tabla.fechaConteos.length > 0 && (
                                  <div className="mt-4">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                                      Cronograma de Conteos ({tabla.fechaConteos.length})
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                      {tabla.fechaConteos.map((fecha, idx) => (
                                        <div key={idx} className="bg-white border border-blue-200 rounded px-2 py-1.5 text-center">
                                          <p className="text-xs text-muted-foreground">C{idx + 1}</p>
                                          <p className="text-xs font-medium">{new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Información General de la Tabla */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Método</label>
                                <p className="text-sm font-medium break-words">{tabla.metodo}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Temperatura</label>
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <Thermometer className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{tabla.temperatura}°C</span>
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Semillas/Rep</label>
                                <p className="text-sm font-medium">{tabla.numSemillasPRep}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Semillas</label>
                                <p className="text-sm font-medium">{tabla.total}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prefrío</label>
                                <p className="text-sm font-medium break-words">
                                  {tabla.tienePrefrio ? (
                                    <>
                                      <span className="text-green-600 font-semibold">Sí</span>
                                      {tabla.descripcionPrefrio && <span className="block text-xs mt-1">{tabla.descripcionPrefrio}</span>}
                                      {tabla.diasPrefrio > 0 && <span className="text-xs text-muted-foreground">({tabla.diasPrefrio} días)</span>}
                                    </>
                                  ) : (
                                    <span className="text-gray-500">No</span>
                                  )}
                                </p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pretratamiento</label>
                                <p className="text-sm font-medium break-words">
                                  {tabla.tienePretratamiento ? (
                                    <>
                                      <span className="text-green-600 font-semibold">Sí</span>
                                      {tabla.descripcionPretratamiento && <span className="block text-xs mt-1">{tabla.descripcionPretratamiento}</span>}
                                      {tabla.diasPretratamiento > 0 && <span className="text-xs text-muted-foreground">({tabla.diasPretratamiento} días)</span>}
                                    </>
                                  ) : (
                                    <span className="text-gray-500">No</span>
                                  )}
                                </p>
                              </div>
                              {tabla.productoYDosis && (
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Producto y Dosis</label>
                                  <p className="text-sm font-medium break-words">{tabla.productoYDosis}</p>
                                </div>
                              )}
                            </div>

                            {/* Promedios por Conteo (Calculados desde repeticiones) */}
                            {tabla.repGerm && tabla.repGerm.length > 0 && tabla.numeroConteos && (
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  Promedios de Normales por Conteo (Calculados)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                                  {Array.from({ length: tabla.numeroConteos }, (_, conteoIndex) => {
                                    const totalConteo = tabla.repGerm?.reduce((sum, rep) => {
                                      return sum + (rep.normales && rep.normales[conteoIndex] ? rep.normales[conteoIndex] : 0)
                                    }, 0) || 0
                                    const numRepeticiones = tabla.repGerm?.length || 1
                                    const promedio = totalConteo / numRepeticiones

                                    return (
                                      <div key={conteoIndex} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-blue-600 break-words">{promedio.toFixed(4)}</p>
                                        <p className="text-xs text-muted-foreground">Conteo {conteoIndex + 1}</p>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Promedios Sin Redondeo de todas las categorías */}
                            {tabla.repGerm && tabla.repGerm.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Calculator className="h-4 w-4" />
                                  Promedios Calculados (Sin Redondeo)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                    <p className="text-base sm:text-lg font-bold text-green-600 break-words">
                                      {((tabla.repGerm?.reduce((sum, rep) => {
                                        return sum + (rep.normales ? rep.normales.reduce((s, n) => s + n, 0) : 0)
                                      }, 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Promedio Normales</p>
                                  </div>
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                    <p className="text-base sm:text-lg font-bold text-orange-600 break-words">
                                      {((tabla.repGerm?.reduce((sum, rep) => sum + (rep.anormales || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Promedio Anormales</p>
                                  </div>
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                    <p className="text-base sm:text-lg font-bold text-yellow-600 break-words">
                                      {((tabla.repGerm?.reduce((sum, rep) => sum + (rep.duras || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Promedio Duras</p>
                                  </div>
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                    <p className="text-base sm:text-lg font-bold text-blue-600 break-words">
                                      {((tabla.repGerm?.reduce((sum, rep) => sum + (rep.frescas || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Promedio Frescas</p>
                                  </div>
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                    <p className="text-base sm:text-lg font-bold text-gray-600 break-words">
                                      {((tabla.repGerm?.reduce((sum, rep) => sum + (rep.muertas || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Promedio Muertas</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Porcentajes Calculados (Sin Redondeo) */}
                            {tabla.repGerm && tabla.repGerm.length > 0 && (
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Calculator className="h-4 w-4" />
                                  Porcentajes Calculados (Sin Redondeo)
                                </h4>
                                {(() => {
                                  // Calcular totales reales desde las repeticiones
                                  const totalNormales = tabla.repGerm?.reduce((sum, rep) => {
                                    return sum + (rep.normales ? rep.normales.reduce((s, n) => s + n, 0) : 0)
                                  }, 0) || 0
                                  const totalAnormales = tabla.repGerm?.reduce((sum, rep) => sum + (rep.anormales || 0), 0) || 0
                                  const totalDuras = tabla.repGerm?.reduce((sum, rep) => sum + (rep.duras || 0), 0) || 0
                                  const totalFrescas = tabla.repGerm?.reduce((sum, rep) => sum + (rep.frescas || 0), 0) || 0
                                  const totalMuertas = tabla.repGerm?.reduce((sum, rep) => sum + (rep.muertas || 0), 0) || 0
                                  const totalGeneral = totalNormales + totalAnormales + totalDuras + totalFrescas + totalMuertas

                                  return (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-green-600 break-words">
                                          {totalGeneral > 0 ? ((totalNormales / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">% Normales</p>
                                      </div>
                                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-orange-600 break-words">
                                          {totalGeneral > 0 ? ((totalAnormales / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">% Anormales</p>
                                      </div>
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-yellow-600 break-words">
                                          {totalGeneral > 0 ? ((totalDuras / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">% Duras</p>
                                      </div>
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-blue-600 break-words">
                                          {totalGeneral > 0 ? ((totalFrescas / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">% Frescas</p>
                                      </div>
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-gray-600 break-words">
                                          {totalGeneral > 0 ? ((totalMuertas / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                        </p>
                                        <p className="text-xs text-muted-foreground">% Muertas</p>
                                      </div>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}

                            {/* Porcentajes con Redondeo */}
                            {(tabla.porcentajeNormalesConRedondeo !== undefined ||
                              tabla.porcentajeAnormalesConRedondeo !== undefined ||
                              tabla.porcentajeDurasConRedondeo !== undefined ||
                              tabla.porcentajeFrescasConRedondeo !== undefined ||
                              tabla.porcentajeMuertasConRedondeo !== undefined) && (
                                <div className="mb-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="text-sm font-semibold">
                                      Porcentajes con Redondeo
                                    </h4>
                                    <Button variant="outline" size="sm" className="h-8">
                                      Editar
                                    </Button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                    {tabla.porcentajeNormalesConRedondeo !== undefined && (
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-green-600 break-words">{tabla.porcentajeNormalesConRedondeo}%</p>
                                        <p className="text-xs text-muted-foreground">Normales</p>
                                      </div>
                                    )}
                                    {tabla.porcentajeAnormalesConRedondeo !== undefined && (
                                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-orange-600 break-words">{tabla.porcentajeAnormalesConRedondeo}%</p>
                                        <p className="text-xs text-muted-foreground">Anormales</p>
                                      </div>
                                    )}
                                    {tabla.porcentajeDurasConRedondeo !== undefined && (
                                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-yellow-600 break-words">{tabla.porcentajeDurasConRedondeo}%</p>
                                        <p className="text-xs text-muted-foreground">Duras</p>
                                      </div>
                                    )}
                                    {tabla.porcentajeFrescasConRedondeo !== undefined && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-blue-600 break-words">{tabla.porcentajeFrescasConRedondeo}%</p>
                                        <p className="text-xs text-muted-foreground">Frescas</p>
                                      </div>
                                    )}
                                    {tabla.porcentajeMuertasConRedondeo !== undefined && (
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                        <p className="text-sm sm:text-base font-bold text-gray-600 break-words">{tabla.porcentajeMuertasConRedondeo}%</p>
                                        <p className="text-xs text-muted-foreground">Muertas</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Repeticiones */}
                            {tabla.repGerm && tabla.repGerm.length > 0 && (
                              <div className="mb-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-sm font-semibold">
                                      Repeticiones de Tabla
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1">{tabla.repGerm.length} repeticiones</p>
                                  </div>
                                  <Button variant="outline" size="sm" className="h-8">
                                    Editar
                                  </Button>
                                </div>
                                <div className="overflow-x-auto">
                                  <div className="min-w-full">
                                    {/* Vista móvil - cards */}
                                    <div className="block sm:hidden space-y-3">
                                      {tabla.repGerm.map((rep) => (
                                        <div key={rep.repGermID} className="bg-gray-50 border rounded-lg p-3">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="font-semibold text-sm">Rep {rep.numRep}</span>
                                            <span className="text-xs text-muted-foreground font-semibold">Total: {rep.total}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                              <span className="font-medium text-green-700">Normales:</span>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {rep.normales.map((valor, idx) => (
                                                  <span key={idx} className="inline-block bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-semibold">
                                                    {valor}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium text-orange-700">Anormales:</span>
                                              <span className="block mt-1 font-semibold">{rep.anormales}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-yellow-700">Duras:</span>
                                              <span className="block mt-1 font-semibold">{rep.duras}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-blue-700">Frescas:</span>
                                              <span className="block mt-1 font-semibold">{rep.frescas}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Muertas:</span>
                                              <span className="block mt-1 font-semibold">{rep.muertas}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Vista desktop - tabla */}
                                    <table className="hidden sm:table w-full text-sm">
                                      <thead>
                                        <tr className="border-b bg-muted/50">
                                          <th className="text-left p-2 font-medium min-w-[50px]">Rep</th>
                                          <th className="text-left p-2 font-medium min-w-[100px]">Normales</th>
                                          <th className="text-left p-2 font-medium min-w-[80px]">Anormales</th>
                                          <th className="text-left p-2 font-medium min-w-[60px]">Duras</th>
                                          <th className="text-left p-2 font-medium min-w-[60px]">Frescas</th>
                                          <th className="text-left p-2 font-medium min-w-[60px]">Muertas</th>
                                          <th className="text-left p-2 font-medium min-w-[60px]">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {tabla.repGerm.map((rep) => (
                                          <tr key={rep.repGermID} className="border-b">
                                            <td className="p-2 font-semibold">{rep.numRep}</td>
                                            <td className="p-2">
                                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {rep.normales.map((valor, idx) => (
                                                  <span key={idx} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs whitespace-nowrap font-semibold">
                                                    {valor}
                                                  </span>
                                                ))}
                                              </div>
                                            </td>
                                            <td className="p-2 font-semibold">{rep.anormales}</td>
                                            <td className="p-2 font-semibold">{rep.duras}</td>
                                            <td className="p-2 font-semibold">{rep.frescas}</td>
                                            <td className="p-2 font-semibold">{rep.muertas}</td>
                                            <td className="p-2 font-bold text-gray-900">{rep.total}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Valores de Germinación por Instituto */}
                            {tabla.valoresGerm && tabla.valoresGerm.length > 0 && (
                              <div>
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="text-sm font-semibold">
                                    Valores INIA/INASE
                                  </h4>
                                  <Button variant="outline" size="sm" className="h-8">
                                    Editar
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                  {tabla.valoresGerm.map((valor, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-purple-50/50 border-purple-200">
                                      <div className="flex items-center gap-2 mb-3">
                                        <Building className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                        <span className="font-medium text-purple-700 break-words">{valor.instituto}</span>
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Normales</label>
                                          <p className="font-medium break-words">{valor.normales}%</p>
                                        </div>
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Anormales</label>
                                          <p className="font-medium break-words">{valor.anormales}%</p>
                                        </div>
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Duras</label>
                                          <p className="font-medium break-words">{valor.duras}%</p>
                                        </div>
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Frescas</label>
                                          <p className="font-medium break-words">{valor.frescas}%</p>
                                        </div>
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Muertas</label>
                                          <p className="font-medium break-words">{valor.muertas}%</p>
                                        </div>
                                        <div className="text-center">
                                          <label className="text-xs text-muted-foreground block">Germinación</label>
                                          <p className="font-semibold text-base sm:text-lg text-green-600 break-words">{valor.germinacion}%</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Historial de Actividades */}
            <AnalysisHistoryCard
              analisisId={germinacion.analisisID}
              analisisTipo="germinacion"
              historial={germinacion.historial}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
