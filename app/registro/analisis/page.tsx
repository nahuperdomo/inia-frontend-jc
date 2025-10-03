"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, TestTube, Sprout, Scale, Microscope, AlertTriangle } from "lucide-react"
import Link from "next/link"

import DosnFields from "@/app/registro/analisis/dosn/form-dosn"
import GerminacionFields from "@/app/registro/analisis/germinacion/form-germinacion"
import { obtenerLotesActivos } from "@/app/services/lote-service"
import { LoteSimpleDTO } from "@/app/models"
import { registrarAnalisis } from "@/app/services/analisis-service"
import { crearGerminacion } from "@/app/services/germinacion-service"


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

  // Cuscuta
  cuscutaGramos: string
  cuscutaNumero: string
  cuscutaFecha: string
  cuscutaCumple: string

  // Cumple estándar
  cumpleEstandar: string
  cumpleFecha: string

  // Germinación
  fechaInicioGerm: string
  fechaConteos: string[]
  fechaUltConteo: string
  numDias: string
  numeroRepeticiones: number
  numeroConteos: number
}

const analysisTypes = [
  { id: "pureza", name: "Pureza Física", description: "Análisis de pureza física de semillas", icon: Search, color: "blue" },
  { id: "germinacion", name: "Germinación", description: "Ensayos de germinación estándar", icon: Sprout, color: "green" },
  { id: "pms", name: "Peso de Mil Semillas", description: "Determinación del peso de mil semillas", icon: Scale, color: "purple" },
  { id: "tetrazolio", name: "Tetrazolio", description: "Ensayo de viabilidad y vigor", icon: TestTube, color: "orange" },
  { id: "dosn", name: "DOSN", description: "Determinación de otras semillas nocivas", icon: Microscope, color: "red" },
]

export default function RegistroAnalisisPage() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("");
  const [selectedLote, setSelectedLote] = useState("");
  // Estados para listados de malezas, cultivos y brassicas
  const [malezasList, setMalezasList] = useState<any[]>([]);
  const [cultivosList, setCultivosList] = useState<any[]>([]);
  const [brassicasList, setBrassicasList] = useState<any[]>([]);

  // Funciones de callback con logs para debugging - memoizadas para evitar re-renders infinitos
  const handleMalezasChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handleMalezasChange llamado con:", list);
    setMalezasList(list);
  }, []);

  const handleCultivosChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handleCultivosChange llamado con:", list);
    setCultivosList(list);
  }, []);

  const handleBrassicasChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handleBrassicasChange llamado con:", list);
    setBrassicasList(list);
  }, []);
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
    // Cuscuta
    cuscutaGramos: "",
    cuscutaNumero: "",
    cuscutaFecha: "",
    cuscutaCumple: "",
    // Cumple estándar
    cumpleEstandar: "",
    cumpleFecha: "",
    // Germinación
    fechaInicioGerm: "",
    fechaConteos: [],
    fechaUltConteo: "",
    numDias: "",
    numeroRepeticiones: 1,
    numeroConteos: 0,
  });

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = useCallback((field: keyof AnalysisFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }))
  }, [])

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

    let payload: any = {
      ...formData,
      idLote: formData.loteid,
      comentarios: formData.observaciones,
      estado: "REGISTRADO",
    };

    if (selectedAnalysisType === "dosn") {
      const mapTipoDosn = (obj: any, prefix: string) => [
        obj[`${prefix}Completo`] ? "COMPLETO" : null,
        obj[`${prefix}Reducido`] ? "REDUCIDO" : null,
        obj[`${prefix}Limitado`] ? "LIMITADO" : null,
        obj[`${prefix}ReducidoLimitado`] ? "REDUCIDO_LIMITADO" : null,
      ].filter(Boolean);

      // Debug: Verificar estados de los arrays antes de procesar
      console.log("🔍 DEBUG - Estados de arrays antes de procesar:");
      console.log("  - malezasList.length:", malezasList.length);
      console.log("  - cultivosList.length:", cultivosList.length);
      console.log("  - brassicasList.length:", brassicasList.length);

      // Agregar otrosCultivos
      let cultivosListWithOtros = [...cultivosList];
      if (formData.otrosCultivos && formData.otrosCultivos !== "") {
        cultivosListWithOtros.push({
          listadoTipo: "OTROS",
          listadoInsti: formData.otrosCultivosInsti || "INIA",
          listadoNum: Number(formData.otrosCultivosNum) || 1,
          idCatalogo: formData.otrosCultivosIdCatalogo || null
        });
      }

      // mapeo de malezas - ya no es necesario mapear porque el componente envía los valores correctos
      const listados = [
        ...malezasList.map((m) => ({
          ...m,
          listadoNum: m.listadoNum !== null && m.listadoNum !== undefined ? m.listadoNum : null, // mantener null si no hay valor
        })),
        ...cultivosListWithOtros.map((c) => ({ ...c, listadoTipo: "OTROS" })),
        ...brassicasList.map((b) => ({ ...b, listadoTipo: "BRASSICA" })),
      ];

      payload = {
        idLote: formData.loteid,
        comentarios: formData.observaciones,
        // Cumple estándar
        cumpleEstandar: formData.cumpleEstandar === "si" ? true : formData.cumpleEstandar === "no" ? false : null,
        // INIA
        fechaINIA: formData.iniaFecha || null,
        gramosAnalizadosINIA: toNum(formData.iniaGramos),
        tipoINIA: mapTipoDosn(formData, "inia"),
        // INASE
        fechaINASE: formData.inaseFecha || null,
        gramosAnalizadosINASE: toNum(formData.inaseGramos),
        tipoINASE: mapTipoDosn(formData, "inase"),
        // Cuscuta - usar fecha actual si hay datos de cuscuta y no se especificó fecha
        cuscuta_g: toNum(formData.cuscutaGramos),
        cuscutaNum: toNum(formData.cuscutaNumero),
        fechaCuscuta: (toNum(formData.cuscutaGramos) > 0 || toNum(formData.cuscutaNumero) > 0) 
          ? new Date().toISOString().split('T')[0] // Fecha actual en formato YYYY-MM-DD
          : null,
        // Listados
        listados,
      };

      // Debug logs para verificar datos antes de enviar
      console.log("🔍 DEBUG - Datos de DOSN antes de enviar:");
      console.log("  - listados finales:", listados);
      console.log("  - payload.listados:", payload.listados);

      // Validación adicional para asegurar que hay datos para enviar
      if (listados.length === 0) {
        console.warn("⚠️ WARNING: No hay listados para enviar. Esto podría ser normal si el análisis no requiere listados.");
      } else {
        console.log(`✅ Se enviarán ${listados.length} listados al backend`);
      }
    } else if (selectedAnalysisType === "pureza") {
      payload = {
        ...payload,
        pesoInicial: toNum(formData.pesoInicial),
        semillaPura: toNum(formData.semillaPura),
        materiaInerte: toNum(formData.materiaInerte),
        otrosCultivos: toNum(formData.otrosCultivos),
        malezas: toNum(formData.malezas),
      };
    } else if (selectedAnalysisType === "germinacion") {
      // Validaciones específicas para germinación
      if (!formData.fechaInicioGerm) {
        setError("Fecha de inicio de germinación es requerida");
        setLoading(false);
        return;
      }
      if (!formData.fechaUltConteo) {
        setError("Fecha del último conteo es requerida");
        setLoading(false);
        return;
      }
      if (!formData.numeroRepeticiones || formData.numeroRepeticiones < 1) {
        setError("Número de repeticiones debe ser mayor a 0");
        setLoading(false);
        return;
      }
      if (!formData.numeroConteos || formData.numeroConteos < 1) {
        setError("Número de conteos debe ser mayor a 0");
        setLoading(false);
        return;
      }
      if (!formData.fechaConteos || formData.fechaConteos.length === 0) {
        setError("Debe especificar al menos una fecha de conteo");
        setLoading(false);
        return;
      }

      // Filtrar fechas vacías
      const fechasValidas = formData.fechaConteos.filter((fecha: string) => fecha && fecha.trim() !== "");
      if (fechasValidas.length === 0) {
        setError("Debe completar al menos una fecha de conteo");
        setLoading(false);
        return;
      }

      // Validar que la fecha de inicio sea anterior a la fecha de último conteo
      if (formData.fechaInicioGerm && formData.fechaUltConteo) {
        const fechaInicio = new Date(formData.fechaInicioGerm);
        const fechaFin = new Date(formData.fechaUltConteo);
        
        if (fechaInicio >= fechaFin) {
          setError("La fecha de inicio debe ser anterior a la fecha de último conteo");
          setLoading(false);
          return;
        }
      }

      // Validar que todas las fechas de conteo estén entre la fecha de inicio y fin
      if (formData.fechaInicioGerm && formData.fechaUltConteo) {
        const fechaInicio = new Date(formData.fechaInicioGerm);
        const fechaFin = new Date(formData.fechaUltConteo);
        
        for (const fecha of fechasValidas) {
          const fechaConteo = new Date(fecha);
          if (fechaConteo < fechaInicio || fechaConteo > fechaFin) {
            setError(`Todas las fechas de conteo deben estar entre ${fechaInicio.toLocaleDateString()} y ${fechaFin.toLocaleDateString()}`);
            setLoading(false);
            return;
          }
        }
      }

      payload = {
        idLote: parseInt(formData.loteid), // Convertir a número
        comentarios: formData.observaciones || "",
        fechaInicioGerm: formData.fechaInicioGerm,
        fechaConteos: fechasValidas,
        fechaUltConteo: formData.fechaUltConteo,
        numDias: formData.numDias || "",
        numeroRepeticiones: formData.numeroRepeticiones || 1,
        numeroConteos: formData.numeroConteos || 1,
      };
    }

    try {
      console.log("=== DEBUG INFO ===");
      console.log("Tipo de análisis:", selectedAnalysisType);

      // Verificar cookies
      const cookies = document.cookie;
      console.log("Cookies disponibles:", cookies);
      const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
      console.log("Token en cookies:", tokenCookie ? "✅ Existe" : "❌ No existe");

      console.log("Enviando payload para germinación:", payload);

      // PRUEBA: Intentar hacer una llamada a un endpoint que sabemos que funciona
      if (selectedAnalysisType === "germinacion") {
        console.log("🧪 PRUEBA: Vamos a probar primero obtener lotes para verificar auth...");
        try {
          const lotesTest = await obtenerLotesActivos();
          console.log("✅ Test de auth exitoso - lotes obtenidos:", lotesTest.length);
        } catch (authError) {
          console.error("❌ Test de auth falló:", authError);
          throw new Error("Problema de autenticación detectado");
        }

        console.log("🚀 Ahora intentando crear germinación...");
        const result = await crearGerminacion(payload);

        // Redirigir a la página de gestión del análisis creado
        setTimeout(() => {
          window.location.href = `/listado/analisis/germinacion/${result.analisisID}`;
        }, 1500);
      } else {
        await registrarAnalisis(payload, selectedAnalysisType)
      }
      setSuccess(true)
    } catch (err: any) {
      console.error("Error al crear germinación:", err);
      console.error("Status del error:", err.status);
      console.error("Mensaje completo:", err.message);
      setError(err?.message || "Error al registrar análisis")
    } finally {
      setLoading(false)
    }
  }

  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
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
          <p className="text-muted-foreground">Registra nuevos análisis para lotes existentes en el sistema</p>
        </div>
      </div>

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
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
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
                    {lotesLoading && <SelectItem value="loading" disabled>Cargando lotes...</SelectItem>}
                    {lotesError && <SelectItem value="error" disabled>{lotesError}</SelectItem>}
                    {!lotesLoading && !lotesError && lotes.map((lote) => (
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
          {selectedAnalysisType === "dosn" && (
            <DosnFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
              onChangeListadosMalezas={handleMalezasChange}
              onChangeListadosCultivos={handleCultivosChange}
              onChangeListadosBrassicas={handleBrassicasChange}
            />
          )}
          {selectedAnalysisType === "germinacion" && (
            <GerminacionFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="outline" className="w-full sm:flex-1 bg-transparent" disabled={loading}>
              Guardar como Borrador
            </Button>
            <Button
              className="w-full sm:flex-1 bg-green-700 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar Análisis"}
            </Button>
          </div>

          {error && <div className="text-red-600 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">¡Análisis registrado exitosamente!</div>}
        </CardContent>
      </Card>
    </div>
  )
}
