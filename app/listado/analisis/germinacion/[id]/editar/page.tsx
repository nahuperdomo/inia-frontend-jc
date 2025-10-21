"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  obtenerGerminacionPorId, 
  obtenerTablasGerminacion,
  crearTablaGerminacion,
  finalizarGerminacion,
  actualizarGerminacion
} from '@/app/services/germinacion-service'
import { obtenerLotesActivos } from '@/app/services/lote-service'
import { GerminacionDTO, GerminacionRequestDTO, GerminacionEditRequestDTO } from '@/app/models/interfaces/germinacion'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { TablaGermDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { TablasGerminacionSection } from '@/components/germinacion/tablas-germinacion-section'
import { CalendarDays, Beaker, CheckCircle, Edit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const germinacionId = params.id as string

  const [germinacion, setGerminacion] = useState<GerminacionDTO | null>(null)
  const [tablas, setTablas] = useState<TablaGermDTO[]>([])
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingTable, setCreatingTable] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
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
      console.log("🔄 Cargando germinación y tablas para ID:", germinacionId)
      
      // Cargar datos en paralelo
      const [germinacionData, lotesData] = await Promise.all([
        obtenerGerminacionPorId(parseInt(germinacionId)),
        obtenerLotesActivos()
      ])
      
      console.log("✅ Germinación cargada:", germinacionData)
      console.log("✅ Lotes cargados:", lotesData)
      setGerminacion(germinacionData)
      setLotes(lotesData)
      
      // Cargar tablas usando el endpoint correcto
      try {
        const tablasData = await obtenerTablasGerminacion(parseInt(germinacionId))
        console.log("✅ Tablas cargadas:", tablasData)
        setTablas(tablasData)
      } catch (tablasError: any) {
        console.warn("⚠️ No se pudieron cargar las tablas:", tablasError)
        // Si es 404, significa que no hay tablas, lo cual es normal
        if (tablasError.message && tablasError.message.includes('404')) {
          console.log("📝 No hay tablas creadas todavía - esto es normal")
          setTablas([])
        } else {
          throw tablasError // Re-lanzar si es otro tipo de error
        }
      }
    } catch (err: any) {
      console.error("❌ Error cargando datos:", err)
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
      
      console.log("🚀 Creando nueva tabla para germinación:", germinacionId)
      
      const nuevaTabla = await crearTablaGerminacion(parseInt(germinacionId))
      console.log("✅ Tabla creada:", nuevaTabla)
      
      // Solo recargar las tablas en lugar de recargar todo
      const tablasData = await obtenerTablasGerminacion(parseInt(germinacionId))
      setTablas(tablasData)
    } catch (err: any) {
      console.error("❌ Error creando tabla:", err)
      setError(err?.message || "Error al crear tabla")
    } finally {
      setCreatingTable(false)
    }
  }

  const handleFinalizarAnalisis = async () => {
    if (!window.confirm("¿Está seguro que desea finalizar este análisis? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setFinalizing(true)
      setError("")
      
      console.log("🏁 Finalizando análisis:", germinacionId)
      
      await finalizarGerminacion(parseInt(germinacionId))
      console.log("✅ Análisis finalizado")
      
      // Redirigir a la página de visualización (sin /editar)
      router.push(`/listado/analisis/germinacion/${germinacionId}`)
    } catch (err: any) {
      console.error("❌ Error finalizando análisis:", err)
      setError(err?.message || "Error al finalizar análisis")
    } finally {
      setFinalizing(false)
    }
  }

  const handleReabrirAnalisis = async () => {
    if (!window.confirm("¿Está seguro que desea editar este análisis? Podrá volver a modificarlo y sus tablas.")) {
      return
    }

    try {
      setFinalizing(true)
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
      
      console.log("✅ Análisis habilitado para edición")
    } catch (err: any) {
      console.error("❌ Error editando análisis:", err)
      setError(err?.message || "Error al editar análisis")
    } finally {
      setFinalizing(false)
    }
  }

  const handleEditarGerminacion = () => {
    if (!germinacion) return
    
    console.log("🔍 Iniciando edición de germinación")
    
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
      console.log("💾 Guardando cambios en germinación:", germinacionId)
      
      // Crear el DTO de edición con solo los campos permitidos
      const datosEdicion: GerminacionEditRequestDTO = {
        idLote: germinacionEditada.idLote,
        comentarios: germinacionEditada.comentarios
      }
      
      console.log("📊 Datos a enviar:", JSON.stringify(datosEdicion, null, 2))
      
      const germinacionActualizada = await actualizarGerminacion(parseInt(germinacionId), datosEdicion)
      console.log("✅ Germinación actualizada exitosamente")
      
      // Actualizar estado local
      setGerminacion(germinacionActualizada)
      setEditandoGerminacion(false)
      setGerminacionOriginal(null)
    } catch (error: any) {
      console.error("❌ Error guardando germinación:", error)
      alert(`Error al guardar los cambios: ${error.message || 'Error desconocido'}`)
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

  const isFinalized = germinacion.estado === 'FINALIZADO' || germinacion.fechaFin !== null
  const canCreateTable = !isFinalized && tablas.length < 4 // Máximo 4 tablas según especificaciones
  const canFinalize = !isFinalized && tablas.length > 0 && tablas.every(tabla => 
    tabla.finalizada === true
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Germinación</h1>
          <p className="text-muted-foreground">ID: {germinacion.analisisID}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isFinalized ? "default" : "secondary"}>
            {isFinalized ? "Finalizado" : "En Proceso"}
          </Badge>
        </div>
      </div>

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
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Información del Análisis
            </CardTitle>
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
                                <span className="text-muted-foreground">Nombre Lote:</span>
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
              {germinacion.fechaInicioGerm && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatearFechaLocal(germinacion.fechaInicioGerm)}
                  </p>
                </div>
              )}
              {germinacion.numDias && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Días de Análisis</p>
                  <p className="font-semibold">{germinacion.numDias}</p>
                </div>
              )}
              {germinacion.numeroRepeticiones && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Repeticiones</p>
                  <p className="font-semibold">{germinacion.numeroRepeticiones}</p>
                </div>
              )}
              {germinacion.numeroConteos && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conteos</p>
                  <p className="font-semibold">{germinacion.numeroConteos}</p>
                </div>
              )}
              {germinacion.fechaUltConteo && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Último Conteo</p>
                  <p className="font-semibold flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatearFechaLocal(germinacion.fechaUltConteo)}
                  </p>
                </div>
              )}
              {germinacion.comentarios && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                  <p className="font-semibold">{germinacion.comentarios}</p>
                </div>
              )}
              {germinacion.fechaConteos && germinacion.fechaConteos.length > 0 && (
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Fechas de Conteos</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {germinacion.fechaConteos.map((fecha, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-600">Conteo {index + 1}:</span> {formatearFechaLocal(fecha)}
                      </div>
                    ))}
                  </div>
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
        isFinalized={isFinalized}
        onTablaUpdated={cargarDatos}
        germinacion={germinacion}
        onAnalysisFinalized={() => router.push(`/listado/analisis/germinacion/${germinacionId}`)}
      />

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-4">          
          {canFinalize && (
            <Button 
              onClick={handleFinalizarAnalisis}
              disabled={finalizing}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {finalizing ? "Finalizando..." : "Finalizar Análisis"}
            </Button>
          )}

          
          <Button 
            onClick={() => router.push('/listado')}
            variant="outline"
            size="lg"
          >
            Volver al Listado
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}