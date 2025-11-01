"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useConfirm } from "@/lib/hooks/useConfirm"

import {
  ArrowLeft,
  Edit,
  Download,
  Calendar,
  FileText,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { obtenerDosnPorId } from "@/app/services/dosn-service"
import type { DosnDTO } from "@/app/models"
import type { EstadoAnalisis, TipoDOSN, TipoListado } from "@/app/models/types/enums"
import { AnalysisHistoryCard } from "@/components/analisis/analysis-history-card"
import * as especiesService from "@/app/services/especie-service"
import type { EspecieDTO } from "@/app/models"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"


// Función helper para mostrar nombres legibles de tipos de listado
const getTipoListadoDisplay = (tipo: TipoListado) => {
  switch (tipo) {
    case "MAL_TOLERANCIA_CERO":
      return "Maleza Tolerancia Cero"
    case "MAL_TOLERANCIA":
      return "Maleza Tolerancia"
    case "MAL_COMUNES":
      return "Malezas Comunes"
    case "BRASSICA":
      return "Brassica"
    case "OTROS":
      return "Otros Cultivos"
    default:
      return tipo
  }
}

// Función helper para obtener el color del badge según el tipo
const getTipoListadoBadgeColor = (tipo: TipoListado) => {
  switch (tipo) {
    case "MAL_TOLERANCIA_CERO":
      return "bg-red-100 text-red-700 border-red-200"
    case "MAL_TOLERANCIA":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "MAL_COMUNES":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "BRASSICA":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "OTROS":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

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

export default function DosnDetailPage() {
  const params = useParams()
  const { confirm } = useConfirm()
  const dosnId = params.id as string
  const [dosn, setDosn] = useState<DosnDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDosn = async () => {
      try {
        setLoading(true)
        const data = await obtenerDosnPorId(Number.parseInt(dosnId))
        setDosn(data)
      } catch (err) {
        setError("Error al cargar los detalles del análisis DOSN")
        console.error("Error fetching DOSN:", err)
      } finally {
        setLoading(false)
      }
    }

    if (dosnId) {
      fetchDosn()
    }
  }, [dosnId])

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

  const formatTipoDOSN = (tipos: TipoDOSN[] | undefined) => {
    if (!tipos || tipos.length === 0) return "No especificado"
    return tipos
      .map((tipo) => {
        switch (tipo) {
          case "COMPLETO":
            return "Completo"
          case "REDUCIDO":
            return "Reducido"
          case "LIMITADO":
            return "Limitado"
          case "REDUCIDO_LIMITADO":
            return "Reducido Limitado"
          default:
            return tipo
        }
      })
      .join(", ")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando análisis</p>
            <p className="text-sm text-muted-foreground">Obteniendo detalles del DOSN...</p>
          </div>
        </div>
      </div>
    
    )
  }

  if (error || !dosn) {
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
          <Link href="/listado/analisis/dosn">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header sticky solo dentro del área con scroll */}
      <div className="bg-background border-b sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6">
          <Link href="/listado/analisis/dosn">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-bold text-balance">
                  Análisis DOSN #{dosn.analisisID}
                </h1>
                <Badge
                  variant={getEstadoBadgeVariant(dosn.estado)}
                  className="text-sm px-3 py-1"
                >
                  {dosn.estado}
                </Badge>
              </div>
              <p className="text-base text-muted-foreground text-pretty">
                Determinación de otras semillas nocivas • Lote {dosn.lote}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/listado/analisis/dosn/${dosn.analisisID}/editar`}>
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Edit className="h-4 w-4" />
                  Editar análisis
                </Button>
              </Link>
              {/* Botón Finalizar: muestra confirmación y realiza validación cliente */}
              <Button
                size="lg"
                variant="destructive"
                className="gap-2 w-full sm:w-auto"
                onClick={async () => {
                  try {
                    // Validación cliente (mismos criterios que el servidor)
                    const tieneINIA = !!(dosn.fechaINIA && dosn.gramosAnalizadosINIA && Number(dosn.gramosAnalizadosINIA) > 0)
                    const tieneINASE = !!(dosn.fechaINASE && dosn.gramosAnalizadosINASE && Number(dosn.gramosAnalizadosINASE) > 0)
                    const tieneCuscuta = !!(dosn.cuscutaRegistros && dosn.cuscutaRegistros.length > 0 && dosn.cuscutaRegistros.some(r => (r.cuscuta_g && Number(r.cuscuta_g) > 0) || (r.cuscutaNum && Number(r.cuscutaNum) > 0)))
                    const tieneListados = !!(dosn.listados && dosn.listados.length > 0)

                    if (!tieneINIA && !tieneINASE && !tieneCuscuta && !tieneListados) {
                      // Mostrar un modal sencillo con confirmación del usuario
                      const confirmed = await confirm({
                        title: "Finalizar sin evidencia",
                        message: "No hay evidencia (INIA/INASE/listados/cuscuta). ¿Desea intentar finalizar de todas formas?",
                        confirmText: "Finalizar",
                        cancelText: "Cancelar",
                        variant: "warning"
                      })
                      
                      if (!confirmed) {
                        return
                      }
                    }

                    // Llamada al servicio
                    // Importar dinamicamente para evitar ciclos si no existe
                    const { finalizarAnalisis } = await import('@/app/services/dosn-service')
                    await finalizarAnalisis(Number.parseInt(dosn.analisisID.toString()))
                    // Refrescar la página para mostrar el nuevo estado
                    window.location.reload()
                  } catch (err: any) {
                    alert(err?.message || 'Error al finalizar el análisis')
                  }
                }}
              >
                Finalizar Análisis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Compensar altura del header sticky */}
    <div className="pt-4">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de Tabla de Tolerancias */}
        <div className="mb-6 flex justify-end">
          <TablaToleranciasButton
            pdfPath="/tablas-tolerancias/tabla-dosn.pdf"
            title="Ver Tabla de Tolerancias"
            variant="outline"
            size="sm"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden bg-background">
              <CardHeader className="bg-background border-b sticky top-[20px] z-20">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      ID Análisis
                    </label>
                    <p className="text-2xl font-bold">{dosn.analisisID}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lote</label>
                    <p className="text-2xl font-semibold">{dosn.lote}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fecha de Inicio
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {formatearFechaLocal(dosn.fechaInicio)}
                      </p>
                    </div>
                  </div>

                  {dosn.fechaFin && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha de Finalización
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-medium">
                          {formatearFechaLocal(dosn.fechaFin)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Cumple Estándar
                    </label>
                    <div className="flex items-center gap-3">
                      {dosn.cumpleEstandar !== undefined ? (
                        <>
                          <div
                            className={`p-2 rounded-lg ${dosn.cumpleEstandar ? "bg-green-500/10" : "bg-destructive/10"}`}
                          >
                            {dosn.cumpleEstandar ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <span
                            className={`text-lg font-semibold ${dosn.cumpleEstandar ? "text-green-600" : "text-destructive"}`}
                          >
                            {dosn.cumpleEstandar ? "Cumple con el estándar" : "No cumple con el estándar"}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg text-muted-foreground">Pendiente de evaluación</span>
                      )}
                    </div>
                  </div>
                </div>

                {dosn.comentarios && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Comentarios
                      </label>
                      <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">{dosn.comentarios}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {(dosn.fechaINIA || dosn.gramosAnalizadosINIA || dosn.tipoINIA) && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    Análisis INIA
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {dosn.fechaINIA && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Fecha
                        </label>
                        <p className="text-lg font-semibold">
                          {formatearFechaLocal(dosn.fechaINIA)}
                        </p>
                      </div>
                    )}
                    {dosn.gramosAnalizadosINIA && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Gramos Analizados
                        </label>
                        <p className="text-lg font-semibold">{dosn.gramosAnalizadosINIA} g</p>
                      </div>
                    )}
                    {dosn.tipoINIA && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Tipo
                        </label>
                        <p className="text-lg font-semibold">{formatTipoDOSN(dosn.tipoINIA)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {(dosn.fechaINASE || dosn.gramosAnalizadosINASE || dosn.tipoINASE) && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    Análisis INASE
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {dosn.fechaINASE && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Fecha
                        </label>
                        <p className="text-lg font-semibold">
                          {formatearFechaLocal(dosn.fechaINASE)}
                        </p>
                      </div>
                    )}
                    {dosn.gramosAnalizadosINASE && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Gramos Analizados
                        </label>
                        <p className="text-lg font-semibold">{dosn.gramosAnalizadosINASE} g</p>
                      </div>
                    )}
                    {dosn.tipoINASE && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Tipo
                        </label>
                        <p className="text-lg font-semibold">{formatTipoDOSN(dosn.tipoINASE)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {dosn.cuscutaRegistros && dosn.cuscutaRegistros.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    Análisis de Cuscuta
                    <Badge variant="secondary" className="ml-auto">
                      {dosn.cuscutaRegistros.length} registro{dosn.cuscutaRegistros.length > 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dosn.cuscutaRegistros.map((registro, index) => (
                      <Card key={registro.id || index} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-muted-foreground">
                              Registro #{index + 1}
                            </h4>
                            {registro.instituto && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                {registro.instituto}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {registro.instituto && (
                              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-lg p-4 text-center space-y-2">
                                <p className="text-2xl font-bold text-blue-600">{registro.instituto}</p>
                                <p className="text-sm font-medium text-muted-foreground">Instituto Analista</p>
                              </div>
                            )}
                            {registro.cuscuta_g !== undefined && registro.cuscuta_g !== null && (
                              <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-lg p-4 text-center space-y-2">
                                <p className="text-3xl font-bold text-orange-600">{registro.cuscuta_g}</p>
                                <p className="text-sm font-medium text-muted-foreground">Gramos de Cuscuta</p>
                              </div>
                            )}
                            {registro.cuscutaNum !== undefined && registro.cuscutaNum !== null && (
                              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-lg p-4 text-center space-y-2">
                                <p className="text-3xl font-bold text-red-600">{registro.cuscutaNum}</p>
                                <p className="text-sm font-medium text-muted-foreground">Número de Semillas</p>
                              </div>
                            )}
                            {registro.fechaCuscuta && (
                              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-lg p-4 text-center space-y-2">
                                <p className="text-lg font-bold text-purple-600">{formatearFechaLocal(registro.fechaCuscuta)}</p>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de Análisis</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {dosn.listados && dosn.listados.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    Listados
                    <Badge variant="secondary" className="ml-auto">
                      {dosn.listados.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dosn.listados.map((listado, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 border rounded-xl p-5 hover:bg-muted/50 transition-colors"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Especie
                            </label>
                            <p className="text-base font-semibold">
                              {/* Mostrar catalogo (malezas) o especie (otros cultivos) */}
                              {listado.catalogo?.nombreComun || 
                               listado.especie?.nombreComun ||
                               (listado.listadoTipo === "BRASSICA" ? "Sin especificación" : "--")}
                            </p>
                            {/* Nombre científico de malezas */}
                            {listado.catalogo?.nombreCientifico && (
                              <p className="text-sm text-muted-foreground italic">
                                {listado.catalogo.nombreCientifico}
                              </p>
                            )}
                            {/* Nombre científico de especies/cultivos */}
                            {listado.especie?.nombreCientifico && (
                              <p className="text-sm text-muted-foreground italic">
                                {listado.especie.nombreCientifico}
                              </p>
                            )}
                            {listado.listadoTipo === "BRASSICA" && !listado.catalogo?.nombreComun && !listado.especie?.nombreComun && (
                              <p className="text-sm text-muted-foreground">
                                Las brassicas no requieren especificación de catálogo
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Tipo
                            </label>
                            <Badge variant="outline" className={`font-medium ${getTipoListadoBadgeColor(listado.listadoTipo as TipoListado)}`}>
                              {getTipoListadoDisplay(listado.listadoTipo as TipoListado)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Instituto
                            </label>
                            <p className="text-base font-medium">{listado.listadoInsti}</p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Número
                            </label>
                            <p className="text-base font-semibold">{listado.listadoNum}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Historial de Actividades */}
            <AnalysisHistoryCard
              analisisId={dosn.analisisID}
              analisisTipo="dosn"
              historial={dosn.historial}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
