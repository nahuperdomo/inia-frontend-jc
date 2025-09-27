"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, TestTube, Sprout, Scale, Microscope, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import DosnFields from "@/app/registro/analisis/dosn/form-dosn"
import { obtenerLotesActivos, type LoteSimple } from "@/app/services/lote-service"
import { registrarAnalisis } from "@/app/services/analisis-service"

export type AnalysisFormData = {
  loteid: string
  responsable: string
  prioridad: string
  observaciones: string

  // Pureza
  pesoInicial: string
  semillaPura: string
  materiaInerte: string

  // Otros Cultivos
  otrosCultivos: string
  otrosCultivosInsti: string
  otrosCultivosNum: string
  otrosCultivosIdCatalogo: string

  malezas: string
  malezasToleridas: string
  pesoTotal: string

  // Germinación
  fechaInicioGerm: string
  fechaUltConteo: string
  numeroRepeticiones: string
  numeroConteos: string
  numDias: string
  fechaConteos: string[]

  // DOSN (INIA)
  iniaFecha: string
  iniaGramos: string
  iniaCompleto: boolean
  iniaReducido: boolean
  iniaLimitado: boolean
  iniaReducidoLimitado: boolean

  // DOSN (INASE)
  inaseFecha: string
  inaseGramos: string
  inaseCompleto: boolean
  inaseReducido: boolean
  inaseLimitado: boolean
  inaseReducidoLimitado: boolean
}

const analysisTypes = [
  {
    id: "pureza",
    name: "Pureza Física",
    description: "Análisis de pureza física de semillas",
    icon: Search,
    color: "blue",
  },
  {
    id: "germinacion",
    name: "Germinación",
    description: "Ensayos de germinación estándar",
    icon: Sprout,
    color: "green",
  },
  {
    id: "pms",
    name: "Peso de Mil Semillas",
    description: "Determinación del peso de mil semillas",
    icon: Scale,
    color: "purple",
  },
  {
    id: "tetrazolio",
    name: "Tetrazolio",
    description: "Ensayo de viabilidad y vigor",
    icon: TestTube,
    color: "orange",
  },
  { id: "dosn", name: "DOSN", description: "Determinación de otras semillas nocivas", icon: Microscope, color: "red" },
]

export default function RegistroAnalisisPage() {
  const router = useRouter()
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("")
  const [selectedLote, setSelectedLote] = useState("")
  // Estados para listados de malezas y cultivos
  const [malezasList, setMalezasList] = useState<any[]>([])
  const [cultivosList, setCultivosList] = useState<any[]>([])
  const [formData, setFormData] = useState<AnalysisFormData>({
    loteid: "",
    responsable: "",
    prioridad: "",
    observaciones: "",
    pesoInicial: "",
    semillaPura: "",
    materiaInerte: "",
    otrosCultivos: "",
    otrosCultivosInsti: "",
    otrosCultivosNum: "",
    otrosCultivosIdCatalogo: "",
    malezas: "",
    malezasToleridas: "",
    pesoTotal: "",
    fechaInicioGerm: "",
    fechaUltConteo: "",
    numeroRepeticiones: "4",
    numeroConteos: "7",
    numDias: "",
    fechaConteos: [],
    iniaFecha: "",
    iniaGramos: "",
    iniaCompleto: false,
    iniaReducido: false,
    iniaLimitado: false,
    iniaReducidoLimitado: false,
    inaseFecha: "",
    inaseGramos: "",
    inaseCompleto: false,
    inaseReducido: false,
    inaseLimitado: false,
    inaseReducidoLimitado: false,
  })

  const handleInputChange = (field: keyof AnalysisFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }))
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toNum = (v: string) => (v === "" ? undefined : Number(v))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (!selectedAnalysisType) {
      setLoading(false)
      setError("Selecciona el tipo de análisis.")
      return
    }
    if (!formData.loteid) {
      setLoading(false)
      setError("Selecciona un lote.")
      return
    }

    if (selectedAnalysisType === "germinacion") {
      if (!formData.fechaInicioGerm) {
        setLoading(false)
        setError("La fecha de inicio de germinación es requerida.")
        return
      }
      if (!formData.fechaUltConteo) {
        setLoading(false)
        setError("La fecha del último conteo es requerida.")
        return
      }
      if (!formData.numDias) {
        setLoading(false)
        setError("El número de días es requerido.")
        return
      }
      const fechasCompletas = formData.fechaConteos.filter((f) => f !== "").length
      const fechasRequeridas = Number.parseInt(formData.numeroConteos) || 0
      if (fechasCompletas !== fechasRequeridas) {
        setLoading(false)
        setError(`Debes completar todas las ${fechasRequeridas} fechas de conteo.`)
        return
      }
    }

    let payload: any = {
      ...formData,
      idLote: formData.loteid,
      comentarios: formData.observaciones,
      estado: "REGISTRADO",
    }

    if (selectedAnalysisType === "dosn") {
      const mapTipoDosn = (obj: any, prefix: string) =>
        [
          obj[`${prefix}Completo`] ? "COMPLETO" : null,
          obj[`${prefix}Reducido`] ? "REDUCIDO" : null,
          obj[`${prefix}Limitado`] ? "LIMITADO" : null,
          obj[`${prefix}ReducidoLimitado`] ? "REDUCIDO_LIMITADO" : null,
        ].filter(Boolean)

      // Agregar otrosCultivos
      const cultivosListWithOtros = [...cultivosList]
      if (formData.otrosCultivos && formData.otrosCultivos !== "") {
        cultivosListWithOtros.push({
          listadoTipo: "OTROS",
          listadoInsti: formData.otrosCultivosInsti || "INIA",
          listadoNum: Number(formData.otrosCultivosNum) || 1,
          idCatalogo: formData.otrosCultivosIdCatalogo || null,
        })
      }

      // mapeo de malezas
      const mapMalezaTipo = (m: any) => {
        switch (m.tipoMaleza) {
          case "tolerancia-cero":
            return "MAL_TOLERANCIA_CERO"
          case "con-tolerancia":
            return "MAL_TOLERANCIA"
          case "comunes":
            return "MAL_COMUNES"
          case "no-contiene":
            return "MAL_COMUNES"
          default:
            return "MAL_COMUNES"
        }
      }

      const listados = [
        ...malezasList.map((m) => ({
          ...m,
          listadoTipo: mapMalezaTipo(m),
          listadoNum: m.numero ? Number(m.numero) : 0, // si no hay valor → 0
        })),
        ...cultivosListWithOtros.map((c) => ({ ...c, listadoTipo: "OTROS" })),
      ]

      payload = {
        idLote: formData.loteid,
        comentarios: formData.observaciones,
        estado: "REGISTRADO",
        // INIA
        fechaINIA: formData.iniaFecha || null,
        gramosAnalizadosINIA: toNum(formData.iniaGramos),
        tipoINIA: mapTipoDosn(formData, "inia"),
        // INASE
        fechaINASE: formData.inaseFecha || null,
        gramosAnalizadosINASE: toNum(formData.inaseGramos),
        tipoINASE: mapTipoDosn(formData, "inase"),
        // Listados
        listados,
      }
    } else if (selectedAnalysisType === "pureza") {
      payload = {
        ...payload,
        pesoInicial: toNum(formData.pesoInicial),
        semillaPura: toNum(formData.semillaPura),
        materiaInerte: toNum(formData.materiaInerte),
        otrosCultivos: toNum(formData.otrosCultivos),
        malezas: toNum(formData.malezas),
      }
    } else if (selectedAnalysisType === "germinacion") {
      payload = {
        ...payload,
        fechaInicioGerm: formData.fechaInicioGerm,
        fechaConteos: formData.fechaConteos.filter((fecha) => fecha !== ""), // Remove empty dates
        fechaUltConteo: formData.fechaUltConteo,
        numeroRepeticiones: toNum(formData.numeroRepeticiones),
        numeroConteos: toNum(formData.numeroConteos),
        numDias: formData.numDias,
      }
    }

    try {
      const response = await registrarAnalisis(payload, selectedAnalysisType)
      setSuccess(true)

      if (selectedAnalysisType === "germinacion" && response?.id) {
        setTimeout(() => {
          router.push(`/analisis/germinacion/${response.id}`)
        }, 1500)
      }
    } catch (err: any) {
      setError(err?.message || "Error al registrar análisis")
    } finally {
      setLoading(false)
    }
  }

  const [lotes, setLotes] = useState<LoteSimple[]>([])
  const [lotesLoading, setLotesLoading] = useState(true)
  const [lotesError, setLotesError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLotes = async () => {
      setLotesLoading(true)
      setLotesError(null)
      try {
        const data = await obtenerLotesActivos()
        setLotes(data)
      } catch {
        setLotesError("Error al cargar lotes")
      } finally {
        setLotesLoading(false)
      }
    }
    fetchLotes()
  }, [])

  const selectedLoteInfo = selectedLote ? lotes.find((l) => l.loteID.toString() === selectedLote) : null

  const isFormReady = () => {
    if (!selectedAnalysisType || !formData.loteid) return false

    if (selectedAnalysisType === "germinacion") {
      const fechasCompletas = formData.fechaConteos.filter((f) => f !== "").length
      const fechasRequeridas = Number.parseInt(formData.numeroConteos) || 0
      return (
        formData.fechaInicioGerm && formData.fechaUltConteo && formData.numDias && fechasCompletas === fechasRequeridas
      )
    }

    return true
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/registro">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Registro
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Registro de Análisis</h1>
          <p className="text-muted-foreground">Configura los parámetros iniciales para tu análisis</p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Configuración Inicial</h3>
                <p className="text-sm text-blue-700">Define los parámetros básicos del análisis</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-600" />
            <div className="flex items-center gap-3 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-600">Análisis Detallado</h3>
                <p className="text-sm text-gray-500">Gestión de tablas y repeticiones</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Tipo de Análisis</CardTitle>
          <p className="text-sm text-muted-foreground">Elige el tipo de análisis que deseas registrar</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = selectedAnalysisType === type.id
              return (
                <div
                  key={type.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAnalysisType(type.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                    <h3 className="font-semibold">{type.name}</h3>
                    {isSelected && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Seleccionado</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Análisis</CardTitle>
          <p className="text-sm text-muted-foreground">Completa la información para registrar el análisis</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lote">Lote a Analizar</Label>
                <Select
                  value={selectedLote}
                  onValueChange={(value) => {
                    setSelectedLote(value)
                    handleInputChange("loteid", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lote existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {lotesLoading && (
                      <SelectItem value="loading" disabled>
                        Cargando lotes...
                      </SelectItem>
                    )}
                    {lotesError && (
                      <SelectItem value="error" disabled>
                        {lotesError}
                      </SelectItem>
                    )}
                    {!lotesLoading &&
                      !lotesError &&
                      lotes.map((lote) => (
                        <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                          {lote.ficha} (ID: {lote.loteID})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Observaciones adicionales sobre el análisis..."
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {selectedLoteInfo && (
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Información del Lote</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ficha:</span>
                      <span className="font-medium">{selectedLoteInfo.ficha}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ID:</span>
                      <span>{selectedLoteInfo.loteID}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Número Ficha:</span>
                      <span>{selectedLoteInfo.numeroFicha}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Activo:</span>
                      <span>{selectedLoteInfo.activo ? "Sí" : "No"}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {selectedAnalysisType === "pureza" && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Campos Específicos - Pureza Física</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pesoInicial">Peso Inicial (g)</Label>
                    <Input
                      id="pesoInicial"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.pesoInicial}
                      onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="semillaPura">Semilla Pura (g)</Label>
                    <Input
                      id="semillaPura"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.semillaPura}
                      onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="materiaInerte">Materia Inerte (g)</Label>
                    <Input
                      id="materiaInerte"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.materiaInerte}
                      onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otrosCultivos">Otros Cultivos (g)</Label>
                    <Input
                      id="otrosCultivos"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.otrosCultivos}
                      onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="malezas">Malezas (g)</Label>
                    <Input
                      id="malezas"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.malezas}
                      onChange={(e) => handleInputChange("malezas", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="malezasToleridas">Malezas Toleradas</Label>
                    <Input
                      id="malezasToleridas"
                      placeholder="Especificar malezas toleradas"
                      value={formData.malezasToleridas}
                      onChange={(e) => handleInputChange("malezasToleridas", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pesoTotal">Peso Total</Label>
                  <Select value={formData.pesoTotal} onValueChange={(v) => handleInputChange("pesoTotal", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar peso total" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5g">5g</SelectItem>
                      <SelectItem value="10g">10g</SelectItem>
                      <SelectItem value="25g">25g</SelectItem>
                      <SelectItem value="50g">50g</SelectItem>
                      <SelectItem value="100g">100g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedAnalysisType === "germinacion" && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Configuración Inicial - Germinación</CardTitle>
                <p className="text-sm text-green-700">
                  Define los parámetros básicos que se usarán en el análisis completo
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fechaInicioGerm">Fecha Inicio Germinación *</Label>
                    <Input
                      id="fechaInicioGerm"
                      type="date"
                      value={formData.fechaInicioGerm}
                      onChange={(e) => handleInputChange("fechaInicioGerm", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Fecha de inicio del ensayo (requerida)</p>
                  </div>
                  <div>
                    <Label htmlFor="fechaUltConteo">Fecha Último Conteo *</Label>
                    <Input
                      id="fechaUltConteo"
                      type="date"
                      value={formData.fechaUltConteo}
                      onChange={(e) => handleInputChange("fechaUltConteo", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Fecha del último conteo programado (requerida)</p>
                  </div>
                  <div>
                    <Label htmlFor="numeroRepeticiones">Número de Repeticiones *</Label>
                    <Select
                      value={formData.numeroRepeticiones}
                      onValueChange={(v) => handleInputChange("numeroRepeticiones", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar repeticiones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 repeticiones</SelectItem>
                        <SelectItem value="4">4 repeticiones</SelectItem>
                        <SelectItem value="8">8 repeticiones</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Controla cuántas RepGerm crear &gt; 0</p>
                  </div>
                  <div>
                    <Label htmlFor="numeroConteos">Número de Conteos *</Label>
                    <Select
                      value={formData.numeroConteos}
                      onValueChange={(v) => {
                        handleInputChange("numeroConteos", v)
                        const newFechas = Array(Number.parseInt(v) || 0).fill("")
                        handleInputChange("fechaConteos", newFechas)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar conteos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 conteos</SelectItem>
                        <SelectItem value="5">5 conteos</SelectItem>
                        <SelectItem value="7">7 conteos</SelectItem>
                        <SelectItem value="10">10 conteos</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Controla el tamaño del array normales[] &gt; 0</p>
                  </div>
                  <div>
                    <Label htmlFor="numDias">Número de Días *</Label>
                    <Input
                      id="numDias"
                      type="text"
                      placeholder="ej: 7, 14, 21"
                      value={formData.numDias}
                      onChange={(e) => handleInputChange("numDias", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Duración total del ensayo (requerido)</p>
                  </div>
                </div>

                <div>
                  <Label>Fechas de Conteo * (Array no-null)</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Define las fechas específicas para cada conteo. Todas las fechas son obligatorias.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: Number.parseInt(formData.numeroConteos) || 7 }, (_, i) => (
                      <div key={i}>
                        <Label htmlFor={`fechaConteo-${i}`} className="text-sm">
                          Conteo {i + 1} *
                        </Label>
                        <Input
                          id={`fechaConteo-${i}`}
                          type="date"
                          value={formData.fechaConteos[i] || ""}
                          onChange={(e) => {
                            const newFechas = [...formData.fechaConteos]
                            newFechas[i] = e.target.value
                            handleInputChange("fechaConteos", newFechas)
                          }}
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    {formData.fechaConteos.filter((f) => f !== "").length > 0 && (
                      <p className="text-xs text-green-600">
                        ✓ {formData.fechaConteos.filter((f) => f !== "").length} de {formData.numeroConteos} fechas
                        completadas
                      </p>
                    )}
                  </div>
                </div>

                <Card className="bg-green-100 border-green-300">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-800 text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Configuración Automática
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-green-700">
                    <ul className="space-y-1">
                      <li>• Se crearán {formData.numeroRepeticiones} repeticiones automáticamente</li>
                      <li>• Cada repetición tendrá un array normales[] de {formData.numeroConteos} posiciones</li>
                      <li>• Las fechas de conteo son obligatorias (array no-null)</li>
                      <li>• Los campos marcados con * son requeridos por el sistema</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Después de la Configuración
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-blue-700">
                    <p>Una vez completada la configuración inicial, accederás al flujo completo que incluye:</p>
                    <ul className="mt-2 space-y-1">
                      <li>• Gestión de Tablas de Germinación</li>
                      <li>• Sistema de Repeticiones por Tabla</li>
                      <li>• Ingreso de datos de conteos</li>
                      <li>• Cálculos automáticos y validaciones</li>
                      <li>• Seguimiento del progreso paso a paso</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {selectedAnalysisType === "dosn" && (
            <DosnFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
              onChangeListadosMalezas={setMalezasList}
              onChangeListadosCultivos={setCultivosList}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="outline" className="w-full sm:flex-1 bg-transparent" disabled={loading}>
              Guardar como Borrador
            </Button>

            {selectedAnalysisType === "germinacion" ? (
              <Button
                className={`w-full sm:flex-1 ${isFormReady() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
                onClick={handleSubmit}
                disabled={loading || !isFormReady()}
              >
                {loading ? (
                  "Configurando..."
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Redirigiendo al Análisis...
                  </>
                ) : (
                  <>
                    Continuar al Análisis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-full sm:flex-1 bg-green-700 hover:bg-green-800"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Registrando..." : "Registrar Análisis"}
              </Button>
            )}
          </div>

          {error && <div className="text-red-600 mt-2 p-3 bg-red-50 rounded-md border border-red-200">{error}</div>}
          {success && selectedAnalysisType === "germinacion" && (
            <div className="text-green-600 mt-2 p-3 bg-green-50 rounded-md border border-green-200 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              ¡Configuración completada! Redirigiendo al flujo de análisis...
            </div>
          )}
          {success && selectedAnalysisType !== "germinacion" && (
            <div className="text-green-600 mt-2 p-3 bg-green-50 rounded-md border border-green-200">
              ¡Análisis registrado exitosamente!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
