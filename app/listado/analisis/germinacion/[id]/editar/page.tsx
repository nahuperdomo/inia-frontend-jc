"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConfirm } from '@/lib/hooks/useConfirm'
import { 
  obtenerGerminacionPorId, 
  obtenerTablasGerminacion,
  crearTablaGerminacion,
  finalizarGerminacion,
  actualizarGerminacion,
  aprobarAnalisis,
  marcarParaRepetir
} from '@/app/services/germinacion-service'
import { obtenerLotesActivos } from '@/app/services/lote-service'
import { GerminacionDTO, GerminacionRequestDTO, GerminacionEditRequestDTO } from '@/app/models/interfaces/germinacion'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { TablaGermDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { TablasGerminacionSection } from '@/components/germinacion/tablas-germinacion-section'
import { CalendarDays, Beaker, CheckCircle, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnalisisHeaderBar } from "@/components/analisis/analisis-header-bar"
import { AnalisisAccionesCard } from "@/components/analisis/analisis-acciones-card"
import { toast } from "sonner"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"

// Función utilitaria para formatear fechas correctamente
const formatearFechaLocal = (fechaString: string): string => {
  if (!fechaString) return ''
  
  // Crear fecha como fecha local en lugar de UTC para evitar problemas de zona horaria
  const [year, month, day] = fechaString.split('-').map(Number)
  const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed
  
  return fecha.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Función para formatear fecha y hora (LocalDateTime del backend)
const formatearFechaHora = (fechaString: string): string => {
  if (!fechaString) return ''
  
  try {
    const fecha = new Date(fechaString)
    if (isNaN(fecha.getTime())) return fechaString // Si no se puede parsear, devolver el string original
    
    return fecha.toLocaleString('es-UY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return fechaString
  }
}

// Función para convertir fecha del backend al formato YYYY-MM-DD para inputs
const convertirFechaParaInput = (fechaString: string): string => {
  if (!fechaString) return ''
  
  // Si la fecha ya está en formato YYYY-MM-DD, devolverla tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    return fechaString
  }
  
  // Si viene con hora o en otro formato, extraer solo la parte de fecha
  const fecha = new Date(fechaString)
  if (isNaN(fecha.getTime())) return '' // Fecha inválida
  
  // Formatear como YYYY-MM-DD
  return fecha.toISOString().split('T')[0]
}

export default function GerminacionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { confirm } = useConfirm()
  const germinacionId = params.id as string

  const [germinacion, setGerminacion] = useState<GerminacionDTO | null>(null)
  const [tablas, setTablas] = useState<TablaGermDTO[]>([])
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingTable, setCreatingTable] = useState(false)
  const [error, setError] = useState<string>("")
  const [editandoGerminacion, setEditandoGerminacion] = useState(false)
  
  // Simplificado para solo campos editables
  const [germinacionEditada, setGerminacionEditada] = useState<{
    idLote: number
    comentarios: string
  }>({
    idLote: 0,
    comentarios: ''
  })
  
  const [germinacionOriginal, setGerminacionOriginal] = useState<{
    idLote: number
    comentarios: string
  } | null>(null)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log(" Cargando germinación y tablas para ID:", germinacionId)
      
      // Cargar datos en paralelo
      const [germinacionData, lotesData] = await Promise.all([
        obtenerGerminacionPorId(parseInt(germinacionId)),
        obtenerLotesActivos()
      ])
      
      console.log(" Germinación cargada:", germinacionData)
      console.log(" Lotes cargados:", lotesData)
      setGerminacion(germinacionData)
      setLotes(lotesData)
      
      // Cargar tablas usando el endpoint correcto
      try {
        const tablasData = await obtenerTablasGerminacion(parseInt(germinacionId))
        console.log(" Tablas cargadas:", tablasData)
        setTablas(tablasData)
      } catch (tablasError: any) {
        console.warn("️ No se pudieron cargar las tablas:", tablasError)
        // Si es 404, significa que no hay tablas, lo cual es normal
        if (tablasError.message && tablasError.message.includes('404')) {
          console.log(" No hay tablas creadas todavía - esto es normal")
          setTablas([])
        } else {
          throw tablasError // Re-lanzar si es otro tipo de error
        }
      }
    } catch (err: any) {
      console.error(" Error cargando datos:", err)
      setError(err?.message || "Error al cargar datos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (germinacionId) {
      cargarDatos()
    }
  }, [germinacionId])

  const handleCrearTabla = async () => {
    try {
      setCreatingTable(true)
      setError("")
      
      console.log(" Creando nueva tabla para germinación:", germinacionId)
      
      const nuevaTabla = await crearTablaGerminacion(parseInt(germinacionId))
      console.log(" Tabla creada:", nuevaTabla)
      
      // Solo recargar las tablas en lugar de recargar todo
      const tablasData = await obtenerTablasGerminacion(parseInt(germinacionId))
      setTablas(tablasData)
    } catch (err: any) {
      console.error(" Error creando tabla:", err)
      setError(err?.message || "Error al crear tabla")
    } finally {
      setCreatingTable(false)
    }
  }

  const handleReabrirAnalisis = async () => {
    const confirmed = await confirm({
      title: "Editar análisis",
      message: "¿Está seguro que desea editar este análisis? Podrá volver a modificarlo y sus tablas.",
      confirmText: "Editar",
      cancelText: "Cancelar",
      variant: "warning"
    })

    if (!confirmed) {
      return
    }

    try {
      setError("")
      
      console.log("✏️ Editando análisis:", germinacionId)
      
      // Actualizar estado local para marcar como en proceso
      if (germinacion) {
        setGerminacion({
          ...germinacion,
          estado: 'EN_PROCESO',
          fechaFin: undefined
        })
      }
      
      console.log(" Análisis habilitado para edición")
    } catch (err: any) {
      console.error(" Error editando análisis:", err)
      setError(err?.message || "Error al editar análisis")
    }
  }

  const handleEditarGerminacion = () => {
    if (!germinacion) return
    
    console.log(" Iniciando edición de germinación")
    
    // Solo preparar los campos editables
    const datosEdicion = {
      idLote: germinacion.idLote || 0,
      comentarios: germinacion.comentarios || ''
    }
    
    setGerminacionEditada(datosEdicion)
    setGerminacionOriginal({ ...datosEdicion })
    setEditandoGerminacion(true)
  }

  const handleCancelarEdicionGerminacion = () => {
    if (germinacionOriginal) {
      setGerminacionEditada({ ...germinacionOriginal })
    }
    setEditandoGerminacion(false)
    setGerminacionOriginal(null)
  }

  const hanCambiadoGerminacion = (): boolean => {
    if (!germinacionOriginal) return true
    return JSON.stringify(germinacionEditada) !== JSON.stringify(germinacionOriginal)
  }

  const handleGuardarGerminacion = async () => {
    if (!hanCambiadoGerminacion()) {
      setEditandoGerminacion(false)
      setGerminacionOriginal(null)
      return
    }

    try {
      console.log(" Guardando cambios en germinación:", germinacionId)
      
      // Crear el DTO de edición con solo los campos permitidos
      const datosEdicion: GerminacionEditRequestDTO = {
        idLote: germinacionEditada.idLote,
        comentarios: germinacionEditada.comentarios
      }
      
      console.log(" Datos a enviar:", JSON.stringify(datosEdicion, null, 2))
      
      const germinacionActualizada = await actualizarGerminacion(parseInt(germinacionId), datosEdicion)
      console.log(" Germinación actualizada exitosamente")
      
      // Actualizar estado local
      setGerminacion(germinacionActualizada)
      setEditandoGerminacion(false)
      setGerminacionOriginal(null)
    } catch (error: any) {
      console.error(" Error guardando germinación:", error)
      alert(`Error al guardar los cambios: ${error.message || 'Error desconocido'}`)
    }
  }

  // Finalizar análisis
  const handleFinalizarAnalisis = async () => {
    if (!germinacion) return
    
    try {
      console.log("Finalizando análisis Germinación:", germinacion.analisisID)
      await finalizarGerminacion(germinacion.analisisID)
      alert("Análisis finalizado exitosamente")
      await cargarDatos()
    } catch (err: any) {
      console.error("Error finalizando análisis:", err)
      alert(`Error al finalizar análisis: ${err?.message || "Error desconocido"}`)
    }
  }

  // Aprobar análisis
  const handleAprobar = async () => {
    if (!germinacion) return
    
    try {
      console.log(" Aprobando análisis Germinación:", germinacion.analisisID)
      await aprobarAnalisis(germinacion.analisisID)
      alert("Análisis aprobado exitosamente")
      await cargarDatos()
    } catch (err: any) {
      console.error(" Error aprobando análisis:", err)
      alert(`Error al aprobar análisis: ${err?.message || "Error desconocido"}`)
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!germinacion) return
    
    try {
      console.log(" Marcando análisis Germinación para repetir:", germinacion.analisisID)
      await marcarParaRepetir(germinacion.analisisID)
      alert("Análisis marcado para repetir")
      await cargarDatos()
    } catch (err: any) {
      console.error(" Error marcando para repetir:", err)
      alert(`Error al marcar para repetir: ${err?.message || "Error desconocido"}`)
    }
  }

  // Finalizar y aprobar
  const handleFinalizarYAprobar = async () => {
    if (!germinacion) return
    
    try {
      console.log("Finalizando y aprobando análisis Germinación:", germinacion.analisisID)
      // Cuando el admin finaliza, el backend ya lo aprueba automáticamente
      await finalizarGerminacion(germinacion.analisisID)
      alert("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/germinacion/${germinacion.analisisID}`)
    } catch (err: any) {
      console.error("Error finalizando y aprobando:", err)
      alert(`Error al finalizar y aprobar: ${err?.message || "Error desconocido"}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!germinacion) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">No se pudo cargar la información del análisis</p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mt-4"
            >
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Universal - Sin botón de edición */}
      <AnalisisHeaderBar
        tipoAnalisis="Germinación"
        analisisId={germinacion.analisisID}
        estado={germinacion.estado || ""}
        volverUrl={`/listado/analisis/germinacion/${germinacionId}`}
        ocultarBotonEdicion={true}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Información del Análisis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              <CardTitle>Información del Análisis</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <TablaToleranciasButton
                pdfPath="/tablas-tolerancias/tabla-germinacion.pdf"
                title="Tabla de Tolerancias"
              />
              {!editandoGerminacion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditarGerminacion}
                  className="min-w-fit"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editandoGerminacion ? (
            <div className="space-y-6">
              <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p><strong>Modo de Edición:</strong> Solo se pueden modificar los campos que se muestran a continuación. Los datos como fechas, número de días y repeticiones no son editables una vez creado el análisis.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lote Asociado *</Label>
                    <Select
                      value={germinacionEditada.idLote?.toString() || ""}
                      onValueChange={(value) => setGerminacionEditada(prev => ({ 
                        ...prev, 
                        idLote: parseInt(value) 
                      }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Seleccionar lote..." />
                      </SelectTrigger>
                      <SelectContent>
                        {lotes.map((lote) => (
                          <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                            {lote.ficha} (ID: {lote.loteID})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Selecciona el lote que se analizará en este análisis de germinación
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Comentarios</Label>
                    <Input
                      value={germinacionEditada.comentarios}
                      onChange={(e) => setGerminacionEditada(prev => ({ 
                        ...prev, 
                        comentarios: e.target.value 
                      }))}
                      placeholder="Comentarios adicionales sobre el análisis..."
                      className="h-11"
                    />
                    <p className="text-xs text-gray-500">
                      Información adicional o observaciones sobre el análisis
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Información del lote seleccionado */}
                  {germinacionEditada.idLote && lotes.find(l => l.loteID === germinacionEditada.idLote) && (
                    <Card className="bg-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Información del Lote</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(() => {
                          const selectedLoteInfo = lotes.find(l => l.loteID === germinacionEditada.idLote);
                          return selectedLoteInfo ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ficha:</span>
                                <span className="font-medium">{selectedLoteInfo.ficha}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Lote:</span>
                                <span>{selectedLoteInfo.nomLote}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Activo:</span>
                                <span>{selectedLoteInfo.activo ? "Sí" : "No"}</span>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelarEdicionGerminacion}
                  className="min-w-24"
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleGuardarGerminacion}
                  disabled={!hanCambiadoGerminacion()}
                  className={
                    !hanCambiadoGerminacion()
                      ? 'bg-gray-400 hover:bg-gray-500 min-w-32'
                      : 'bg-green-600 hover:bg-green-700 min-w-32'
                  }
                >
                  {!hanCambiadoGerminacion() ? 'Sin Cambios' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID Análisis</p>
                <p className="font-semibold">{germinacion.analisisID}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lote</p>
                <p className="font-semibold">{germinacion.lote || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="font-semibold">{germinacion.estado}</p>
              </div>
              {germinacion.fechaInicio && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatearFechaHora(germinacion.fechaInicio)}
                  </p>
                </div>
              )}
              {germinacion.fechaFin && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Fin</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatearFechaHora(germinacion.fechaFin)}
                  </p>
                </div>
              )}
              {germinacion.comentarios && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                  <p className="font-semibold">{germinacion.comentarios}</p>
                </div>
              )}
              {tablas.length > 0 && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tablas de Germinación</p>
                  <p className="text-sm text-muted-foreground">
                    Este análisis tiene {tablas.length} tabla{tablas.length !== 1 ? 's' : ''} de germinación. 
                    Los detalles de cada tabla se muestran en la sección inferior.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de Tablas */}
      <TablasGerminacionSection 
        tablas={tablas}
        germinacionId={parseInt(germinacionId)}
        isFinalized={germinacion.estado === 'APROBADO' || germinacion.estado === 'PENDIENTE_APROBACION'}
        onTablaUpdated={cargarDatos}
        germinacion={germinacion}
        onAnalysisFinalized={() => router.push(`/listado/analisis/germinacion/${germinacionId}`)}
      />

      {/* Acciones */}
      <AnalisisAccionesCard
        analisisId={germinacion.analisisID}
        tipoAnalisis="germinacion"
        estado={germinacion.estado || ""}
        onAprobar={async () => {
          await aprobarAnalisis(germinacion.analisisID)
          toast.success("Análisis aprobado exitosamente")
          router.push(`/listado/analisis/germinacion/${germinacion.analisisID}`)
        }}
        onMarcarParaRepetir={async () => {
          await marcarParaRepetir(germinacion.analisisID)
          toast.success("Análisis marcado para repetir")
          router.push(`/listado/analisis/germinacion/${germinacion.analisisID}`)
        }}
        onFinalizarYAprobar={async () => {
          // Cuando el admin finaliza, el backend automáticamente lo aprueba
          await finalizarGerminacion(germinacion.analisisID)
          toast.success("Análisis finalizado y aprobado exitosamente")
          router.push(`/listado/analisis/germinacion/${germinacion.analisisID}`)
        }}
        onFinalizar={async () => {
          const confirmed = await confirm({
            title: "Finalizar análisis",
            message: "¿Está seguro que desea finalizar este análisis? Esta acción no se puede deshacer.",
            confirmText: "Finalizar",
            cancelText: "Cancelar",
            variant: "danger"
          })

          if (!confirmed) {
            return
          }
          await finalizarGerminacion(parseInt(germinacionId))
          toast.success("Análisis finalizado exitosamente")
          router.push(`/listado/analisis/germinacion/${germinacionId}`)
        }}
      />
    </div>
  )
}