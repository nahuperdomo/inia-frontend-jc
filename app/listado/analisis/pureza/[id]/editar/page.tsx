"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Loader2, AlertTriangle, Search, Plus, Trash2, Leaf, CheckCircle2, Scale, FlaskConical, Microscope, PieChart, Calendar, Calculator, Percent, Building2, FileText, XCircle } from "lucide-react"
import Link from "next/link"
import { 
  obtenerPurezaPorId, 
  actualizarPureza,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir
} from "@/app/services/pureza-service"
import * as malezasService from "@/app/services/malezas-service"
import { obtenerTodasEspecies } from "@/app/services/especie-service"
import type { PurezaDTO, PurezaRequestDTO, MalezasCatalogoDTO, EspecieDTO, TipoListado } from "@/app/models"
import { toast } from "sonner"
import { AnalisisHeaderBar } from "@/components/analisis/analisis-header-bar"
import { AnalisisAccionesCard } from "@/components/analisis/analisis-acciones-card"
import { TablaToleranciasButton } from "@/components/analisis/tabla-tolerancias-button"

// Función helper para mostrar nombres legibles de tipos de listado
const getTipoListadoDisplay = (tipo: TipoListado) => {
  switch (tipo) {
    case "MAL_TOLERANCIA_CERO":
      return "Maleza Tolerancia Cero"
    case "MAL_TOLERANCIA":
      return "Maleza Tolerancia"
    case "MAL_COMUNES":
      return "Malezas Comunes"
    case "OTROS":
      return "Otros Cultivos"
    default:
      return tipo
  }
}

// Función helper para obtener el color del badge según el tipo
const getTipoListadoBadgeColor = (tipo: TipoListado) => {
  switch (tipo) {
    case "MAL_TOLERANCIA_CERO":
      return "bg-red-100 text-red-700 border-red-200"
    case "MAL_TOLERANCIA":
      return "bg-orange-100 text-orange-700 border-orange-200"
    case "MAL_COMUNES":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "OTROS":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export default function EditarPurezaPage() {
  const params = useParams()
  const router = useRouter()
  const purezaId = params.id as string

  const [pureza, setPureza] = useState<PurezaDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [catalogos, setCatalogos] = useState<MalezasCatalogoDTO[]>([])
  const [especies, setEspecies] = useState<EspecieDTO[]>([])

  // Nuevos estados para agregar listados
  const [showAddListado, setShowAddListado] = useState(false)
  const [newListado, setNewListado] = useState({
    listadoTipo: "",
    listadoInsti: "",
    listadoNum: 0,
    idCatalogo: 0,
    idEspecie: 0,
  })

  // Form state
  const [formData, setFormData] = useState({
    fecha: "",
    pesoInicial_g: 0,
    semillaPura_g: 0,
    materiaInerte_g: 0,
    otrosCultivos_g: 0,
    malezas_g: 0,
    malezasToleradas_g: 0,
    malezasTolCero_g: 0,
    pesoTotal_g: 0,
    
    redonSemillaPura: 0,
    redonMateriaInerte: 0,
    redonOtrosCultivos: 0,
    redonMalezas: 0,
    redonMalezasToleradas: 0,
    redonMalezasTolCero: 0,
    redonPesoTotal: 0,
    
    inasePura: 0,
    inaseMateriaInerte: 0,
    inaseOtrosCultivos: 0,
    inaseMalezas: 0,
    inaseMalezasToleradas: 0,
    inaseMalezasTolCero: 0,
    inaseFecha: "",
    
    cumpleEstandar: "",
    observacionesPureza: "",
    listados: [] as any[],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const targetId = Number.parseInt(purezaId)
        console.log("Cargando Pureza con ID:", targetId)

        const purezaData = await obtenerPurezaPorId(targetId)
        console.log("Pureza cargada exitosamente:", purezaData)
        setPureza(purezaData)

        // Cargar catálogos
        try {
          console.log("Cargando catálogos de malezas...")
          const catalogosData = await malezasService.obtenerTodasMalezas()
          if (Array.isArray(catalogosData)) {
            setCatalogos(catalogosData)
          }
        } catch (catalogError) {
          console.error("Error al cargar catálogos:", catalogError)
          setCatalogos([])
        }

        // Cargar especies
        try {
          console.log("Cargando especies...")
          const especiesData = await obtenerTodasEspecies(true)
          if (Array.isArray(especiesData)) {
            setEspecies(especiesData)
          }
        } catch (especiesError) {
          console.error("Error al cargar especies:", especiesError)
          setEspecies([])
        }

        // Función para formatear fecha
        const formatDateForInput = (dateString: string | undefined) => {
          if (!dateString) return ""
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
          try {
            const date = new Date(dateString)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          } catch {
            return ""
          }
        }

        // Poblar el formulario
        setFormData({
          fecha: formatDateForInput(purezaData.fecha),
          pesoInicial_g: purezaData.pesoInicial_g || 0,
          semillaPura_g: purezaData.semillaPura_g || 0,
          materiaInerte_g: purezaData.materiaInerte_g || 0,
          otrosCultivos_g: purezaData.otrosCultivos_g || 0,
          malezas_g: purezaData.malezas_g || 0,
          malezasToleradas_g: purezaData.malezasToleradas_g || 0,
          malezasTolCero_g: purezaData.malezasTolCero_g || 0,
          pesoTotal_g: purezaData.pesoTotal_g || 0,
          
          redonSemillaPura: purezaData.redonSemillaPura || 0,
          redonMateriaInerte: purezaData.redonMateriaInerte || 0,
          redonOtrosCultivos: purezaData.redonOtrosCultivos || 0,
          redonMalezas: purezaData.redonMalezas || 0,
          redonMalezasToleradas: purezaData.redonMalezasToleradas || 0,
          redonMalezasTolCero: purezaData.redonMalezasTolCero || 0,
          redonPesoTotal: purezaData.redonPesoTotal || 0,
          
          inasePura: purezaData.inasePura || 0,
          inaseMateriaInerte: purezaData.inaseMateriaInerte || 0,
          inaseOtrosCultivos: purezaData.inaseOtrosCultivos || 0,
          inaseMalezas: purezaData.inaseMalezas || 0,
          inaseMalezasToleradas: purezaData.inaseMalezasToleradas || 0,
          inaseMalezasTolCero: purezaData.inaseMalezasTolCero || 0,
          inaseFecha: formatDateForInput(purezaData.inaseFecha),
          
          cumpleEstandar: purezaData.cumpleEstandar === true ? "si" : purezaData.cumpleEstandar === false ? "no" : "",
          observacionesPureza: purezaData.comentarios || "",
          listados: purezaData.otrasSemillas?.map((listado) => ({
            listadoTipo: listado.listadoTipo,
            listadoInsti: listado.listadoInsti,
            listadoNum: listado.listadoNum,
            idCatalogo: listado.catalogo?.catalogoID || null,
            catalogoNombre: listado.catalogo?.nombreComun || "",
            catalogoCientifico: listado.catalogo?.nombreCientifico || "",
            idEspecie: listado.especie?.especieID || null,
            especieNombre: listado.especie?.nombreComun || "",
            especieCientifico: listado.especie?.nombreCientifico || "",
          })) || [],
        })
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los detalles del análisis de Pureza")
      } finally {
        setLoading(false)
      }
    }

    if (purezaId) {
      fetchData()
    }
  }, [purezaId])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Calcular peso total automáticamente (suma de todos los componentes)
  const pesoTotalCalculado = useMemo(() => {
    const semillaPura = parseFloat(formData.semillaPura_g as any) || 0;
    const materiaInerte = parseFloat(formData.materiaInerte_g as any) || 0;
    const otrosCultivos = parseFloat(formData.otrosCultivos_g as any) || 0;
    const malezas = parseFloat(formData.malezas_g as any) || 0;
    const malezasToleradas = parseFloat(formData.malezasToleradas_g as any) || 0;
    const malezasTolCero = parseFloat(formData.malezasTolCero_g as any) || 0;

    return semillaPura + materiaInerte + otrosCultivos + malezas + malezasToleradas + malezasTolCero;
  }, [
    formData.semillaPura_g,
    formData.materiaInerte_g,
    formData.otrosCultivos_g,
    formData.malezas_g,
    formData.malezasToleradas_g,
    formData.malezasTolCero_g
  ]);

  // Sincronizar peso total calculado con formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      pesoTotal_g: parseFloat(pesoTotalCalculado.toFixed(3))
    }));
  }, [pesoTotalCalculado]);

  // Calcular porcentajes automáticamente basados en PESO TOTAL (no peso inicial)
  const porcentajes = useMemo(() => {
    const pesoTotal = parseFloat(formData.pesoTotal_g as any) || 0;
    const semillaPura = parseFloat(formData.semillaPura_g as any) || 0;
    const materiaInerte = parseFloat(formData.materiaInerte_g as any) || 0;
    const otrosCultivos = parseFloat(formData.otrosCultivos_g as any) || 0;
    const malezas = parseFloat(formData.malezas_g as any) || 0;
    const malezasToleradas = parseFloat(formData.malezasToleradas_g as any) || 0;
    const malezasTolCero = parseFloat(formData.malezasTolCero_g as any) || 0;

    if (pesoTotal === 0 || isNaN(pesoTotal)) {
      return {
        semillaPura: 0,
        materiaInerte: 0,
        otrosCultivos: 0,
        malezas: 0,
        malezasToleradas: 0,
        malezasTolCero: 0,
      };
    }

    return {
      semillaPura: (semillaPura / pesoTotal) * 100,
      materiaInerte: (materiaInerte / pesoTotal) * 100,
      otrosCultivos: (otrosCultivos / pesoTotal) * 100,
      malezas: (malezas / pesoTotal) * 100,
      malezasToleradas: (malezasToleradas / pesoTotal) * 100,
      malezasTolCero: (malezasTolCero / pesoTotal) * 100,
    };
  }, [
    formData.pesoTotal_g,
    formData.semillaPura_g,
    formData.materiaInerte_g,
    formData.otrosCultivos_g,
    formData.malezas_g,
    formData.malezasToleradas_g,
    formData.malezasTolCero_g
  ]);

  // Validar que los porcentajes redondeados sumen 100
  const sumaPorcentajesRedondeados = useMemo(() => {
    const suma = (
      parseFloat(formData.redonSemillaPura as any || "0") +
      parseFloat(formData.redonMateriaInerte as any || "0") +
      parseFloat(formData.redonOtrosCultivos as any || "0") +
      parseFloat(formData.redonMalezas as any || "0") +
      parseFloat(formData.redonMalezasToleradas as any || "0") +
      parseFloat(formData.redonMalezasTolCero as any || "0")
    );
    return suma.toFixed(2);
  }, [
    formData.redonSemillaPura,
    formData.redonMateriaInerte,
    formData.redonOtrosCultivos,
    formData.redonMalezas,
    formData.redonMalezasToleradas,
    formData.redonMalezasTolCero
  ]);

  // Calcular redonPesoTotal automáticamente (suma de todos los porcentajes)
  const redonPesoTotalCalculado = useMemo(() => {
    const suma = (
      parseFloat(formData.redonSemillaPura as any || "0") +
      parseFloat(formData.redonMateriaInerte as any || "0") +
      parseFloat(formData.redonOtrosCultivos as any || "0") +
      parseFloat(formData.redonMalezas as any || "0") +
      parseFloat(formData.redonMalezasToleradas as any || "0") +
      parseFloat(formData.redonMalezasTolCero as any || "0")
    );
    return suma.toFixed(2);
  }, [
    formData.redonSemillaPura,
    formData.redonMateriaInerte,
    formData.redonOtrosCultivos,
    formData.redonMalezas,
    formData.redonMalezasToleradas,
    formData.redonMalezasTolCero
  ]);

  // Sincronizar redonPesoTotal calculado con formData
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      redonPesoTotal: parseFloat(redonPesoTotalCalculado)
    }));
  }, [redonPesoTotalCalculado]);

  const handleListadoAdd = (newListado: any) => {
    setFormData((prev) => ({
      ...prev,
      listados: [...prev.listados, newListado],
    }))
  }

  const handleListadoRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      listados: prev.listados.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!pureza) return

    try {
      setSaving(true)

      const updateData: PurezaRequestDTO = {
        idLote: pureza.idLote || 0,
        comentarios: formData.observacionesPureza || undefined,
        cumpleEstandar: formData.cumpleEstandar === "si" ? true : formData.cumpleEstandar === "no" ? false : undefined,
        
        fecha: formData.fecha,
        pesoInicial_g: formData.pesoInicial_g || 0,
        semillaPura_g: formData.semillaPura_g || 0,
        materiaInerte_g: formData.materiaInerte_g || 0,
        otrosCultivos_g: formData.otrosCultivos_g || 0,
        malezas_g: formData.malezas_g || 0,
        malezasToleradas_g: formData.malezasToleradas_g || 0,
        malezasTolCero_g: formData.malezasTolCero_g || 0,
        pesoTotal_g: formData.pesoTotal_g || 0,
        
        redonSemillaPura: formData.redonSemillaPura || 0,
        redonMateriaInerte: formData.redonMateriaInerte || 0,
        redonOtrosCultivos: formData.redonOtrosCultivos || 0,
        redonMalezas: formData.redonMalezas || 0,
        redonMalezasToleradas: formData.redonMalezasToleradas || 0,
        redonMalezasTolCero: formData.redonMalezasTolCero || 0,
        redonPesoTotal: formData.redonPesoTotal || 0,
        
        inasePura: formData.inasePura || 0,
        inaseMateriaInerte: formData.inaseMateriaInerte || 0,
        inaseOtrosCultivos: formData.inaseOtrosCultivos || 0,
        inaseMalezas: formData.inaseMalezas || 0,
        inaseMalezasToleradas: formData.inaseMalezasToleradas || 0,
        inaseMalezasTolCero: formData.inaseMalezasTolCero || 0,
        inaseFecha: formData.inaseFecha || undefined,
        
        otrasSemillas: formData.listados.map((listado) => ({
          listadoTipo: listado.listadoTipo,
          listadoInsti: listado.listadoInsti,
          listadoNum: listado.listadoNum,
          idCatalogo: listado.idCatalogo || undefined,  // Para malezas
          idEspecie: listado.idEspecie || undefined,    // Para otros cultivos
        })),
      }

      await actualizarPureza(Number.parseInt(purezaId), updateData)
      toast.success("Análisis de Pureza actualizado correctamente")
      router.push(`/listado/analisis/pureza/${purezaId}`)
    } catch (err) {
      console.error("Error updating Pureza:", err)
      toast.error("Error al actualizar el análisis de Pureza")
    } finally {
      setSaving(false)
    }
  }

  // Finalizar análisis
  const handleFinalizarAnalisis = async () => {
    if (!pureza) return
    
    try {
      console.log(" Finalizando análisis Pureza:", pureza.analisisID)
      await finalizarAnalisis(pureza.analisisID)
      toast.success("Análisis finalizado exitosamente")
      router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
    } catch (err: any) {
      console.error(" Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    }
  }

  // Aprobar análisis (solo para análisis en PENDIENTE_APROBACION o A_REPETIR)
  const handleAprobar = async () => {
    if (!pureza) return
    
    try {
      console.log(" Aprobando análisis Pureza:", pureza.analisisID)
      await aprobarAnalisis(pureza.analisisID)
      toast.success("Análisis aprobado exitosamente")
      router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
    } catch (err: any) {
      console.error(" Error aprobando análisis:", err)
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!pureza) return
    
    try {
      console.log(" Marcando análisis Pureza para repetir:", pureza.analisisID)
      await marcarParaRepetir(pureza.analisisID)
      toast.success("Análisis marcado para repetir")
      router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
    } catch (err: any) {
      console.error(" Error marcando para repetir:", err)
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis",
      })
    }
  }

  // Finalizar y aprobar (solo para admin en estados no finalizados)
  const handleFinalizarYAprobar = async () => {
    if (!pureza) return
    
    try {
      console.log(" Finalizando y aprobando análisis Pureza:", pureza.analisisID)
      // Cuando el admin finaliza, el backend automáticamente lo aprueba
      // No necesitamos llamar a aprobarAnalisis por separado
      await finalizarAnalisis(pureza.analisisID)
      toast.success("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
    } catch (err: any) {
      console.error(" Error finalizando y aprobando:", err)
      toast.error('Error al finalizar y aprobar', {
        description: err?.message || "No se pudo completar la acción",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Cargando análisis de Pureza...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pureza) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h2 className="text-xl font-semibold mb-2">Error al cargar</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Link href="/listado/analisis/pureza">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al listado
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header Universal */}
      <AnalisisHeaderBar
        tipoAnalisis="Pureza"
        analisisId={pureza.analisisID}
        estado={pureza.estado || ""}
        volverUrl={`/listado/analisis/pureza/${purezaId}`}
        modoEdicion={true}
        onToggleEdicion={() => router.push(`/listado/analisis/pureza/${purezaId}`)}
        onGuardarCambios={handleSave}
        guardando={saving}
        tieneCambios={true}
      />

      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="space-y-6">
          {/* SECCIÓN INIA */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">INIA</h3>
                  <p className="text-sm text-muted-foreground">Instituto Nacional de Investigación Agropecuaria</p>
                </div>
              </div>
              <TablaToleranciasButton
                pdfPath="/tablas-tolerancias/tabla-pureza.pdf"
                title="Ver Tabla de Tolerancias"
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              />
            </div>

            {/* Card 1: Fecha y Datos en Gramos */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fecha y Valores en Gramos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Fecha */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Fecha del análisis *
                    </Label>
                    <Input
                      type="date"
                      value={formData.fecha || ""}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Peso Inicial */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      Peso inicial (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.pesoInicial_g ?? ""}
                      onChange={(e) => handleInputChange("pesoInicial_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Semilla Pura */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-green-600" />
                      Semilla pura (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.semillaPura_g ?? ""}
                      onChange={(e) => handleInputChange("semillaPura_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Materia Inerte */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Microscope className="h-4 w-4 text-amber-600" />
                      Materia inerte (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.materiaInerte_g ?? ""}
                      onChange={(e) => handleInputChange("materiaInerte_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Otros Cultivos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-purple-600" />
                      Otros cultivos (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.otrosCultivos_g ?? ""}
                      onChange={(e) => handleInputChange("otrosCultivos_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Malezas */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-orange-600" />
                      Malezas (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.malezas_g ?? ""}
                      onChange={(e) => handleInputChange("malezas_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Malezas Toleradas */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-pink-600" />
                      Malezas toleradas (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.malezasToleradas_g ?? ""}
                      onChange={(e) => handleInputChange("malezasToleradas_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Malezas Tolerancia Cero */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-red-600" />
                      Malezas tol. cero (g) *
                    </Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={formData.malezasTolCero_g ?? ""}
                      onChange={(e) => handleInputChange("malezasTolCero_g", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.000"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Peso Total - Auto calculado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      Peso total (g) - Auto *
                    </Label>
                    <Input
                      type="text"
                      value={pesoTotalCalculado.toFixed(3)}
                      readOnly
                      placeholder="0.000"
                      className="h-11 bg-blue-50 border-blue-300 font-semibold text-blue-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card de Porcentajes sin Redondeo (Auto-calculados) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-600" />
                Porcentajes sin Redondeo (Automático - 4 decimales)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Calculados automáticamente en base al peso total</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Semilla Pura % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-green-600" />
                    Semilla pura (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.semillaPura.toFixed(4)}
                    readOnly
                    className="h-11 bg-emerald-50 border-emerald-300 font-semibold text-emerald-700"
                  />
                </div>

                {/* Materia Inerte % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Microscope className="h-4 w-4 text-amber-600" />
                    Materia inerte (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.materiaInerte.toFixed(4)}
                    readOnly
                    className="h-11 bg-amber-50 border-amber-300 font-semibold text-amber-700"
                  />
                </div>

                {/* Otros Cultivos % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-purple-600" />
                    Otros cultivos (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.otrosCultivos.toFixed(4)}
                    readOnly
                    className="h-11 bg-purple-50 border-purple-300 font-semibold text-purple-700"
                  />
                </div>

                {/* Malezas % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-orange-600" />
                    Malezas (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.malezas.toFixed(4)}
                    readOnly
                    className="h-11 bg-orange-50 border-orange-300 font-semibold text-orange-700"
                  />
                </div>

                {/* Malezas Toleradas % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600" />
                    Malezas toleradas (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.malezasToleradas.toFixed(4)}
                    readOnly
                    className="h-11 bg-pink-50 border-pink-300 font-semibold text-pink-700"
                  />
                </div>

                {/* Malezas Tolerancia Cero % */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Malezas tol. cero (%)
                  </Label>
                  <Input
                    type="text"
                    value={porcentajes.malezasTolCero.toFixed(4)}
                    readOnly
                    className="h-11 bg-red-50 border-red-300 font-semibold text-red-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Porcentajes CON REDONDEO (Manual) */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                Porcentajes con Redondeo (Manual)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Ingrese manualmente los valores redondeados</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Semilla Pura Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-green-600" />
                    Semilla pura (%)
                  </Label>
                  <Input
                    type={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "tr" : (formData.redonSemillaPura ?? "")}
                    onChange={(e) => handleInputChange("redonSemillaPura", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.semillaPura > 0 && porcentajes.semillaPura < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>

                {/* Materia Inerte Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Microscope className="h-4 w-4 text-amber-600" />
                    Materia inerte (%)
                  </Label>
                  <Input
                    type={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "tr" : (formData.redonMateriaInerte ?? "")}
                    onChange={(e) => handleInputChange("redonMateriaInerte", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.materiaInerte > 0 && porcentajes.materiaInerte < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>

                {/* Otros Cultivos Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-purple-600" />
                    Otros cultivos (%)
                  </Label>
                  <Input
                    type={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "tr" : (formData.redonOtrosCultivos ?? "")}
                    onChange={(e) => handleInputChange("redonOtrosCultivos", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.otrosCultivos > 0 && porcentajes.otrosCultivos < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>

                {/* Malezas Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-orange-600" />
                    Malezas (%)
                  </Label>
                  <Input
                    type={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "tr" : (formData.redonMalezas ?? "")}
                    onChange={(e) => handleInputChange("redonMalezas", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.malezas > 0 && porcentajes.malezas < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezas > 0 && porcentajes.malezas < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>

                {/* Malezas Toleradas Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-pink-600" />
                    Malezas toleradas (%)
                  </Label>
                  <Input
                    type={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "tr" : (formData.redonMalezasToleradas ?? "")}
                    onChange={(e) => handleInputChange("redonMalezasToleradas", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezasToleradas > 0 && porcentajes.malezasToleradas < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>

                {/* Malezas Tolerancia Cero Redondeado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-red-600" />
                    Malezas tol. cero (%)
                  </Label>
                  <Input
                    type={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "text" : "number"}
                    step="0.01"
                    value={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "tr" : (formData.redonMalezasTolCero ?? "")}
                    onChange={(e) => handleInputChange("redonMalezasTolCero", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    placeholder={(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "tr" : "0.00"}
                    readOnly={porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05}
                    className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 ${(porcentajes.malezasTolCero > 0 && porcentajes.malezasTolCero < 0.05) ? "bg-muted italic" : ""}`}
                  />
                </div>
              </div>

              {/* Peso Total Redondeado - Auto Calculado */}
              <div className="grid grid-cols-1 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-600" />
                    Peso total (%) - Auto
                  </Label>
                  <Input
                    type="text"
                    value={redonPesoTotalCalculado}
                    readOnly
                    className="h-11 bg-blue-50 border-blue-300 font-semibold text-blue-700"
                  />
                </div>
              </div>

              {/* Validación de Suma = 100 */}
              <Alert className={`mt-4 ${sumaPorcentajesRedondeados === "100.00" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                <AlertDescription className={sumaPorcentajesRedondeados === "100.00" ? "text-green-800" : "text-red-800"}>
                  <div className="flex items-center gap-2 font-semibold">
                    {sumaPorcentajesRedondeados === "100.00" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Suma correcta: {sumaPorcentajesRedondeados}%
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Suma incorrecta: {sumaPorcentajesRedondeados}% (debe ser 100.00%)
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* SECCIÓN INASE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">INASE</h3>
                <p className="text-sm text-muted-foreground">Instituto Nacional de Semillas</p>
              </div>
            </div>

            {/* Card 4: Porcentajes INASE */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Fecha y Porcentajes INASE
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Ingrese los porcentajes oficiales de INASE</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* INASE Fecha - PRIMERO */}
                  <div className="space-y-2 md:col-span-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Fecha INASE
                    </Label>
                    <Input
                      type="date"
                      value={formData.inaseFecha || ""}
                      onChange={(e) => handleInputChange("inaseFecha", e.target.value)}
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Semilla Pura */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FlaskConical className="h-4 w-4 text-blue-600" />
                      Semilla pura (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inasePura ?? ""}
                      onChange={(e) => handleInputChange("inasePura", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Materia Inerte */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Microscope className="h-4 w-4 text-blue-600" />
                      Materia inerte (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inaseMateriaInerte ?? ""}
                      onChange={(e) => handleInputChange("inaseMateriaInerte", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Otros Cultivos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <PieChart className="h-4 w-4 text-blue-600" />
                      Otros cultivos (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inaseOtrosCultivos ?? ""}
                      onChange={(e) => handleInputChange("inaseOtrosCultivos", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Malezas */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-blue-600" />
                      Malezas (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inaseMalezas ?? ""}
                      onChange={(e) => handleInputChange("inaseMalezas", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Malezas Toleradas */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      Malezas toleradas (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inaseMalezasToleradas ?? ""}
                      onChange={(e) => handleInputChange("inaseMalezasToleradas", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* INASE Malezas Tolerancia Cero */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-red-600" />
                      Malezas tol. cero (%)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.inaseMalezasTolCero ?? ""}
                      onChange={(e) => handleInputChange("inaseMalezasTolCero", e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      placeholder="0.00"
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Card 5: Cumple Estándar */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Cumplimiento del Estándar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado de cumplimiento</Label>
                <Select
                  value={formData.cumpleEstandar || ""}
                  onValueChange={(value) => handleInputChange("cumpleEstandar", value)}
                >
                  <SelectTrigger className="w-full h-11 border rounded-md shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Cumple con el estándar
                      </div>
                    </SelectItem>
                    <SelectItem value="no">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        No cumple con el estándar
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensaje dinámico */}
              {formData.cumpleEstandar && (
                <div
                  className={`mt-4 rounded-lg border p-4 transition-colors ${formData.cumpleEstandar === "si"
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                    }`}
                >
                  <div
                    className={`flex items-center gap-2 ${formData.cumpleEstandar === "si"
                      ? "text-emerald-800"
                      : "text-red-800"
                      }`}
                  >
                    {formData.cumpleEstandar === "si" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-semibold">La muestra cumple con los estándares establecidos</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span className="font-semibold">La muestra NO cumple con los estándares establecidos</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Observaciones */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Comentarios adicionales</Label>
                <Textarea
                  value={formData.observacionesPureza}
                  onChange={(e) => handleInputChange("observacionesPureza", e.target.value)}
                  rows={4}
                  placeholder="Ingrese cualquier observación relevante sobre el análisis..."
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Registros (Malezas y Cultivos) */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Registros (Malezas y Cultivos)
                </CardTitle>
                <Button onClick={() => setShowAddListado(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddListado && (
                <div className="border-2 border-dashed rounded-lg p-4 mb-4 bg-muted/30">
                  <h3 className="text-sm font-semibold mb-4">Nuevo Registro</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select
                        value={newListado.listadoTipo}
                        onValueChange={(value) =>
                          setNewListado((prev) => ({
                            ...prev,
                            listadoTipo: value,
                            idCatalogo: 0,
                            idEspecie: 0, // Reset también idEspecie
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MAL_TOLERANCIA_CERO">Maleza Tolerancia Cero</SelectItem>
                          <SelectItem value="MAL_TOLERANCIA">Maleza Tolerancia</SelectItem>
                          <SelectItem value="MAL_COMUNES">Malezas Comunes</SelectItem>
                          <SelectItem value="OTROS">Otros Cultivos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Especie</Label>
                      <Select
                        value={
                          newListado.listadoTipo === "OTROS"
                            ? newListado.idEspecie.toString()
                            : newListado.idCatalogo.toString()
                        }
                        onValueChange={(value) =>
                          setNewListado((prev) => ({
                            ...prev,
                            ...(newListado.listadoTipo === "OTROS"
                              ? { idEspecie: Number.parseInt(value), idCatalogo: 0 }
                              : { idCatalogo: Number.parseInt(value), idEspecie: 0 }),
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar especie" />
                        </SelectTrigger>
                        <SelectContent>
                          {newListado.listadoTipo === "OTROS" ? (
                            especies.length === 0 ? (
                              <SelectItem value="0" disabled>
                                No hay especies disponibles
                              </SelectItem>
                            ) : (
                              especies.map((especie) => (
                                <SelectItem key={especie.especieID} value={especie.especieID.toString()}>
                                  {especie.nombreComun}
                                </SelectItem>
                              ))
                            )
                          ) : catalogos.length === 0 ? (
                            <SelectItem value="0" disabled>
                              No hay malezas disponibles
                            </SelectItem>
                          ) : (
                            catalogos.map((catalogo) => (
                              <SelectItem key={catalogo.catalogoID} value={catalogo.catalogoID.toString()}>
                                {catalogo.nombreComun}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Instituto</Label>
                      <Select
                        value={newListado.listadoInsti}
                        onValueChange={(value) => setNewListado((prev) => ({ ...prev, listadoInsti: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INIA">INIA</SelectItem>
                          <SelectItem value="INASE">INASE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        type="number"
                        value={newListado.listadoNum === 0 ? "" : newListado.listadoNum}
                        onChange={(e) =>
                          setNewListado((prev) => ({
                            ...prev,
                            listadoNum: e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                          }))
                        }
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        // Validar según el tipo
                        const isOtrosCultivos = newListado.listadoTipo === "OTROS"
                        const hasRequiredFields = newListado.listadoTipo && 
                          newListado.listadoInsti && 
                          (isOtrosCultivos ? newListado.idEspecie : newListado.idCatalogo)

                        if (hasRequiredFields) {
                          if (isOtrosCultivos) {
                            // Para otros cultivos, buscar en especies
                            const especie = especies.find((e) => e.especieID === newListado.idEspecie)
                            handleListadoAdd({
                              ...newListado,
                              especieNombre: especie?.nombreComun || "",
                              especieCientifico: especie?.nombreCientifico || "",
                              catalogoNombre: "",
                              catalogoCientifico: "",
                            })
                          } else {
                            // Para malezas, buscar en catalogos
                            const catalogo = catalogos.find((c) => c.catalogoID === newListado.idCatalogo)
                            handleListadoAdd({
                              ...newListado,
                              catalogoNombre: catalogo?.nombreComun || "",
                              catalogoCientifico: catalogo?.nombreCientifico || "",
                              especieNombre: "",
                              especieCientifico: "",
                            })
                          }
                          setNewListado({ listadoTipo: "", listadoInsti: "", listadoNum: 0, idCatalogo: 0, idEspecie: 0 })
                          setShowAddListado(false)
                          toast.success("Registro agregado")
                        } else {
                          toast.error("Complete todos los campos")
                        }
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddListado(false)
                        setNewListado({ listadoTipo: "", listadoInsti: "", listadoNum: 0, idCatalogo: 0 , idEspecie: 0 })
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {formData.listados.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">No hay registros</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Especie</TableHead>
                        <TableHead>Instituto</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.listados.map((listado, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="outline" className={getTipoListadoBadgeColor(listado.listadoTipo as TipoListado)}>
                              {getTipoListadoDisplay(listado.listadoTipo as TipoListado)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {listado.listadoTipo === "OTROS" 
                                  ? (listado.especieNombre || "--")
                                  : (listado.catalogoNombre || "--")
                                }
                              </div>
                              <div className="text-sm text-muted-foreground italic">
                                {listado.listadoTipo === "OTROS"
                                  ? listado.especieCientifico
                                  : listado.catalogoCientifico
                                }
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{listado.listadoInsti}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{listado.listadoNum}</TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                handleListadoRemove(index)
                                toast.success("Registro eliminado")
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Card de Acciones */}
        <AnalisisAccionesCard
          analisisId={pureza.analisisID}
          tipoAnalisis="pureza"
          estado={pureza.estado || ""}
          onAprobar={async () => {
            await aprobarAnalisis(pureza.analisisID)
            toast.success("Análisis aprobado exitosamente")
            router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
          }}
          onMarcarParaRepetir={async () => {
            await marcarParaRepetir(pureza.analisisID)
            toast.success("Análisis marcado para repetir")
            router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
          }}
          onFinalizarYAprobar={async () => {
            await finalizarAnalisis(pureza.analisisID)
            toast.success("Análisis finalizado y aprobado")
            router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
          }}
          onFinalizar={async () => {
            await finalizarAnalisis(pureza.analisisID)
            toast.success("Análisis finalizado exitosamente")
            router.push(`/listado/analisis/pureza/${pureza.analisisID}`)
          }}
        />
      </div>
    </div>
  )
}