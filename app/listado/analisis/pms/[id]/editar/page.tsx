"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Scale, 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  AlertTriangle,
  Hash,
  Target,
  Loader2,
  Edit
} from "lucide-react"
import Link from "next/link"
import { Toaster, toast } from "sonner"
import { PmsDTO, RepPmsDTO } from "@/app/models"
import { 
  obtenerPmsPorId, 
  actualizarPms,
  actualizarPmsConRedondeo,
  finalizarAnalisis
} from "@/app/services/pms-service"
import { 
  obtenerRepeticionesPorPms, 
  crearRepPms, 
  actualizarRepPms, 
  eliminarRepPms 
} from "@/app/services/repeticiones-service"

interface RepeticionEdit extends RepPmsDTO {
  isNew?: boolean
  isEditing?: boolean
}

export default function EditarPMSPage() {
  const params = useParams()
  const router = useRouter()
  const pmsId = params.id as string

  const [analisis, setAnalisis] = useState<PmsDTO | null>(null)
  const [repeticiones, setRepeticiones] = useState<RepeticionEdit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Estados para el formulario de análisis
  const [formData, setFormData] = useState({
    comentarios: ""
  })
  const [editingParams, setEditingParams] = useState(false)

  // Estados para agregar repetición
  const [showAddRepeticion, setShowAddRepeticion] = useState(false)
  const [newRepeticion, setNewRepeticion] = useState({
    numRep: 1,
    numTanda: 1,
    peso: 0,
    valido: true
  })

  // Estados para PMS con redondeo
  const [pmsConRedondeoTemp, setPmsConRedondeoTemp] = useState<string>("")
  const [savingRedondeo, setSavingRedondeo] = useState(false)

  // Estados para finalizar análisis
  const [finalizing, setFinalizing] = useState(false)

  // Función para recargar datos del análisis y repeticiones
  const recargarDatos = async () => {
    if (!pmsId) return

    try {
      const [analisisActualizado, repeticionesActualizadas] = await Promise.all([
        obtenerPmsPorId(parseInt(pmsId)),
        obtenerRepeticionesPorPms(parseInt(pmsId))
      ])
      
      setAnalisis(analisisActualizado)
      
      // Ordenar repeticiones por tanda y número de repetición
      const repeticionesOrdenadas = repeticionesActualizadas
        .sort((a, b) => {
          if (a.numTanda !== b.numTanda) {
            return a.numTanda - b.numTanda
          }
          return a.numRep - b.numRep
        })
        .map(rep => ({ ...rep, isEditing: false }))
      
      setRepeticiones(repeticionesOrdenadas)
      
      // Actualizar PMS con redondeo temporal
      setPmsConRedondeoTemp(analisisActualizado.pmsconRedon?.toString() || "")
      
      console.log("✅ Datos recargados exitosamente")
    } catch (err) {
      console.warn("⚠️ No se pudieron recargar los datos automáticamente:", err)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      if (!pmsId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [analisisData, repeticionesData] = await Promise.all([
          obtenerPmsPorId(parseInt(pmsId)),
          obtenerRepeticionesPorPms(parseInt(pmsId))
        ])
        
        setAnalisis(analisisData)
        
        // Ordenar repeticiones por tanda y número de repetición
        const repeticionesOrdenadas = repeticionesData
          .sort((a, b) => {
            if (a.numTanda !== b.numTanda) {
              return a.numTanda - b.numTanda
            }
            return a.numRep - b.numRep
          })
          .map(rep => ({ ...rep, isEditing: false }))
        
        setRepeticiones(repeticionesOrdenadas)
        
        // Inicializar formulario
        setFormData({
          comentarios: analisisData.comentarios || ""
        })
        
        // Inicializar PMS con redondeo temporal
        setPmsConRedondeoTemp(analisisData.pmsconRedon?.toString() || "")
      } catch (err: any) {
        const errorMsg = err?.message || "No se pudo cargar el análisis"
        setError(errorMsg)
        toast.error('Error al cargar análisis', {
          description: errorMsg,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pmsId])

  // Manejar cambios en formulario principal
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  // Guardar cambios del análisis
  const handleSaveAnalisis = async () => {
    if (!analisis || !hasChanges) return

    setSaving(true)
    try {
      const updatedAnalisis = await actualizarPms(analisis.analisisID, {
        idLote: analisis.idLote || 0,
        esSemillaBrozosa: analisis.esSemillaBrozosa, // Mantener el valor original
        comentarios: formData.comentarios
      })
      
      setAnalisis(updatedAnalisis)
      setEditingParams(false)
      setHasChanges(false)
      toast.success('Análisis actualizado exitosamente')
    } catch (err: any) {
      toast.error('Error al actualizar análisis', {
        description: err?.message || "No se pudo actualizar el análisis",
      })
    } finally {
      setSaving(false)
    }
  }

  // Agregar nueva repetición
  const handleAddRepeticion = async () => {
    if (!analisis) return

    try {
      const nextRepNumber = getNextRepeticionNumber()
      const currentTanda = getCurrentTanda()
      
      const nuevaRep = await crearRepPms(analisis.analisisID, {
        numRep: nextRepNumber,
        numTanda: currentTanda,
        peso: newRepeticion.peso,
        valido: true // Siempre inicia como válido, el backend determinará la validez final
      })
      
      setRepeticiones(prev => [...prev, { ...nuevaRep, isEditing: false }])
      
      // Reset form y cerrar
      setNewRepeticion({
        numRep: 1,
        numTanda: 1,
        peso: 0,
        valido: true
      })
      setShowAddRepeticion(false)
      
      toast.success('Repetición agregada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      await recargarDatos()
    } catch (err: any) {
      toast.error('Error al agregar repetición', {
        description: err?.message || "No se pudo agregar la repetición",
      })
    }
  }

  // Editar repetición existente
  const handleEditRepeticion = (index: number) => {
    setRepeticiones(prev => prev.map((rep, i) => 
      i === index ? { ...rep, isEditing: true } : rep
    ))
  }

  // Cancelar edición de repetición
  const handleCancelEditRepeticion = async (index: number) => {
    const repId = repeticiones[index].repPMSID
    try {
      // Recargar datos originales
      const repeticionOriginal = await obtenerRepeticionesPorPms(parseInt(pmsId))
      const repOriginal = repeticionOriginal.find(r => r.repPMSID === repId)
      
      if (repOriginal) {
        setRepeticiones(prev => prev.map((rep, i) => 
          i === index ? { ...repOriginal, isEditing: false } : rep
        ))
      }
    } catch (err) {
      toast.error('Error al cancelar edición')
    }
  }

  // Guardar cambios de repetición
  const handleSaveRepeticion = async (index: number) => {
    const rep = repeticiones[index]
    if (!analisis) return

    try {
      const updatedRep = await actualizarRepPms(analisis.analisisID, rep.repPMSID, {
        numRep: rep.numRep,
        numTanda: rep.numTanda,
        peso: rep.peso,
        valido: rep.valido
      })
      
      setRepeticiones(prev => prev.map((r, i) => 
        i === index ? { ...updatedRep, isEditing: false } : r
      ))
      
      toast.success('Repetición actualizada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      await recargarDatos()
    } catch (err: any) {
      toast.error('Error al actualizar repetición', {
        description: err?.message || "No se pudo actualizar la repetición",
      })
    }
  }

  // Eliminar repetición
  const handleDeleteRepeticion = async (index: number) => {
    const rep = repeticiones[index]
    if (!analisis) return

    if (!confirm(`¿Estás seguro de que deseas eliminar la repetición #${rep.numRep}?`)) {
      return
    }

    try {
      await eliminarRepPms(analisis.analisisID, rep.repPMSID)
      setRepeticiones(prev => prev.filter((_, i) => i !== index))
      
      toast.success('Repetición eliminada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      await recargarDatos()
    } catch (err: any) {
      toast.error('Error al eliminar repetición', {
        description: err?.message || "No se pudo eliminar la repetición",
      })
    }
  }

  // Actualizar campo de repetición
  const handleRepeticionChange = (index: number, field: keyof RepeticionEdit, value: any) => {
    setRepeticiones(prev => prev.map((rep, i) => 
      i === index ? { ...rep, [field]: value } : rep
    ))
  }

  // Actualizar PMS con redondeo
  const handleUpdatePmsConRedondeo = async () => {
    if (!analisis || !pmsConRedondeoTemp) return

    const valor = parseFloat(pmsConRedondeoTemp)
    if (isNaN(valor) || valor <= 0) {
      toast.error('Ingrese un valor válido mayor a 0')
      return
    }

    setSavingRedondeo(true)
    try {
      const updatedAnalisis = await actualizarPmsConRedondeo(analisis.analisisID, valor)
      setAnalisis(updatedAnalisis)
      toast.success('PMS con redondeo actualizado exitosamente')
    } catch (err: any) {
      toast.error('Error al actualizar PMS con redondeo', {
        description: err?.message || "No se pudo actualizar el valor",
      })
    } finally {
      setSavingRedondeo(false)
    }
  }

  // Finalizar análisis
  const handleFinalizarAnalisis = async () => {
    if (!analisis) return
    
    if (!window.confirm("¿Está seguro que desea finalizar este análisis? Esta acción no se puede deshacer.")) {
      return
    }

    setFinalizing(true)
    try {
      console.log("🏁 Finalizando análisis PMS:", analisis.analisisID)
      
      await finalizarAnalisis(analisis.analisisID)
      console.log("✅ Análisis PMS finalizado")
      
      // Redirigir a la página de visualización (sin /editar)
      router.push(`/listado/analisis/pms/${analisis.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    } finally {
      setFinalizing(false)
    }
  }

  // Obtener el siguiente número de repetición
  const getNextRepeticionNumber = (): number => {
    const currentTanda = getCurrentTanda()
    const repeticionesTandaActual = repeticiones.filter(rep => rep.numTanda === currentTanda)
    return repeticionesTandaActual.length + 1
  }

  // Obtener la tanda actual
  const getCurrentTanda = (): number => {
    if (!analisis) return 1
    
    // Contar repeticiones por tanda
    const tandas = new Map<number, number>()
    repeticiones.forEach(rep => {
      tandas.set(rep.numTanda, (tandas.get(rep.numTanda) || 0) + 1)
    })
    
    // Buscar la primera tanda que no esté completa
    for (let tanda = 1; tanda <= (analisis.numTandas || 1); tanda++) {
      const repeticionesTanda = tandas.get(tanda) || 0
      if (repeticionesTanda < (analisis.numRepeticionesEsperadas || 0)) {
        return tanda
      }
    }
    
    // Si todas las tandas están completas, seguir en la última tanda
    return analisis.numTandas || 1
  }

  // Agrupar repeticiones por tandas
  const getRepeticionesPorTandas = () => {
    if (!analisis) return []
    
    const grupos = new Map<number, RepeticionEdit[]>()
    
    // Agrupar repeticiones por tanda
    repeticiones.forEach(rep => {
      if (!grupos.has(rep.numTanda)) {
        grupos.set(rep.numTanda, [])
      }
      grupos.get(rep.numTanda)!.push(rep)
    })
    
    // Convertir a array y determinar si cada tanda está completa
    const resultado = []
    for (let tanda = 1; tanda <= (analisis.numTandas || 1); tanda++) {
      const repsEnTanda = grupos.get(tanda) || []
      const completa = repsEnTanda.length >= (analisis.numRepeticionesEsperadas || 0)
      
      resultado.push({
        tanda,
        repeticiones: repsEnTanda.sort((a, b) => a.numRep - b.numRep),
        completa
      })
    }
    
    return resultado
  }

  // Verificar si se pueden agregar más repeticiones
  const puedeAgregarRepeticiones = (): boolean => {
    if (!analisis) return false
    
    // Límite máximo de 16 repeticiones totales según el backend
    const totalRepeticiones = repeticiones.length
    if (totalRepeticiones >= 16) return false
    
    // Verificar si ya se cumple el estándar CV y hay al menos una tanda válida completa
    const umbralCV = analisis.esSemillaBrozosa ? 6.0 : 4.0
    const tieneCoeficienteValidoCalculado = analisis.coefVariacion && analisis.coefVariacion <= umbralCV
    
    if (tieneCoeficienteValidoCalculado) {
      // Verificar si hay al menos una tanda válida completa
      const tandasCompletas = getRepeticionesPorTandas().filter(t => t.completa)
      const tieneAlMenosUnaTandaValida = tandasCompletas.some(tanda => 
        tanda.repeticiones.some(rep => rep.valido === true)
      )
      
      // Si ya se cumple el estándar y hay una tanda válida, no se necesitan más repeticiones
      if (tieneAlMenosUnaTandaValida) return false
    }
    
    return true
  }

  // Verificar si se puede finalizar el análisis
  const puedeFinalizarAnalisis = (): boolean => {
    if (!analisis) return false
    
    // No se puede finalizar si ya está finalizado o aprobado
    if (analisis.estado === "FINALIZADO" || analisis.estado === "APROBADO" || analisis.estado === "PENDIENTE_APROBACION") {
      return false
    }
    
    // Debe tener al menos una repetición
    if (repeticiones.length === 0) return false
    
    // Debe tener estadísticas calculadas (promedio100g)
    if (!analisis.promedio100g) return false
    
    // Debe tener al menos una tanda válida completa
    const tandasCompletas = getRepeticionesPorTandas().filter(t => t.completa)
    const tieneAlMenosUnaTandaValida = tandasCompletas.some(tanda => 
      tanda.repeticiones.some(rep => rep.valido === true)
    )
    
    return tieneAlMenosUnaTandaValida
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
      case "FINALIZADO":
      case "PENDIENTE_APROBACION":
        return "secondary"
      case "PENDIENTE":
      case "PARA_REPETIR":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Cargando análisis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analisis) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/listado/analisis/pms/${pmsId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Detalle
            </Button>
          </Link>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-8 w-8" />
              <div>
                <h4 className="font-medium">Error al cargar análisis</h4>
                <p className="text-sm">{error || "Análisis no encontrado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/listado/analisis/pms/${pmsId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Detalle
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Editar Análisis PMS #{analisis.analisisID}</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Modificar parámetros y repeticiones del análisis
            </p>
          </div>
        </div>
        <Badge variant={getEstadoBadgeVariant(analisis.estado || "")} className="self-start sm:self-center">
          {analisis.estado === "APROBADO" ? "Aprobado" : 
           analisis.estado === "EN_PROCESO" ? "En Proceso" : 
           analisis.estado === "FINALIZADO" ? "Finalizado" :
           analisis.estado === "PENDIENTE_APROBACION" ? "Pendiente Aprobación" :
           analisis.estado === "PENDIENTE" ? "Pendiente" :
           analisis.estado === "PARA_REPETIR" ? "Para Repetir" : analisis.estado}
        </Badge>
      </div>

      {/* Información del Análisis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Parámetros del Análisis
            </CardTitle>
            <div className="flex gap-2">
              {!editingParams ? (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingParams(true)}
                  className="min-w-24"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingParams(false)
                      setFormData({
                        comentarios: analisis?.comentarios || ""
                      })
                      setHasChanges(false)
                    }}
                    className="min-w-24"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveAnalisis}
                    disabled={!hasChanges || saving}
                    size="sm"
                    className="min-w-32"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Número de Repeticiones Esperadas</Label>
                <Input
                  type="number"
                  value={analisis?.numRepeticionesEsperadas || ""}
                  className="bg-gray-50 cursor-not-allowed"
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Este valor no puede modificarse una vez creado el análisis
                </p>
              </div>

              <div className="space-y-2">
                <Label>Número de Tandas (Actual)</Label>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-lg text-blue-600">
                    {analisis?.numTandas || 1}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se gestiona automáticamente según el rendimiento de las repeticiones
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Semilla</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  <Badge variant={analisis?.esSemillaBrozosa ? "destructive" : "default"}>
                    {analisis?.esSemillaBrozosa ? "Semilla Brozosa" : "Semilla Normal"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Umbral CV: {analisis?.esSemillaBrozosa ? "≤ 6%" : "≤ 4%"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Este valor no puede modificarse una vez creado el análisis
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Observaciones</Label>
                {editingParams ? (
                  <Textarea
                    value={formData.comentarios}
                    onChange={(e) => handleFormChange("comentarios", e.target.value)}
                    placeholder="Comentarios adicionales sobre el análisis..."
                    rows={4}
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded border min-h-[100px]">
                    {analisis?.comentarios || "Sin observaciones"}
                  </div>
                )}
              </div>

              {/* Información del lote */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Información del Lote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lote:</span>
                    <span className="font-medium">{analisis?.lote || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">ID Lote:</span>
                    <span>{analisis?.idLote || "-"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cultivar:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Especie:</span>
                    <span>-</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repeticiones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Repeticiones ({repeticiones.length})
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestionar las repeticiones del análisis PMS
              </p>
            </div>
            {analisis.estado !== "APROBADO" && puedeAgregarRepeticiones() && (
              <Button 
                onClick={() => {
                  setNewRepeticion({
                    numRep: repeticiones.length + 1,
                    numTanda: 1,
                    peso: 0,
                    valido: true
                  })
                  setShowAddRepeticion(true)
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Repetición
              </Button>
            )}
            {!puedeAgregarRepeticiones() && (
              <div className="text-sm text-muted-foreground">
                {repeticiones.length >= 16 
                  ? "Límite máximo de 16 repeticiones alcanzado"
                  : "Ya se cumple el estándar CV con tandas válidas"
                }
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Formulario para nueva repetición */}
          {showAddRepeticion && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Nueva Repetición</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-xs">Peso (g) *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      value={newRepeticion.peso}
                      onChange={(e) => setNewRepeticion(prev => ({ 
                        ...prev, 
                        peso: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="Ingrese el peso en gramos"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Repetición #{getNextRepeticionNumber()} de la Tanda {getCurrentTanda()}</p>
                    <p>• Los valores de repetición, tanda y validez se asignan automáticamente</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddRepeticion(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddRepeticion}
                    disabled={newRepeticion.peso <= 0}
                  >
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabla de repeticiones */}
          {repeticiones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay repeticiones registradas aún.</p>
              <p className="text-sm mt-2">
                Agrega repeticiones para comenzar el análisis.
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Repetición</TableHead>
                    <TableHead className="whitespace-nowrap">Tanda</TableHead>
                    <TableHead className="whitespace-nowrap">Peso (g)</TableHead>
                    <TableHead className="whitespace-nowrap">Válido</TableHead>
                    <TableHead className="whitespace-nowrap">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {repeticiones.map((rep, index) => (
                    <TableRow key={rep.repPMSID}>
                      <TableCell className="whitespace-nowrap">
                        {rep.isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={rep.numRep}
                            onChange={(e) => handleRepeticionChange(index, "numRep", parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        ) : (
                          `#${rep.numRep}`
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {rep.isEditing ? (
                          <Input
                            type="number"
                            min="1"
                            value={rep.numTanda}
                            onChange={(e) => handleRepeticionChange(index, "numTanda", parseInt(e.target.value) || 1)}
                            className="w-24"
                          />
                        ) : (
                          rep.numTanda
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {rep.isEditing ? (
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            value={rep.peso}
                            onChange={(e) => handleRepeticionChange(index, "peso", parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        ) : (
                          `${rep.peso?.toFixed(3)}g`
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                          // Verificar si la tanda de esta repetición está completa
                          const tandaCompleta = getRepeticionesPorTandas()
                            .find(t => t.tanda === rep.numTanda)?.completa || false
                          
                          if (rep.isEditing) {
                            return (
                              <Checkbox
                                checked={rep.valido}
                                onCheckedChange={(checked) => handleRepeticionChange(index, "valido", !!checked)}
                              />
                            )
                          } else if (tandaCompleta) {
                            return (
                              <Badge variant={rep.valido ? "default" : "destructive"}>
                                {rep.valido ? "Válido" : "Inválido"}
                              </Badge>
                            )
                          } else {
                            return (
                              <Badge variant="outline" className="text-muted-foreground">
                                Indeterminado
                              </Badge>
                            )
                          }
                        })()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-1">
                          {rep.isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveRepeticion(index)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelEditRepeticion(index)}
                                className="text-gray-600 hover:text-gray-700"
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRepeticion(index)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRepeticion(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados Calculados */}
      {analisis.promedio100g && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Resultados Calculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Promedio 100g</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analisis.promedio100g.toFixed(4)}g
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Desviación Estándar</p>
                <p className="text-2xl font-bold">
                  {analisis.desvioStd?.toFixed(4) || "-"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Coef. Variación</p>
                <p className={`text-2xl font-bold ${
                  analisis.coefVariacion && analisis.coefVariacion <= (analisis.esSemillaBrozosa ? 6 : 4)
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {analisis.coefVariacion?.toFixed(4)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Repeticiones</p>
                <p className="text-2xl font-bold text-purple-600">
                  {repeticiones.length}
                </p>
              </div>
            </div>

            {/* PMS Final - Solo mostrar si hay repeticiones válidas */}
            {analisis.pmssinRedon && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Peso de Mil Semillas (PMS)
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* PMS Sin Redondeo */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        PMS sin Redondeo (Calculado)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {analisis.pmssinRedon.toFixed(4)}g
                        </div>
                        <p className="text-sm text-blue-700">
                          Valor calculado automáticamente
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* PMS Con Redondeo */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-800 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        PMS con Redondeo (Manual)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-green-700">
                          Valor Final para Certificado
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pmsConRedondeoTemp}
                              onChange={(e) => setPmsConRedondeoTemp(e.target.value)}
                              placeholder="Ej: 25.4"
                              className="text-center text-lg font-bold pr-8"
                            />
                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                              g
                            </span>
                          </div>
                          <Button
                            onClick={handleUpdatePmsConRedondeo}
                            disabled={savingRedondeo || !pmsConRedondeoTemp || parseFloat(pmsConRedondeoTemp) <= 0}
                            size="default"
                            className="min-w-24 bg-green-600 hover:bg-green-700"
                          >
                            {savingRedondeo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ingrese el valor final redondeado según criterios del laboratorio
                        </p>
                      </div>
                      
                      {analisis.pmsconRedon && (
                        <div className="text-center p-3 bg-green-100 rounded-md border border-green-300">
                          <div className="text-lg font-bold text-green-800 mb-1">
                            {analisis.pmsconRedon}g
                          </div>
                          <span className="text-sm font-medium text-green-700">
                            ✓ Valor Final Confirmado
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Acciones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-4">
          {puedeFinalizarAnalisis() && (
            <Button 
              onClick={handleFinalizarAnalisis}
              disabled={finalizing}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              {finalizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                "Finalizar Análisis"
              )}
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