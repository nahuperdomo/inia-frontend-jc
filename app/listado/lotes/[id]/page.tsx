"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ArrowLeft, 
  Edit, 
  Calendar,
  Building,
  User,
  MapPin,
  Scale,
  TestTube,
  Activity,
  FileText,
  Eye
} from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { LoteDTO } from "@/app/models/interfaces/lote"
import { TipoAnalisis } from "@/app/models/types/enums"
import { obtenerLotePorId } from "@/app/services/lote-service"

export default function DetalleLotePage() {
  const params = useParams()
  const router = useRouter()
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
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/listado/lotes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lotes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">
              {lote.nomLote ? lote.nomLote : `Lote ${lote.ficha}`}
            </h1>
            <p className="text-muted-foreground">
              Ficha: {lote.ficha} • ID: {lote.loteID}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/listado/lotes/${loteId}/editar`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Lote
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ficha</label>
                  <p className="text-sm font-mono">{lote.ficha}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre del Lote</label>
                  <p className="text-sm font-medium">{lote.nomLote || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p className="text-sm">{lote.tipo || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código CC</label>
                  <p className="text-sm font-mono">{lote.codigoCC || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Código FF</label>
                  <p className="text-sm font-mono">{lote.codigoFF || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Remitente</label>
                  <p className="text-sm">{lote.remitente || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unidad Embolsado</label>
                  <p className="text-sm">{lote.unidadEmbolsado || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Empresa y Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Empresa y Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-sm">{lote.empresaNombre || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="text-sm">{lote.clienteNombre || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del Cultivar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Información del Cultivar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cultivar</label>
                  <p className="text-sm">{lote.cultivarNombre || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Especie</label>
                  <p className="text-sm">-</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Entrega</label>
                  <p className="text-sm">{formatearFecha(lote.fechaEntrega?.toString())}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Recibo</label>
                  <p className="text-sm">{formatearFecha(lote.fechaRecibo?.toString())}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Cosecha</label>
                  <p className="text-sm">{formatearFecha(lote.fechaCosecha?.toString())}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Cantidad y Peso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Cantidad y Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kilos Limpios</label>
                  <p className="text-sm">{lote.kilosLimpios ? `${lote.kilosLimpios} kg` : "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cantidad</label>
                  <p className="text-sm">{lote.cantidad ? `${lote.cantidad}` : "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {lote.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{lote.observaciones}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado del Lote */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={lote.activo ? "default" : "secondary"} className="text-sm">
                {lote.activo ? "Activo" : "Inactivo"}
              </Badge>
            </CardContent>
          </Card>

          {/* Tipos de Análisis Asignados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Tipos de Análisis Asignados
              </CardTitle>
              <CardDescription>
                Análisis configurados para este lote
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
                <p className="text-sm text-muted-foreground">
                  No hay tipos de análisis asignados
                </p>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Origen</label>
                <p className="text-sm">{lote.origenValor || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Depósito</label>
                <p className="text-sm">{lote.depositoValor || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                <p className="text-sm">{lote.estadoValor || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/listado/lotes/${loteId}/editar`} className="w-full">
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Lote
                </Button>
              </Link>
              <Link href="/registro/analisis" className="w-full">
                <Button variant="outline" className="w-full">
                  <TestTube className="h-4 w-4 mr-2" />
                  Crear Análisis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}