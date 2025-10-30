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
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { 
  obtenerPmsPorId, 
  actualizarPms,
  actualizarPmsConRedondeo,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir
} from "@/app/services/pms-service"
import { AnalisisHeaderBar } from "@/components/analisis/analisis-header-bar"
import { AnalisisAccionesCard } from "@/components/analisis/analisis-acciones-card"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"
import { 
  obtenerRepeticionesPorPms, 
  crearRepPms, 
  actualizarRepPms, 
  eliminarRepPms 
} from "@/app/services/repeticiones-service"
import { obtenerLotesActivos } from "@/app/services/lote-service"

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
  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Estados para el formulario de análisis
  const [formData, setFormData] = useState({
    idLote: 0,
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
  const [newRepeticionPesoInput, setNewRepeticionPesoInput] = useState<string>("")
  
  // Estado para mantener los inputs de texto durante la edición de repeticiones
  // Usamos un Map con el ID de repetición como clave
  const [editRepeticionPesoInputs, setEditRepeticionPesoInputs] = useState<Map<number, string>>(new Map())

  // Estados para PMS con redondeo
  const [pmsConRedondeoTemp, setPmsConRedondeoTemp] = useState<string>("")
  const [savingRedondeo, setSavingRedondeo] = useState(false)
  const [editingRedondeo, setEditingRedondeo] = useState(false)

  // Función para recargar datos del análisis y repeticiones
  const recargarDatos = async () => {
    if (!pmsId) return

    try {
      console.log("🔄 Recargando datos del análisis PMS:", pmsId)
      const [analisisActualizado, repeticionesActualizadas] = await Promise.all([
        obtenerPmsPorId(parseInt(pmsId)),
        obtenerRepeticionesPorPms(parseInt(pmsId))
      ])
      
      console.log("📊 Análisis actualizado:", analisisActualizado)
      console.log("📋 Repeticiones actualizadas:", repeticionesActualizadas)
      
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
      console.log("📊 Estado de validez de repeticiones:")
      repeticionesOrdenadas.forEach(rep => {
        console.log(`  Rep #${rep.numRep} (Tanda ${rep.numTanda}): ${rep.peso}g - Válido: ${rep.valido}`)
      })
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
        const [analisisData, repeticionesData, lotesData] = await Promise.all([
          obtenerPmsPorId(parseInt(pmsId)),
          obtenerRepeticionesPorPms(parseInt(pmsId)),
          obtenerLotesActivos()
        ])
        
        setAnalisis(analisisData)
        setLotes(lotesData)
        
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
          idLote: analisisData.idLote || 0,
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
        idLote: formData.idLote || 0,
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
      
      console.log("➕ Agregando nueva repetición #", nextRepNumber, "Tanda", currentTanda)
      
      const nuevaRep = await crearRepPms(analisis.analisisID, {
        numRep: nextRepNumber,
        numTanda: currentTanda,
        peso: newRepeticion.peso,
        valido: true // Siempre inicia como válido, el backend determinará la validez final
      })
      
      console.log("✅ Repetición creada:", nuevaRep)
      
      setRepeticiones(prev => [...prev, { ...nuevaRep, isEditing: false }])
      
      // Reset form y cerrar
      setNewRepeticion({
        numRep: 1,
        numTanda: 1,
        peso: 0,
        valido: true
      })
      setNewRepeticionPesoInput("")
      setShowAddRepeticion(false)
      
      toast.success('Repetición agregada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      console.log("🔄 Recargando datos después de agregar repetición...")
      await recargarDatos()
      
      console.log("🔍 Verificando si aún se puede agregar más repeticiones...")
      // La función puedeAgregarRepeticiones() se re-evaluará automáticamente con los datos actualizados
    } catch (err: any) {
      console.error("❌ Error al agregar repetición:", err)
      toast.error('Error al agregar repetición', {
        description: err?.message || "No se pudo agregar la repetición",
      })
    }
  }

  // Editar repetición existente
  const handleEditRepeticion = (index: number) => {
    const rep = repeticiones[index]
    // Inicializar el input de texto con el valor actual del peso
    setEditRepeticionPesoInputs(prev => {
      const newMap = new Map(prev)
      newMap.set(rep.repPMSID, rep.peso?.toString() || "")
      return newMap
    })
    
    setRepeticiones(prev => prev.map((rep, i) => 
      i === index ? { ...rep, isEditing: true } : rep
    ))
  }

  // Cancelar edición de repetición
  const handleCancelEditRepeticion = async (index: number) => {
    const repId = repeticiones[index].repPMSID
    
    // Limpiar el input de texto de edición
    setEditRepeticionPesoInputs(prev => {
      const newMap = new Map(prev)
      newMap.delete(repId)
      return newMap
    })
    
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

    // Limpiar el input de texto de edición
    setEditRepeticionPesoInputs(prev => {
      const newMap = new Map(prev)
      newMap.delete(rep.repPMSID)
      return newMap
    })

    try {
      console.log("💾 Guardando repetición:", rep)
      const updatedRep = await actualizarRepPms(analisis.analisisID, rep.repPMSID, {
        numRep: rep.numRep,
        numTanda: rep.numTanda,
        peso: rep.peso,
        valido: rep.valido
      })
      
      console.log("✅ Repetición guardada:", updatedRep)
      
      setRepeticiones(prev => prev.map((r, i) => 
        i === index ? { ...updatedRep, isEditing: false } : r
      ))
      
      toast.success('Repetición actualizada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      console.log("🔄 Iniciando recarga de datos después de actualizar repetición...")
      await recargarDatos()
    } catch (err: any) {
      console.error("❌ Error al actualizar repetición:", err)
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
      console.log("🗑️ Eliminando repetición:", rep)
      await eliminarRepPms(analisis.analisisID, rep.repPMSID)
      setRepeticiones(prev => prev.filter((_, i) => i !== index))
      
      toast.success('Repetición eliminada exitosamente')
      
      // Recargar todos los datos para obtener estadísticas y validez actualizadas
      console.log("🔄 Recargando datos después de eliminar repetición...")
      await recargarDatos()
      console.log("✅ Recarga completada")
    } catch (err: any) {
      console.error("❌ Error al eliminar repetición:", err)
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
      setEditingRedondeo(false) // Desactivar modo edición después de guardar
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

    try {
      console.log("🏁 Finalizando análisis PMS:", analisis.analisisID)
      
      await finalizarAnalisis(analisis.analisisID)
      console.log("✅ Análisis PMS finalizado")
      
      toast.success("Análisis finalizado exitosamente")
      
      // Redirigir a la página de visualización (sin /editar)
      router.push(`/listado/analisis/pms/${analisis.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    }
  }

  // Aprobar análisis
  const handleAprobar = async () => {
    if (!analisis) return
    
    try {
      console.log("✅ Aprobando análisis PMS:", analisis.analisisID)
      await aprobarAnalisis(analisis.analisisID)
      toast.success("Análisis aprobado exitosamente")
      await recargarDatos()
    } catch (err: any) {
      console.error("❌ Error aprobando análisis:", err)
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!analisis) return
    
    try {
      console.log("🔄 Marcando análisis PMS para repetir:", analisis.analisisID)
      await marcarParaRepetir(analisis.analisisID)
      toast.success("Análisis marcado para repetir")
      await recargarDatos()
    } catch (err: any) {
      console.error("❌ Error marcando para repetir:", err)
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis",
      })
    }
  }

  // Finalizar y aprobar
  const handleFinalizarYAprobar = async () => {
    if (!analisis) return
    
    try {
      console.log("🏁✅ Finalizando y aprobando análisis PMS:", analisis.analisisID)
      // Cuando el admin finaliza, el backend ya lo aprueba automáticamente
      await finalizarAnalisis(analisis.analisisID)
      toast.success("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/pms/${analisis.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando y aprobando:", err)
      toast.error('Error al finalizar y aprobar', {
        description: err?.message || "No se pudo completar la acción",
      })
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
    
    // Contar repeticiones válidas por tanda
    const tandas = new Map<number, number>()
    repeticiones.forEach(rep => {
      if (rep.valido === true) {
        tandas.set(rep.numTanda, (tandas.get(rep.numTanda) || 0) + 1)
      }
    })
    
    // Buscar la primera tanda que no esté completa (no tenga suficientes repeticiones válidas)
    for (let tanda = 1; tanda <= (analisis.numTandas || 1); tanda++) {
      const repeticionesValidasTanda = tandas.get(tanda) || 0
      if (repeticionesValidasTanda < (analisis.numRepeticionesEsperadas || 0)) {
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
      // Una tanda está completa si tiene el número esperado de repeticiones VÁLIDAS
      const repeticionesValidasEnTanda = repsEnTanda.filter(rep => rep.valido === true).length
      const completa = repeticionesValidasEnTanda >= (analisis.numRepeticionesEsperadas || 0)
      
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
    
    // Límite máximo de 16 repeticiones totales
    const totalRepeticiones = repeticiones.length
    if (totalRepeticiones >= 16) {
      console.log("❌ No se pueden agregar más: límite de 16 alcanzado")
      return false
    }
    
    // Contar repeticiones por estado de validez
    const repeticionesValidas = repeticiones.filter(rep => rep.valido === true)
    const repeticionesInvalidas = repeticiones.filter(rep => rep.valido === false)
    const repeticionesIndeterminadas = repeticiones.filter(rep => rep.valido === null || rep.valido === undefined)
    
    console.log("📊 Estado de repeticiones:")
    console.log("  Total:", totalRepeticiones)
    console.log("  Válidas:", repeticionesValidas.length)
    console.log("  Inválidas:", repeticionesInvalidas.length)
    console.log("  Indeterminadas:", repeticionesIndeterminadas.length)
    console.log("  Esperadas:", analisis.numRepeticionesEsperadas)
    
    // CASO 1: Si hay repeticiones indeterminadas, siempre permitir agregar
    // (significa que la tanda aún no está completa o no se procesaron los cálculos)
    if (repeticionesIndeterminadas.length > 0) {
      console.log("✅ Permitir agregar: hay repeticiones indeterminadas")
      return true
    }
    
    // CASO 2: Si YA tengo suficientes repeticiones válidas, NO permitir agregar más
    // (ya se cumplió el objetivo, incluso si hay inválidas extras)
    if (repeticionesValidas.length >= (analisis.numRepeticionesEsperadas || 0)) {
      // Calcular CV para verificar si es aceptable
      const pesos = repeticionesValidas.map(rep => rep.peso)
      const promedio = pesos.reduce((sum, peso) => sum + peso, 0) / pesos.length
      const varianza = pesos.reduce((sum, peso) => sum + Math.pow(peso - promedio, 2), 0) / pesos.length
      const desviacion = Math.sqrt(varianza)
      const cv = (desviacion / promedio) * 100
      
      const umbralCV = analisis.esSemillaBrozosa ? 6.0 : 4.0
      
      console.log("📈 CV calculado:", cv.toFixed(2), "% (umbral:", umbralCV, "%)")
      
      // Si el CV es aceptable, NO permitir agregar más
      if (cv <= umbralCV) {
        console.log("❌ No permitir agregar: ya tiene", repeticionesValidas.length, "válidas con CV aceptable")
        return false
      }
      
      // Si el CV NO es aceptable, permitir agregar más para mejorar
      console.log("✅ Permitir agregar: CV mayor al umbral, necesita mejorar")
      return true
    }
    
    // CASO 3: Si hay repeticiones inválidas pero AÚN no alcanza las válidas esperadas,
    // permitir agregar para reemplazarlas
    if (repeticionesInvalidas.length > 0 && repeticionesValidas.length < (analisis.numRepeticionesEsperadas || 0)) {
      console.log("✅ Permitir agregar: hay inválidas y faltan válidas")
      return true
    }
    
    // CASO 4: Si no hay repeticiones válidas suficientes, permitir agregar
    if (repeticionesValidas.length < (analisis.numRepeticionesEsperadas || 0)) {
      console.log("✅ Permitir agregar: faltan repeticiones válidas")
      return true
    }
    
    console.log("❌ No permitir agregar: condiciones no cumplidas")
    return false
  }

  // Verificar si se puede finalizar el análisis
  const puedeFinalizarAnalisis = (): boolean => {
    if (!analisis) return false
    
    // No se puede finalizar si ya está aprobado o pendiente de aprobación
    if (analisis.estado === "APROBADO" || analisis.estado === "PENDIENTE_APROBACION") {
      return false
    }
    
    // Debe tener al menos una repetición
    if (repeticiones.length === 0) return false
    
    // Debe tener estadísticas calculadas (promedio100g)
    if (!analisis.promedio100g) return false
    
    // Debe tener PMS con redondeo ingresado
    if (!analisis.pmsconRedon) return false
    
    const totalRepeticiones = repeticiones.length
    const repeticionesValidas = repeticiones.filter(rep => rep.valido === true)
    
    // Si no hay repeticiones válidas, no se puede finalizar
    if (repeticionesValidas.length === 0) return false
    
    // Calcular CV de todas las repeticiones válidas
    const pesos = repeticionesValidas.map(rep => rep.peso)
    const promedio = pesos.reduce((sum, peso) => sum + peso, 0) / pesos.length
    const varianza = pesos.reduce((sum, peso) => sum + Math.pow(peso - promedio, 2), 0) / pesos.length
    const desviacion = Math.sqrt(varianza)
    const cv = (desviacion / promedio) * 100
    
    // Determinar umbral según tipo de semilla
    const umbralCV = analisis.esSemillaBrozosa ? 6.0 : 4.0
    
    // Se puede finalizar si:
    // 1. El CV es válido (≤ umbral), O
    // 2. Se alcanzó el límite de 16 repeticiones (aunque el CV no sea válido)
    return cv <= umbralCV || totalRepeticiones >= 16
  }

  // Verificar si se puede editar el PMS con redondeo
  const puedeEditarPmsConRedondeo = (): boolean => {
    if (!analisis) return false
    
    // No se puede editar si ya está aprobado o pendiente de aprobación
    if (analisis.estado === "APROBADO" || analisis.estado === "PENDIENTE_APROBACION") {
      return false
    }
    
    // Debe tener al menos una repetición
    if (repeticiones.length === 0) return false
    
    // Debe tener estadísticas calculadas (promedio100g)
    if (!analisis.promedio100g) return false
    
    const totalRepeticiones = repeticiones.length
    const repeticionesValidas = repeticiones.filter(rep => rep.valido === true)
    const repeticionesInvalidas = repeticiones.filter(rep => rep.valido === false)
    const repeticionesIndeterminadas = repeticiones.filter(rep => rep.valido === null || rep.valido === undefined)
    
    console.log("🎯 Verificando si puede editar PMS con redondeo:")
    console.log("  Total repeticiones:", totalRepeticiones)
    console.log("  Válidas:", repeticionesValidas.length)
    console.log("  Inválidas:", repeticionesInvalidas.length)
    console.log("  Indeterminadas:", repeticionesIndeterminadas.length)
    console.log("  Esperadas:", analisis.numRepeticionesEsperadas)
    
    // Se puede editar el PMS con redondeo si:
    // 1. Hay suficientes repeticiones válidas (sin contar indeterminadas ni inválidas)
    // 2. O si se alcanzó el límite de 16 repeticiones
    
    // Caso 1: Tiene suficientes repeticiones VÁLIDAS
    if (repeticionesValidas.length >= (analisis.numRepeticionesEsperadas || 0)) {
      console.log("✅ Puede editar: tiene suficientes repeticiones válidas")
      return true
    }
    
    // Caso 2: Límite alcanzado - 16 repeticiones máximo
    if (totalRepeticiones >= 16) {
      console.log("✅ Puede editar: alcanzó límite de 16 repeticiones")
      return true
    }
    
    console.log("❌ No puede editar: faltan repeticiones válidas")
    return false
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
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Header Universal */}
      <AnalisisHeaderBar
        tipoAnalisis="PMS"
        analisisId={analisis.analisisID}
        estado={analisis.estado || ""}
        volverUrl={`/listado/analisis/pms/${pmsId}`}
        modoEdicion={editingParams}
        onToggleEdicion={() => {
          if (editingParams) {
            setEditingParams(false)
            setFormData({
              idLote: analisis?.idLote || 0,
              comentarios: analisis?.comentarios || ""
            })
            setHasChanges(false)
          } else {
            setEditingParams(true)
          }
        }}
        onGuardarCambios={handleSaveAnalisis}
        guardando={saving}
        tieneCambios={hasChanges}
      />

      <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6">

      {/* Información del Análisis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Parámetros del Análisis
            </CardTitle>
            <div className="flex gap-2">
              <TablaToleranciasButton 
                pdfPath="/tablas-tolerancias/tabla-pms.pdf" 
                title="Tabla de Tolerancias"
              />
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
                        idLote: analisis?.idLote || 0,
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
                <Label>Lote *</Label>
                {editingParams ? (
                  <Select
                    value={formData.idLote?.toString() || ""}
                    onValueChange={(value) => 
                      handleFormChange("idLote", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un lote" />
                    </SelectTrigger>
                    <SelectContent>
                      {lotes.map((lote) => (
                        <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                          {lote.ficha} - {lote.cultivarNombre || 'Sin cultivar'} - {lote.especieNombre || 'Sin especie'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-gray-50 rounded border">
                    {analisis?.lote || `Lote ID: ${analisis?.idLote}` || "Sin lote asignado"}
                  </div>
                )}
              </div>

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
                      type="text"
                      value={newRepeticionPesoInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(',', '.')
                        // Permitir cualquier input válido para números decimales
                        if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                          setNewRepeticionPesoInput(value)
                          const numValue = parseFloat(value)
                          setNewRepeticion(prev => ({ 
                            ...prev, 
                            peso: isNaN(numValue) ? 0 : numValue 
                          }))
                        }
                      }}
                      onFocus={(e) => {
                        // Seleccionar todo el texto al hacer focus para facilitar reemplazo
                        e.target.select()
                      }}
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
                            type="text"
                            value={editRepeticionPesoInputs.get(rep.repPMSID) ?? ""}
                            onChange={(e) => {
                              const value = e.target.value.replace(',', '.')
                              // Permitir cualquier input válido para números decimales
                              if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                // Actualizar el input de texto
                                setEditRepeticionPesoInputs(prev => {
                                  const newMap = new Map(prev)
                                  newMap.set(rep.repPMSID, value)
                                  return newMap
                                })
                                
                                // Actualizar el valor numérico en la repetición
                                const numValue = parseFloat(value)
                                handleRepeticionChange(index, "peso", isNaN(numValue) ? 0 : numValue)
                              }
                            }}
                            onFocus={(e) => {
                              // Seleccionar todo el texto al hacer focus para facilitar reemplazo
                              e.target.select()
                            }}
                            className="w-24"
                          />
                        ) : (
                          `${rep.peso?.toFixed(3)}g`
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(() => {
                          // Mostrar estado de validación basado en el valor del backend
                          if (rep.valido === null || rep.valido === undefined) {
                            return (
                              <Badge variant="outline" className="text-muted-foreground">
                                Indeterminado
                              </Badge>
                            )
                          } else if (rep.valido === true) {
                            return (
                              <Badge variant="default" className="bg-green-600">
                                Válido
                              </Badge>
                            )
                          } else {
                            return (
                              <Badge variant="destructive">
                                Inválido
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

      {/* Advertencia de CV superado */}
      {analisis.coefVariacion && analisis.coefVariacion > (analisis.esSemillaBrozosa ? 6 : 4) && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Coeficiente de Variación Superado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-yellow-900">
                El coeficiente de variación actual (<strong>{analisis.coefVariacion.toFixed(4)}%</strong>) 
                supera el umbral permitido de <strong>{analisis.esSemillaBrozosa ? "6.0%" : "4.0%"}</strong> 
                para semillas {analisis.esSemillaBrozosa ? "brozosas" : "normales"}.
              </p>
              <p className="text-sm text-yellow-900">
                {repeticiones.length < 16 ? (
                  <>
                    Se recomienda agregar más tandas de repeticiones hasta alcanzar un CV aceptable 
                    o el límite máximo de 16 repeticiones.
                  </>
                ) : (
                  <>
                    Se ha alcanzado el límite máximo de 16 repeticiones. 
                    Puede finalizar el análisis aunque el CV no sea óptimo.
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="text-xs text-yellow-800">
                  <strong>Tandas actuales:</strong> {analisis.numTandas || 1}
                </div>
                <div className="text-xs text-yellow-800">
                  <strong>Repeticiones totales:</strong> {repeticiones.length}/16
                </div>
                <div className="text-xs text-yellow-800">
                  <strong>Repeticiones válidas:</strong> {repeticiones.filter(r => r.valido === true).length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        PMS sin Redondeo
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
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-green-800 flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          PMS con Redondeo
                        </CardTitle>
                        {!editingRedondeo && analisis.pmsconRedon && puedeEditarPmsConRedondeo() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRedondeo(true)}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editingRedondeo && puedeEditarPmsConRedondeo() ? (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-green-700">
                            Valor Final para Certificado
                          </Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                value={pmsConRedondeoTemp}
                                onChange={(e) => {
                                  const value = e.target.value.replace(',', '.')
                                  // Permitir cualquier input válido para números decimales
                                  if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                                    setPmsConRedondeoTemp(value)
                                  }
                                }}
                                onFocus={(e) => e.target.select()}
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
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingRedondeo(false)
                                setPmsConRedondeoTemp(analisis.pmsconRedon?.toString() || "")
                              }}
                              size="default"
                            >
                              Cancelar
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Ingrese el valor final redondeado según criterios del laboratorio
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {analisis.pmsconRedon ? (
                            <div className="text-center p-4 bg-green-100 rounded-md border border-green-300">
                              <div className="text-2xl font-bold text-green-800 mb-1">
                                {analisis.pmsconRedon}g
                              </div>
                              <span className="text-sm font-medium text-green-700">
                                ✓ Valor Final Confirmado
                              </span>
                            </div>
                          ) : (
                            <div className="text-center p-4 border-2 border-dashed border-green-300 rounded-md">
                              {puedeEditarPmsConRedondeo() ? (
                                <>
                                  <p className="text-green-700 font-medium mb-2">Valor no establecido</p>
                                  <Button
                                    onClick={() => setEditingRedondeo(true)}
                                    variant="outline"
                                    className="text-green-700 border-green-300 hover:bg-green-50"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Establecer Valor
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <p className="text-muted-foreground font-medium mb-2">Valor no disponible</p>
                                  <p className="text-sm text-muted-foreground">
                                    Necesita {analisis.numRepeticionesEsperadas || 0} repeticiones válidas 
                                    para poder establecer el valor final.
                                  </p>
                                  <div className="mt-2 text-xs text-red-600">
                                    Repeticiones válidas: {repeticiones.filter(rep => rep.valido === true).length} / {analisis.numRepeticionesEsperadas || 0}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
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
      <AnalisisAccionesCard
        analisisId={analisis.analisisID}
        tipoAnalisis="pms"
        estado={analisis.estado || ""}
        onAprobar={async () => {
          await aprobarAnalisis(analisis.analisisID)
          toast.success("Análisis aprobado exitosamente")
          router.push(`/listado/analisis/pms/${analisis.analisisID}`)
        }}
        onMarcarParaRepetir={async () => {
          await marcarParaRepetir(analisis.analisisID)
          toast.success("Análisis marcado para repetir")
          router.push(`/listado/analisis/pms/${analisis.analisisID}`)
        }}
        onFinalizarYAprobar={async () => {
          // Cuando el admin finaliza, el backend automáticamente lo aprueba
          await finalizarAnalisis(analisis.analisisID)
          toast.success("Análisis finalizado y aprobado exitosamente")
          router.push(`/listado/analisis/pms/${analisis.analisisID}`)
        }}
        onFinalizar={handleFinalizarAnalisis}
      />
      </div>
    </div>
  )
}