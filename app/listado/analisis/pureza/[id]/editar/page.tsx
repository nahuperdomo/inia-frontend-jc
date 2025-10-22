"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Loader2, AlertTriangle, Search, Plus, Trash2, Leaf, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { obtenerPurezaPorId, actualizarPureza } from "@/app/services/pureza-service"
import { obtenerTodosActivosMalezasCultivos } from "@/app/services/malezas-service"
import type { PurezaDTO, PurezaRequestDTO, MalezasYCultivosCatalogoDTO, TipoListado, TipoMYCCatalogo } from "@/app/models"
import { toast } from "sonner"

// Función helper para mapear tipos de listado a tipos de catálogo
const getCompatibleCatalogTypes = (listadoTipo: TipoListado): TipoMYCCatalogo[] => {
  switch (listadoTipo) {
    case "MAL_TOLERANCIA":
    case "MAL_TOLERANCIA_CERO":
    case "MAL_COMUNES":
      return ["MALEZA"]
    case "OTROS":
      return ["CULTIVO"]
    default:
      return ["MALEZA", "CULTIVO"]
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
          const catalogosData = await obtenerTodosActivosMalezasCultivos()
          if (Array.isArray(catalogosData)) {
            setCatalogos(catalogosData)
          }
        } catch (catalogError) {
          console.error("Error al cargar catálogos:", catalogError)
          setCatalogos([])
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
        pesoInicial_g: formData.pesoInicial_g,
        semillaPura_g: formData.semillaPura_g,
        materiaInerte_g: formData.materiaInerte_g,
        otrosCultivos_g: formData.otrosCultivos_g,
        malezas_g: formData.malezas_g,
        malezasToleradas_g: formData.malezasToleradas_g,
        malezasTolCero_g: formData.malezasTolCero_g,
        pesoTotal_g: formData.pesoTotal_g,
        
        redonSemillaPura: formData.redonSemillaPura,
        redonMateriaInerte: formData.redonMateriaInerte,
        redonOtrosCultivos: formData.redonOtrosCultivos,
        redonMalezas: formData.redonMalezas,
        redonMalezasToleradas: formData.redonMalezasToleradas,
        redonMalezasTolCero: formData.redonMalezasTolCero,
        redonPesoTotal: formData.redonPesoTotal,
        
        inasePura: formData.inasePura,
        inaseMateriaInerte: formData.inaseMateriaInerte,
        inaseOtrosCultivos: formData.inaseOtrosCultivos,
        inaseMalezas: formData.inaseMalezas,
        inaseMalezasToleradas: formData.inaseMalezasToleradas,
        inaseMalezasTolCero: formData.inaseMalezasTolCero,
        inaseFecha: formData.inaseFecha || undefined,
        
        otrasSemillas: formData.listados.map((listado) => ({
          listadoTipo: listado.listadoTipo,
          listadoInsti: listado.listadoInsti,
          listadoNum: listado.listadoNum,
          idCatalogo: listado.idCatalogo,
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
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Link href={`/listado/analisis/pureza/${purezaId}`}>
                <Button variant="ghost" size="sm" className="mt-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">Editar Análisis de Pureza</h1>
                  <Badge variant="outline">#{pureza.analisisID}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lote: {pureza.lote}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="space-y-6">
          {/* Card de Datos Generales - Pesos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos Generales - Pesos (gramos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso Inicial (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.pesoInicial_g || ""}
                    onChange={(e) => handleInputChange("pesoInicial_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semilla Pura (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.semillaPura_g || ""}
                    onChange={(e) => handleInputChange("semillaPura_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materia Inerte (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.materiaInerte_g || ""}
                    onChange={(e) => handleInputChange("materiaInerte_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Otros Cultivos (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.otrosCultivos_g || ""}
                    onChange={(e) => handleInputChange("otrosCultivos_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.malezas_g || ""}
                    onChange={(e) => handleInputChange("malezas_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Toleradas (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.malezasToleradas_g || ""}
                    onChange={(e) => handleInputChange("malezasToleradas_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Tol. Cero (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.malezasTolCero_g || ""}
                    onChange={(e) => handleInputChange("malezasTolCero_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Peso Total (g)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.pesoTotal_g || ""}
                    onChange={(e) => handleInputChange("pesoTotal_g", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Porcentajes Redondeados */}
          <Card>
            <CardHeader>
              <CardTitle>Porcentajes Redondeados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Semilla Pura (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonSemillaPura || ""}
                    onChange={(e) => handleInputChange("redonSemillaPura", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materia Inerte (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonMateriaInerte || ""}
                    onChange={(e) => handleInputChange("redonMateriaInerte", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Otros Cultivos (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonOtrosCultivos || ""}
                    onChange={(e) => handleInputChange("redonOtrosCultivos", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonMalezas || ""}
                    onChange={(e) => handleInputChange("redonMalezas", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Toleradas (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonMalezasToleradas || ""}
                    onChange={(e) => handleInputChange("redonMalezasToleradas", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Tol. Cero (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.redonMalezasTolCero || ""}
                    onChange={(e) => handleInputChange("redonMalezasTolCero", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de INASE */}
          <Card>
            <CardHeader>
              <CardTitle>Porcentajes INASE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 lg:col-span-3">
                  <Label>Fecha INASE</Label>
                  <Input
                    type="date"
                    value={formData.inaseFecha}
                    onChange={(e) => handleInputChange("inaseFecha", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Semilla Pura (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inasePura || ""}
                    onChange={(e) => handleInputChange("inasePura", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Materia Inerte (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inaseMateriaInerte || ""}
                    onChange={(e) => handleInputChange("inaseMateriaInerte", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Otros Cultivos (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inaseOtrosCultivos || ""}
                    onChange={(e) => handleInputChange("inaseOtrosCultivos", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inaseMalezas || ""}
                    onChange={(e) => handleInputChange("inaseMalezas", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Toleradas (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inaseMalezasToleradas || ""}
                    onChange={(e) => handleInputChange("inaseMalezasToleradas", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Malezas Tol. Cero (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.inaseMalezasTolCero || ""}
                    onChange={(e) => handleInputChange("inaseMalezasTolCero", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Cumplimiento y Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento y Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Cumple Estándar</Label>
                <Select
                  value={formData.cumpleEstandar}
                  onValueChange={(value) => handleInputChange("cumpleEstandar", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Sí
                      </div>
                    </SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  value={formData.observacionesPureza}
                  onChange={(e) => handleInputChange("observacionesPureza", e.target.value)}
                  rows={4}
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

                    <div className="space-y-2">
                      <Label>Especie</Label>
                      <Select
                        value={newListado.idCatalogo.toString()}
                        onValueChange={(value) =>
                          setNewListado((prev) => ({ ...prev, idCatalogo: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
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
                                  {newListado.listadoTipo ? "No hay especies" : "Selecciona tipo primero"}
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
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        const hasRequiredFields = newListado.listadoTipo && newListado.listadoInsti && newListado.idCatalogo

                        if (hasRequiredFields) {
                          const catalogo = catalogos.find((c) => c.catalogoID === newListado.idCatalogo)
                          handleListadoAdd({
                            ...newListado,
                            catalogoNombre: catalogo?.nombreComun || "",
                            catalogoCientifico: catalogo?.nombreCientifico || "",
                          })
                          setNewListado({ listadoTipo: "", listadoInsti: "", listadoNum: 0, idCatalogo: 0 })
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
                        <TableHead>Especie</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Instituto</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.listados.map((listado, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{listado.catalogoNombre || "--"}</div>
                              <div className="text-sm text-muted-foreground italic">
                                {listado.catalogoCientifico}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTipoListadoBadgeColor(listado.listadoTipo as TipoListado)}>
                              {getTipoListadoDisplay(listado.listadoTipo as TipoListado)}
                            </Badge>
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
      </div>
    </div>
  )
}
