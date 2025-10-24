"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, AlertTriangle, TestTube, Target } from "lucide-react"
import Link from "next/link"
import { obtenerTetrazolioPorId, actualizarTetrazolio, actualizarPorcentajesRedondeados } from "@/app/services/tetrazolio-service"
import { obtenerRepeticionesPorTetrazolio } from "@/app/services/repeticiones-service"
import type { TetrazolioDTO, TetrazolioRequestDTO } from "@/app/models/interfaces/tetrazolio"
import type { RepTetrazolioViabilidadDTO } from "@/app/models/interfaces/repeticiones"
import { toast } from "sonner"
import TetrazolioFields from "@/app/registro/analisis/tetrazolio/form-tetrazolio"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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

        // Configurar porcentajes
        setPorcentajesEditados({
          porcViablesRedondeo: tetrazolioData.porcViablesRedondeo || 0,
          porcNoViablesRedondeo: tetrazolioData.porcNoViablesRedondeo || 0,
          porcDurasRedondeo: tetrazolioData.porcDurasRedondeo || 0
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

  const handleGuardarPorcentajes = async () => {
    try {
      const payload = {
        porcViablesRedondeo: parseFloat(String(porcentajesEditados.porcViablesRedondeo) || '0') || 0,
        porcNoViablesRedondeo: parseFloat(String(porcentajesEditados.porcNoViablesRedondeo) || '0') || 0,
        porcDurasRedondeo: parseFloat(String(porcentajesEditados.porcDurasRedondeo) || '0') || 0,
      }

      console.log("💾 Guardando porcentajes redondeados:", payload)
      const tetrazolioActualizado = await actualizarPorcentajesRedondeados(parseInt(tetrazolioId), payload)

      setTetrazolio(tetrazolioActualizado)
      setPorcentajesEditados({
        porcViablesRedondeo: tetrazolioActualizado.porcViablesRedondeo || 0,
        porcNoViablesRedondeo: tetrazolioActualizado.porcNoViablesRedondeo || 0,
        porcDurasRedondeo: tetrazolioActualizado.porcDurasRedondeo || 0
      })
      toast.success("Porcentajes actualizados exitosamente")
    } catch (err: any) {
      console.error("❌ Error al actualizar porcentajes:", err)
      toast.error(err.message || 'Error al actualizar porcentajes')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <Link href={`/listado/analisis/tetrazolio/${tetrazolioId}`}>
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-8">
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs sm:text-sm">Cancelar</span>
              </Button>
            </Link>

            <div className="flex flex-col gap-2">
              <div className="space-y-1 text-center lg:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-balance">
                    Editar Análisis de Tetrazolio #{tetrazolio.analisisID}
                  </h1>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {tetrazolio.estado}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-pretty">
                  Lote {tetrazolio.lote}
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Button
                  size="sm"
                  className="gap-1.5 w-full sm:w-auto h-9"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs sm:text-sm">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span className="text-xs sm:text-sm">Guardar cambios</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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

                  {/* Botón para guardar porcentajes */}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleGuardarPorcentajes}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Guardar Porcentajes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
