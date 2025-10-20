"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import {
  ArrowLeft,
  Edit,
  Calendar,
  FileText,
  Scale,
  Sprout,
  Microscope,
  PieChart,
  Leaf,
  CheckCircle2,
  Percent,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { obtenerPurezaPorId } from "@/app/services/pureza-service"
import type { PurezaDTO } from "@/app/models"
import type { EstadoAnalisis, TipoListado } from "@/app/models/types/enums"

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

// Función para mostrar "tr" si el valor es menor a 0.05
const formatearPorcentaje = (valor: number | undefined | null, decimales: number = 2): string => {
  if (valor === undefined || valor === null) return '--'
  // Si el valor es exactamente 0, mostrarlo como 0.00
  if (valor === 0) return '0.00'
  // Si el valor es muy pequeño (< 0.05), mostrar "tr"
  if (valor < 0.05 && valor > 0) return 'tr'
  return valor.toFixed(decimales)
}

// Función para formatear porcentajes INASE (trata null/undefined como 0)
// Retorna el valor formateado SIN el símbolo '%' para que se pueda agregar condicionalmente
const formatearPorcentajeInase = (valor: number | undefined | null, decimales: number = 2): string => {
  // Para INASE, si el valor es null o undefined, mostrar como 0
  if (valor === undefined || valor === null || valor === 0) return '0.00'
  // Si el valor es muy pequeño (< 0.05), mostrar "tr"
  if (valor < 0.05 && valor > 0) return 'tr'
  return valor.toFixed(decimales)
}

// Función para formatear porcentajes con redondeo verificando el porcentaje sin redondeo
// Retorna el valor formateado SIN el símbolo '%' para que se pueda agregar condicionalmente
const formatearPorcentajeConRedondeo = (
  valorRedondeado: number | undefined | null, 
  porcentajeSinRedondeo: number | undefined | null
): string => {
  // IMPORTANTE: PRIMERO verificar el porcentaje SIN redondeo (es la fuente de verdad)
  if (porcentajeSinRedondeo !== undefined && porcentajeSinRedondeo !== null) {
    // Si el porcentaje sin redondeo es < 0.05 pero MAYOR que 0, mostrar "tr"
    if (porcentajeSinRedondeo > 0 && porcentajeSinRedondeo < 0.05) {
      return 'tr'
    }
    // Si el porcentaje sin redondeo es exactamente 0, mostrar 0.00
    if (porcentajeSinRedondeo === 0) {
      return '0.00'
    }
  }
  
  // Si el valor redondeado existe, usarlo
  if (valorRedondeado !== undefined && valorRedondeado !== null) {
    return valorRedondeado.toFixed(2)
  }
  
  // Si no hay ningún valor disponible
  return '--'
}

export default function PurezaDetailPage() {
  const params = useParams()
  const purezaId = params.id as string
  const [pureza, setPureza] = useState<PurezaDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPureza = async () => {
      try {
        setLoading(true)
        const data = await obtenerPurezaPorId(Number.parseInt(purezaId))
        setPureza(data)
      } catch (err) {
        setError("Error al cargar los detalles del análisis de Pureza")
        console.error("Error fetching Pureza:", err)
      } finally {
        setLoading(false)
      }
    }

    if (purezaId) {
      fetchPureza()
    }
  }, [purezaId])

  const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
    switch (estado) {
      case "FINALIZADO":
        return "default"
      case "EN_PROCESO":
        return "secondary"
      case "APROBADO":
        return "outline"
      case "PENDIENTE":
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
            <p className="text-sm text-muted-foreground">Obteniendo detalles de Pureza...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pureza) {
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
          <Link href="/listado/analisis/pureza">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calcular porcentajes automáticos con 4 decimales
  const pesoInicial = Number(pureza.pesoInicial_g) || 0
  const porcentajesCalculados = pesoInicial > 0 ? {
    semillaPura: (Number(pureza.semillaPura_g) / pesoInicial) * 100,
    materiaInerte: (Number(pureza.materiaInerte_g) / pesoInicial) * 100,
    otrosCultivos: (Number(pureza.otrosCultivos_g) / pesoInicial) * 100,
    malezas: (Number(pureza.malezas_g) / pesoInicial) * 100,
    malezasToleradas: (Number(pureza.malezasToleradas_g) / pesoInicial) * 100,
    malezasTolCero: (Number(pureza.malezasTolCero_g) / pesoInicial) * 100,
  } : null

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header sticky */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <Link href="/listado/analisis/pureza">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-bold text-balance">
                    Análisis de Pureza #{pureza.analisisID}
                  </h1>
                  <Badge
                    variant={getEstadoBadgeVariant(pureza.estado)}
                    className="text-sm px-3 py-1"
                  >
                    {pureza.estado}
                  </Badge>
                </div>
                <p className="text-base text-muted-foreground text-pretty">
                  Análisis de Pureza de Semillas • Lote {pureza.lote}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/listado/analisis/pureza/${pureza.analisisID}/editar`}>
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    <Edit className="h-4 w-4" />
                    Editar análisis
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="destructive"
                  className="gap-2 w-full sm:w-auto"
                  onClick={async () => {
                    try {
                      // Validación básica
                      if (!pureza.fecha || !pureza.pesoInicial_g || !pureza.pesoTotal_g) {
                        if (!window.confirm('Faltan datos básicos. ¿Desea intentar finalizar de todas formas?')) {
                          return
                        }
                      }

                      const { finalizarAnalisis } = await import('@/app/services/pureza-service')
                      await finalizarAnalisis(Number.parseInt(pureza.analisisID.toString()))
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

      {/* Content */}
      <div className="pt-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 gap-6 lg:gap-8">
            <div className="space-y-6">
              {/* Información General */}
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
                      <p className="text-2xl font-bold">{pureza.analisisID}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lote</label>
                      <p className="text-2xl font-semibold">{pureza.lote}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha del Análisis
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-medium">
                          {formatearFechaLocal(pureza.fecha)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Fecha de Inicio
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-medium">
                          {formatearFechaLocal(pureza.fechaInicio)}
                        </p>
                      </div>
                    </div>

                    {pureza.fechaFin && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Fecha de Finalización
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-lg font-medium">
                            {formatearFechaLocal(pureza.fechaFin)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Cumple Estándar
                      </label>
                      <div className="flex items-center gap-3">
                        {pureza.cumpleEstandar !== undefined ? (
                          <>
                            <div
                              className={`p-2 rounded-lg ${pureza.cumpleEstandar ? "bg-green-500/10" : "bg-destructive/10"}`}
                            >
                              {pureza.cumpleEstandar ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                            <span
                              className={`text-lg font-semibold ${pureza.cumpleEstandar ? "text-green-600" : "text-destructive"}`}
                            >
                              {pureza.cumpleEstandar ? "Cumple con el estándar" : "No cumple con el estándar"}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg text-muted-foreground">Pendiente de evaluación</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {pureza.comentarios && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Comentarios
                        </label>
                        <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">{pureza.comentarios}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Valores en Gramos */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Scale className="h-5 w-5 text-emerald-600" />
                    </div>
                    Valores en Gramos (INIA)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-blue-600">{Number(pureza.pesoInicial_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Peso Inicial (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-emerald-600">{Number(pureza.semillaPura_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Semilla Pura (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-amber-600">{Number(pureza.materiaInerte_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Materia Inerte (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-purple-600">{Number(pureza.otrosCultivos_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Otros Cultivos (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-orange-600">{Number(pureza.malezas_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Malezas (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-pink-600">{Number(pureza.malezasToleradas_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Malezas Toleradas (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-red-600">{Number(pureza.malezasTolCero_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Malezas Tol. Cero (g)</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-200/50 rounded-lg p-4 text-center space-y-2">
                      <p className="text-2xl font-bold text-slate-600">{Number(pureza.pesoTotal_g).toFixed(3)}</p>
                      <p className="text-xs font-medium text-muted-foreground">Peso Total (g)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Porcentajes sin Redondeo */}
              {porcentajesCalculados && (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Percent className="h-5 w-5 text-blue-600" />
                      </div>
                      Porcentajes sin Redondeo (4 decimales)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Semilla Pura</label>
                        <p className="text-xl font-bold text-emerald-600">{porcentajesCalculados.semillaPura.toFixed(4)}%</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Materia Inerte</label>
                        <p className="text-xl font-bold text-amber-600">{porcentajesCalculados.materiaInerte.toFixed(4)}%</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Otros Cultivos</label>
                        <p className="text-xl font-bold text-purple-600">{porcentajesCalculados.otrosCultivos.toFixed(4)}%</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas</label>
                        <p className="text-xl font-bold text-orange-600">{porcentajesCalculados.malezas.toFixed(4)}%</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Toleradas</label>
                        <p className="text-xl font-bold text-pink-600">{porcentajesCalculados.malezasToleradas.toFixed(4)}%</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Tol. Cero</label>
                        <p className="text-xl font-bold text-red-600">{porcentajesCalculados.malezasTolCero.toFixed(4)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Porcentajes con Redondeo */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Percent className="h-5 w-5 text-indigo-600" />
                    </div>
                    Porcentajes con Redondeo (Manual)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Semilla Pura</label>
                      <p className="text-xl font-bold text-emerald-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonSemillaPura, porcentajesCalculados?.semillaPura)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Materia Inerte</label>
                      <p className="text-xl font-bold text-amber-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonMateriaInerte, porcentajesCalculados?.materiaInerte)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Otros Cultivos</label>
                      <p className="text-xl font-bold text-purple-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonOtrosCultivos, porcentajesCalculados?.otrosCultivos)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Malezas</label>
                      <p className="text-xl font-bold text-orange-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonMalezas, porcentajesCalculados?.malezas)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Toleradas</label>
                      <p className="text-xl font-bold text-pink-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonMalezasToleradas, porcentajesCalculados?.malezasToleradas)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Tol. Cero</label>
                      <p className="text-xl font-bold text-red-600">
                        {(() => {
                          const valor = formatearPorcentajeConRedondeo(pureza.redonMalezasTolCero, porcentajesCalculados?.malezasTolCero)
                          return valor === 'tr' ? 'tr' : `${valor}%`
                        })()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase">Peso Total</label>
                      <p className="text-xl font-bold text-slate-600">
                        {pureza.redonPesoTotal !== null && pureza.redonPesoTotal !== undefined 
                          ? `${pureza.redonPesoTotal.toFixed(2)}%`
                          : '100.00%'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Datos INASE - Mostrar siempre */}
              <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-lg bg-purple-500/10">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      Datos INASE
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {pureza.inaseFecha && (
                        <div className="space-y-1.5 sm:col-span-3">
                          <label className="text-xs font-medium text-muted-foreground uppercase">Fecha INASE</label>
                          <p className="text-lg font-semibold">{formatearFechaLocal(pureza.inaseFecha)}</p>
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Semilla Pura</label>
                        <p className="text-xl font-bold text-emerald-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inasePura)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Materia Inerte</label>
                        <p className="text-xl font-bold text-amber-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inaseMateriaInerte)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Otros Cultivos</label>
                        <p className="text-xl font-bold text-purple-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inaseOtrosCultivos)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas</label>
                        <p className="text-xl font-bold text-orange-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inaseMalezas)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Toleradas</label>
                        <p className="text-xl font-bold text-pink-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inaseMalezasToleradas)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase">Malezas Tol. Cero</label>
                        <p className="text-xl font-bold text-red-600">
                          {(() => {
                            const valor = formatearPorcentajeInase(pureza.inaseMalezasTolCero)
                            return valor === 'tr' ? 'tr' : `${valor}%`
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* Listados (Otras Semillas) */}
              {pureza.otrasSemillas && pureza.otrasSemillas.length > 0 && (
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      Otras Semillas
                      <Badge variant="secondary" className="ml-auto">
                        {pureza.otrasSemillas.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {pureza.otrasSemillas.map((listado, index) => (
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
                                {listado.catalogo?.nombreComun || "--"}
                              </p>
                              {listado.catalogo?.nombreCientifico && (
                                <p className="text-sm text-muted-foreground italic">
                                  {listado.catalogo.nombreCientifico}
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
          </div>
        </div>
      </div>
    </div>
  )
}
