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
import { obtenerDosnPorId, actualizarDosn, obtenerTodasDosnActivas } from "@/app/services/dosn-service"
import { obtenerTodosActivosMalezasCultivos } from "@/app/services/malezas-service"
import type { DosnDTO, DosnRequestDTO, MalezasYCultivosCatalogoDTO, TipoListado, TipoMYCCatalogo } from "@/app/models"
import { toast } from "sonner"

// Función helper para mapear tipos de listado a tipos de catálogo
const getCompatibleCatalogTypes = (listadoTipo: TipoListado): TipoMYCCatalogo[] => {
  switch (listadoTipo) {
    case "MAL_TOLERANCIA":
    case "MAL_TOLERANCIA_CERO":
    case "MAL_COMUNES":
      return ["MALEZA"]
    case "BRASSICA":
      return [] // Las brassicas no tienen catálogo
    case "OTROS":
      return ["CULTIVO"]
    default:
      return ["MALEZA", "CULTIVO"] // Solo malezas y cultivos
  }
}

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
  const [catalogos, setCatalogos] = useState<MalezasYCultivosCatalogoDTO[]>([])

  // Nuevos estados para agregar listados
  const [showAddListado, setShowAddListado] = useState(false)
  const [newListado, setNewListado] = useState({
    listadoTipo: "",
    listadoInsti: "",
    listadoNum: 0,
    idCatalogo: 0,
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
    cuscuta_g: 0,
    cuscutaNum: 0,
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
          console.log("Cargando catálogos de malezas/cultivos/brassicas...")
          const catalogosData = await obtenerTodosActivosMalezasCultivos()
          console.log("Respuesta de catálogos:", catalogosData)
          console.log("Tipo de respuesta:", typeof catalogosData)
          console.log("Es array?", Array.isArray(catalogosData))

          if (Array.isArray(catalogosData)) {
            console.log("Catálogos cargados correctamente:", catalogosData.length, "items")

            // Mostrar distribución por tipos
            const tipoDistribution = catalogosData.reduce(
              (acc, cat) => {
                acc[cat.tipoMYCCatalogo] = (acc[cat.tipoMYCCatalogo] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            )
            console.log("Distribución por tipos:", tipoDistribution)

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
          cuscuta_g: dosnData.cuscuta_g || 0,
          cuscutaNum: dosnData.cuscutaNum || 0,
          listados:
            dosnData.listados?.map((listado) => ({
              listadoTipo: listado.listadoTipo,
              listadoInsti: listado.listadoInsti,
              listadoNum: listado.listadoNum,
              idCatalogo: listado.catalogo?.catalogoID || null,
              catalogoNombre: listado.catalogo?.nombreComun || "",
              catalogoCientifico: listado.catalogo?.nombreCientifico || "",
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

  const handleSave = async () => {
    if (!dosn) return

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
      console.log("- cuscuta_g:", formData.cuscuta_g)
      console.log("- cuscutaNum:", formData.cuscutaNum)

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
        cuscuta_g: formData.cuscuta_g || undefined,
        cuscutaNum: formData.cuscutaNum || undefined,
        fechaCuscuta: (formData.cuscuta_g > 0 || formData.cuscutaNum > 0) 
          ? (dosn.fechaCuscuta || new Date().toISOString().split('T')[0]) // Usar fecha existente o actual
          : undefined,
        listados: formData.listados.map((listado) => ({
          listadoTipo: listado.listadoTipo,
          listadoInsti: listado.listadoInsti,
          listadoNum: listado.listadoNum,
          idCatalogo: listado.idCatalogo,
        })),
      }

      console.log("Fechas después del formateo:")
      console.log("- fechaINIA:", updateData.fechaINIA)
      console.log("- fechaINASE:", updateData.fechaINASE)
      console.log("- fechaCuscuta:", updateData.fechaCuscuta)
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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Link href={`/listado/analisis/dosn/${dosnId}`}>
                <Button variant="ghost" size="sm" className="mt-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-balance">Editar Análisis DOSN</h1>
                  <Badge variant="outline" className="text-sm">
                    #{dosn.analisisID}
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-muted-foreground text-pretty">
                  Modifica los datos del análisis de determinación de otras semillas nocivas
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <Link href={`/listado/analisis/dosn/${dosnId}`} className="flex-1 lg:flex-none">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancelar
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving} className="flex-1 lg:flex-none">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

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

        <Card>
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
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Análisis INIA */}
          <Card className="border-blue-200 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xl">Análisis INIA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaINIA" className="text-sm font-medium">
                    Fecha INIA
                  </Label>
                  <Input
                    id="fechaINIA"
                    type="date"
                    value={formData.fechaINIA}
                    onChange={(e) => handleInputChange("fechaINIA", e.target.value)}
                    className="text-base"
                  />
                </div>
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
                        handleInputChange("gramosAnalizadosINIA", e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="Ingrese gramos"
                      min="0"
                      step="0.01"
                      className="pr-10 text-base"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      g
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipos de Análisis INIA</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["COMPLETO", "REDUCIDO", "LIMITADO", "REDUCIDO_LIMITADO"].map((tipo) => (
                    <div
                      key={tipo}
                      className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`inia-${tipo}`}
                        checked={formData.tipoINIA.includes(tipo)}
                        onCheckedChange={(checked) => handleTipoChange("INIA", tipo, !!checked)}
                      />
                      <Label htmlFor={`inia-${tipo}`} className="text-sm font-medium cursor-pointer flex-1">
                        {tipo === "REDUCIDO_LIMITADO"
                          ? "Reducido Limitado"
                          : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="fechaINASE" className="text-sm font-medium">
                    Fecha INASE
                  </Label>
                  <Input
                    id="fechaINASE"
                    type="date"
                    value={formData.fechaINASE}
                    onChange={(e) => handleInputChange("fechaINASE", e.target.value)}
                    className="text-base"
                  />
                </div>
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
                        handleInputChange("gramosAnalizadosINASE", e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0)
                      }
                      placeholder="Ingrese gramos"
                      min="0"
                      step="0.01"
                      className="pr-10 text-base"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-muted-foreground">
                      g
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipos de Análisis INASE</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["COMPLETO", "REDUCIDO", "LIMITADO", "REDUCIDO_LIMITADO"].map((tipo) => (
                    <div
                      key={tipo}
                      className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`inase-${tipo}`}
                        checked={formData.tipoINASE.includes(tipo)}
                        onCheckedChange={(checked) => handleTipoChange("INASE", tipo, !!checked)}
                      />
                      <Label htmlFor={`inase-${tipo}`} className="text-sm font-medium cursor-pointer flex-1">
                        {tipo === "REDUCIDO_LIMITADO"
                          ? "Reducido Limitado"
                          : tipo.charAt(0) + tipo.slice(1).toLowerCase()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-orange-200 dark:border-orange-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xl">Análisis de Cuscuta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cuscuta_g" className="text-sm font-medium">
                  Peso Cuscuta
                </Label>
                <div className="relative">
                  <Input
                    id="cuscuta_g"
                    type="number"
                    value={formData.cuscuta_g === 0 ? "" : formData.cuscuta_g}
                    onChange={(e) => handleInputChange("cuscuta_g", e.target.value === "" ? 0 : Number.parseFloat(e.target.value) || 0)}
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
                <Label htmlFor="cuscutaNum" className="text-sm font-medium">
                  Número de Cuscuta
                </Label>
                <Input
                  id="cuscutaNum"
                  type="number"
                  value={formData.cuscutaNum === 0 ? "" : formData.cuscutaNum}
                  onChange={(e) => handleInputChange("cuscutaNum", e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0)}
                  placeholder="Ingrese número"
                  min="0"
                  className="text-base"
                />
              </div>
            </div>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo de Listado</Label>
                    <Select
                      value={newListado.listadoTipo}
                      onValueChange={(value) =>
                        setNewListado((prev) => ({
                          ...prev,
                          listadoTipo: value,
                          idCatalogo: 0,
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
                        value={newListado.idCatalogo.toString()}
                        onValueChange={(value) =>
                          setNewListado((prev) => ({ ...prev, idCatalogo: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Seleccionar especie" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const tiposCompatibles = newListado.listadoTipo
                              ? getCompatibleCatalogTypes(newListado.listadoTipo as TipoListado)
                              : ["MALEZA", "CULTIVO"]

                            const catalogosFiltrados = catalogos.filter((cat) =>
                              tiposCompatibles.includes(cat.tipoMYCCatalogo),
                            )

                            if (catalogosFiltrados.length === 0) {
                              return (
                                <SelectItem value="0" disabled>
                                  {newListado.listadoTipo ? `No hay especies disponibles` : "Selecciona primero el tipo"}
                                </SelectItem>
                              )
                            }

                            return catalogosFiltrados.map((catalogo) => (
                              <SelectItem key={catalogo.catalogoID} value={catalogo.catalogoID.toString()}>
                                {catalogo.nombreComun}
                              </SelectItem>
                            ))
                          })()}
                        </SelectContent>
                      </Select>
                    )}
                    {newListado.listadoTipo && newListado.listadoTipo !== "BRASSICA" && (() => {
                      const tiposCompatibles = getCompatibleCatalogTypes(newListado.listadoTipo as TipoListado)
                      const catalogosFiltrados = catalogos.filter((cat) =>
                        tiposCompatibles.includes(cat.tipoMYCCatalogo),
                      )

                      return (
                        <p className="text-xs text-muted-foreground mt-1">
                          {`${catalogosFiltrados.length} especies disponibles`}
                        </p>
                      )
                    })()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      // Para brassicas, no requerimos idCatalogo
                      const isBrassica = newListado.listadoTipo === "BRASSICA"
                      const hasRequiredFields = newListado.listadoTipo && 
                        newListado.listadoInsti && 
                        (isBrassica || newListado.idCatalogo)

                      if (hasRequiredFields) {
                        const catalogo = isBrassica ? null : catalogos.find((c) => c.catalogoID === newListado.idCatalogo)
                        handleListadoAdd({
                          ...newListado,
                          idCatalogo: isBrassica ? null : newListado.idCatalogo,
                          catalogoNombre: catalogo?.nombreComun || (isBrassica ? "Brassica spp." : ""),
                          catalogoCientifico: catalogo?.nombreCientifico || "",
                        })
                        setNewListado({ listadoTipo: "", listadoInsti: "", listadoNum: 0, idCatalogo: 0 })
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
                      setNewListado({ listadoTipo: "", listadoInsti: "", listadoNum: 0, idCatalogo: 0 })
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
                               (listado.listadoTipo === "BRASSICA" ? "Sin especificación" : "--")}
                            </div>
                            <div className="text-sm text-muted-foreground italic">
                              {listado.catalogoCientifico}
                            </div>
                            {listado.listadoTipo === "BRASSICA" && !listado.catalogoNombre && (
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

        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/listado/analisis/dosn/${dosnId}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving} size="lg" className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Guardando cambios...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
