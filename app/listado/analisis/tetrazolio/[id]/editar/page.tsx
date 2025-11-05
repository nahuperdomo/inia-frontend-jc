"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, AlertTriangle, TestTube, Target, Plus, Hash, Edit, X } from "lucide-react"
import Link from "next/link"
import { 
  obtenerTetrazolioPorId, 
  actualizarTetrazolio,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir,
  actualizarPorcentajesRedondeados
} from "@/app/services/tetrazolio-service"
import { obtenerRepeticionesPorTetrazolio, crearRepTetrazolioViabilidad, actualizarRepTetrazolioViabilidad } from "@/app/services/repeticiones-service"
import type { TetrazolioDTO, TetrazolioRequestDTO } from "@/app/models/interfaces/tetrazolio"
import type { RepTetrazolioViabilidadDTO } from "@/app/models/interfaces/repeticiones"
import { toast } from "sonner"
import TetrazolioFields from "@/app/registro/analisis/tetrazolio/form-tetrazolio"
import { AnalisisHeaderBar } from "@/components/analisis/analisis-header-bar"
import { AnalisisAccionesCard } from "@/components/analisis/analisis-acciones-card"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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

// Función utilitaria para convertir fecha para input
const convertirFechaParaInput = (fechaString: string): string => {
  if (!fechaString) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
    return fechaString
  }

  const fecha = new Date(fechaString)
  if (isNaN(fecha.getTime())) return ''

  return fecha.toISOString().split('T')[0]
}

export default function EditarTetrazolioPage() {
  const params = useParams()
  const router = useRouter()
  const tetrazolioId = params.id as string

  const [tetrazolio, setTetrazolio] = useState<TetrazolioDTO | null>(null)
  const [repeticiones, setRepeticiones] = useState<RepTetrazolioViabilidadDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  type FormState = {
    fecha: string
    numSemillasPorRep: number
    numRepeticionesEsperadas: number | string
    pretratamiento: string
    pretratamientoOtro: string
    concentracion: string
    concentracionOtro: string
    tincionHs: number | string
    tincionHsOtro: string
    tincionTemp: number | string
    tincionTempOtro: string
    comentarios: string
    viabilidadInase: number | string
  }

  const [formData, setFormData] = useState<FormState>({
    fecha: "",
    numSemillasPorRep: 50,
    numRepeticionesEsperadas: 0,
    pretratamiento: "",
    pretratamientoOtro: "",
    concentracion: "",
    concentracionOtro: "",
    tincionHs: 24,
    tincionHsOtro: "",
    tincionTemp: 30,
    tincionTempOtro: "",
    comentarios: "",
    viabilidadInase: "",
  })

  // Estado para porcentajes redondeados
  const [porcentajesEditados, setPorcentajesEditados] = useState<{
    porcViablesRedondeo: number | string
    porcNoViablesRedondeo: number | string
    porcDurasRedondeo: number | string
  }>({
    porcViablesRedondeo: '',
    porcNoViablesRedondeo: '',
    porcDurasRedondeo: ''
  })

  // Estado para nueva repetición
  const [creatingRepeticion, setCreatingRepeticion] = useState(false)
  const [showAddRepeticion, setShowAddRepeticion] = useState(false)
  const [nuevaRepeticion, setNuevaRepeticion] = useState<any>({
    fecha: new Date().toISOString().split('T')[0],
    viablesNum: '',
    noViablesNum: '',
    duras: ''
  } as any)

  // Estados para edición de repeticiones
  const [editingRepeticionIndex, setEditingRepeticionIndex] = useState<number | null>(null)

  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState<{
    pretratamientoOtro?: string
    concentracionOtro?: string
    tincionHsOtro?: string
    tincionTempOtro?: string
  }>({})

  // Fecha de hoy en formato ISO
  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const targetId = Number.parseInt(tetrazolioId)
        console.log("Cargando Tetrazolio con ID:", targetId)

        const tetrazolioData = await obtenerTetrazolioPorId(targetId)
        console.log("Tetrazolio cargado exitosamente:", tetrazolioData)
        setTetrazolio(tetrazolioData)

        // Cargar repeticiones
        try {
          const repeticionesData = await obtenerRepeticionesPorTetrazolio(targetId)
          console.log("Repeticiones cargadas:", repeticionesData)
          setRepeticiones(repeticionesData)
        } catch (repError) {
          console.warn("Error al cargar repeticiones:", repError)
          setRepeticiones([])
        }

        // Configurar porcentajes - usar '' en lugar de 0 para campos vacíos
        setPorcentajesEditados({
          porcViablesRedondeo: tetrazolioData.porcViablesRedondeo ?? '',
          porcNoViablesRedondeo: tetrazolioData.porcNoViablesRedondeo ?? '',
          porcDurasRedondeo: tetrazolioData.porcDurasRedondeo ?? ''
        })

        // Opciones predefinidas para validar
        const opcionesPretratamiento = [
          "EP 16 horas",
          "EP 18 horas",
          "S/Pretratamiento",
          "Agua 7 horas",
          "Agua 8 horas",
        ]
        const opcionesConcentracion = ["1%", "0%", "5%", "0,75%"]
        const opcionesTincionHoras = ["2", "3", "16", "18"]
        const opcionesTemperatura = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40]

        // Detectar si pretratamiento es personalizado
        const pretratamientoActual = tetrazolioData.pretratamiento || ""
        const isPretratamientoPersonalizado = pretratamientoActual && !opcionesPretratamiento.includes(pretratamientoActual)

        // Detectar si concentración es personalizada
        const concentracionActual = tetrazolioData.concentracion || ""
        const isConcentracionPersonalizada = concentracionActual && !opcionesConcentracion.includes(concentracionActual)

        // Detectar si tinción horas es personalizada
        const tincionHsActual = tetrazolioData.tincionHs || 24
        const isTincionHsPersonalizada = !opcionesTincionHoras.includes(tincionHsActual.toString())

        // Detectar si temperatura es personalizada
        const tincionTempActual = tetrazolioData.tincionTemp || 30
        const isTincionTempPersonalizada = !opcionesTemperatura.includes(tincionTempActual)

        // Poblar formData con los datos existentes
        setFormData({
          fecha: convertirFechaParaInput(tetrazolioData.fecha || ""),
          numSemillasPorRep: tetrazolioData.numSemillasPorRep || 50,
          numRepeticionesEsperadas: tetrazolioData.numRepeticionesEsperadas ?? 2,
          pretratamiento: isPretratamientoPersonalizado ? "Otro (especificar)" : pretratamientoActual,
          pretratamientoOtro: isPretratamientoPersonalizado ? pretratamientoActual : "",
          concentracion: isConcentracionPersonalizada ? "Otro (especificar)" : concentracionActual,
          concentracionOtro: isConcentracionPersonalizada ? concentracionActual : "",
          tincionHs: isTincionHsPersonalizada ? "Otra (especificar)" : tincionHsActual,
          tincionHsOtro: isTincionHsPersonalizada ? tincionHsActual.toString() : "",
          tincionTemp: isTincionTempPersonalizada ? 0 : tincionTempActual,
          tincionTempOtro: isTincionTempPersonalizada ? tincionTempActual.toString() : "",
          comentarios: tetrazolioData.comentarios || "",
          viabilidadInase: tetrazolioData.viabilidadInase || "",
        })

      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los detalles del análisis de Tetrazolio")
      } finally {
        setLoading(false)
      }
    }

    if (tetrazolioId) {
      fetchData()
    }
  }, [tetrazolioId])


  // Control especial para numRepeticionesEsperadas: no permitir bajar de repeticiones.length
  const handleInputChange = useCallback((field: string, value: any) => {
    // Limpiar errores de validación cuando el usuario modifica campos "Otro"
    if (field === "pretratamientoOtro" || field === "concentracionOtro" || field === "tincionHsOtro" || field === "tincionTempOtro") {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }

    if (field === "numRepeticionesEsperadas") {
      // Si el valor está vacío, permitirlo temporalmente (usuario está escribiendo)
      if (value === "" || value === null || value === undefined) {
        setFormData(prev => ({ ...prev, [field]: "" }));
        return;
      }

      const numValue = Number(value);

      // Si no es un número válido, no actualizar
      if (isNaN(numValue)) {
        return;
      }

      // Solo validar cuando hay un número válido
      let nuevoValor = numValue;

      // Validar límite inferior basado en repeticiones ya creadas
      const minimo = Math.max(repeticiones.length, 2);
      
      if (numValue < minimo) {
        toast.error(
          repeticiones.length > 0
            ? `No se puede establecer un número de repeticiones menor al número de repeticiones ya creadas (${repeticiones.length}).`
            : `El número mínimo de repeticiones es 2.`,
          {
            description: `El valor mínimo permitido es ${minimo} repeticiones.`,
            duration: 4000,
          }
        );
        nuevoValor = minimo;
      } else if (numValue > 8) {
        toast.warning("El número máximo de repeticiones es 8", { duration: 3000 });
        nuevoValor = 8;
      }

      setFormData((prev) => ({
        ...prev,
        [field]: nuevoValor,
      }));

      return;
    }
    
    // Cualquier otro campo
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, [repeticiones.length]);

  const handleGuardarPorcentajes = async () => {
    try {
      const payload = {
        porcViablesRedondeo: parseFloat(String(porcentajesEditados.porcViablesRedondeo) || '0') || 0,
        porcNoViablesRedondeo: parseFloat(String(porcentajesEditados.porcNoViablesRedondeo) || '0') || 0,
        porcDurasRedondeo: parseFloat(String(porcentajesEditados.porcDurasRedondeo) || '0') || 0,
      }

      console.log(" Guardando porcentajes redondeados:", payload)
      const tetrazolioActualizado = await actualizarPorcentajesRedondeados(parseInt(tetrazolioId), payload)

      setTetrazolio(tetrazolioActualizado)
      setPorcentajesEditados({
        porcViablesRedondeo: tetrazolioActualizado.porcViablesRedondeo || 0,
        porcNoViablesRedondeo: tetrazolioActualizado.porcNoViablesRedondeo || 0,
        porcDurasRedondeo: tetrazolioActualizado.porcDurasRedondeo || 0
      })
      toast.success("Porcentajes actualizados exitosamente")
    } catch (err: any) {
      console.error(" Error al actualizar porcentajes:", err)
      toast.error(err.message || 'Error al actualizar porcentajes')
    }
  }

  const handleCrearRepeticion = async () => {
    if (!tetrazolio) return
    
    // Validación de límite de repeticiones
    if (repeticiones.length >= (tetrazolio.numRepeticionesEsperadas || 8)) {
      toast.error(`Ya se han creado todas las repeticiones esperadas (${tetrazolio.numRepeticionesEsperadas})`)
      return
    }
    
    // Validación de fecha nueva repetición: no puede ser futura
    if (nuevaRepeticion.fecha > hoy) {
      toast.error("La fecha de la repetición no puede ser posterior a hoy")
      return
    }

    const total =
      (parseInt(String(nuevaRepeticion.viablesNum) || '0') || 0) +
      (parseInt(String(nuevaRepeticion.noViablesNum) || '0') || 0) +
      (parseInt(String(nuevaRepeticion.duras) || '0') || 0)

    const esperado = tetrazolio?.numSemillasPorRep || 50
    const diferencia = Math.abs(total - esperado)
    const porcentajeDiferencia = (diferencia / esperado) * 100

    if (porcentajeDiferencia > 5) {
      toast.error(
        `El total (${total}) difiere en más del ±5% del esperado (${esperado}). Diferencia: ${porcentajeDiferencia.toFixed(1)}%. No se puede crear la repetición.`
      )
      return
    }

    try {
      setCreatingRepeticion(true)
      console.log("➕ Creando nueva repetición para tetrazolio:", tetrazolio.analisisID)
      
      await crearRepTetrazolioViabilidad(parseInt(tetrazolioId), nuevaRepeticion)
      
      // Recargar repeticiones
      const repeticionesActualizadas = await obtenerRepeticionesPorTetrazolio(parseInt(tetrazolioId))
      setRepeticiones(repeticionesActualizadas)
      
      // Limpiar formulario
      setNuevaRepeticion({
        fecha: new Date().toISOString().split("T")[0],
        viablesNum: '',
        noViablesNum: '',
        duras: '',
      })
      setShowAddRepeticion(false)
      
      toast.success("Repetición creada exitosamente")
      
      console.log(` Repetición creada. Total: ${repeticionesActualizadas.length}/${tetrazolio.numRepeticionesEsperadas}`)
    } catch (err: any) {
      console.error(" Error al crear repetición:", err)
      toast.error(err.message || "Error al crear repetición")
    } finally {
      setCreatingRepeticion(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveChanges()
  }


  const saveChanges = async () => {
    // Limpiar errores previos
    setValidationErrors({})

    // Validaciones básicas
    const hoy = new Date().toISOString().split('T')[0]
    if (!formData.fecha) {
      toast.error("Debe ingresar la fecha del ensayo")
      return
    }

    if (formData.fecha > hoy) {
      toast.error("La fecha no puede ser posterior a hoy")
      return
    }

    if (
      !formData.numRepeticionesEsperadas ||
      Number(formData.numRepeticionesEsperadas) < 2 ||
      Number(formData.numRepeticionesEsperadas) > 8
    ) {
      toast.error("El número de repeticiones debe estar entre 2 y 8")
      return
    }

    if (Number(formData.numRepeticionesEsperadas) < repeticiones.length) {
      toast.error(`No puede ser menor a las repeticiones ya creadas (${repeticiones.length})`)
      return
    }

    if (![25, 50, 100].includes(formData.numSemillasPorRep)) {
      toast.error("Las semillas por repetición deben ser 25, 50 o 100")
      return
    }

    // ========== VALIDACIONES PARA CAMPOS "OTRO (ESPECIFICAR)" ==========
    
    // Validar Pretratamiento
    if (formData.pretratamiento === "Otro (especificar)") {
      if (!formData.pretratamientoOtro || formData.pretratamientoOtro.trim() === "") {
        setValidationErrors(prev => ({ ...prev, pretratamientoOtro: "Campo obligatorio" }))
        toast.error("Debe especificar el pretratamiento personalizado", {
          description: "El campo de pretratamiento no puede estar vacío cuando selecciona 'Otro (especificar)'",
          duration: 4000,
        })
        return
      }
    }

    // Validar Concentración
    if (formData.concentracion === "Otro (especificar)") {
      if (!formData.concentracionOtro || formData.concentracionOtro.trim() === "") {
        setValidationErrors(prev => ({ ...prev, concentracionOtro: "Campo obligatorio" }))
        toast.error("Debe especificar la concentración personalizada", {
          description: "El campo de concentración no puede estar vacío cuando selecciona 'Otro (especificar)'",
          duration: 4000,
        })
        return
      }
    }

    // Validar Tinción Horas
    if (typeof formData.tincionHs === "string" && formData.tincionHs === "Otra (especificar)") {
      if (!formData.tincionHsOtro || formData.tincionHsOtro.trim() === "") {
        setValidationErrors(prev => ({ ...prev, tincionHsOtro: "Campo obligatorio" }))
        toast.error("Debe especificar las horas de tinción personalizadas", {
          description: "El campo de horas de tinción no puede estar vacío cuando selecciona 'Otra (especificar)'",
          duration: 4000,
        })
        return
      }
      const tincionHsValor = parseFloat(formData.tincionHsOtro)
      if (isNaN(tincionHsValor) || tincionHsValor <= 0) {
        setValidationErrors(prev => ({ ...prev, tincionHsOtro: "Debe ser un número válido mayor a 0" }))
        toast.error("Las horas de tinción deben ser un número válido mayor a 0")
        return
      }
    }

    // Validar Temperatura
    if (formData.tincionTemp === 0 || formData.tincionTemp === "0") {
      if (!formData.tincionTempOtro || formData.tincionTempOtro.trim() === "") {
        setValidationErrors(prev => ({ ...prev, tincionTempOtro: "Campo obligatorio" }))
        toast.error("Debe especificar la temperatura personalizada", {
          description: "El campo de temperatura no puede estar vacío cuando selecciona 'Otra (especificar)'",
          duration: 4000,
        })
        return
      }
      const tincionTempValor = parseFloat(formData.tincionTempOtro)
      if (isNaN(tincionTempValor) || tincionTempValor <= 0) {
        setValidationErrors(prev => ({ ...prev, tincionTempOtro: "Debe ser un número válido mayor a 0" }))
        toast.error("La temperatura debe ser un número válido mayor a 0")
        return
      }
    }

    try {
      setSaving(true)

      // Determinar valores finales basados en las selecciones
      const pretratamientoFinal =
        formData.pretratamiento === "Otro (especificar)"
          ? formData.pretratamientoOtro.trim()
          : formData.pretratamiento

      const concentracionFinal =
        formData.concentracion === "Otro (especificar)"
          ? formData.concentracionOtro.trim()
          : formData.concentracion

      const tincionHsFinal =
        (typeof formData.tincionHs === "string" && formData.tincionHs === "Otra (especificar)")
          ? parseFloat(formData.tincionHsOtro)
          : typeof formData.tincionHs === "string"
            ? parseFloat(formData.tincionHs)
            : formData.tincionHs

      const tincionTempFinal: number | undefined =
        formData.tincionTemp === 0 || formData.tincionTemp === "0"
          ? parseFloat(formData.tincionTempOtro)
          : typeof formData.tincionTemp === "string"
            ? ((): number | undefined => {
                const parsed = parseFloat(formData.tincionTemp)
                return isNaN(parsed) ? undefined : parsed
              })()
            : formData.tincionTemp

      const requestData: TetrazolioRequestDTO = {
        idLote: tetrazolio!.idLote!,
        comentarios: formData.comentarios || undefined,
        numSemillasPorRep: formData.numSemillasPorRep,
        numRepeticionesEsperadas: Number(formData.numRepeticionesEsperadas),
        pretratamiento: pretratamientoFinal,
        concentracion: concentracionFinal,
        tincionHs: tincionHsFinal,
        tincionTemp: tincionTempFinal,
        fecha: formData.fecha,
        viabilidadInase: Number(formData.viabilidadInase) || undefined,
      }

      // Guardar cambios de repeticiones editadas
      for (const rep of repeticiones) {
        await actualizarRepTetrazolioViabilidad(
          Number.parseInt(tetrazolioId),
          rep.repTetrazolioViabID,
          {
            fecha: rep.fecha,
            viablesNum: Number(rep.viablesNum),
            noViablesNum: Number(rep.noViablesNum),
            duras: Number(rep.duras)
          }
        )
      }

      await actualizarTetrazolio(Number.parseInt(tetrazolioId), requestData)

      // Guardar porcentajes redondeados si están disponibles
      if (puedeEditarPorcentajes && (porcentajesEditados.porcViablesRedondeo !== '' || 
          porcentajesEditados.porcNoViablesRedondeo !== '' || 
          porcentajesEditados.porcDurasRedondeo !== '')) {
        const payloadPorcentajes = {
          porcViablesRedondeo: parseFloat(String(porcentajesEditados.porcViablesRedondeo) || '0') || 0,
          porcNoViablesRedondeo: parseFloat(String(porcentajesEditados.porcNoViablesRedondeo) || '0') || 0,
          porcDurasRedondeo: parseFloat(String(porcentajesEditados.porcDurasRedondeo) || '0') || 0,
        }
        await actualizarPorcentajesRedondeados(parseInt(tetrazolioId), payloadPorcentajes)
      }

      toast.success("Análisis de Tetrazolio actualizado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolioId}`)

    } catch (err: any) {
      console.error("Error al guardar:", err)
      toast.error(err?.message || "Error al actualizar el análisis")
    } finally {
      setSaving(false)
    }
  }

  // Finalizar análisis
  const handleFinalizarAnalisis = async () => {
    if (!tetrazolio) return
    
    try {
      console.log(" Finalizando análisis Tetrazolio:", tetrazolio.analisisID)
      await finalizarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis finalizado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error(" Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    }
  }

  // Aprobar análisis (solo para análisis en PENDIENTE_APROBACION o A_REPETIR)
  const handleAprobar = async () => {
    if (!tetrazolio) return
    
    try {
      console.log(" Aprobando análisis Tetrazolio:", tetrazolio.analisisID)
      await aprobarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis aprobado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error(" Error aprobando análisis:", err)
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!tetrazolio) return
    
    try {
      console.log(" Marcando análisis Tetrazolio para repetir:", tetrazolio.analisisID)
      await marcarParaRepetir(tetrazolio.analisisID)
      toast.success("Análisis marcado para repetir")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error(" Error marcando para repetir:", err)
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis",
      })
    }
  }

  // Finalizar y aprobar (solo para admin en estados no finalizados)
  const handleFinalizarYAprobar = async () => {
    if (!tetrazolio) return
    
    try {
      console.log(" Finalizando y aprobando análisis Tetrazolio:", tetrazolio.analisisID)
      // Cuando el admin finaliza, el backend automáticamente lo aprueba
      // No necesitamos llamar a aprobarAnalisis por separado
      await finalizarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error(" Error finalizando y aprobando:", err)
      toast.error('Error al finalizar y aprobar', {
        description: err?.message || "No se pudo completar la acción",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando análisis</p>
            <p className="text-sm text-muted-foreground">Obteniendo datos para edición...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !tetrazolio) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el análisis</h2>
            <p className="text-muted-foreground text-pretty">{error || "El análisis solicitado no existe"}</p>
          </div>
          <Link href="/listado/analisis/tetrazolio">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calcular si puede mostrarse la sección de porcentajes
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
  const puedeEditarPorcentajes = tetrazolio && repeticiones.length >= (tetrazolio.numRepeticionesEsperadas || 0)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Universal */}
      <AnalisisHeaderBar
        tipoAnalisis="Tetrazolio"
        analisisId={tetrazolio.analisisID}
        estado={tetrazolio.estado || ""}
        volverUrl={`/listado/analisis/tetrazolio/${tetrazolioId}`}
        modoEdicion={true}
        onToggleEdicion={() => router.push(`/listado/analisis/tetrazolio/${tetrazolioId}`)}
        onGuardarCambios={saveChanges}
        guardando={saving}
        tieneCambios={true}
      />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-muted/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <TestTube className="h-5 w-5 text-orange-600" />
                    </div>
                    Formulario de Edición
                  </CardTitle>
                  <TablaToleranciasButton 
                    pdfPath="/tablas-tolerancias/tabla-tetrazolio.pdf" 
                    title="Tabla de Tolerancias"
                    className="w-full sm:w-auto"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TetrazolioFields
                  formData={formData}
                  handleInputChange={handleInputChange}
                  modoEdicion={true}
                  validationErrors={validationErrors}
                />
              </CardContent>
            </Card>
          </form>

          {/* Resumen estadístico */}
          {repeticiones.length > 0 && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Resumen Estadístico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Semillas</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {totales.total}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Viables</p>
                    <p className="text-2xl font-bold text-green-600">
                      {totales.viables}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({totales.total > 0 ? ((totales.viables / totales.total) * 100).toFixed(1) : 0}%)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No Viables</p>
                    <p className="text-2xl font-bold text-red-600">
                      {totales.noViables}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({totales.total > 0 ? ((totales.noViables / totales.total) * 100).toFixed(1) : 0}%)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Duras</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {totales.duras}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({totales.total > 0 ? ((totales.duras / totales.total) * 100).toFixed(1) : 0}%)
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-orange-200">
                  <p className="text-sm text-center text-muted-foreground">
                    <strong>Repeticiones:</strong> {repeticiones.length} de {tetrazolio?.numRepeticionesEsperadas || 0} completadas
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de Repeticiones */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-muted/50">
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Hash className="h-5 w-5 text-orange-600" />
                    </div>
                    Repeticiones ({repeticiones.length}/{tetrazolio?.numRepeticionesEsperadas || 0})
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gestionar las repeticiones del análisis de Tetrazolio
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {tetrazolio.estado !== "APROBADO" && repeticiones.length < (tetrazolio.numRepeticionesEsperadas || 0) && (
                    <Button 
                      onClick={() => {
                        setNuevaRepeticion({
                          fecha: new Date().toISOString().split('T')[0],
                          viablesNum: '',
                          noViablesNum: '',
                          duras: ''
                        })
                        setShowAddRepeticion(true)
                      }}
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Repetición
                    </Button>
                  )}
                  {repeticiones.length >= (tetrazolio.numRepeticionesEsperadas || 0) && (
                    <div className="text-sm text-muted-foreground">
                      Todas las repeticiones esperadas completadas
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Crear nueva repetición */}
              {showAddRepeticion && (
                <Card className="border-dashed border-2 border-blue-300 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-blue-600" />
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
                          onChange={(e) => setNuevaRepeticion((prev: any) => ({ ...prev, fecha: e.target.value }))}
                          max={hoy}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-green-600">Viables (n°)</Label>
                        <Input
                          type="number"
                          min="0"
                          max={tetrazolio?.numSemillasPorRep || 100}
                          value={nuevaRepeticion.viablesNum}
                          onChange={(e) => setNuevaRepeticion((prev: any) => ({ ...prev, viablesNum: e.target.value === '' ? '' : e.target.value }))}
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
                          onChange={(e) => setNuevaRepeticion((prev: any) => ({ ...prev, duras: e.target.value === '' ? '' : e.target.value }))}
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
                          onChange={(e) => setNuevaRepeticion((prev: any) => ({ ...prev, noViablesNum: e.target.value === '' ? '' : e.target.value }))}
                        />
                        <div className="text-xs text-muted-foreground">
                          Semillas no viables (sin tinción)
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Total</Label>
                        <div className="h-9 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                          {(parseInt(String(nuevaRepeticion.viablesNum) || '0') || 0) + (parseInt(String(nuevaRepeticion.duras) || '0') || 0) + (parseInt(String(nuevaRepeticion.noViablesNum) || '0') || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Esperado: {tetrazolio?.numSemillasPorRep}
                        </div>
                      </div>
                    </div>

                    {/* Validación del total */}
                    {(() => {
                      const total = 
                        (parseInt(String(nuevaRepeticion.viablesNum) || '0') || 0) + 
                        (parseInt(String(nuevaRepeticion.duras) || '0') || 0) + 
                        (parseInt(String(nuevaRepeticion.noViablesNum) || '0') || 0)
                      const esperado = tetrazolio?.numSemillasPorRep || 50
                      const diferencia = Math.abs(total - esperado)
                      const porcentajeDiferencia = (diferencia / esperado) * 100

                      if (porcentajeDiferencia > 5) {
                        return (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                El total ({total}) difiere en más del ±5% del esperado ({esperado}). Diferencia: {porcentajeDiferencia.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        )
                      } else if (diferencia > 0) {
                        return (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center gap-2 text-yellow-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">
                                Ajuste permitido dentro del ±5%. Total: {total}, Esperado: {esperado}, Diferencia: {porcentajeDiferencia.toFixed(1)}%
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
                        Si la suma no coincide exactamente, se permite un ajuste de hasta ±5% del total esperado.
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleCrearRepeticion}
                      disabled={creatingRepeticion}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {creatingRepeticion ? 'Creando...' : 'Crear Repetición'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddRepeticion(false)
                        setNuevaRepeticion({
                          fecha: new Date().toISOString().split('T')[0],
                          viablesNum: '',
                          noViablesNum: '',
                          duras: ''
                        })
                      }}
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Lista de repeticiones editables */}
              {repeticiones.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {repeticiones.map((repeticion, index) => (
                      <Card key={repeticion.repTetrazolioViabID} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                Repetición #{index + 1}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {editingRepeticionIndex === index ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingRepeticionIndex(null)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingRepeticionIndex(index)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Fecha</Label>
                              <Input
                                type="date"
                                value={repeticion.fecha}
                                max={hoy}
                                onChange={e => {
                                  const nuevas = [...repeticiones];
                                  nuevas[index] = { ...nuevas[index], fecha: e.target.value };
                                  setRepeticiones(nuevas);
                                }}
                                disabled={editingRepeticionIndex !== index}
                              />
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Viables</Label>
                              <Input
                                type="number"
                                min="0"
                                value={repeticion.viablesNum}
                                onChange={e => {
                                  const nuevas = [...repeticiones];
                                  const valor = e.target.value === '' ? 0 : parseInt(e.target.value);
                                  nuevas[index] = { ...nuevas[index], viablesNum: valor };
                                  setRepeticiones(nuevas);
                                }}
                                disabled={editingRepeticionIndex !== index}
                              />
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">Duras</Label>
                              <Input
                                type="number"
                                min="0"
                                value={repeticion.duras}
                                onChange={e => {
                                  const nuevas = [...repeticiones];
                                  const valor = e.target.value === '' ? 0 : parseInt(e.target.value);
                                  nuevas[index] = { ...nuevas[index], duras: valor };
                                  setRepeticiones(nuevas);
                                }}
                                disabled={editingRepeticionIndex !== index}
                              />
                            </div>

                            <div>
                              <Label className="text-xs text-muted-foreground">No viables</Label>
                              <Input
                                type="number"
                                min="0"
                                value={repeticion.noViablesNum}
                                onChange={e => {
                                  const nuevas = [...repeticiones];
                                  const valor = e.target.value === '' ? 0 : parseInt(e.target.value);
                                  nuevas[index] = { ...nuevas[index], noViablesNum: valor };
                                  setRepeticiones(nuevas);
                                }}
                                disabled={editingRepeticionIndex !== index}
                              />
                            </div>

                            <div>
                              <Label>Total</Label>
                              <div className="h-9 px-3 py-2 border rounded-md bg-muted text-sm flex items-center">
                                {(repeticion.viablesNum || 0) + (repeticion.duras || 0) + (repeticion.noViablesNum || 0)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Esperado: {tetrazolio?.numSemillasPorRep}
                              </div>
                            </div>
                          </div>

                          {/* Advertencia de suma fuera de ±5% */}
                          {(() => {
                            const total = (repeticion.viablesNum || 0) + (repeticion.noViablesNum || 0) + (repeticion.duras || 0)
                            const esperado = tetrazolio?.numSemillasPorRep || 50
                            const diferencia = Math.abs(total - esperado)
                            const porcentajeDiferencia = (diferencia / esperado) * 100
                            if (porcentajeDiferencia > 5) {
                              return (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-4">
                                  <div className="flex items-center gap-2 text-red-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      El total ({total}) difiere en más del ±5% del esperado ({esperado}). Diferencia: {porcentajeDiferencia.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )
                            } else if (diferencia > 0) {
                              return (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mt-4">
                                  <div className="flex items-center gap-2 text-yellow-700">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">
                                      Ajuste permitido dentro del ±5%. Total: {total}, Esperado: {esperado}, Diferencia: {porcentajeDiferencia.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })()}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay repeticiones registradas aún.</p>
                  <p className="text-sm">Crear la primera repetición para comenzar el análisis.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección de Porcentajes Redondeados */}
          {puedeEditarPorcentajes && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Target className="h-5 w-5 text-orange-600" />
                  </div>
                  Porcentajes Finales con Redondeo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Resumen de totales calculados */}
                  {totales.total > 0 && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800 mb-3">Porcentajes Calculados (Automáticos)</h4>
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
                    </div>
                  )}

                  {/* Inputs para porcentajes redondeados */}
                  <div>
                    <h4 className="font-medium mb-4">Porcentajes Redondeados (Editables)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>% Viables (Redondeo)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={porcentajesEditados.porcViablesRedondeo}
                          onChange={(e) => setPorcentajesEditados(prev => ({
                            ...prev,
                            porcViablesRedondeo: e.target.value === '' ? '' : e.target.value
                          }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>% No Viables (Redondeo)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={porcentajesEditados.porcNoViablesRedondeo}
                          onChange={(e) => setPorcentajesEditados(prev => ({
                            ...prev,
                            porcNoViablesRedondeo: e.target.value === '' ? '' : e.target.value
                          }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>% Duras (Redondeo)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={porcentajesEditados.porcDurasRedondeo}
                          onChange={(e) => setPorcentajesEditados(prev => ({
                            ...prev,
                            porcDurasRedondeo: e.target.value === '' ? '' : e.target.value
                          }))}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
                  {/* Card de Acciones */}
          <AnalisisAccionesCard
            analisisId={tetrazolio.analisisID}
            tipoAnalisis="tetrazolio"
            estado={tetrazolio.estado || ""}
            onAprobar={handleAprobar}
            onMarcarParaRepetir={handleMarcarParaRepetir}
            onFinalizarYAprobar={handleFinalizarYAprobar}
            onFinalizar={handleFinalizarAnalisis}
          />
        </div>
      </div>
    </div>
  )
}
