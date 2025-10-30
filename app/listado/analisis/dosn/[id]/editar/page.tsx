"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Loader2, AlertTriangle, FileText, Building2, Plus, Trash2, Leaf } from "lucide-react"
import Link from "next/link"
import {
  obtenerDosnPorId,
  actualizarDosn,
  obtenerTodasDosnActivas,
  finalizarAnalisis,
  aprobarAnalisis,
  marcarParaRepetir
} from "@/app/services/dosn-service"
import * as malezasService from "@/app/services/malezas-service"
import * as especiesService from "@/app/services/especie-service"
import type { DosnDTO, DosnRequestDTO, MalezasCatalogoDTO, TipoListado, Instituto, EspecieDTO } from "@/app/models"
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
    case "BRASSICA":
      return "Brassica"
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
    case "BRASSICA":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "OTROS":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export default function EditarDosnPage() {
  const params = useParams()
  const router = useRouter()
  const dosnId = params.id as string

  const [dosn, setDosn] = useState<DosnDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [catalogos, setCatalogos] = useState<MalezasCatalogoDTO[]>([])
  const [especies, setEspecies] = useState<EspecieDTO[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    comentarios: "",
    cumpleEstandar: false,
    fechaINIA: "",
    gramosAnalizadosINIA: 0,
    tipoINIA: [] as string[],
    fechaINASE: "",
    gramosAnalizadosINASE: 0,
    tipoINASE: [] as string[],
    cuscutaRegistros: [] as any[], // Array de registros de Cuscuta
    listados: [] as any[],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const targetId = Number.parseInt(dosnId)
        console.log("Buscando DOSN con ID:", targetId)

        // Primero verificar que el ID existe en el listado
        try {
          console.log("Verificando si el DOSN existe en el listado...")
          const todosDosn = await obtenerTodasDosnActivas()
          console.log(
            "DOSNs disponibles:",
            todosDosn.map((d) => ({ id: d.analisisID, lote: d.lote })),
          )

          const dosnExists = todosDosn.find((d) => d.analisisID === targetId)
          if (!dosnExists) {
            throw new Error(
              `No se encontró un análisis DOSN con ID ${targetId}. IDs disponibles: ${todosDosn.map((d) => d.analisisID).join(", ")}`,
            )
          }
          console.log("DOSN encontrado en listado:", dosnExists)
        } catch (listError) {
          console.error("Error al verificar existencia:", listError)
          setError(`${listError}`)
          return
        }

        // Ahora cargar los datos específicos del DOSN
        console.log("Cargando datos detallados del DOSN...")
        const dosnData = await obtenerDosnPorId(targetId)
        console.log("DOSN cargado exitosamente:", dosnData)
        setDosn(dosnData)

        // Cargar los catálogos usando el servicio correcto
        try {
          console.log("Cargando catálogos de malezas...")
          const catalogosData = await malezasService.obtenerTodasMalezas()
          console.log("Respuesta de catálogos:", catalogosData)
          console.log("Tipo de respuesta:", typeof catalogosData)
          console.log("Es array?", Array.isArray(catalogosData))

          if (Array.isArray(catalogosData)) {
            console.log("Catálogos cargados correctamente:", catalogosData.length, "items")

            if (catalogosData.length > 0) {
              console.log("Primer catálogo:", catalogosData[0])
            }
            setCatalogos(catalogosData)
          } else {
            console.warn("La respuesta no es un array:", catalogosData)
            setCatalogos([])
          }
        } catch (catalogError) {
          console.error("Error detallado al cargar catálogos:", catalogError)
          setCatalogos([])
        }

        try {
          console.log("Cargando especies...")
          const especiesData = await especiesService.obtenerTodasEspecies(true)
          setEspecies(especiesData)
          console.log("Especies cargadas:", especiesData.length)
        } catch (error) {
          console.error("Error cargando especies:", error)
          setEspecies([])
        }


        // Función para formatear fecha evitando problemas de zona horaria
        const formatDateForInput = (dateString: string | undefined) => {
          if (!dateString) return ""
          try {
            // Si ya viene en formato YYYY-MM-DD, usarlo directamente
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
              return dateString
            }
            // Si viene en otro formato, parsearlo sin crear problemas de timezone
            const date = new Date(dateString)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          } catch (dateError) {
            console.warn("Error al formatear fecha:", dateString, dateError)
            return ""
          }
        }

        // Poblar el formulario con los datos existentes
        const formDataToSet = {
          comentarios: dosnData.comentarios || "",
          cumpleEstandar: dosnData.cumpleEstandar || false,
          fechaINIA: formatDateForInput(dosnData.fechaINIA),
          gramosAnalizadosINIA: dosnData.gramosAnalizadosINIA || 0,
          tipoINIA: dosnData.tipoINIA || [],
          fechaINASE: formatDateForInput(dosnData.fechaINASE),
          gramosAnalizadosINASE: dosnData.gramosAnalizadosINASE || 0,
          tipoINASE: dosnData.tipoINASE || [],
          cuscutaRegistros: dosnData.cuscutaRegistros?.map(r => ({
            id: r.id,
            instituto: r.instituto,
            cuscuta_g: r.cuscuta_g || 0,
            cuscutaNum: r.cuscutaNum || 0,
            fechaCuscuta: formatDateForInput(r.fechaCuscuta),
          })) || [],
          listados:
            dosnData.listados?.map((listado) => ({
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
        }

        console.log("Estableciendo datos del formulario:", formDataToSet)
        setFormData(formDataToSet)
      } catch (err) {
        console.error("Error general al cargar datos:", err)
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(`Error al cargar los detalles del análisis DOSN: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (dosnId && dosnId !== "undefined" && !isNaN(Number.parseInt(dosnId))) {
      fetchData()
    } else {
      setError(`ID de análisis DOSN no válido: "${dosnId}"`)
      setLoading(false)
    }
  }, [dosnId])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTipoChange = (institute: "INIA" | "INASE", tipo: string, checked: boolean) => {
    const field = institute === "INIA" ? "tipoINIA" : "tipoINASE"
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], tipo] : prev[field].filter((t) => t !== tipo),
    }))
  }

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

  const handleCuscutaRegistroAdd = () => {
    setFormData((prev) => ({
      ...prev,
      cuscutaRegistros: [
        ...prev.cuscutaRegistros,
        {
          instituto: "",
          cuscuta_g: 0,
          cuscutaNum: 0,
          fechaCuscuta: new Date().toISOString().split('T')[0],
        },
      ],
    }))
  }

  const handleCuscutaRegistroRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      cuscutaRegistros: prev.cuscutaRegistros.filter((_, i) => i !== index),
    }))
  }

  const handleCuscutaRegistroUpdate = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.cuscutaRegistros]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, cuscutaRegistros: updated }
    })
  }

  const handleSave = async () => {
    if (!dosn) return

    // Validación cliente antes de enviar
    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {}

      // --- Helpers locales ---
      const validarFecha = (fecha: string) => {
        if (!fecha) return false
        const f = new Date(fecha + "T00:00:00") // evita error por zona horaria
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        return !isNaN(f.getTime()) && f <= hoy
      }

      const validarGramos = (valor: number | string) => {
        const n = parseFloat(valor as string)
        return !isNaN(n) && n > 0
      }

      const validarTiposAnalisis = (tipos: string[]) => {
        return Array.isArray(tipos) && tipos.length > 0
      }

      // --- INIA ---
      if (!validarTiposAnalisis(formData.tipoINIA)) {
        newErrors.tipoINIA = "Debe seleccionar al menos un tipo de análisis para INIA"
      }

      if (!validarFecha(formData.fechaINIA)) {
        newErrors.fechaINIA = "Ingrese una fecha válida (no futura) para INIA"
      }

      if (!validarGramos(formData.gramosAnalizadosINIA)) {
        newErrors.gramosAnalizadosINIA = "Debe ingresar una cantidad válida de gramos (> 0) para INIA"
      }

      // --- INASE ---
      if (!validarTiposAnalisis(formData.tipoINASE)) {
        newErrors.tipoINASE = "Debe seleccionar al menos un tipo de análisis para INASE"
      }

      if (!validarFecha(formData.fechaINASE)) {
        newErrors.fechaINASE = "Ingrese una fecha válida (no futura) para INASE"
      }

      if (!validarGramos(formData.gramosAnalizadosINASE)) {
        newErrors.gramosAnalizadosINASE = "Debe ingresar una cantidad válida de gramos (> 0) para INASE"
      }

      // --- Reglas cruzadas opcionales ---
      if (formData.fechaINIA && !formData.gramosAnalizadosINIA) {
        newErrors.gramosAnalizadosINIA = "Si hay fecha, debe ingresar los gramos analizados para INIA"
      }
      if (formData.gramosAnalizadosINIA && !formData.fechaINIA) {
        newErrors.fechaINIA = "Si hay gramos analizados, debe ingresar la fecha de INIA"
      }

      if (formData.fechaINASE && !formData.gramosAnalizadosINASE) {
        newErrors.gramosAnalizadosINASE = "Si hay fecha, debe ingresar los gramos analizados para INASE"
      }
      if (formData.gramosAnalizadosINASE && !formData.fechaINASE) {
        newErrors.fechaINASE = "Si hay gramos analizados, debe ingresar la fecha de INASE"
      }

      // --- Validar listados ---
      if (formData.listados && formData.listados.length > 0) {
        formData.listados.forEach((l, idx) => {
          if (!l.listadoTipo || !l.listadoInsti) {
            newErrors[`listado_${idx}`] = "Listado incompleto"
          }
        })
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }


    if (!validateForm()) {
      toast.error('Corrija los errores del formulario antes de guardar')
      return
    }

    try {
      setSaving(true)

      // Función para formatear fecha evitando problemas de zona horaria al enviar al backend
      const formatDateForBackend = (dateString: string | undefined) => {
        if (!dateString) return undefined
        try {
          // Verificar que la fecha esté en formato YYYY-MM-DD válido
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
          if (!dateRegex.test(dateString)) {
            console.warn("Formato de fecha inválido:", dateString)
            return undefined
          }
          // Retornar la fecha tal como está, sin conversión de zona horaria
          return dateString
        } catch (dateError) {
          console.warn("Error al formatear fecha para backend:", dateString, dateError)
          return undefined
        }
      }

      console.log("Fechas antes del formateo:")
      console.log("- fechaINIA:", formData.fechaINIA)
      console.log("- fechaINASE:", formData.fechaINASE)
      console.log("- cuscutaRegistros:", formData.cuscutaRegistros)

      const updateData: DosnRequestDTO = {
        idLote: dosn.idLote || 0,
        comentarios: formData.comentarios,
        cumpleEstandar: formData.cumpleEstandar,
        fechaINIA: formatDateForBackend(formData.fechaINIA),
        gramosAnalizadosINIA: formData.gramosAnalizadosINIA || undefined,
        tipoINIA: formData.tipoINIA as any[],
        fechaINASE: formatDateForBackend(formData.fechaINASE),
        gramosAnalizadosINASE: formData.gramosAnalizadosINASE || undefined,
        tipoINASE: formData.tipoINASE as any[],
        cuscutaRegistros: formData.cuscutaRegistros
          .filter((r: any) => r.instituto) // Solo enviar registros con instituto
          .map((r: any) => ({
            id: r.id, // Incluir ID si existe (para actualización)
            instituto: r.instituto,
            cuscuta_g: r.cuscuta_g || undefined,
            cuscutaNum: r.cuscutaNum || undefined,
            fechaCuscuta: formatDateForBackend(r.fechaCuscuta) || new Date().toISOString().split('T')[0],
          })),
        listados: formData.listados.map((listado) => ({
          listadoTipo: listado.listadoTipo,
          listadoInsti: listado.listadoInsti,
          listadoNum: listado.listadoNum,
          idCatalogo: listado.idCatalogo || undefined,  // Para malezas
          idEspecie: listado.idEspecie || undefined,    // Para otros cultivos
        })),
      }

      console.log("Datos completos a enviar al backend:", updateData)

      await actualizarDosn(Number.parseInt(dosnId), updateData)
      toast.success("Análisis DOSN actualizado correctamente")
      router.push(`/listado/analisis/dosn/${dosnId}`)
    } catch (err) {
      console.error("Error updating DOSN:", err)
      toast.error("Error al actualizar el análisis DOSN")
    } finally {
      setSaving(false)
    }
  }

  // Finalizar análisis
  const handleFinalizarAnalisis = async () => {
    if (!dosn) return

    try {
      console.log("🏁 Finalizando análisis DOSN:", dosn.analisisID)
      await finalizarAnalisis(dosn.analisisID)
      toast.success("Análisis finalizado exitosamente")
      router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando análisis:", err)
      toast.error('Error al finalizar análisis', {
        description: err?.message || "No se pudo finalizar el análisis",
      })
    }
  }

  // Aprobar análisis
  const handleAprobar = async () => {
    if (!dosn) return

    try {
      console.log("✅ Aprobando análisis DOSN:", dosn.analisisID)
      await aprobarAnalisis(dosn.analisisID)
      toast.success("Análisis aprobado exitosamente")
      // Recargar datos
      const dosnData = await obtenerDosnPorId(Number.parseInt(dosnId))
      setDosn(dosnData)
    } catch (err: any) {
      console.error("❌ Error aprobando análisis:", err)
      toast.error('Error al aprobar análisis', {
        description: err?.message || "No se pudo aprobar el análisis",
      })
    }
  }

  // Marcar para repetir
  const handleMarcarParaRepetir = async () => {
    if (!dosn) return

    try {
      console.log("🔄 Marcando análisis DOSN para repetir:", dosn.analisisID)
      await marcarParaRepetir(dosn.analisisID)
      toast.success("Análisis marcado para repetir")
      // Recargar datos
      const dosnData = await obtenerDosnPorId(Number.parseInt(dosnId))
      setDosn(dosnData)
    } catch (err: any) {
      console.error("❌ Error marcando para repetir:", err)
      toast.error('Error al marcar para repetir', {
        description: err?.message || "No se pudo marcar el análisis",
      })
    }
  }

  // Finalizar y aprobar
  const handleFinalizarYAprobar = async () => {
    if (!dosn) return

    try {
      console.log("🏁✅ Finalizando y aprobando análisis DOSN:", dosn.analisisID)
      // Cuando el admin finaliza, el backend ya lo aprueba automáticamente
      await finalizarAnalisis(dosn.analisisID)
      toast.success("Análisis finalizado y aprobado exitosamente")
      router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
    } catch (err: any) {
      console.error("❌ Error finalizando y aprobando:", err)
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
            <p className="text-lg font-medium">Cargando análisis DOSN...</p>
            <p className="text-sm text-muted-foreground mt-2">Obteniendo datos del servidor</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !dosn) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-lg w-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Error al cargar</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg mb-6">
                  <p className="font-medium mb-1">ID del análisis: {dosnId}</p>
                  <p>Verifique que el análisis existe y que tiene permisos para editarlo.</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/listado/analisis/dosn">
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Volver al listado
                    </Button>
                  </Link>
                  <Button onClick={() => window.location.reload()}>Reintentar</Button>
                </div>
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
        tipoAnalisis="DOSN"
        analisisId={dosn.analisisID}
        estado={dosn.estado || ""}
        volverUrl={`/listado/analisis/dosn/${dosnId}`}
        modoEdicion={true}
        onToggleEdicion={() => router.push(`/listado/analisis/dosn/${dosnId}`)}
        onGuardarCambios={handleSave}
        guardando={saving}
        tieneCambios={true}
      />

      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Información del Análisis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ID Análisis</label>
                <p className="text-2xl font-bold mt-1">{dosn.analisisID}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lote</label>
                <p className="text-xl font-semibold mt-1">{dosn.lote}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  Estado Actual
                </label>
                <Badge variant="secondary" className="text-sm">
                  {dosn.estado}
                </Badge>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                  Cumple Estándar
                </label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="cumpleEstandar-header"
                    checked={formData.cumpleEstandar}
                    onCheckedChange={(checked) => handleInputChange("cumpleEstandar", checked)}
                  />
                  <Label htmlFor="cumpleEstandar-header" className="text-sm font-medium cursor-pointer">
                    {formData.cumpleEstandar ? "Sí" : "No"}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/*  <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl">Información General</span>
            </CardTitle>
          </CardHeader>
       
                  <CardContent>
                    <div className="space-y-3">
                      <Label htmlFor="comentarios" className="text-base font-medium">
                        Comentarios
                      </Label>
                      <Textarea
                        id="comentarios"
                        value={formData.comentarios}
                        onChange={(e) => handleInputChange("comentarios", e.target.value)}
                        placeholder="Ingrese comentarios sobre el análisis..."
                        rows={5}
                        className="resize-none text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Agregue observaciones o notas relevantes sobre este análisis
                      </p>
                    </div>
                  </CardContent>
        
        </Card>*/}

        {/* Análisis INIA */}
        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xl">Análisis INIA</span>
              </CardTitle>
              <TablaToleranciasButton 
                pdfPath="/tablas-tolerancias/tabla-dosn.pdf" 
                title="Tabla de Tolerancias"
              />
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha INIA */}
              <div className="space-y-2">
                <Label htmlFor="fechaINIA" className="text-sm font-medium">
                  Fecha INIA
                </Label>
                <Input
                  id="fechaINIA"
                  type="date"
                  value={formData.fechaINIA}
                  onChange={(e) => handleInputChange("fechaINIA", e.target.value)}
                  className={`text-base ${errors.fechaINIA ? "border-red-500 bg-red-50" : ""}`}
                />
                {errors.fechaINIA && (
                  <p className="text-sm text-destructive mt-1">{errors.fechaINIA}</p>
                )}
              </div>

              {/* Gramos Analizados INIA */}
              <div className="space-y-2">
                <Label htmlFor="gramosAnalizadosINIA" className="text-sm font-medium">
                  Gramos Analizados
                </Label>
                <div className="relative">
                  <Input
                    id="gramosAnalizadosINIA"
                    type="number"
                    value={formData.gramosAnalizadosINIA === 0 ? "" : formData.gramosAnalizadosINIA}
                    onChange={(e) =>
                      handleInputChange(
                        "gramosAnalizadosINIA",
                        e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Ingrese gramos"
                    min="0"
                    step="0.01"
                    className={`pr-10 text-base ${errors.gramosAnalizadosINIA ? "border-red-500 bg-red-50" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    g
                  </span>
                </div>
                {errors.gramosAnalizadosINIA && (
                  <p className="text-sm text-destructive mt-1">{errors.gramosAnalizadosINIA}</p>
                )}
              </div>
            </div>

            {/* Tipos de Análisis INIA */}
            <div className="space-y-3">
              <Label
                className={`text-sm font-medium ${errors.tipoINIA ? "text-red-600" : ""
                  }`}
              >
                Tipos de Análisis INIA
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["COMPLETO", "REDUCIDO", "LIMITADO", "REDUCIDO_LIMITADO"].map((tipo) => (
                  <div
                    key={tipo}
                    className={`flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${errors.tipoINIA ? "border-red-300 bg-red-50" : ""
                      }`}
                  >
                    <Checkbox
                      id={`inia-${tipo}`}
                      checked={formData.tipoINIA.includes(tipo)}
                      onCheckedChange={(checked) => handleTipoChange("INIA", tipo, !!checked)}
                    />
                    <Label htmlFor={`inia-${tipo}`} className="text-sm font-medium cursor-pointer flex-1">
                      {tipo === "REDUCIDO_LIMITADO" ? "Reducido Limitado" : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.tipoINIA && (
                <p className="text-sm text-destructive mt-1">{errors.tipoINIA}</p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Análisis INASE */}
        <Card className="border-purple-200 dark:border-purple-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xl">Análisis INASE</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha INASE */}
              <div className="space-y-2">
                <Label htmlFor="fechaINASE" className="text-sm font-medium">
                  Fecha INASE
                </Label>
                <Input
                  id="fechaINASE"
                  type="date"
                  value={formData.fechaINASE}
                  onChange={(e) => handleInputChange("fechaINASE", e.target.value)}
                  className={`text-base ${errors.fechaINASE ? "border-red-500 bg-red-50" : ""}`}
                />
                {errors.fechaINASE && (
                  <p className="text-sm text-destructive mt-1">{errors.fechaINASE}</p>
                )}
              </div>

              {/* Gramos Analizados INASE */}
              <div className="space-y-2">
                <Label htmlFor="gramosAnalizadosINASE" className="text-sm font-medium">
                  Gramos Analizados
                </Label>
                <div className="relative">
                  <Input
                    id="gramosAnalizadosINASE"
                    type="number"
                    value={formData.gramosAnalizadosINASE === 0 ? "" : formData.gramosAnalizadosINASE}
                    onChange={(e) =>
                      handleInputChange(
                        "gramosAnalizadosINASE",
                        e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Ingrese gramos"
                    min="0"
                    step="0.01"
                    className={`pr-10 text-base ${errors.gramosAnalizadosINASE ? "border-red-500 bg-red-50" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    g
                  </span>
                </div>
                {errors.gramosAnalizadosINASE && (
                  <p className="text-sm text-destructive mt-1">{errors.gramosAnalizadosINASE}</p>
                )}
              </div>
            </div>

            {/* Tipos de Análisis INASE */}
            <div className="space-y-3">
              <Label
                className={`text-sm font-medium ${errors.tipoINASE ? "text-red-600" : ""
                  }`}
              >
                Tipos de Análisis INASE
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["COMPLETO", "REDUCIDO", "LIMITADO", "REDUCIDO_LIMITADO"].map((tipo) => (
                  <div
                    key={tipo}
                    className={`flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${errors.tipoINASE ? "border-red-300 bg-red-50" : ""
                      }`}
                  >
                    <Checkbox
                      id={`inase-${tipo}`}
                      checked={formData.tipoINASE.includes(tipo)}
                      onCheckedChange={(checked) => handleTipoChange("INASE", tipo, !!checked)}
                    />
                    <Label htmlFor={`inase-${tipo}`} className="text-sm font-medium cursor-pointer flex-1">
                      {tipo === "REDUCIDO_LIMITADO" ? "Reducido Limitado" : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.tipoINASE && (
                <p className="text-sm text-destructive mt-1">{errors.tipoINASE}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-xl">Análisis de Cuscuta</span>
              </CardTitle>
              <Button 
                onClick={handleCuscutaRegistroAdd} 
                size="sm" 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Registro
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {formData.cuscutaRegistros.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay registros de Cuscuta. Haga clic en "Agregar Registro" para crear uno.</p>
              </div>
            ) : (
              formData.cuscutaRegistros.map((registro: any, index: number) => (
                <Card key={index} className="bg-muted/30 border-dashed">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline" className="text-xs">
                        Registro {index + 1} - {registro.instituto || "Sin instituto"}
                      </Badge>
                      <Button
                        onClick={() => handleCuscutaRegistroRemove(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Instituto</Label>
                        <Select
                          value={registro.instituto || ""}
                          onValueChange={(value) => handleCuscutaRegistroUpdate(index, "instituto", value)}
                        >
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Seleccionar instituto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INIA">INIA</SelectItem>
                            <SelectItem value="INASE">INASE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Peso (g)</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={registro.cuscuta_g === 0 ? "" : registro.cuscuta_g}
                            onChange={(e) =>
                              handleCuscutaRegistroUpdate(
                                index,
                                "cuscuta_g",
                                e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="Ingrese peso"
                            min="0"
                            step="0.01"
                            className="pr-10 text-base"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                            g
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Número</Label>
                        <Input
                          type="number"
                          value={registro.cuscutaNum === 0 ? "" : registro.cuscutaNum}
                          onChange={(e) =>
                            handleCuscutaRegistroUpdate(
                              index,
                              "cuscutaNum",
                              e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="Ingrese número"
                          min="0"
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Fecha</Label>
                        <Input
                          type="date"
                          value={registro.fechaCuscuta || ""}
                          onChange={(e) => handleCuscutaRegistroUpdate(index, "fechaCuscuta", e.target.value)}
                          className="text-base"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900/50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xl">Listados</span>
              </CardTitle>
              <Button onClick={() => setShowAddListado(true)} size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Listado
              </Button>
            </div>
          </CardHeader>
        <CardContent className="pt-6">
          {showAddListado && (
            <div className="border-2 border-dashed rounded-xl p-6 mb-6 bg-muted/30">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
                Nuevo Listado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* 1. Tipo de Listado */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tipo de Listado</Label>
                  <Select
                    value={newListado.listadoTipo}
                    onValueChange={(value) =>
                      setNewListado((prev) => ({
                        ...prev,
                        listadoTipo: value,
                        idCatalogo: 0,
                        idEspecie: 0,
                      }))
                    }
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAL_TOLERANCIA_CERO">Maleza Tolerancia Cero</SelectItem>
                      <SelectItem value="MAL_TOLERANCIA">Maleza Tolerancia</SelectItem>
                      <SelectItem value="MAL_COMUNES">Malezas Comunes</SelectItem>
                      <SelectItem value="BRASSICA">Brassica</SelectItem>
                      <SelectItem value="OTROS">Otros Cultivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Especie */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Especie {newListado.listadoTipo === "BRASSICA" && <span className="text-xs text-muted-foreground">(No requerido para Brassica)</span>}
                  </Label>
                  {newListado.listadoTipo === "BRASSICA" ? (
                    <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                      <p className="text-sm text-muted-foreground">
                        Las brassicas no requieren especie específica del catálogo
                      </p>
                    </div>
                  ) : (
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
                      <SelectTrigger className="text-base">
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

                  )}
                  {newListado.listadoTipo && newListado.listadoTipo !== "BRASSICA" && (() => {
                    return (
                      <p className="text-xs text-muted-foreground mt-1">
                       {/* {`${catalogos.length} malezas disponibles`} */}
                      </p>
                    )
                  })()}
                </div>

                {/* 3. Instituto */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Instituto</Label>
                  <Select
                    value={newListado.listadoInsti}
                    onValueChange={(value) => setNewListado((prev) => ({ ...prev, listadoInsti: value }))}
                  >
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Seleccionar instituto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INIA">INIA</SelectItem>
                      <SelectItem value="INASE">INASE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 4. Número */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Número</Label>
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
                    placeholder="Ingrese número"
                    className="text-base"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    // Determinar tipo de listado especial
                    const isBrassica = newListado.listadoTipo === "BRASSICA"
                    const isOtros = newListado.listadoTipo === "OTROS"

                    // Validación de campos requeridos
                    const hasRequiredFields =
                      newListado.listadoTipo &&
                      newListado.listadoInsti &&
                      (isBrassica || (isOtros ? newListado.idEspecie : newListado.idCatalogo))

                    if (hasRequiredFields) {
                      // 🔍 Buscar el registro correcto según tipo
                      const catalogo = isBrassica
                        ? null
                        : isOtros
                          ? especies.find((e) => e.especieID === newListado.idEspecie)
                          : catalogos.find((c) => c.catalogoID === newListado.idCatalogo)

                      // 🧾 Armar objeto a agregar
                      handleListadoAdd({
                        ...newListado,
                        idCatalogo:
                          isBrassica || isOtros
                            ? null
                            : newListado.idCatalogo,
                        idEspecie: isOtros ? newListado.idEspecie : null,
                        catalogoNombre:
                          catalogo?.nombreComun ||
                          (isBrassica ? "Brassica spp." : ""),
                        catalogoCientifico: catalogo?.nombreCientifico || "",
                        especieNombre: isOtros ? catalogo?.nombreComun || "" : "",
                        especieCientifico: isOtros ? catalogo?.nombreCientifico || "" : "",
                      })

                      // 🧹 Limpiar formulario
                      setNewListado({
                        listadoTipo: "",
                        listadoInsti: "",
                        listadoNum: 0,
                        idCatalogo: 0,
                        idEspecie: 0,
                      })
                      setShowAddListado(false)
                      toast.success("Listado agregado correctamente")
                    } else {
                      toast.error("Complete todos los campos requeridos")
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
                    setNewListado({
                      listadoTipo: "",
                      listadoInsti: "",
                      listadoNum: 0,
                      idCatalogo: 0,
                      idEspecie: 0,
                    })
                  }}
                  size="sm"
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de listados existentes */}
              {formData.listados.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <Leaf className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-lg font-medium text-muted-foreground">No hay listados registrados</p>
                  <p className="text-sm text-muted-foreground mt-1">Agrega un listado para comenzar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Especie</TableHead>
                        <TableHead className="min-w-[150px]">Tipo</TableHead>
                        <TableHead className="min-w-[100px]">Instituto</TableHead>
                        <TableHead className="min-w-[80px]">Número</TableHead>
                        <TableHead className="min-w-[80px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.listados.map((listado, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {listado.catalogoNombre ||
                                  listado.especieNombre ||
                                  (listado.listadoTipo === "BRASSICA" ? "Sin especificación" : "--")}
                              </div>
                              <div className="text-sm text-muted-foreground italic">
                                {listado.catalogoCientifico || listado.especieCientifico}
                              </div>
                              {listado.listadoTipo === "BRASSICA" && !listado.catalogoNombre && !listado.especieNombre && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  No requiere catálogo
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTipoListadoBadgeColor(listado.listadoTipo as TipoListado)}>
                              {getTipoListadoDisplay(listado.listadoTipo as TipoListado)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {listado.listadoInsti}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-lg">{listado.listadoNum}</span>
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                handleListadoRemove(index)
                                toast.success("Listado eliminado")
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

        {/* Card de Acciones */}
        <AnalisisAccionesCard
          analisisId={dosn.analisisID}
          tipoAnalisis="dosn"
          estado={dosn.estado || ""}
          onAprobar={async () => {
            await aprobarAnalisis(dosn.analisisID)
            toast.success("Análisis aprobado exitosamente")
            router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
          }}
          onMarcarParaRepetir={async () => {
            await marcarParaRepetir(dosn.analisisID)
            toast.success("Análisis marcado para repetir")
            router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
          }}
          onFinalizarYAprobar={async () => {
            // Cuando el admin finaliza, el backend automáticamente lo aprueba
            await finalizarAnalisis(dosn.analisisID)
            toast.success("Análisis finalizado y aprobado exitosamente")
            router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
          }}
          onFinalizar={async () => {
            await finalizarAnalisis(dosn.analisisID)
            toast.success("Análisis finalizado exitosamente")
            router.push(`/listado/analisis/dosn/${dosn.analisisID}`)
          }}
        />
      </div>
    </div>
  )
}
