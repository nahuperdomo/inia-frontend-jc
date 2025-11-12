"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import legadoService from "@/app/services/legado-service"
import type { LegadoDTO } from "@/app/models/interfaces/legado"

import Link from "next/link"

import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Package, 
  FileText, 
  BarChart3, 
  Calculator,
  Building,
  Calendar,
  Beaker,
  Loader2,
  AlertTriangle,
  Download
} from "lucide-react"

// Helper function para mostrar valores - maneja null, undefined y cadenas vacías
const displayValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") {
    return "-"
  }
  return String(value)
}

export default function LegadoDetailPage() {
  const params = useParams()
  const legadoId = params.id as string
  const [legado, setLegado] = useState<LegadoDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await legadoService.getById(Number.parseInt(legadoId))
        console.log("Datos del legado recibidos:", data)
        console.log("Familia:", data.familia)
        setLegado(data)
      } catch (err) {
        setError("Error al cargar los detalles del registro legado")
        console.error("Error fetching legado:", err)
      } finally {
        setLoading(false)
      }
    }

    if (legadoId) {
      fetchData()
    }
  }, [legadoId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando registro</p>
            <p className="text-sm text-muted-foreground">Obteniendo detalles del registro legado...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !legado) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el registro</h2>
            <p className="text-muted-foreground text-pretty">{error || "El registro solicitado no existe"}</p>
          </div>
          <Link href="/listado/legado">
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
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-6">
            <Link href="/listado/legado">
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl lg:text-4xl font-bold text-balance">Registro Legado #{legado.legadoID}</h1>
                  <Badge variant={legado.activo ? "default" : "secondary"} className="text-sm px-3 py-1">
                    {legado.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-base text-muted-foreground text-pretty">
                  Datos históricos importados • Ficha {legado.lote.ficha} • {legado.lote.nomLote}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Lote */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  Información del Lote
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Lote
                    </label>
                    <p className="text-lg font-semibold">{displayValue(legado.lote.nomLote)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Número de Ficha
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.ficha)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Cultivar
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.cultivarNombre)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Empresa
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.empresaNombre)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Depósito
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.depositoValor)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Origen
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.origenValor)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Kilos Limpios
                    </label>
                    <p className="text-lg font-medium">{displayValue(legado.lote.kilosLimpios)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fecha Recibo
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-lg font-medium">
                        {legado.lote.fechaRecibo
                          ? new Date(legado.lote.fechaRecibo).toLocaleDateString("es-ES", { 
                              year: "numeric", 
                              month: "long", 
                              day: "numeric" 
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                {legado.lote.observaciones && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Observaciones
                      </label>
                      <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">
                        {legado.lote.observaciones}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Datos del Documento */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  Datos del Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Código Doc
                    </label>
                    <p className="text-base font-medium">{displayValue(legado.codDoc)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Nombre Doc
                    </label>
                    <p className="text-base font-medium">{displayValue(legado.nomDoc)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Nro Doc
                    </label>
                    <p className="text-base font-medium">{displayValue(legado.nroDoc)}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Fecha Doc
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-base font-medium">
                        {legado.fechaDoc
                          ? new Date(legado.fechaDoc).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Familia
                    </label>
                    <Badge variant="outline" className="text-sm">{displayValue(legado.familia)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de Germinación */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Beaker className="h-5 w-5 text-green-600" />
                  </div>
                  Datos de Germinación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {legado.germC !== null ? legado.germC : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">Germ C</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {legado.germSC !== null ? legado.germSC : "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">Germ SC</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {legado.peso1000 || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground">Peso 1000</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Germ Total SC I
                    </label>
                    <p className="text-base font-medium">
                      {legado.germTotalSC_I !== null ? legado.germTotalSC_I : "-"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Germ Total C I
                    </label>
                    <p className="text-base font-medium">
                      {legado.germTotalC_I !== null ? legado.germTotalC_I : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos de Pureza */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                    </div>
                    Datos de Pureza
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pura</label>
                      <p className="text-base font-medium">{legado.pura || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OC</label>
                      <p className="text-base font-medium">{legado.oc || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Porc OC</label>
                      <p className="text-base font-medium">{legado.porcOC || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maleza</label>
                      <p className="text-base font-medium">{legado.maleza || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maleza Tol.</label>
                      <p className="text-base font-medium">{legado.malezaTol || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mat. Inerte</label>
                      <p className="text-base font-medium">{legado.matInerte || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Calculator className="h-5 w-5 text-cyan-600" />
                    </div>
                    Pureza Inase
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pura I</label>
                      <p className="text-base font-medium">{legado.puraI || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">OC I</label>
                      <p className="text-base font-medium">{legado.ocI || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maleza I</label>
                      <p className="text-base font-medium">{legado.malezaI || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maleza Tol. I</label>
                      <p className="text-base font-medium">{legado.malezaTolI || "-"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mat. Inerte I</label>
                      <p className="text-base font-medium">{legado.matInerteI || "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Datos de Transacción */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  Datos de Transacción
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nro. Trans.</label>
                    <p className="text-base font-medium">{legado.nroTrans || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cta. Mov.</label>
                    <p className="text-base font-medium">{legado.ctaMov || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">STK</label>
                    <p className="text-base font-medium">{legado.stk || "-"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peso HEC</label>
                    <p className="text-base font-medium">{legado.pesoHEC || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Semillas */}
            {(legado.semillaPura ||
              legado.semillaOtrosCultivos ||
              legado.semillaMalezas ||
              legado.semillaMalezasToleradas ||
              legado.materiaInerte) && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <Beaker className="h-5 w-5 text-teal-600" />
                    </div>
                    Análisis de Semillas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {legado.semillaPura && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Semilla Pura
                        </label>
                        <p className="text-base font-medium">{legado.semillaPura}</p>
                      </div>
                    )}
                    {legado.semillaOtrosCultivos && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Semilla de Otros Cultivos
                        </label>
                        <p className="text-base font-medium">{legado.semillaOtrosCultivos}</p>
                      </div>
                    )}
                    {legado.semillaMalezas && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Semilla Malezas
                        </label>
                        <p className="text-base font-medium">{legado.semillaMalezas}</p>
                      </div>
                    )}
                    {legado.semillaMalezasToleradas && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Semilla Malezas Toleradas
                        </label>
                        <p className="text-base font-medium">{legado.semillaMalezasToleradas}</p>
                      </div>
                    )}
                    {legado.materiaInerte && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Materia Inerte
                        </label>
                        <p className="text-base font-medium">{legado.materiaInerte}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observaciones */}
            {legado.otrasSemillasObser && (
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Otras Semillas Obser
                    </label>
                    <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">
                      {legado.otrasSemillasObser}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tipo de Semilla */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg">Tipo de Semilla</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tipo Semilla
                  </label>
                  <p className="text-base font-medium">{legado.tipoSemilla || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tipo Trat. Germ
                  </label>
                  <p className="text-base font-medium">{legado.tipoTratGerm || "-"}</p>
                </div>
              </CardContent>
            </Card>


            {/* Metadatos de Importación */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <FileSpreadsheet className="h-5 w-5 text-rose-600" />
                  </div>
                  Info. Importación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Archivo Origen
                  </label>
                  <p className="text-sm font-medium break-words">{legado.archivoOrigen || "-"}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Fila Excel
                  </label>
                  <p className="text-base font-medium">
                    {legado.filaExcel !== null ? legado.filaExcel : "-"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Fecha Importación
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {legado.fechaImportacion
                        ? new Date(legado.fechaImportacion).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}