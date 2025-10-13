"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  obtenerTetrazolioPorId, 
  actualizarTetrazolio,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir,
  actualizarPorcentajesRedondeados
} from '@/app/services/tetrazolio-service'
import { 
  crearRepTetrazolioViabilidad,
  obtenerRepeticionesPorTetrazolio
} from '@/app/services/repeticiones-service'
import { obtenerLotesActivos } from '@/app/services/lote-service'
import { TetrazolioDTO, TetrazolioRequestDTO } from '@/app/models/interfaces/tetrazolio'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { RepTetrazolioViabilidadDTO, RepTetrazolioViabilidadRequestDTO } from '@/app/models/interfaces/repeticiones'
import { 
  TestTube, 
  CalendarDays, 
  Beaker, 
  CheckCircle, 
  Edit,
  Plus,
  Thermometer,
  Timer,
  Hash,
  FlaskConical,
  Target,
  AlertTriangle,
  Save,
  X,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// Función utilitaria para formatear fechas
const formatearFechaLocal = (fechaString: string): string => {
  if (!fechaString) return ''
  
  const [year, month, day] = fechaString.split('-').map(Number)
  const fecha = new Date(year, month - 1, day)
  
  return fecha.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const convertirFechaParaInput = (fechaString: string): string => {
  if (!fechaString) return ''
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    return fechaString
  }
  
  const fecha = new Date(fechaString)
  if (isNaN(fecha.getTime())) return ''
  
  return fecha.toISOString().split('T')[0]
}

export default function TetrazolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tetrazolioId = params.id as string

  const [tetrazolio, setTetrazolio] = useState<TetrazolioDTO | null>(null)
  const [repeticiones, setRepeticiones] = useState<RepTetrazolioViabilidadDTO[]>([])
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingRepeticion, setCreatingRepeticion] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState<string>("")
  const [editandoTetrazolio, setEditandoTetrazolio] = useState(false)
  const [editandoPorcentajes, setEditandoPorcentajes] = useState(false)
  
  // Estados para edición
  const [tetrazolioEditado, setTetrazolioEditado] = useState<{
    idLote: number
    comentarios: string
    numSemillasPorRep: number
    numRepeticionesEsperadas: number
    pretratamiento: string
    pretratamientoOtro: string
    concentracion: string
    concentracionOtro: string
    tincionHs: number | string
    tincionHsOtro: string
    tincionTemp: number
    tincionTempOtro: string
    fecha: string
  }>({
    idLote: 0,
    comentarios: '',
    numSemillasPorRep: 50,
    numRepeticionesEsperadas: 0,
    pretratamiento: '',
    pretratamientoOtro: '',
    concentracion: '',
    concentracionOtro: '',
    tincionHs: 24,
    tincionHsOtro: '',
    tincionTemp: 30,
    tincionTempOtro: '',
    fecha: ''
  })

  // Estado para porcentajes redondeados
  const [porcentajesEditados, setPorcentajesEditados] = useState<{
    porcViablesRedondeo: number
    porcNoViablesRedondeo: number
    porcDurasRedondeo: number
  }>({
    porcViablesRedondeo: 0,
    porcNoViablesRedondeo: 0,
    porcDurasRedondeo: 0
  })

  // Estado para nueva repetición
  const [nuevaRepeticion, setNuevaRepeticion] = useState<RepTetrazolioViabilidadRequestDTO>({
    fecha: new Date().toISOString().split('T')[0],
    viablesNum: 0,
    noViablesNum: 0,
    duras: 0
  })

  // Estado para confirmar cancelar edición si hay cambios
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const populateTetrazolioEditadoFromTetrazolio = () => {
    if (!tetrazolio) return
    setTetrazolioEditado({
      idLote: tetrazolio.idLote || 0,
      comentarios: tetrazolio.comentarios || '',
      numSemillasPorRep: tetrazolio.numSemillasPorRep || 50,
      numRepeticionesEsperadas: tetrazolio.numRepeticionesEsperadas || 0,
      pretratamiento: tetrazolio.pretratamiento || '',
      pretratamientoOtro: '',
      concentracion: tetrazolio.concentracion || '',
      concentracionOtro: '',
      tincionHs: tetrazolio.tincionHs || 24,
      tincionHsOtro: '',
      tincionTemp: tetrazolio.tincionTemp || 30,
      tincionTempOtro: '',
      fecha: convertirFechaParaInput(tetrazolio.fecha || '')
    })
  }

  const tieneCambios = () => {
    if (!tetrazolio) return false

    const original = {
      idLote: tetrazolio.idLote || 0,
      comentarios: tetrazolio.comentarios || '',
      numSemillasPorRep: tetrazolio.numSemillasPorRep || 50,
      numRepeticionesEsperadas: tetrazolio.numRepeticionesEsperadas || 0,
      pretratamiento: tetrazolio.pretratamiento || '',
      pretratamientoOtro: '',
      concentracion: tetrazolio.concentracion || '',
      concentracionOtro: '',
      tincionHs: tetrazolio.tincionHs || 24,
      tincionHsOtro: '',
      tincionTemp: tetrazolio.tincionTemp || 30,
      tincionTempOtro: '',
      fecha: convertirFechaParaInput(tetrazolio.fecha || '')
    }

    // Comparar campo por campo
    return (
      original.idLote !== tetrazolioEditado.idLote ||
      original.comentarios !== tetrazolioEditado.comentarios ||
      original.numSemillasPorRep !== tetrazolioEditado.numSemillasPorRep ||
      original.numRepeticionesEsperadas !== tetrazolioEditado.numRepeticionesEsperadas ||
      original.pretratamiento !== tetrazolioEditado.pretratamiento ||
      original.pretratamientoOtro !== tetrazolioEditado.pretratamientoOtro ||
      original.concentracion !== tetrazolioEditado.concentracion ||
      original.concentracionOtro !== tetrazolioEditado.concentracionOtro ||
      String(original.tincionHs) !== String(tetrazolioEditado.tincionHs) ||
      original.tincionHsOtro !== tetrazolioEditado.tincionHsOtro ||
      original.tincionTemp !== tetrazolioEditado.tincionTemp ||
      original.tincionTempOtro !== tetrazolioEditado.tincionTempOtro ||
      original.fecha !== tetrazolioEditado.fecha
    )
  }

  const handleRequestCancelEdit = () => {
    if (tieneCambios()) {
      setShowCancelConfirm(true)
    } else {
      // No hay cambios, cerrar directamente y resetear
      setEditandoTetrazolio(false)
      populateTetrazolioEditadoFromTetrazolio()
    }
  }

  const confirmarDescartarCambios = () => {
    setShowCancelConfirm(false)
    setEditandoTetrazolio(false)
    populateTetrazolioEditadoFromTetrazolio()
  }

  const cargarDatos = async () => {
    try {
      setLoading(true)
      console.log("🔄 Cargando tetrazolio y repeticiones para ID:", tetrazolioId)
      
      const [tetrazolioData, lotesData] = await Promise.all([
        obtenerTetrazolioPorId(parseInt(tetrazolioId)),
        obtenerLotesActivos()
      ])
      
      console.log("✅ Tetrazolio cargado:", tetrazolioData)
      setTetrazolio(tetrazolioData)
      setLotes(lotesData)
      
      // Configurar datos para edición
      setTetrazolioEditado({
        idLote: tetrazolioData.idLote || 0,
        comentarios: tetrazolioData.comentarios || '',
        numSemillasPorRep: tetrazolioData.numSemillasPorRep || 50,
        numRepeticionesEsperadas: tetrazolioData.numRepeticionesEsperadas || 0,
        pretratamiento: tetrazolioData.pretratamiento || '',
        pretratamientoOtro: '',
        concentracion: tetrazolioData.concentracion || '',
        concentracionOtro: '',
        tincionHs: tetrazolioData.tincionHs || 24,
        tincionHsOtro: '',
        tincionTemp: tetrazolioData.tincionTemp || 30,
        tincionTempOtro: '',
        fecha: convertirFechaParaInput(tetrazolioData.fecha || '')
      })

      // Configurar porcentajes
      setPorcentajesEditados({
        porcViablesRedondeo: tetrazolioData.porcViablesRedondeo || 0,
        porcNoViablesRedondeo: tetrazolioData.porcNoViablesRedondeo || 0,
        porcDurasRedondeo: tetrazolioData.porcDurasRedondeo || 0
      })
      
      // Cargar repeticiones
      try {
        const repeticionesData = await obtenerRepeticionesPorTetrazolio(parseInt(tetrazolioId))
        console.log("✅ Repeticiones cargadas:", repeticionesData)
        setRepeticiones(repeticionesData)
      } catch (repError) {
        console.warn("⚠️ Error al cargar repeticiones:", repError)
        setRepeticiones([])
      }
      
    } catch (err: any) {
      console.error("❌ Error cargando datos:", err)
      setError(err.message || 'Error al cargar el análisis de tetrazolio')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tetrazolioId) {
      cargarDatos()
    }
  }, [tetrazolioId])

  const handleGuardarEdicion = async () => {
    try {
      // Determinar valores finales basados en las selecciones
      const pretratamientoFinal = tetrazolioEditado.pretratamiento === 'Otro (especificar)' 
        ? tetrazolioEditado.pretratamientoOtro 
        : tetrazolioEditado.pretratamiento

      const concentracionFinal = tetrazolioEditado.concentracion === 'Otro (especificar)'
        ? tetrazolioEditado.concentracionOtro
        : tetrazolioEditado.concentracion

      const tincionHsFinal = tetrazolioEditado.tincionHs === 'Otra (especificar)'
        ? parseFloat(tetrazolioEditado.tincionHsOtro) || 24
        : typeof tetrazolioEditado.tincionHs === 'string' 
          ? parseFloat(tetrazolioEditado.tincionHs) || 24
          : tetrazolioEditado.tincionHs

      const tincionTempFinal = tetrazolioEditado.tincionTemp === 0
        ? parseFloat(tetrazolioEditado.tincionTempOtro) || 30
        : tetrazolioEditado.tincionTemp

      const payload: TetrazolioRequestDTO = {
        idLote: tetrazolioEditado.idLote,
        comentarios: tetrazolioEditado.comentarios,
        numSemillasPorRep: tetrazolioEditado.numSemillasPorRep,
        numRepeticionesEsperadas: tetrazolioEditado.numRepeticionesEsperadas,
        pretratamiento: pretratamientoFinal,
        concentracion: concentracionFinal,
        tincionHs: tincionHsFinal,
        tincionTemp: tincionTempFinal,
        fecha: tetrazolioEditado.fecha
      }

      console.log("💾 Guardando cambios en tetrazolio:", payload)
      const tetrazolioActualizado = await actualizarTetrazolio(parseInt(tetrazolioId), payload)
      
      setTetrazolio(tetrazolioActualizado)
      setEditandoTetrazolio(false)
      console.log("✅ Tetrazolio actualizado exitosamente")
    } catch (err: any) {
      console.error("❌ Error al actualizar:", err)
      setError(err.message || 'Error al actualizar el análisis')
    }
  }

  const handleGuardarPorcentajes = async () => {
    try {
      console.log("💾 Guardando porcentajes redondeados:", porcentajesEditados)
      const tetrazolioActualizado = await actualizarPorcentajesRedondeados(parseInt(tetrazolioId), porcentajesEditados)
      
      setTetrazolio(tetrazolioActualizado)
      setEditandoPorcentajes(false)
      console.log("✅ Porcentajes actualizados exitosamente")
    } catch (err: any) {
      console.error("❌ Error al actualizar porcentajes:", err)
      setError(err.message || 'Error al actualizar porcentajes')
    }
  }

  const handleCrearRepeticion = async () => {
    try {
      setCreatingRepeticion(true)
      console.log("➕ Creando nueva repetición:", nuevaRepeticion)
      
      const repeticionCreada = await crearRepTetrazolioViabilidad(parseInt(tetrazolioId), nuevaRepeticion)
      console.log("✅ Repetición creada:", repeticionCreada)
      
      // Recargar repeticiones
      const repeticionesActualizadas = await obtenerRepeticionesPorTetrazolio(parseInt(tetrazolioId))
      setRepeticiones(repeticionesActualizadas)
      
      // Reset del formulario
      setNuevaRepeticion({
        fecha: new Date().toISOString().split('T')[0],
        viablesNum: 0,
        noViablesNum: 0,
        duras: 0
      })
      
    } catch (err: any) {
      console.error("❌ Error al crear repetición:", err)
      setError(err.message || 'Error al crear repetición')
    } finally {
      setCreatingRepeticion(false)
    }
  }

  const handleFinalizarAnalisis = async () => {
    try {
      setFinalizing(true)
      const tetrazolioFinalizado = await finalizarAnalisis(parseInt(tetrazolioId))
      setTetrazolio(tetrazolioFinalizado)
      console.log("✅ Análisis finalizado")
    } catch (err: any) {
      console.error("❌ Error al finalizar:", err)
      setError(err.message || 'Error al finalizar análisis')
    } finally {
      setFinalizing(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      "PENDIENTE": { variant: "outline" as const, color: "blue" },
      "EN_PROCESO": { variant: "secondary" as const, color: "yellow" }, 
      "FINALIZADO": { variant: "secondary" as const, color: "green" },
      "PENDIENTE_APROBACION": { variant: "secondary" as const, color: "orange" },
      "APROBADO": { variant: "default" as const, color: "green" },
      "PARA_REPETIR": { variant: "destructive" as const, color: "red" }
    }
    
    const config = variants[estado as keyof typeof variants] || variants["PENDIENTE"]
    
    return (
      <Badge variant={config.variant}>
        {estado.replace('_', ' ')}
      </Badge>
    )
  }

  // Calcular totales
  const calcularTotales = () => {
    if (repeticiones.length === 0) return { total: 0, viables: 0, noViables: 0, duras: 0 }
    
    const totales = repeticiones.reduce((acc, rep) => ({
      viables: acc.viables + (rep.viablesNum || 0),
      noViables: acc.noViables + (rep.noViablesNum || 0),
      duras: acc.duras + (rep.duras || 0)
    }), { viables: 0, noViables: 0, duras: 0 })
    
    const total = totales.viables + totales.noViables + totales.duras
    
    return { ...totales, total }
  }

  const totales = calcularTotales()
  const puedeFinalizarse = tetrazolio && repeticiones.length >= (tetrazolio.numRepeticionesEsperadas || 0)

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TestTube className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold">Cargando análisis de tetrazolio...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tetrazolio) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              Análisis de tetrazolio no encontrado
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header sticky solo dentro del área con scroll */}
      <div className="bg-background border-b sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-6">
          <Link href="/listado/analisis/tetrazolio">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl lg:text-4xl font-bold text-balance">
                  Análisis de Tetrazolio #{tetrazolio.analisisID}
                </h1>
                {getEstadoBadge(tetrazolio.estado || 'REGISTRADO')}
              </div>
              <p className="text-base text-muted-foreground text-pretty">
                Viabilidad con tetrazolio • Lote {tetrazolio.lote}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {editandoTetrazolio ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 w-full sm:w-auto"
                  onClick={handleRequestCancelEdit}
                >
                  <X className="h-4 w-4" />
                  Cancelar edición
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => {
                    // Cargar valores actuales en el formulario de edición antes de abrir
                    setTetrazolioEditado({
                      idLote: tetrazolio.idLote || 0,
                      comentarios: tetrazolio.comentarios || '',
                      numSemillasPorRep: tetrazolio.numSemillasPorRep || 50,
                      numRepeticionesEsperadas: tetrazolio.numRepeticionesEsperadas || 0,
                      pretratamiento: tetrazolio.pretratamiento || '',
                      pretratamientoOtro: '',
                      concentracion: tetrazolio.concentracion || '',
                      concentracionOtro: '',
                      tincionHs: tetrazolio.tincionHs || 24,
                      tincionHsOtro: '',
                      tincionTemp: tetrazolio.tincionTemp || 30,
                      tincionTempOtro: '',
                      fecha: convertirFechaParaInput(tetrazolio.fecha || '')
                    })
                    setEditandoTetrazolio(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Editar análisis
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Compensar altura del header sticky */}
    <div className="pt-4">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Información del análisis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-orange-600" />
            Información del Análisis
            {editandoTetrazolio && (
              <div className="ml-auto flex gap-2">
                <Button size="sm" onClick={handleGuardarEdicion}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRequestCancelEdit}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Lote */}
            <div className="space-y-2">
              <Label>Lote</Label>
              {editandoTetrazolio ? (
                <Select
                  value={tetrazolioEditado.idLote.toString()}
                  onValueChange={(value) => setTetrazolioEditado(prev => ({ ...prev, idLote: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lotes.map((lote) => (
                      <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                        {lote.ficha}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-medium">{tetrazolio.lote}</div>
              )}
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Fecha del Ensayo
              </Label>
              {editandoTetrazolio ? (
                <Input
                  type="date"
                  value={tetrazolioEditado.fecha}
                  onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, fecha: e.target.value }))}
                />
              ) : (
                <div className="text-sm">{formatearFechaLocal(tetrazolio.fecha || '')}</div>
              )}
            </div>

            {/* Semillas por repetición */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Número de semillas por repetición
              </Label>
              {editandoTetrazolio ? (
                <Input
                  type="number"
                  value={tetrazolioEditado.numSemillasPorRep}
                  disabled
                  onChange={() => { /* campo deshabilitado intencionalmente */ }}
                />
              ) : (
                <div className="text-sm">{tetrazolio.numSemillasPorRep}</div>
              )}
            </div>

            {/* Pretratamiento */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Pretratamiento
              </Label>
              {editandoTetrazolio ? (
                <div className="space-y-2">
                  <Select
                    value={tetrazolioEditado.pretratamiento}
                    onValueChange={(value) => setTetrazolioEditado(prev => ({ ...prev, pretratamiento: value, pretratamientoOtro: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar pretratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EP 16 horas">EP 16 horas</SelectItem>
                      <SelectItem value="EP 18 horas">EP 18 horas</SelectItem>
                      <SelectItem value="S/Pretratamiento">S/Pretratamiento</SelectItem>
                      <SelectItem value="Agua 7 horas">Agua 7 horas</SelectItem>
                      <SelectItem value="Agua 8 horas">Agua 8 horas</SelectItem>
                      <SelectItem value="Otro (especificar)">Otro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {tetrazolioEditado.pretratamiento === 'Otro (especificar)' && (
                    <Input
                      value={tetrazolioEditado.pretratamientoOtro}
                      onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, pretratamientoOtro: e.target.value }))}
                      placeholder="Ingresar pretratamiento manualmente"
                    />
                  )}
                </div>
              ) : (
                <div className="text-sm">{tetrazolio.pretratamiento || 'Ninguno'}</div>
              )}
            </div>

            {/* Concentración */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Beaker className="h-4 w-4" />
                Concentración
              </Label>
              {editandoTetrazolio ? (
                <div className="space-y-2">
                  <Select
                    value={tetrazolioEditado.concentracion}
                    onValueChange={(value) => setTetrazolioEditado(prev => ({ ...prev, concentracion: value, concentracionOtro: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar concentración" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1%">1%</SelectItem>
                      <SelectItem value="0%">0%</SelectItem>
                      <SelectItem value="5%">5%</SelectItem>
                      <SelectItem value="0,75%">0,75%</SelectItem>
                      <SelectItem value="Otro (especificar)">Otro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {tetrazolioEditado.concentracion === 'Otro (especificar)' && (
                    <Input
                      value={tetrazolioEditado.concentracionOtro}
                      onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, concentracionOtro: e.target.value }))}
                      placeholder="Ingresar concentración manualmente"
                    />
                  )}
                </div>
              ) : (
                <div className="text-sm">{tetrazolio.concentracion}</div>
              )}
            </div>

            {/* Temperatura */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Tinción (°C)
              </Label>
              {editandoTetrazolio ? (
                <div className="space-y-2">
                  <Select
                    value={tetrazolioEditado.tincionTemp.toString()}
                    onValueChange={(value) => {
                      if (value === 'Otro (especificar)') {
                        setTetrazolioEditado(prev => ({ ...prev, tincionTemp: 0, tincionTempOtro: '' }))
                      } else {
                        setTetrazolioEditado(prev => ({ ...prev, tincionTemp: parseInt(value), tincionTempOtro: '' }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar temperatura" />
                    </SelectTrigger>
                    <SelectContent>
                      {[30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map(temp => (
                        <SelectItem key={temp} value={temp.toString()}>{temp}°C</SelectItem>
                      ))}
                      <SelectItem value="Otro (especificar)">Otro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {tetrazolioEditado.tincionTemp === 0 && (
                    <Input
                      type="number"
                      value={tetrazolioEditado.tincionTempOtro}
                      onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, tincionTempOtro: e.target.value }))}
                      placeholder="Ingresar temperatura manualmente"
                      min="15"
                      max="45"
                    />
                  )}
                </div>
              ) : (
                <div className="text-sm">{tetrazolio.tincionTemp}°C</div>
              )}
            </div>

            {/* Tiempo de tinción */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Tinción (hs)
              </Label>
              {editandoTetrazolio ? (
                <div className="space-y-2">
                  <Select
                    value={tetrazolioEditado.tincionHs.toString()}
                    onValueChange={(value) => {
                      if (value === 'Otra (especificar)') {
                        setTetrazolioEditado(prev => ({ ...prev, tincionHs: 'Otra (especificar)', tincionHsOtro: '' }))
                      } else {
                        setTetrazolioEditado(prev => ({ ...prev, tincionHs: parseFloat(value), tincionHsOtro: '' }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tiempo de tinción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="3">3 horas</SelectItem>
                      <SelectItem value="16">16 horas</SelectItem>
                      <SelectItem value="18">18 horas</SelectItem>
                      <SelectItem value="Otra (especificar)">Otra (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  {tetrazolioEditado.tincionHs === 'Otra (especificar)' && (
                    <Input
                      type="number"
                      value={tetrazolioEditado.tincionHsOtro}
                      onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, tincionHsOtro: e.target.value }))}
                      placeholder="Ingresar tiempo manualmente"
                      min="1"
                      max="72"
                    />
                  )}
                </div>
              ) : (
                <div className="text-sm">{tetrazolio.tincionHs}h</div>
              )}
            </div>

            {/* Repeticiones esperadas */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Repeticiones Esperadas
              </Label>
              {editandoTetrazolio ? (
                <Input
                  type="number"
                  min={0}
                  value={tetrazolioEditado.numRepeticionesEsperadas}
                  disabled
                  onChange={() => { /* campo deshabilitado intencionalmente */ }}
                />
              ) : (
                <div className="text-sm">{tetrazolio.numRepeticionesEsperadas}</div>
              )}
            </div>
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <Label>Comentarios</Label>
            {editandoTetrazolio ? (
              <Textarea
                value={tetrazolioEditado.comentarios}
                onChange={(e) => setTetrazolioEditado(prev => ({ ...prev, comentarios: e.target.value }))}
                placeholder="Observaciones generales o particulares del análisis..."
                rows={3}
              />
            ) : (
              <div className="text-sm min-h-[60px] p-3 border rounded-md bg-muted/50">
                {tetrazolio.comentarios || 'Sin comentarios'}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Campo abierto para notas del analista.
            </div>
          </div>

          {/* Notas generales */}
          {!editandoTetrazolio && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
              <h4 className="font-medium text-orange-800 mb-2">Notas Generales del Análisis de Tetrazolio</h4>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• El orden de registro es: Viables → Duras → No viables.</li>
                <li>• Si la suma total no coincide con el número de semillas, se ajusta ±1 en Viables.</li>
                <li>• Los campos 'Pretratamiento', 'Tinción (hs)' y 'Tinción (°C)' pueden modificarse según la especie analizada.</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección de repeticiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-orange-600" />
            Repeticiones ({repeticiones.length}/{tetrazolio.numRepeticionesEsperadas})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Crear nueva repetición */}
          {repeticiones.length < (tetrazolio.numRepeticionesEsperadas || 0) && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nueva Repetición
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={nuevaRepeticion.fecha}
                      onChange={(e) => setNuevaRepeticion(prev => ({ ...prev, fecha: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-600">Viables (n°)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={tetrazolio?.numSemillasPorRep || 100}
                      value={nuevaRepeticion.viablesNum}
                      onChange={(e) => setNuevaRepeticion(prev => ({ ...prev, viablesNum: parseInt(e.target.value) || 0 }))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Semillas viables (teñidas)
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-yellow-600">Duras (n°)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={tetrazolio?.numSemillasPorRep || 100}
                      value={nuevaRepeticion.duras}
                      onChange={(e) => setNuevaRepeticion(prev => ({ ...prev, duras: parseInt(e.target.value) || 0 }))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Semillas duras (no absorbieron agua)
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-600">No viables (n°)</Label>
                    <Input
                      type="number"
                      min="0"
                      max={tetrazolio?.numSemillasPorRep || 100}
                      value={nuevaRepeticion.noViablesNum}
                      onChange={(e) => setNuevaRepeticion(prev => ({ ...prev, noViablesNum: parseInt(e.target.value) || 0 }))}
                    />
                    <div className="text-xs text-muted-foreground">
                      Semillas no viables (sin tinción)
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Total</Label>
                    <div className="h-9 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                      {(nuevaRepeticion.viablesNum || 0) + (nuevaRepeticion.duras || 0) + (nuevaRepeticion.noViablesNum || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Esperado: {tetrazolio?.numSemillasPorRep}
                    </div>
                  </div>
                </div>
                
                {/* Validación del total */}
                {(() => {
                  const total = (nuevaRepeticion.viablesNum || 0) + (nuevaRepeticion.duras || 0) + (nuevaRepeticion.noViablesNum || 0)
                  const esperado = tetrazolio?.numSemillasPorRep || 50
                  const diferencia = Math.abs(total - esperado)
                  
                  if (diferencia > 1) {
                    return (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            El total ({total}) difiere en más de ±1 del esperado ({esperado})
                          </span>
                        </div>
                      </div>
                    )
                  } else if (diferencia === 1) {
                    return (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center gap-2 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">
                            Ajuste permitido de ±1. Total: {total}, Esperado: {esperado}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()}
                
                {/* Notas de registro */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <strong>Orden de registro:</strong> Viables → Duras → No viables
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Si la suma no coincide exactamente, se permite ajuste de ±1 en Viables.
                  </div>
                </div>
                
                <Button 
                  onClick={handleCrearRepeticion} 
                  disabled={creatingRepeticion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {creatingRepeticion ? 'Creando...' : 'Crear Repetición'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Lista de repeticiones */}
          {repeticiones.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {repeticiones.map((repeticion, index) => (
                  <Card key={repeticion.repTetrazolioViabID} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Repetición</Label>
                          <div className="font-medium">#{index + 1}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Fecha</Label>
                          <div>{formatearFechaLocal(repeticion.fecha)}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Viables</Label>
                          <div className="text-green-600 font-medium">{repeticion.viablesNum}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">No Viables</Label>
                          <div className="text-red-600 font-medium">{repeticion.noViablesNum}</div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Duras</Label>
                          <div className="text-yellow-600 font-medium">{repeticion.duras}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resumen de totales */}
              {totales.total > 0 && (
                <Card className="bg-orange-50 border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de Resultados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totales.total}</div>
                        <div className="text-sm text-muted-foreground">Total Semillas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{totales.viables}</div>
                        <div className="text-sm text-muted-foreground">Viables</div>
                        <div className="text-xs">({((totales.viables / totales.total) * 100).toFixed(1)}%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{totales.noViables}</div>
                        <div className="text-sm text-muted-foreground">No Viables</div>
                        <div className="text-xs">({((totales.noViables / totales.total) * 100).toFixed(1)}%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{totales.duras}</div>
                        <div className="text-sm text-muted-foreground">Duras</div>
                        <div className="text-xs">({((totales.duras / totales.total) * 100).toFixed(1)}%)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Mensaje si no hay repeticiones */}
          {repeticiones.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay repeticiones registradas aún.</p>
              <p className="text-sm">Crear la primera repetición para comenzar el análisis.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Porcentajes redondeados */}
      {puedeFinalizarse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Porcentajes Finales con Redondeo
              <div className="ml-auto flex gap-2">
                {editandoPorcentajes ? (
                  <>
                    <Button size="sm" onClick={handleGuardarPorcentajes}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        // Si hay edición de porcentajes no necesitamos confirmación de tetrazolio edits
                        setEditandoPorcentajes(false)
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditandoPorcentajes(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>% Viables (Redondeo)</Label>
                {editandoPorcentajes ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={porcentajesEditados.porcViablesRedondeo}
                    onChange={(e) => setPorcentajesEditados(prev => ({ 
                      ...prev, 
                      porcViablesRedondeo: parseFloat(e.target.value) || 0 
                    }))}
                  />
                ) : (
                  <div className="text-lg font-medium text-green-600">
                    {tetrazolio.porcViablesRedondeo || 0}%
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>% No Viables (Redondeo)</Label>
                {editandoPorcentajes ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={porcentajesEditados.porcNoViablesRedondeo}
                    onChange={(e) => setPorcentajesEditados(prev => ({ 
                      ...prev, 
                      porcNoViablesRedondeo: parseFloat(e.target.value) || 0 
                    }))}
                  />
                ) : (
                  <div className="text-lg font-medium text-red-600">
                    {tetrazolio.porcNoViablesRedondeo || 0}%
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>% Duras (Redondeo)</Label>
                {editandoPorcentajes ? (
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={porcentajesEditados.porcDurasRedondeo}
                    onChange={(e) => setPorcentajesEditados(prev => ({ 
                      ...prev, 
                      porcDurasRedondeo: parseFloat(e.target.value) || 0 
                    }))}
                  />
                ) : (
                  <div className="text-lg font-medium text-yellow-600">
                    {tetrazolio.porcDurasRedondeo || 0}%
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
    <CancelEditDialog open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} onDiscard={confirmarDescartarCambios} />
  </div>
  )
}

// Nota: el Dialog se coloca fuera del return principal si se desea, pero aquí lo dejamos dentro del módulo y lo invocamos desde estado
function CancelEditDialog({ open, onClose, onDiscard }: { open: boolean, onClose: () => void, onDiscard: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Descartar cambios</DialogTitle>
          <DialogDescription>Hay cambios sin guardar en el formulario. ¿Deseas descartarlos?</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onClose()}>Continuar editando</Button>
          <Button onClick={() => { onDiscard() }}>Descartar cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// fin del archivo