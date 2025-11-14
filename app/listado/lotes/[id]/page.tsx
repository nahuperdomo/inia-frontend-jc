"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ArrowLeft,
  Edit,
  Calendar,
  Building,
  MapPin,
  Scale,
  TestTube,
  Activity,
  FileText
} from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { LoteDTO } from "@/app/models/interfaces/lote"
import { TipoAnalisis } from "@/app/models/types/enums"
import { obtenerLotePorId } from "@/app/services/lote-service"

export default function DetalleLotePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [lote, setLote] = useState<LoteDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loteId = params?.id as string

  useEffect(() => {
    const fetchLote = async () => {
      if (!loteId) return

      setLoading(true)
      setError(null)

      try {
        const data = await obtenerLotePorId(parseInt(loteId))
        setLote(data)
      } catch (err: any) {
        const errorMsg = err?.message || "No se pudo cargar la información del lote"
        setError(errorMsg)
        toast.error('Error al cargar lote', {
          description: errorMsg,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLote()
  }, [loteId])

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return "-"
    return new Date(fecha).toLocaleDateString("es-ES")
  }

  const obtenerLabelTipoAnalisis = (tipo: TipoAnalisis) => {
    const labels = {
      PUREZA: "Pureza Física",
      GERMINACION: "Germinación",
      PMS: "Peso de Mil Semillas",
      TETRAZOLIO: "Tetrazolio",
      DOSN: "DOSN"
    }
    return labels[tipo] || tipo
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información del lote...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !lote) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/listado/lotes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lotes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Error al cargar lote</h1>
            <p className="text-muted-foreground">{error || "Lote no encontrado"}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        <Toaster position="top-right" richColors closeButton />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/listado/lotes">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-balance">
                  {lote.nomLote ? lote.nomLote : `Lote ${lote.ficha}`}
                </h1>
                <Badge variant={lote.activo ? "default" : "secondary"} className="text-xs sm:text-sm">
                  {lote.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Ficha: <span className="font-mono">{lote.ficha}</span> • ID: {lote.loteID}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href={`/listado/lotes/${loteId}/editar`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Edit className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Editar</span>
                <span className="sm:hidden">Editar</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Datos Básicos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Ficha</label>
                    <p className="text-sm sm:text-base font-mono font-semibold">{lote.ficha}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Nombre del Lote</label>
                    <p className="text-sm sm:text-base font-semibold">{lote.nomLote || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Tipo</label>
                    <p className="text-sm sm:text-base">{lote.tipo || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Cultivar</label>
                    <p className="text-sm sm:text-base">{lote.cultivarNombre || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Especie</label>
                    <p className="text-sm sm:text-base">{lote.especieNombre || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Unidad Embolsado</label>
                    <p className="text-sm sm:text-base">{lote.unidadEmbolsado || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Código CC</label>
                    <p className="text-sm sm:text-base font-mono">{lote.codigoCC || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Código FF</label>
                    <p className="text-sm sm:text-base font-mono">{lote.codigoFF || "-"}</p>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Remitente</label>
                    <p className="text-sm sm:text-base">{lote.remitente || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Empresa y Cliente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                  Empresa y Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Empresa</label>
                    <p className="text-sm sm:text-base">{lote.empresaNombre || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="text-sm sm:text-base">{lote.clienteNombre || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas Importantes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Fechas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Entrega</label>
                    <p className="text-sm sm:text-base">{formatearFecha(lote.fechaEntrega?.toString())}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Recibo</label>
                    <p className="text-sm sm:text-base">{formatearFecha(lote.fechaRecibo?.toString())}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Cosecha</label>
                    <p className="text-sm sm:text-base">{formatearFecha(lote.fechaCosecha?.toString())}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Almacenamiento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Almacenamiento y Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Origen</label>
                    <p className="text-sm sm:text-base">{lote.origenValor || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Depósito</label>
                    <p className="text-sm sm:text-base">{lote.depositoValor || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Estado</label>
                    <p className="text-sm sm:text-base">{lote.estadoValor || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Peso y Calidad */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                  Peso y Artículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Kilos Limpios</label>
                    <p className="text-sm sm:text-base font-semibold">{lote.kilosLimpios ? `${lote.kilosLimpios} kg` : "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Número Artículo</label>
                    <p className="text-sm sm:text-base">{lote.numeroArticuloValor || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            {lote.observaciones && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base whitespace-pre-wrap">{lote.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-4 sm:space-y-6">
            {/* Tipos de Análisis Asignados */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
                  Análisis Asignados
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tipos de análisis configurados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lote.tiposAnalisisAsignados && lote.tiposAnalisisAsignados.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {lote.tiposAnalisisAsignados.map((tipo) => (
                      <Badge key={tipo} variant="outline" className="text-xs">
                        {obtenerLabelTipoAnalisis(tipo)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No hay tipos de análisis asignados
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Datos de Humedad */}
            {lote.datosHumedad && lote.datosHumedad.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                    Datos de Humedad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lote.datosHumedad.map((humedad, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Tipo: {humedad.humedadNombre || `ID ${humedad.humedadID}`}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">{humedad.porcentaje}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Acciones Rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {user?.role !== "observador" && (
                  <>
                    <Link href={`/listado/lotes/${loteId}/editar`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Lote
                      </Button>
                    </Link>
                    <Link href="/registro/analisis" className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <TestTube className="h-4 w-4 mr-2" />
                        Crear Análisis
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/listado/lotes" className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Ver Todos los Lotes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}