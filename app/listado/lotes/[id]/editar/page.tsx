"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Package, 
  ArrowLeft, 
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react"
import { Toaster, toast } from "sonner"
import Link from "next/link"
import { LoteDTO } from "@/app/models/interfaces/lote"
import { TipoAnalisis } from "@/app/models/types/enums"
import { TiposAnalisisSelector } from "@/components/lotes/tipos-analisis-selector"
import { obtenerLotePorId, actualizarLote, puedeRemoverTipoAnalisis } from "@/app/services/lote-service"

interface TipoAnalisisInfo {
  tipo: TipoAnalisis
  puedeRemover: boolean
  razon?: string
}

export default function EditarLotePage() {
  const params = useParams()
  const router = useRouter()
  const [lote, setLote] = useState<LoteDTO | null>(null)
  const [tiposSeleccionados, setTiposSeleccionados] = useState<TipoAnalisis[]>([])
  const [tiposOriginales, setTiposOriginales] = useState<TipoAnalisis[]>([])
  const [tiposInfo, setTiposInfo] = useState<TipoAnalisisInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        
        // Asegurar que no hay duplicados y limpiar valores undefined/null
        const tiposOriginalArray = data.tiposAnalisisAsignados || []
        const tiposLimpios = tiposOriginalArray
          .filter(tipo => tipo != null) // Eliminar null/undefined
          .filter((tipo, index, array) => array.indexOf(tipo) === index) // Eliminar duplicados
        
        console.log('Tipos originales del backend:', tiposOriginalArray)
        console.log('Tipos limpios:', tiposLimpios)
        
        setTiposSeleccionados([...tiposLimpios])
        setTiposOriginales([...tiposLimpios])
        
        // Verificar qué tipos se pueden remover
        if (tiposLimpios.length > 0) {
          await verificarTiposPuedenRemover(data.loteID, tiposLimpios)
        }
        
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

  const verificarTiposPuedenRemover = async (loteID: number, tipos: TipoAnalisis[]) => {
    const info: TipoAnalisisInfo[] = []
    
    for (const tipo of tipos) {
      try {
        const resultado = await puedeRemoverTipoAnalisis(loteID, tipo)
        info.push({
          tipo,
          puedeRemover: resultado.puedeRemover,
          razon: resultado.razon
        })
      } catch {
        info.push({
          tipo,
          puedeRemover: false,
          razon: "Error al verificar el estado"
        })
      }
    }
    
    setTiposInfo(info)
  }

  const handleTiposChange = (nuevosTipos: TipoAnalisis[]) => {
    // Eliminar duplicados y valores nulos/undefined de los nuevos tipos
    const tiposUnicos = nuevosTipos
      .filter(tipo => tipo != null)
      .filter((tipo, index, array) => array.indexOf(tipo) === index)
    
    console.log('Nuevos tipos recibidos:', nuevosTipos)
    console.log('Tipos únicos procesados:', tiposUnicos)
    
    // Verificar si se está intentando remover un tipo que no se puede
    const tiposARemover = tiposOriginales.filter(tipo => !tiposUnicos.includes(tipo))
    
    for (const tipoARemover of tiposARemover) {
      const info = tiposInfo.find(t => t.tipo === tipoARemover)
      if (info && !info.puedeRemover) {
        toast.error(`No se puede remover ${obtenerLabelTipoAnalisis(tipoARemover)}`, {
          description: info.razon || "Este tipo de análisis no se puede remover"
        })
        return
      }
    }
    
    setTiposSeleccionados([...tiposUnicos])
  }

  const handleGuardar = async () => {
    if (!lote) return
    
    setSaving(true)
    
    try {
      // Convertir LoteDTO a LoteRequestDTO
      const datosActualizados = {
        ficha: lote.ficha,
        cultivarID: lote.cultivarID,
        tipo: lote.tipo || "INTERNO",
        empresaID: lote.empresaID,
        clienteID: lote.clienteID || 0,
        codigoCC: lote.codigoCC || "",
        codigoFF: lote.codigoFF || "",
        fechaEntrega: lote.fechaEntrega?.toString() || "",
        fechaRecibo: lote.fechaRecibo?.toString() || "",
        depositoID: lote.depositoID || 0,
        unidadEmbolsado: lote.unidadEmbolsado || "",
        remitente: lote.remitente || "",
        observaciones: lote.observaciones || "",
        kilosLimpios: Number(lote.kilosLimpios) || 0,
        datosHumedad: lote.datosHumedad?.map(h => ({
          tipoHumedadID: h.humedadID || 0,
          valor: Number(h.porcentaje) || 0
        })) || [],
        numeroArticuloID: lote.numeroArticuloID || 1,
        cantidad: Number(lote.cantidad) || 0,
        origenID: lote.origenID || 1,
        estadoID: lote.estadoID || 1,
        fechaCosecha: lote.fechaCosecha?.toString() || "",
        tiposAnalisisAsignados: tiposSeleccionados
      }
      
      await actualizarLote(lote.loteID, datosActualizados)
      
      toast.success('Lote actualizado exitosamente', {
        description: 'Los tipos de análisis han sido actualizados'
      })
      
      // Redirigir a la página de detalle
      router.push(`/listado/lotes/${loteId}`)
      
    } catch (err: any) {
      toast.error('Error al actualizar lote', {
        description: err?.message || "No se pudo actualizar el lote"
      })
    } finally {
      setSaving(false)
    }
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

  const hayCarmbios = JSON.stringify(tiposSeleccionados.sort()) !== JSON.stringify(tiposOriginales.sort())

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
          <Link href={`/listado/lotes/${loteId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Detalle
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Editar Lote {lote.ficha}</h1>
            <p className="text-muted-foreground">
              Modifica los tipos de análisis asignados a este lote
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGuardar} 
            disabled={saving || !hayCarmbios}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Edición */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Lote */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Lote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ficha</label>
                  <p className="text-sm font-mono">{lote.ficha}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cultivar</label>
                  <p className="text-sm">{lote.cultivarNombre || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Empresa</label>
                  <p className="text-sm">{lote.empresaNombre || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editar Tipos de Análisis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Tipos de Análisis Asignados
              </CardTitle>
              <CardDescription>
                Selecciona los tipos de análisis que se realizarán para este lote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TiposAnalisisSelector
                tiposSeleccionados={tiposSeleccionados}
                onChange={handleTiposChange}
                disabled={saving}
              />
              
              {tiposInfo.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Restricciones para tipos existentes:</p>
                      <div className="space-y-1">
                        {tiposInfo.map((info) => (
                          <div key={info.tipo} className="flex items-center gap-2 text-sm">
                            {info.puedeRemover ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{obtenerLabelTipoAnalisis(info.tipo)}:</span>
                            <span className={info.puedeRemover ? "text-green-700" : "text-red-700"}>
                              {info.puedeRemover ? "Se puede remover" : info.razon}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipos Originales</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tiposOriginales.length > 0 ? (
                    // Crear array único y usar timestamp para evitar keys duplicadas
                    [...new Set(tiposOriginales)].map((tipo, index) => (
                      <Badge key={`original-${tipo}-${Date.now()}-${index}`} variant="secondary" className="text-xs">
                        {obtenerLabelTipoAnalisis(tipo)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin tipos asignados</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipos Seleccionados</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tiposSeleccionados.length > 0 ? (
                    // Crear array único y usar timestamp para evitar keys duplicadas
                    [...new Set(tiposSeleccionados)].map((tipo, index) => (
                      <Badge key={`seleccionado-${tipo}-${Date.now()}-${index}`} variant="default" className="text-xs">
                        {obtenerLabelTipoAnalisis(tipo)}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin tipos seleccionados</p>
                  )}
                </div>
              </div>
              
              {hayCarmbios && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Hay cambios sin guardar. Recuerda guardar para aplicar las modificaciones.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Información de Reglas */}
          <Card>
            <CardHeader>
              <CardTitle>Reglas de Edición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Puedes agregar nuevos tipos de análisis libremente</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Solo puedes remover tipos que no tengan análisis completados</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Puedes remover tipos con análisis marcados "A repetir"</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}