"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  obtenerGerminacionPorId, 
  obtenerTablasGerminacion,
  crearTablaGerminacion,
  finalizarGerminacion,
  actualizarGerminacion
} from '@/app/services/germinacion-service'
import { GerminacionDTO, GerminacionRequestDTO } from '@/app/models/interfaces/germinacion'
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

// Función para validar que una fecha esté en el rango permitido
const validarFechaEnRango = (fecha: string, fechaInicio: string, fechaFin: string): boolean => {
  if (!fecha || !fechaInicio || !fechaFin) return true // Si no hay fechas, no validar
  
  const fechaValidar = new Date(fecha)
  const fechaMin = new Date(fechaInicio)
  const fechaMax = new Date(fechaFin)
  
  return fechaValidar >= fechaMin && fechaValidar <= fechaMax
}

// Función para generar fechas de conteo automáticamente
const generarFechasConteo = (fechaInicio: string, fechaUltConteo: string, numeroConteos: number): string[] => {
  if (!fechaInicio || !fechaUltConteo || numeroConteos <= 0) return []
  
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaUltConteo)
  
  if (inicio >= fin) return []
  
  const diferenciaDias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))
  const intervaloDias = Math.floor(diferenciaDias / (numeroConteos - 1))
  
  const fechas: string[] = []
  for (let i = 0; i < numeroConteos; i++) {
    const fecha = new Date(inicio)
    fecha.setDate(inicio.getDate() + (i * intervaloDias))
    fechas.push(fecha.toISOString().split('T')[0])
  }
  
  // Asegurar que la última fecha sea exactamente la fecha del último conteo
  if (fechas.length > 0) {
    fechas[fechas.length - 1] = fechaUltConteo
  }
  
  return fechas
}

export default function GerminacionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const germinacionId = params.id as string

  const [germinacion, setGerminacion] = useState<GerminacionDTO | null>(null)
  const [tablas, setTablas] = useState<TablaGermDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingTable, setCreatingTable] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState<string>("")
  const [editandoGerminacion, setEditandoGerminacion] = useState(false)
  const [germinacionEditada, setGerminacionEditada] = useState<GerminacionRequestDTO>({
    idLote: 0,
    comentarios: '',
    fechaInicioGerm: '',
    fechaConteos: [],
    fechaUltConteo: '',
    numDias: '',
    numeroRepeticiones: 4,
    numeroConteos: 3
  })
  const [germinacionOriginal, setGerminacionOriginal] = useState<GerminacionRequestDTO | null>(null)

  // Efectos para validaciones y actualizaciones automáticas de fechas
  useEffect(() => {
    if (!editandoGerminacion) return
    
    // Actualizar fechas de conteo automáticamente cuando cambia la fecha de inicio, fin o número de conteos
    const { fechaInicioGerm, fechaUltConteo, numeroConteos } = germinacionEditada
    
    if (fechaInicioGerm && fechaUltConteo && numeroConteos && numeroConteos > 0) {
      const fechasGeneradas = generarFechasConteo(fechaInicioGerm, fechaUltConteo, numeroConteos)
      
      // Solo actualizar si las fechas generadas son diferentes
      const fechasActualesStr = JSON.stringify(germinacionEditada.fechaConteos)
      const fechasGeneradasStr = JSON.stringify(fechasGeneradas)
      
      if (fechasActualesStr !== fechasGeneradasStr) {
        setGerminacionEditada(prev => ({
          ...prev,
          fechaConteos: fechasGeneradas
        }))
      }
    }
  }, [germinacionEditada.fechaInicioGerm, germinacionEditada.fechaUltConteo, germinacionEditada.numeroConteos, editandoGerminacion])

  // Efecto para validar que la fecha de último conteo no sea menor que la de inicio
  useEffect(() => {
    if (!editandoGerminacion) return
    
    const { fechaInicioGerm, fechaUltConteo } = germinacionEditada
    
    if (fechaInicioGerm && fechaUltConteo) {
      const fechaInicio = new Date(fechaInicioGerm)
      const fechaFin = new Date(fechaUltConteo)
      
      if (fechaFin < fechaInicio) {
        // Ajustar automáticamente la fecha de último conteo
        const fechaMinima = new Date(fechaInicio)
        fechaMinima.setDate(fechaMinima.getDate() + 7) // Mínimo 7 días después
        
        setGerminacionEditada(prev => ({
          ...prev,
          fechaUltConteo: fechaMinima.toISOString().split('T')[0]
        }))
      }
    }
  }, [germinacionEditada.fechaInicioGerm, germinacionEditada.fechaUltConteo, editandoGerminacion])

  // Funciones de validación para mostrar en UI
  const validarFechaInicio = (): boolean => {
    if (!editandoGerminacion || !germinacionEditada.fechaUltConteo) return true
    const fechaInicio = new Date(germinacionEditada.fechaInicioGerm)
    const fechaFin = new Date(germinacionEditada.fechaUltConteo)
    return fechaInicio < fechaFin
  }

  const validarFechaUltimoConteo = (): boolean => {
    if (!editandoGerminacion || !germinacionEditada.fechaInicioGerm) return true
    const fechaInicio = new Date(germinacionEditada.fechaInicioGerm)
    const fechaFin = new Date(germinacionEditada.fechaUltConteo)
    return fechaFin > fechaInicio
  }

  const validarFechaConteo = (fecha: string): boolean => {
    if (!editandoGerminacion) return true
    return validarFechaEnRango(fecha, germinacionEditada.fechaInicioGerm, germinacionEditada.fechaUltConteo)
  }

  const sonTodasLasFechasValidas = (): boolean => {
    if (!editandoGerminacion) return true
    
    const fechaInicioValida = validarFechaInicio()
    const fechaFinValida = validarFechaUltimoConteo()
    const fechasConteosValidas = germinacionEditada.fechaConteos.every(fecha => validarFechaConteo(fecha))
    
    return fechaInicioValida && fechaFinValida && fechasConteosValidas
  }

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando germinación y tablas para ID:", germinacionId)
      
      // Primero cargar solo la germinación
      const germinacionData = await obtenerGerminacionPorId(parseInt(germinacionId))
      console.log("✅ Germinación cargada:", germinacionData)
      console.log("📊 Estructura completa de datos:", JSON.stringify(germinacionData, null, 2))
      setGerminacion(germinacionData)
      
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
      
      // Actualizar estado local en lugar de recargar
      if (germinacion) {
        setGerminacion({
          ...germinacion,
          estado: 'FINALIZADO',
          fechaFin: new Date().toISOString()
        })
      }
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
    
    console.log("🔍 Datos de germinación disponibles:", JSON.stringify(germinacion, null, 2))
    
    // Necesitamos el ID del lote, ahora viene del backend en el DTO
    const datosGerminacion = {
      idLote: germinacion.idLote || 0, // Usar el idLote del DTO
      comentarios: germinacion.comentarios || '',
      fechaInicioGerm: convertirFechaParaInput(germinacion.fechaInicioGerm || ''),
      fechaConteos: (germinacion.fechaConteos || []).map(fecha => convertirFechaParaInput(fecha)),
      fechaUltConteo: convertirFechaParaInput(germinacion.fechaUltConteo || ''),
      numDias: germinacion.numDias || '',
      numeroRepeticiones: germinacion.numeroRepeticiones || 4,
      numeroConteos: germinacion.numeroConteos || 3
    }
    
    console.log("🔧 Datos preparados para edición:", JSON.stringify(datosGerminacion, null, 2))
    
    setGerminacionEditada(datosGerminacion)
    setGerminacionOriginal({ ...datosGerminacion })
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

    // Validar fechas antes de guardar
    if (!sonTodasLasFechasValidas()) {
      alert("Por favor, corrige las fechas inválidas antes de guardar")
      return
    }

    try {
      console.log("💾 Guardando cambios en germinación:", germinacionId)
      console.log("📊 Datos a enviar:", JSON.stringify(germinacionEditada, null, 2))
      
      const germinacionActualizada = await actualizarGerminacion(parseInt(germinacionId), germinacionEditada)
      console.log("✅ Germinación actualizada exitosamente")
      
      // Actualizar estado local
      setGerminacion(germinacionActualizada)
      setEditandoGerminacion(false)
      setGerminacionOriginal(null)
    } catch (error: any) {
      console.error("❌ Error guardando germinación:", error)
      console.error("❌ Detalles del error:", error)
      alert(`Error al guardar los cambios: ${error.message || 'Error desconocido'}`)
    }
  }

  const actualizarFechaConteo = (indice: number, fecha: string) => {
    setGerminacionEditada(prev => ({
      ...prev,
      fechaConteos: prev.fechaConteos.map((f, i) => i === indice ? fecha : f)
    }))
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {germinacion.fechaInicioGerm && (
                  <div>
                    <Label className="text-sm font-medium">Fecha de Inicio</Label>
                    <Input
                      type="date"
                      value={germinacionEditada.fechaInicioGerm}
                      onChange={(e) => setGerminacionEditada(prev => ({ ...prev, fechaInicioGerm: e.target.value }))}
                      className={!validarFechaInicio() ? 'border-red-500 bg-red-50' : ''}
                    />
                    {!validarFechaInicio() && (
                      <p className="text-xs text-red-600 mt-1">
                        La fecha de inicio debe ser anterior a la fecha de último conteo
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Fecha Último Conteo</Label>
                  <Input
                    type="date"
                    value={germinacionEditada.fechaUltConteo}
                    onChange={(e) => setGerminacionEditada(prev => ({ ...prev, fechaUltConteo: e.target.value }))}
                    min={germinacionEditada.fechaInicioGerm || undefined}
                    className={!validarFechaUltimoConteo() ? 'border-red-500 bg-red-50' : ''}
                  />
                  {!validarFechaUltimoConteo() && (
                    <p className="text-xs text-red-600 mt-1">
                      La fecha de último conteo debe ser posterior a la fecha de inicio
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Días de Análisis</Label>
                  <Input
                    value={germinacionEditada.numDias}
                    onChange={(e) => setGerminacionEditada(prev => ({ ...prev, numDias: e.target.value }))}
                    placeholder="Ej: 14 días"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Número de Repeticiones</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={germinacionEditada.numeroRepeticiones}
                    onChange={(e) => setGerminacionEditada(prev => ({ ...prev, numeroRepeticiones: parseInt(e.target.value) || 4 }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Número de Conteos</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={germinacionEditada.numeroConteos}
                    onChange={(e) => setGerminacionEditada(prev => ({ ...prev, numeroConteos: parseInt(e.target.value) || 3 }))}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Comentarios</Label>
                  <Input
                    value={germinacionEditada.comentarios}
                    onChange={(e) => setGerminacionEditada(prev => ({ ...prev, comentarios: e.target.value }))}
                    placeholder="Comentarios adicionales..."
                  />
                </div>
              </div>

              {/* Fechas de Conteos */}
              {germinacionEditada.fechaConteos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Fechas de Conteos 
                    <span className="text-xs text-gray-500 ml-2">
                      (Se generan automáticamente basadas en las fechas de inicio y fin)
                    </span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {germinacionEditada.fechaConteos.map((fecha, index) => {
                      const esValida = validarFechaConteo(fecha)
                      const esUltimoConteo = index === germinacionEditada.fechaConteos.length - 1
                      
                      return (
                        <div key={index}>
                          <Label className="text-xs text-gray-600">
                            Conteo {index + 1}
                            {esUltimoConteo && " (Último)"}
                          </Label>
                          <Input
                            type="date"
                            value={fecha}
                            onChange={(e) => actualizarFechaConteo(index, e.target.value)}
                            min={germinacionEditada.fechaInicioGerm || undefined}
                            max={germinacionEditada.fechaUltConteo || undefined}
                            className={!esValida ? 'border-red-500 bg-red-50' : ''}
                          />
                          {!esValida && (
                            <p className="text-xs text-red-600 mt-1">
                              Debe estar entre la fecha de inicio y último conteo
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Mensaje informativo */}
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Tip:</strong> Las fechas de conteo se actualizan automáticamente cuando cambias:
                    </p>
                    <ul className="text-xs text-blue-600 mt-1 ml-4 list-disc">
                      <li>La fecha de inicio de germinación</li>
                      <li>La fecha de último conteo</li>
                      <li>El número de conteos</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelarEdicionGerminacion}
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleGuardarGerminacion}
                  disabled={!hanCambiadoGerminacion() || !sonTodasLasFechasValidas()}
                  className={
                    !hanCambiadoGerminacion()
                      ? 'bg-gray-400 hover:bg-gray-500'
                      : !sonTodasLasFechasValidas()
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }
                >
                  {!hanCambiadoGerminacion() 
                    ? 'Sin Cambios' 
                    : !sonTodasLasFechasValidas()
                    ? 'Fechas Inválidas'
                    : 'Guardar Cambios'}
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

          {/* Botón para reabrir análisis finalizado */}
          {isFinalized && (
            <Button 
              onClick={handleReabrirAnalisis}
              disabled={finalizing}
              variant="outline"
              size="lg"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              {finalizing ? "Editando..." : "Editar Análisis"}
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