"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, AlertTriangle, TestTube } from "lucide-react"
import Link from "next/link"
import { 
  obtenerTetrazolioPorId, 
  actualizarTetrazolio,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir
} from "@/app/services/tetrazolio-service"
import type { TetrazolioDTO, TetrazolioRequestDTO } from "@/app/models/interfaces/tetrazolio"
import { toast } from "sonner"
import TetrazolioFields from "@/app/registro/analisis/tetrazolio/form-tetrazolio"
import { AnalisisHeaderBar } from "@/components/analisis/analisis-header-bar"
import { AnalisisAccionesCard } from "@/components/analisis/analisis-acciones-card"

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  type FormState = {
    fecha: string
    numSemillasPorRep: number
    numRepeticionesEsperadas: number
    pretratamiento: string
    pretratamientoOtro: string
    concentracion: string
    concentracionOtro: string
    tincionHs: number | string
    tincionHsOtro: string
    tincionTemp: number | string
    tincionTempOtro: string
    comentarios: string
  }

  const [formData, setFormData] = useState<FormState>({
    fecha: "",
    numSemillasPorRep: 50,
    numRepeticionesEsperadas: 4,
    pretratamiento: "",
    pretratamientoOtro: "",
    concentracion: "",
    concentracionOtro: "",
    tincionHs: 24,
    tincionHsOtro: "",
    tincionTemp: 30,
    tincionTempOtro: "",
    comentarios: "",
  })

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
          numRepeticionesEsperadas: tetrazolioData.numRepeticionesEsperadas || 4,
          pretratamiento: isPretratamientoPersonalizado ? "Otro (especificar)" : pretratamientoActual,
          pretratamientoOtro: isPretratamientoPersonalizado ? pretratamientoActual : "",
          concentracion: isConcentracionPersonalizada ? "Otro (especificar)" : concentracionActual,
          concentracionOtro: isConcentracionPersonalizada ? concentracionActual : "",
          tincionHs: isTincionHsPersonalizada ? "Otra (especificar)" : tincionHsActual,
          tincionHsOtro: isTincionHsPersonalizada ? tincionHsActual.toString() : "",
          tincionTemp: isTincionTempPersonalizada ? 0 : tincionTempActual,
          tincionTempOtro: isTincionTempPersonalizada ? tincionTempActual.toString() : "",
          comentarios: tetrazolioData.comentarios || "",
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

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveChanges()
  }

  const saveChanges = async () => {
    // Validaciones
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
      formData.numRepeticionesEsperadas < 2 ||
      formData.numRepeticionesEsperadas > 8
    ) {
      toast.error("El número de repeticiones debe estar entre 2 y 8")
      return
    }

    if (![25, 50, 100].includes(formData.numSemillasPorRep)) {
      toast.error("Las semillas por repetición deben ser 25, 50 o 100")
      return
    }

    try {
      setSaving(true)

      // Determinar valores finales basados en las selecciones
      const pretratamientoFinal =
        formData.pretratamiento === "Otro (especificar)"
          ? formData.pretratamientoOtro
          : formData.pretratamiento

      const concentracionFinal =
        formData.concentracion === "Otro (especificar)"
          ? formData.concentracionOtro
          : formData.concentracion

      const tincionHsFinal =
        (typeof formData.tincionHs === "string" && formData.tincionHs === "Otra (especificar)")
          ? parseFloat(formData.tincionHsOtro) || 24
          : typeof formData.tincionHs === "string"
            ? parseFloat(formData.tincionHs) || 24
            : formData.tincionHs

      const tincionTempFinal: number | undefined =
        formData.tincionTemp === 0 || formData.tincionTemp === "0"
          ? (parseFloat(formData.tincionTempOtro) || 30)
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
        numRepeticionesEsperadas: formData.numRepeticionesEsperadas,
        pretratamiento: pretratamientoFinal,
        concentracion: concentracionFinal,
        tincionHs: tincionHsFinal,
        tincionTemp: tincionTempFinal,
        fecha: formData.fecha,
      }

      console.log("Enviando actualización:", requestData)

      await actualizarTetrazolio(Number.parseInt(tetrazolioId), requestData)

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
      console.log("🏁 Finalizando análisis Tetrazolio:", tetrazolio.analisisID)
      await finalizarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis finalizado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    }
  }

  // Aprobar análisis (solo para análisis en PENDIENTE_APROBACION o A_REPETIR)
  const handleAprobar = async () => {
    if (!tetrazolio) return
    
    try {
      console.log("✅ Aprobando análisis Tetrazolio:", tetrazolio.analisisID)
      await aprobarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis aprobado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error aprobando análisis:", err)
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!tetrazolio) return
    
    try {
      console.log("🔄 Marcando análisis Tetrazolio para repetir:", tetrazolio.analisisID)
      await marcarParaRepetir(tetrazolio.analisisID)
      toast.success("Análisis marcado para repetir")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error marcando para repetir:", err)
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis",
      })
    }
  }

  // Finalizar y aprobar (solo para admin en estados no finalizados)
  const handleFinalizarYAprobar = async () => {
    if (!tetrazolio) return
    
    try {
      console.log("🏁✅ Finalizando y aprobando análisis Tetrazolio:", tetrazolio.analisisID)
      // Cuando el admin finaliza, el backend automáticamente lo aprueba
      // No necesitamos llamar a aprobarAnalisis por separado
      await finalizarAnalisis(tetrazolio.analisisID)
      toast.success("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/tetrazolio/${tetrazolio.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando y aprobando:", err)
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
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TestTube className="h-5 w-5 text-orange-600" />
                  </div>
                  Formulario de Edición
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TetrazolioFields
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </CardContent>
            </Card>
          </form>

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
