"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, TestTube, Sprout, Scale, Microscope } from "lucide-react"
import { Toaster, toast } from "sonner"

import Link from "next/link"

import DosnFields from "@/app/registro/analisis/dosn/form-dosn"
import GerminacionFields from "@/app/registro/analisis/germinacion/form-germinacion"
import { obtenerLotesActivos } from "@/app/services/lote-service"
import { LoteSimpleDTO } from "@/app/models"
import { registrarAnalisis } from "@/app/services/analisis-service"
import { crearGerminacion } from "@/app/services/germinacion-service"
import PurezaFields from "./pureza/form-pureza"

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
  // Estados para listados de malezas y cultivos
  const [malezasList, setMalezasList] = useState<any[]>([]);
  const [cultivosList, setCultivosList] = useState<any[]>([]);
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
    // Germinación
    fechaInicioGerm: "",
    fechaConteos: [],
    fechaUltConteo: "",
    numDias: "",
    numeroRepeticiones: 1,
    numeroConteos: 0,
  });

  const handleInputChange = (field: keyof AnalysisFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }))
  }

  const [loading, setLoading] = useState(false)

  // Función para obtener el nombre descriptivo del tipo de análisis
  const getAnalysisTypeName = (typeId: string): string => {
    const analysisType = analysisTypes.find(type => type.id === typeId);
    return analysisType?.name || 'Desconocido';
  }

  const toNum = (v: string) => (v === "" ? undefined : Number(v))

  const handleSubmit = async () => {
    setLoading(true)

    if (!selectedAnalysisType) {
      setLoading(false)
      toast.error('Tipo de análisis requerido', {
        description: 'Selecciona el tipo de análisis que deseas registrar.'
      });
      return
    }
    if (!formData.loteid) {
      setLoading(false)
      toast.error('Lote requerido', {
        description: 'Selecciona un lote para realizar el análisis.'
      });
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

      // mapeo de malezas
      const mapMalezaTipo = (m: any) => {
        switch (m.tipoMaleza) {
          case "tolerancia-cero":
            return "MAL_TOLERANCIA_CERO";
          case "con-tolerancia":
            return "MAL_TOLERANCIA";
          case "comunes":
            return "MAL_COMUNES";
          case "no-contiene":
            return "MAL_COMUNES";
          default:
            return "MAL_COMUNES";
        }
      };

      const listados = [
        ...malezasList.map((m) => ({
          ...m,
          listadoTipo: mapMalezaTipo(m),
          listadoNum: m.numero ? Number(m.numero) : 0, // si no hay valor → 0
        })),
        ...cultivosListWithOtros.map((c) => ({ ...c, listadoTipo: "OTROS" })),
      ];

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
      };
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
        toast.error('Fecha de inicio requerida', {
          description: 'La fecha de inicio de germinación es obligatoria.'
        });
        setLoading(false);
        return;
      }
      if (!formData.fechaUltConteo) {
        toast.error('Fecha de último conteo requerida', {
          description: 'La fecha del último conteo es obligatoria.'
        });
        setLoading(false);
        return;
      }
      if (!formData.numeroRepeticiones || formData.numeroRepeticiones < 1) {
        toast.error('Número de repeticiones inválido', {
          description: 'El número de repeticiones debe ser mayor a 0.'
        });
        setLoading(false);
        return;
      }
      if (!formData.numeroConteos || formData.numeroConteos < 1) {
        toast.error('Número de conteos inválido', {
          description: 'El número de conteos debe ser mayor a 0.'
        });
        setLoading(false);
        return;
      }
      if (!formData.fechaConteos || formData.fechaConteos.length === 0) {
        toast.error('Fechas de conteo requeridas', {
          description: 'Debe especificar al menos una fecha de conteo.'
        });
        setLoading(false);
        return;
      }

      // Filtrar fechas vacías
      const fechasValidas = formData.fechaConteos.filter((fecha: string) => fecha && fecha.trim() !== "");
      if (fechasValidas.length === 0) {
        toast.error('Fechas de conteo incompletas', {
          description: 'Debe completar al menos una fecha de conteo válida.'
        });
        setLoading(false);
        return;
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

        toast.success('Análisis de Germinación registrado exitosamente', {
          description: `Se ha creado el análisis para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });

        // Redirigir a la página de gestión del análisis creado
        setTimeout(() => {
          window.location.href = `/listado/analisis/germinacion/${result.analisisID}`;
        }, 1500);
      } else {
        const response = await registrarAnalisis(payload, selectedAnalysisType);

        toast.success('Análisis registrado exitosamente', {
          description: `Se ha registrado el análisis de ${getAnalysisTypeName(selectedAnalysisType)} para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });
      }
    } catch (err: any) {
      console.error("Error al crear germinación:", err);
      console.error("Status del error:", err.status);
      console.error("Mensaje completo:", err.message);

      const errorMsg = err?.message || "Error al registrar análisis";

      toast.error('Error al registrar análisis', {
        description: errorMsg,
      });
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
      } catch (err) {
        const errorMsg = "No se pudieron cargar los lotes disponibles";
        setLotesError(errorMsg)
        toast.error('Error al cargar lotes', {
          description: 'No se pudieron obtener los lotes disponibles. Intente recargar la página.',
        });
      } finally {
        setLotesLoading(false)
      }
    }
    fetchLotes()
  }, [])

  const selectedLoteInfo = selectedLote ? lotes.find((l) => l.loteID.toString() === selectedLote) : null

  return (
    <div className="p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />
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
                  onClick={() => {
                    setSelectedAnalysisType(type.id);
                  }}
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

                    // Mostrar información del lote seleccionado
                    const loteInfo = lotes.find(l => l.loteID.toString() === value);
                    if (loteInfo) {
                      toast.info('Lote seleccionado', {
                        description: `Ficha: ${loteInfo.ficha} - ID: ${loteInfo.loteID}`
                      });
                    }
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

              {selectedAnalysisType !== "pureza" && (
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
              )}
            </div>
          </div>

          {selectedAnalysisType === "pureza" && (
            <PurezaFields formData={formData} handleInputChange={(field, value) => handleInputChange(field as keyof AnalysisFormData, value)} />
          )}
          {selectedAnalysisType === "dosn" && (
            <DosnFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
              onChangeListadosMalezas={setMalezasList}
              onChangeListadosCultivos={setCultivosList}
            />
          )}
          {selectedAnalysisType === "germinacion" && (
            <GerminacionFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
            />
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              className="w-full sm:flex-1 bg-green-700 hover:bg-green-700"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar Análisis"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
