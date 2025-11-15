"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useConfirm } from "@/lib/hooks/useConfirm"
import { useAuth } from "@/components/auth-provider"

import {
  ArrowLeft,
  Edit,
  FileText,
  BarChart3,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { obtenerDosnPorId } from "@/app/services/dosn-service"
import type { DosnDTO } from "@/app/models"
import type { EstadoAnalisis, TipoDOSN, TipoListado } from "@/app/models/types/enums"
import { AnalysisHistoryCard } from "@/components/analisis/analysis-history-card"

import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"
import { AnalisisInfoGeneralCard } from "@/components/analisis/analisis-info-general-card"
import { formatEstado as formatearEstado, formatearFechaLocal, getEstadoBadgeVariant, getTipoListadoDisplay, getTipoListadoBadgeColor } from "@/lib/utils/format-helpers"

export default function DosnDetailPage() {
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
  const { user } = useAuth()
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

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-balance">
                    Análisis DOSN #{dosn.analisisID}
                  </h1>
                  <Badge
                    variant={getEstadoBadgeVariant(dosn.estado)}
                    className="text-sm px-3 py-1"
                  >
                    {formatearEstado(dosn.estado)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Ficha:</span>
                    <span>{dosn.idLote || dosn.analisisID}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Lote:</span>
                    <span>{dosn.lote}</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {user?.role !== "observador" && (
                  <Link href={`/listado/analisis/dosn/${dosn.analisisID}/editar`}>
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
              {/* Información General */}
              <AnalisisInfoGeneralCard
                analisisID={dosn.analisisID}
                estado={dosn.estado}
                lote={dosn.lote}
                ficha={dosn.ficha}
                cultivarNombre={dosn.cultivarNombre}
                especieNombre={dosn.especieNombre}
                fechaInicio={dosn.fechaInicio}
                fechaFin={dosn.fechaFin}
                cumpleEstandar={dosn.cumpleEstandar}
                comentarios={dosn.comentarios}
              />

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

              {/* Análisis INASE - Siempre mostrar */}
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
                  {!dosn.fechaINASE && !dosn.gramosAnalizadosINASE && (!dosn.tipoINASE || dosn.tipoINASE.length === 0) ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Aún no se han ingresado valores para INASE</p>
                    </div>
                  ) : (
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
                      {dosn.tipoINASE && dosn.tipoINASE.length > 0 && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Tipo
                          </label>
                          <p className="text-lg font-semibold">{formatTipoDOSN(dosn.tipoINASE)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                      {dosn.cuscutaRegistros.map((registro, index) => {
                        const noContiene = (!registro.cuscuta_g || registro.cuscuta_g === 0) && (!registro.cuscutaNum || registro.cuscutaNum === 0);

                        return (
                          <Card key={registro.id || index} className="border-2">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-muted-foreground">
                                  Registro #{index + 1}
                                </h4>
                                <div className="flex items-center gap-2">
                                  {noContiene && (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                      No contiene
                                    </Badge>
                                  )}
                                  {registro.instituto && (
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                      {registro.instituto}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {noContiene ? (
                                <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-200/50 rounded-lg p-6 text-center space-y-2">
                                  <p className="text-lg font-semibold text-gray-600">No se detectó Cuscuta en la muestra</p>
                                  <p className="text-sm text-muted-foreground">Instituto: {registro.instituto}</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {registro.instituto && (
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-lg p-4 text-center space-y-2">
                                      <p className="text-2xl font-bold text-blue-600">{registro.instituto}</p>
                                      <p className="text-sm font-medium text-muted-foreground">Instituto Analista</p>
                                    </div>
                                  )}
                                  {registro.cuscuta_g !== undefined && registro.cuscuta_g !== null && registro.cuscuta_g > 0 && (
                                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-lg p-4 text-center space-y-2">
                                      <p className="text-3xl font-bold text-orange-600">{registro.cuscuta_g}</p>
                                      <p className="text-sm font-medium text-muted-foreground">Gramos de Cuscuta</p>
                                    </div>
                                  )}
                                  {registro.cuscutaNum !== undefined && registro.cuscutaNum !== null && registro.cuscutaNum > 0 && (
                                    <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-lg p-4 text-center space-y-2">
                                      <p className="text-3xl font-bold text-red-600">{registro.cuscutaNum}</p>
                                      <p className="text-sm font-medium text-muted-foreground">Número de Semillas</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
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
                          <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Especie
                                </label>
                                {listado.listadoTipo === "NO_CONTIENE" ? (
                                  <div className="space-y-2">
                                    <p className="text-base font-semibold break-words">--</p>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                      No contiene
                                    </Badge>
                                  </div>
                                ) : listado.listadoTipo === "BRASSICA" && !listado.catalogo?.nombreComun && !listado.especie?.nombreComun ? (
                                  <div className="space-y-2">
                                    <p className="text-base font-semibold break-words text-muted-foreground">
                                      Sin especificación
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Las brassicas no requieren especificación de catálogo
                                    </p>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                      No contiene
                                    </Badge>
                                  </div>
                                ) : listado.listadoTipo === "OTROS" && !listado.catalogo?.nombreComun && !listado.especie?.nombreComun ? (
                                  <div className="space-y-2">
                                    <p className="text-base font-semibold break-words">--</p>
                                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                      No contiene
                                    </Badge>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-base font-semibold break-words">
                                      {listado.catalogo?.nombreComun ||
                                        listado.especie?.nombreComun || "--"}
                                    </p>
                                    {listado.catalogo?.nombreCientifico && (
                                      <p className="text-sm text-muted-foreground italic break-words">
                                        {listado.catalogo.nombreCientifico}
                                      </p>
                                    )}
                                    {listado.especie?.nombreCientifico && (
                                      <p className="text-sm text-muted-foreground italic break-words">
                                        {listado.especie.nombreCientifico}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  Tipo
                                </label>
                                <div className="space-y-2">
                                  {listado.listadoTipo === "NO_CONTIENE" ? (
                                    <>
                                      <p className="text-base break-words">Malezas en general</p>
                                      <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                                        No contiene
                                      </Badge>
                                    </>
                                  ) : (
                                    <Badge variant="outline" className={`font-medium whitespace-normal break-words ${getTipoListadoBadgeColor(listado.listadoTipo as TipoListado)}`}>
                                      {getTipoListadoDisplay(listado.listadoTipo as TipoListado)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <p className="text-base font-semibold">{listado.listadoNum || "--"}</p>
                              </div>
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
