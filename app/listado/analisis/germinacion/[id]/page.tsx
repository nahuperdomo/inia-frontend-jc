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
  finalizarGerminacion
} from '@/app/services/germinacion-service'
import { GerminacionDTO } from '@/app/models/interfaces/germinacion'
import { TablaGermDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { TablasGerminacionSection } from '@/components/germinacion/tablas-germinacion-section'
import { CalendarDays, Beaker, CheckCircle } from 'lucide-react'

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
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Información del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {new Date(germinacion.fechaInicioGerm).toLocaleDateString()}
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