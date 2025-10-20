"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import PmsFields from "@/app/registro/analisis/pms/form-pms"
import TetrazolioFields from "@/app/registro/analisis/tetrazolio/form-tetrazolio"
import { obtenerLotesActivos } from "@/app/services/lote-service"
import { obtenerLotesElegibles } from "@/app/services/lote-service"
import { LoteSimpleDTO } from "@/app/models"
import { registrarAnalisis } from "@/app/services/analisis-service"
import { crearGerminacion } from "@/app/services/germinacion-service"
import { crearPms } from "@/app/services/pms-service"
import { TipoAnalisis } from "@/app/models/types/enums"
import { crearTetrazolio } from "@/app/services/tetrazolio-service"
import PurezaFields from "./pureza/form-pureza"
import { clearDosnStorage, clearGerminacionStorage, clearTetrazolioStorage, clearPurezaStorage } from "@/lib/utils/clear-form-storage"


export type AnalysisFormData = {
  loteid: string
  responsable: string
  prioridad: string
  observaciones: string

  // Pureza - Datos en gramos
  pesoInicial: string
  semillaPura: string
  materiaInerte: string
  otrosCultivos: string
  malezas: string
  malezasToleridas: string
  malezasToleranciasCero: string
  pesoTotal: string

  // Pureza - Porcentajes manuales
  semillaPuraPorcentaje: string
  materiaInertePorcentaje: string
  otrosCultivosPorcentaje: string
  malezasPorcentaje: string
  malezasTolerididasPorcentaje: string
  malezasToleranciasCeroPorcentaje: string

  // Pureza - Porcentajes redondeados manuales
  semillaPuraRedondeado: string
  materiaInerteRedondeado: string
  otrosCultivosRedondeado: string
  malezasRedondeado: string
  malezasTolerididasRedondeado: string
  malezasToleranciasCeroRedondeado: string

  // Pureza - Datos INIA manuales
  iniaSemillaPuraPorcentaje: string
  iniaMateriaInertePorcentaje: string
  iniaOtrosCultivosPorcentaje: string
  iniaMalezasPorcentaje: string
  iniaMalezasTolerididasPorcentaje: string
  iniaMalezasToleranciasCeroPorcentaje: string

  // Pureza - Datos INASE manuales
  inaseSemillaPuraPorcentaje: string
  inaseMateriaInertePorcentaje: string
  inaseOtrosCultivosPorcentaje: string
  inaseMalezasPorcentaje: string
  inaseMalezasTolerididasPorcentaje: string
  inaseMalezasToleranciasCeroPorcentaje: string

  // Pureza - Alerta diferencia
  alertaDiferenciaPeso: string

  // Otros Cultivos (para DOSN)
  otrosCultivosInsti: string
  otrosCultivosNum: string
  otrosCultivosIdCatalogo: string

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

  // PMS
  numRepeticionesEsperadasPms: number
  numTandas: number
  esSemillaBrozosa: boolean
  // Tetrazolio
  fecha: string
  numRepeticionesEsperadasTetrazolio: number
  numSemillasPorRep: number
  pretratamiento: string
  pretratamientoOtro: string
  concentracion: string
  concentracionOtro: string
  tincionHs: number | string
  tincionHsOtro: string
  tincionTemp: number
  tincionTempOtro: string
  comentarios: string
}

const analysisTypes = [
  { id: "PUREZA" as TipoAnalisis, name: "Pureza Física", description: "Análisis de pureza física de semillas", icon: Search, color: "blue" },
  { id: "GERMINACION" as TipoAnalisis, name: "Germinación", description: "Ensayos de germinación estándar", icon: Sprout, color: "green" },
  { id: "PMS" as TipoAnalisis, name: "Peso de Mil Semillas", description: "Determinación del peso de mil semillas", icon: Scale, color: "purple" },
  { id: "TETRAZOLIO" as TipoAnalisis, name: "Tetrazolio", description: "Ensayo de viabilidad y vigor", icon: TestTube, color: "orange" },
  { id: "DOSN" as TipoAnalisis, name: "DOSN", description: "Determinación de otras semillas nocivas", icon: Microscope, color: "red" },
]

export default function RegistroAnalisisPage() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<TipoAnalisis | "">("");
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedLote, setSelectedLote] = useState("");
  // Estados para listados de malezas, cultivos y brassicas
  const [malezasList, setMalezasList] = useState<any[]>([]);
  const [cultivosList, setCultivosList] = useState<any[]>([]);
  const [brassicasList, setBrassicasList] = useState<any[]>([]);

  // Estado específico para Pureza (3 listas separadas)
  const [purezaMalezasList, setPurezaMalezasList] = useState<any[]>([]);
  const [purezaCultivosList, setPurezaCultivosList] = useState<any[]>([]);
  const [purezaBrassicasList, setPurezaBrassicasList] = useState<any[]>([]);
  
  // Key para forzar reset del componente PurezaFields después de un registro exitoso
  const [purezaFormKey, setPurezaFormKey] = useState(0);

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

  // Callbacks específicos para Pureza (3 listas separadas)
  const handlePurezaMalezasChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handlePurezaMalezasChange llamado con:", list);
    setPurezaMalezasList(list);
  }, []);

  const handlePurezaCultivosChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handlePurezaCultivosChange llamado con:", list);
    setPurezaCultivosList(list);
  }, []);

  const handlePurezaBrassicasChange = useCallback((list: any[]) => {
    console.log("🐛 DEBUG - handlePurezaBrassicasChange llamado con:", list);
    setPurezaBrassicasList(list);
  }, []);

  const [mostrarValidacionDosn, setMostrarValidacionDosn] = useState(false)
  const [mostrarValidacionTetrazolio, setMostrarValidacionTetrazolio] = useState(false)


  const [formData, setFormData] = useState<AnalysisFormData>({
    loteid: "",
    responsable: "",
    prioridad: "",
    observaciones: "",

    // Pureza - Datos en gramos
    pesoInicial: "",
    semillaPura: "",
    materiaInerte: "",
    otrosCultivos: "",
    malezas: "",
    malezasToleridas: "",
    malezasToleranciasCero: "",
    pesoTotal: "",

    // Pureza - Porcentajes manuales
    semillaPuraPorcentaje: "",
    materiaInertePorcentaje: "",
    otrosCultivosPorcentaje: "",
    malezasPorcentaje: "",
    malezasTolerididasPorcentaje: "",
    malezasToleranciasCeroPorcentaje: "",

    // Pureza - Porcentajes redondeados manuales
    semillaPuraRedondeado: "",
    materiaInerteRedondeado: "",
    otrosCultivosRedondeado: "",
    malezasRedondeado: "",
    malezasTolerididasRedondeado: "",
    malezasToleranciasCeroRedondeado: "",

    // Pureza - Datos INIA manuales
    iniaSemillaPuraPorcentaje: "",
    iniaMateriaInertePorcentaje: "",
    iniaOtrosCultivosPorcentaje: "",
    iniaMalezasPorcentaje: "",
    iniaMalezasTolerididasPorcentaje: "",
    iniaMalezasToleranciasCeroPorcentaje: "",

    // Pureza - Datos INASE manuales
    inaseSemillaPuraPorcentaje: "",
    inaseMateriaInertePorcentaje: "",
    inaseOtrosCultivosPorcentaje: "",
    inaseMalezasPorcentaje: "",
    inaseMalezasTolerididasPorcentaje: "",
    inaseMalezasToleranciasCeroPorcentaje: "",

    // Pureza - Alerta diferencia
    alertaDiferenciaPeso: "",

    // Otros Cultivos (para DOSN)
    otrosCultivosInsti: "",
    otrosCultivosNum: "",
    otrosCultivosIdCatalogo: "",
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
    // PMS
    numRepeticionesEsperadasPms: 8,
    numTandas: 1,
    esSemillaBrozosa: false,
    // Tetrazolio
    fecha: "",
    numSemillasPorRep: 0,
    pretratamiento: "",
    pretratamientoOtro: "",
    concentracion: "",
    concentracionOtro: "",
    tincionHs: "",
    tincionHsOtro: "",
    tincionTemp: 30,
    tincionTempOtro: "",
    comentarios: "",
    numRepeticionesEsperadasTetrazolio: 2,
  });
  const [loading, setLoading] = useState(false)
  const getAnalysisTypeName = (typeId: string | TipoAnalisis): string => {
    const analysisType = analysisTypes.find(type => type.id === typeId);
    return analysisType?.name || 'Desconocido';
  }

  const handleInputChange = useCallback((field: keyof AnalysisFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }))
  }, [])

  // Wrapper para PurezaFields que acepta string como field
  const handlePurezaInputChange = useCallback((field: string, value: any) => {
    handleInputChange(field as keyof AnalysisFormData, value)
  }, [handleInputChange])

  const toNum = (v: string) => (v === "" ? undefined : Number(v))

  const validarDosn = (data: AnalysisFormData) => {
    const tieneAnalisisINIA =
      data.iniaCompleto || data.iniaReducido || data.iniaLimitado || data.iniaReducidoLimitado
    const tieneAnalisisINASE =
      data.inaseCompleto || data.inaseReducido || data.inaseLimitado || data.inaseReducidoLimitado

    const fechaINIAValida = data.iniaFecha && new Date(data.iniaFecha) <= new Date()
    const fechaINASEValida = data.inaseFecha && new Date(data.inaseFecha) <= new Date()

    const gramosINIAValido = data.iniaGramos && Number(data.iniaGramos) > 0
    const gramosINASEValido = data.inaseGramos && Number(data.inaseGramos) > 0

    const errores: string[] = []

    if (!tieneAnalisisINIA) errores.push("Debe seleccionar al menos un tipo de análisis para INIA")
    if (!tieneAnalisisINASE) errores.push("Debe seleccionar al menos un tipo de análisis para INASE")
    if (!fechaINIAValida) errores.push("Fecha de análisis INIA inválida")
    if (!fechaINASEValida) errores.push("Fecha de análisis INASE inválida")
    if (!gramosINIAValido) errores.push("Debe ingresar gramos válidos para INIA")
    if (!gramosINASEValido) errores.push("Debe ingresar gramos válidos para INASE")

    return {
      valido: errores.length === 0,
      errores,
    }
  }


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

    if (selectedAnalysisType === "DOSN") {
      setMostrarValidacionDosn(true)

      const { valido, errores } = validarDosn(formData)
      if (!valido) {
        setLoading(false)
        toast.error("Hay errores en el formulario DOSN", {
          description: errores.join(" • "),
        })
        return // 🔥 DETIENE el envío al backend
      }

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
        fechaCuscuta: ((toNum(formData.cuscutaGramos) || 0) > 0 || (toNum(formData.cuscutaNumero) || 0) > 0)
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
    } else if (selectedAnalysisType === "PUREZA") {
      // Combinar las 3 listas igual que DOSN (simple y directo)
      const otrasSemillas = [
        ...purezaMalezasList.map((m) => ({
          ...m,
          listadoNum: m.listadoNum !== null && m.listadoNum !== undefined ? m.listadoNum : null,
        })),
        ...purezaCultivosList.map((c) => ({ ...c, listadoTipo: "OTROS" })),
        ...purezaBrassicasList.map((b) => ({ ...b, listadoTipo: "BRASSICA" })),
      ];

      // ✅ Construir payload limpio solo con campos requeridos por el backend
      payload = {
        idLote: formData.loteid,
        comentarios: formData.observaciones,
        estado: "REGISTRADO",
        cumpleEstandar: formData.cumpleEstandar === "si" ? true : formData.cumpleEstandar === "no" ? false : null,
        
        // Datos en gramos
        fecha: formData.fecha,
        pesoInicial_g: parseFloat((formData as any).pesoInicial_g) || 0,
        semillaPura_g: parseFloat((formData as any).semillaPura_g) || 0,
        materiaInerte_g: parseFloat((formData as any).materiaInerte_g) || 0,
        otrosCultivos_g: parseFloat((formData as any).otrosCultivos_g) || 0,
        malezas_g: parseFloat((formData as any).malezas_g) || 0,
        malezasToleradas_g: parseFloat((formData as any).malezasToleradas_g) || 0,
        malezasTolCero_g: parseFloat((formData as any).malezasTolCero_g) || 0,
        pesoTotal_g: parseFloat((formData as any).pesoTotal_g) || 0,

        // Porcentajes con redondeo
        redonSemillaPura: (formData as any).redonSemillaPura ? parseFloat((formData as any).redonSemillaPura) : undefined,
        redonMateriaInerte: (formData as any).redonMateriaInerte ? parseFloat((formData as any).redonMateriaInerte) : undefined,
        redonOtrosCultivos: (formData as any).redonOtrosCultivos ? parseFloat((formData as any).redonOtrosCultivos) : undefined,
        redonMalezas: (formData as any).redonMalezas ? parseFloat((formData as any).redonMalezas) : undefined,
        redonMalezasToleradas: (formData as any).redonMalezasToleradas ? parseFloat((formData as any).redonMalezasToleradas) : undefined,
        redonMalezasTolCero: (formData as any).redonMalezasTolCero ? parseFloat((formData as any).redonMalezasTolCero) : undefined,
        redonPesoTotal: (formData as any).redonPesoTotal ? parseFloat((formData as any).redonPesoTotal) : undefined,

        // Datos INASE
        inasePura: (formData as any).inasePura ? parseFloat((formData as any).inasePura) : undefined,
        inaseMateriaInerte: (formData as any).inaseMateriaInerte ? parseFloat((formData as any).inaseMateriaInerte) : undefined,
        inaseOtrosCultivos: (formData as any).inaseOtrosCultivos ? parseFloat((formData as any).inaseOtrosCultivos) : undefined,
        inaseMalezas: (formData as any).inaseMalezas ? parseFloat((formData as any).inaseMalezas) : undefined,
        inaseMalezasToleradas: (formData as any).inaseMalezasToleradas ? parseFloat((formData as any).inaseMalezasToleradas) : undefined,
        inaseMalezasTolCero: (formData as any).inaseMalezasTolCero ? parseFloat((formData as any).inaseMalezasTolCero) : undefined,
        inaseFecha: (formData as any).inaseFecha || undefined,

        // Malezas/cultivos listados (combinados de las 3 listas)
        otrasSemillas,
      };
    } else if (selectedAnalysisType === "GERMINACION") {
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

      // Validar que la fecha de inicio sea anterior a la fecha de último conteo
      if (formData.fechaInicioGerm && formData.fechaUltConteo) {
        const fechaInicio = new Date(formData.fechaInicioGerm);
        const fechaFin = new Date(formData.fechaUltConteo);

        if (fechaInicio >= fechaFin) {
          toast.error("La fecha de inicio debe ser anterior a la fecha de último conteo");
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
            toast.error(`Todas las fechas de conteo deben estar entre ${fechaInicio.toLocaleDateString()} y ${fechaFin.toLocaleDateString()}`);
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
    } else if (selectedAnalysisType === "PMS") {
      // Validaciones específicas para PMS
      if (!formData.numRepeticionesEsperadasPms || formData.numRepeticionesEsperadasPms < 1) {
        toast.error('Número de repeticiones inválido', {
          description: 'El número de repeticiones esperadas debe ser mayor a 0.'
        });
        setLoading(false);
        return;
      }

      payload = {
        idLote: parseInt(formData.loteid), // Convertir a número
        comentarios: formData.observaciones || "",
        numRepeticionesEsperadas: formData.numRepeticionesEsperadasPms || 8,
        esSemillaBrozosa: formData.esSemillaBrozosa || false,
      };
    } else if (selectedAnalysisType === "TETRAZOLIO") {
      // Validaciones específicas para tetrazolio
      if (!formData.fecha) {
        toast.error('Fecha del ensayo es requerida', {
          description: 'La fecha del ensayo es obligatoria.'
        });
        setLoading(false);
        return;
      }
      if (!formData.numSemillasPorRep || ![25, 50, 100].includes(formData.numSemillasPorRep)) {
        toast.error('Número de semillas inválido', {
          description: 'El número de semillas por repetición debe ser 25, 50 o 100.'
        });
        setLoading(false);
        return;
      }
      if (!formData.numRepeticionesEsperadasTetrazolio || formData.numRepeticionesEsperadasTetrazolio < 2 || formData.numRepeticionesEsperadasTetrazolio > 8) {
        toast.error('Número de repeticiones inválido', {
          description: 'El número de repeticiones esperadas debe estar entre 2 y 8.'
        });
        setLoading(false);
        return;
      }
      if (!formData.concentracion) {
        toast.error('Concentración requerida', {
          description: 'La concentración de tetrazolio es requerida.'
        });
        setLoading(false);
        return;
      }
      if (!formData.tincionTemp || (typeof formData.tincionTemp === 'number' && (formData.tincionTemp < 15 || formData.tincionTemp > 45))) {
        toast.error('Temperatura inválida', {
          description: 'La temperatura de tinción debe estar entre 15 y 45°C.'
        });
        setLoading(false);
        return;
      }

      // Validar tiempo de tinción considerando que puede ser string o número
      const tincionHsValue = formData.tincionHs === "Otra (especificar)"
        ? parseFloat(formData.tincionHsOtro)
        : typeof formData.tincionHs === 'string'
          ? parseFloat(formData.tincionHs)
          : formData.tincionHs;

      if (!tincionHsValue || tincionHsValue < 1 || tincionHsValue > 72) {
        toast.error('Tiempo de tinción inválido', {
          description: 'El tiempo de tinción debe estar entre 1 y 72 horas.'
        });
        setLoading(false);
        return;
      }

      // Preparar valores finales basados en las selecciones del usuario
      const pretratamientoFinal = formData.pretratamiento === 'Otro (especificar)'
        ? formData.pretratamientoOtro
        : formData.pretratamiento

      const concentracionFinal = formData.concentracion === 'Otro (especificar)'
        ? formData.concentracionOtro
        : formData.concentracion

      const tincionHsFinal = formData.tincionHs === 'Otra (especificar)'
        ? parseFloat(formData.tincionHsOtro) || 24
        : typeof formData.tincionHs === 'string'
          ? parseFloat(formData.tincionHs) || 24
          : formData.tincionHs

      const tincionTempFinal = formData.tincionTemp === 0
        ? parseFloat(formData.tincionTempOtro) || 30
        : formData.tincionTemp

      payload = {
        idLote: parseInt(formData.loteid),
        comentarios: formData.comentarios || formData.observaciones || "",
        fecha: formData.fecha,
        numSemillasPorRep: formData.numSemillasPorRep,
        pretratamiento: pretratamientoFinal || "",
        concentracion: concentracionFinal,
        tincionHs: tincionHsFinal,
        tincionTemp: tincionTempFinal,
        numRepeticionesEsperadas: formData.numRepeticionesEsperadasTetrazolio,
      };
    }

    try {
      // Verificar cookies
      const cookies = document.cookie;
      console.log("Cookies disponibles:", cookies);
      const tokenCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('token='));
      console.log("Token en cookies:", tokenCookie ? "✅ Existe" : "❌ No existe");

      console.log("Enviando payload:", payload);

      // PRUEBA: Intentar hacer una llamada a un endpoint que sabemos que funciona
      if (selectedAnalysisType === "GERMINACION") {
        console.log("🧪 PRUEBA: Vamos a probar primero obtener lotes para verificar auth...");
        try {
          const lotesTest = await obtenerLotesActivos();
          console.log("✅ Test de auth exitoso - lotes obtenidos:", lotesTest.length);
        } catch (authError) {
          console.error("❌ Test de auth falló:", authError);
          throw new Error("Problema de autenticación detectado");
        }

        const result = await crearGerminacion(payload);

        toast.success('Análisis de Germinación registrado exitosamente', {
          description: `Se ha creado el análisis para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });

        // ✅ Limpiar storage de germinación
        clearGerminacionStorage()

        setTimeout(() => {
          router.push(`/listado/analisis/germinacion/${result.analisisID}`);
        }, 1500);
      } else if (selectedAnalysisType === "PMS") {
        console.log("🚀 Intentando crear PMS...");
        const result = await crearPms(payload);

        toast.success('Análisis de PMS registrado exitosamente', {
          description: `Se ha creado el análisis para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });

        // Redirigir a la página de edición del análisis creado
        setTimeout(() => {
          window.location.href = `/listado/analisis/pms/${result.analisisID}/editar`;
        }, 1500);
      } else if (selectedAnalysisType === "TETRAZOLIO") {
        // Verificar autenticación antes de crear tetrazolio
        try {
          const lotesTest = await obtenerLotesActivos();
          console.log("✅ Test de auth exitoso - lotes obtenidos:", lotesTest.length);
        } catch (authError) {
          console.error("❌ Test de auth falló:", authError);
          throw new Error("Problema de autenticación detectado");
        }

        const result = await crearTetrazolio(payload);

        toast.success('Análisis de Tetrazolio registrado exitosamente', {
          description: `Se ha creado el análisis para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });

        // ✅ Limpiar storage de tetrazolio
        clearTetrazolioStorage()

        setTimeout(() => {
          // Ruta de detalle existente; la ruta /editar no existe para tetrazolio
          router.push(`/listado/analisis/tetrazolio/${result.analisisID}`);
        }, 1500);
      } else {
        // Registrar otros tipos (DOSN, Pureza, etc.)
        console.log("📤 PAYLOAD COMPLETO A ENVIAR:", JSON.stringify(payload, null, 2));
        console.log("📤 Tipo de análisis:", selectedAnalysisType);
        
        const result = await registrarAnalisis(payload, selectedAnalysisType);

        toast.success('Análisis registrado exitosamente', {
          description: `Se ha registrado el análisis de ${getAnalysisTypeName(selectedAnalysisType)} para el lote ${selectedLoteInfo?.ficha || formData.loteid}`,
        });

        // ✅ Limpiar storage según el tipo de análisis
        if (selectedAnalysisType === "DOSN") {
          clearDosnStorage()
          setMalezasList([])
          setCultivosList([])
          setBrassicasList([])
        } else if (selectedAnalysisType === "PUREZA") {
          clearPurezaStorage()
          setPurezaMalezasList([])
          setPurezaCultivosList([])
          setPurezaBrassicasList([])
          // Incrementar el key para forzar el reset completo del componente
          setPurezaFormKey(prev => prev + 1)
        } else if (selectedAnalysisType === "GERMINACION") {
          clearGerminacionStorage()
        } else if (selectedAnalysisType === "TETRAZOLIO") {
          clearTetrazolioStorage()
        }

        // Redirigir según el tipo de análisis
        setTimeout(() => {
          if (selectedAnalysisType === "DOSN") {
            router.push(`/listado/analisis/dosn/${result.analisisID}`);
          } else if (selectedAnalysisType === "PUREZA") {
            router.push(`/listado/analisis/pureza/${result.analisisID}`);
          } else {
            router.push(`/listado/analisis/${selectedAnalysisType}/${result.analisisID}`);
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error al registrar análisis:", err);
      console.error("Status del error:", err?.status);
      console.error("Mensaje completo:", err?.message || err);

      const errorMsg = err?.message || "Error al registrar análisis";

      toast.error('Error al registrar análisis', {
        description: errorMsg,
      });
    } finally {
      setLoading(false)
    }
  }

  const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
  const [lotesLoading, setLotesLoading] = useState(false)
  const [lotesError, setLotesError] = useState<string | null>(null)

  // Cargar lotes cuando cambia el tipo de análisis
  // Preseleccionar tipo de análisis y lote desde URL
  useEffect(() => {
    const tipoParam = searchParams.get('tipo')
    const loteIdParam = searchParams.get('loteId')
    
    if (tipoParam) {
      const tipoValido = analysisTypes.find(type => type.id === tipoParam)
      if (tipoValido) {
        setSelectedAnalysisType(tipoParam as TipoAnalisis)
        
        // Guardar loteId para preselección posterior
        if (loteIdParam) {
          sessionStorage.setItem('preselectedLoteId', loteIdParam)
        }
      }
    }
    
    // Limpiar la URL sin parámetros
    if (tipoParam || loteIdParam) {
      router.replace('/registro/analisis', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchLotes = async () => {
      if (!selectedAnalysisType) {
        setLotes([]);
        return;
      }

      setLotesLoading(true)
      setLotesError(null)
      setSelectedLote("") // Limpiar selección de lote al cambiar tipo

      try {
        const data = await obtenerLotesElegibles(selectedAnalysisType as TipoAnalisis);
        setLotes(data)

        // Preseleccionar lote si viene desde URL
        const preselectedLoteId = sessionStorage.getItem('preselectedLoteId')
        if (preselectedLoteId) {
          const loteExiste = data.find(lote => lote.loteID.toString() === preselectedLoteId)
          if (loteExiste) {
            setSelectedLote(preselectedLoteId)
            setFormData(prev => ({ ...prev, loteid: preselectedLoteId }))
          }
          // Limpiar el sessionStorage después de usarlo
          sessionStorage.removeItem('preselectedLoteId')
        }

        if (data.length === 0) {
          toast.info('Sin lotes elegibles', {
            description: `No hay lotes elegibles para análisis de ${getAnalysisTypeName(selectedAnalysisType)}. Esto puede ocurrir si no hay lotes con este tipo de análisis asignado o si todos ya tienen análisis completados.`,
          });
        }
      } catch (err) {
        const errorMsg = "No se pudieron cargar los lotes elegibles";
        setLotesError(errorMsg)
        toast.error('Error al cargar lotes', {
          description: 'No se pudieron obtener los lotes elegibles para este análisis. Intente recargar la página.',
        });
      } finally {
        setLotesLoading(false)
      }
    }
    fetchLotes()
  }, [selectedAnalysisType])

  // Función original para casos donde necesitemos todos los lotes
  useEffect(() => {
    // Esta función ya no se usa automáticamente, pero la mantenemos por si es necesaria
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
                  disabled={!selectedAnalysisType}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedAnalysisType
                          ? "Primero selecciona un tipo de análisis"
                          : "Seleccionar lote elegible"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lotesLoading && <SelectItem value="loading" disabled>Cargando lotes elegibles...</SelectItem>}
                    {lotesError && <SelectItem value="error" disabled>{lotesError}</SelectItem>}
                    {!lotesLoading && !lotesError && lotes.length === 0 && selectedAnalysisType && (
                      <SelectItem value="no-elegibles" disabled>
                        No hay lotes elegibles para este análisis
                      </SelectItem>
                    )}
                    {!lotesLoading && !lotesError && lotes.map((lote) => (
                      <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                        {lote.ficha} (ID: {lote.loteID}){lote.cultivarNombre ? ` - ${lote.cultivarNombre}` : ''}{lote.especieNombre ? ` (${lote.especieNombre})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAnalysisType !== "PUREZA" && (
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
                    {selectedLoteInfo.cultivarNombre && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cultivar:</span>
                        <span>{selectedLoteInfo.cultivarNombre}</span>
                      </div>
                    )}
                    {selectedLoteInfo.especieNombre && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Especie:</span>
                        <span>{selectedLoteInfo.especieNombre}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Activo:</span>
                      <span>{selectedLoteInfo.activo ? "Sí" : "No"}</span>
                    </div>
                    {selectedAnalysisType && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-green-600 font-medium mb-1">
                          ✅ Este lote es elegible para {getAnalysisTypeName(selectedAnalysisType)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tiene el tipo de análisis asignado y no tiene análisis completados del mismo tipo.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Información sobre filtrado de lotes */}
              {selectedAnalysisType && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200">
                        <TestTube className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-2">Filtrado de Lotes Elegibles</h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          <div>• Solo se muestran lotes que tienen {getAnalysisTypeName(selectedAnalysisType)} asignado</div>
                          <div>• Excluye lotes con análisis completados de este tipo</div>
                          <div>• Incluye lotes con análisis "A repetir" del mismo tipo</div>
                          {lotes.length === 0 && !lotesLoading && (
                            <div className="text-amber-700 font-medium mt-2">
                              ⚠️ No hay lotes elegibles disponibles
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {selectedAnalysisType === "PUREZA" && (
            <PurezaFields
              key={purezaFormKey}
              formData={{
                ...formData,
                malezas: purezaMalezasList,
                cultivos: purezaCultivosList,
                brassicas: purezaBrassicasList,
              }}
              handleInputChange={handlePurezaInputChange}
              onChangeMalezas={handlePurezaMalezasChange}
              onChangeCultivos={handlePurezaCultivosChange}
              onChangeBrassicas={handlePurezaBrassicasChange}
            />
          )}
          {selectedAnalysisType === "DOSN" && (
            <DosnFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
              onChangeListadosMalezas={handleMalezasChange}
              onChangeListadosCultivos={handleCultivosChange}
              onChangeListadosBrassicas={handleBrassicasChange}
              mostrarValidacion={mostrarValidacionDosn}
            />
          )}
          {selectedAnalysisType === "GERMINACION" && (
            <GerminacionFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
            />
          )}
          {selectedAnalysisType === "PMS" && (
            <PmsFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
            />
          )}
          {selectedAnalysisType === "TETRAZOLIO" && (
            <TetrazolioFields
              formData={formData}
              handleInputChange={handleInputChange as (field: string, value: any) => void}
              mostrarValidacion={mostrarValidacionTetrazolio}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              className="w-full sm:flex-1 bg-transparent"
              disabled={loading}
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
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

