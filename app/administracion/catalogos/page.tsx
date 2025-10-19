"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Database, 
  Leaf, 
  Sprout,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Save,
  X,
  Tags,
  Package,
  FlaskConical,
  Microscope,
  Archive,
  Warehouse,
  FileText,
  RefreshCw,
  Bug
} from "lucide-react"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Servicios
import { 
  obtenerTodosCatalogos, 
  obtenerCatalogoPorTipo,
  crearCatalogo,
  actualizarCatalogo,
  eliminarCatalogo,
  reactivarCatalogo
} from "@/app/services/catalogo-service"
import {
  obtenerTodasEspecies,
  crearEspecie,
  actualizarEspecie,
  eliminarEspecie,
  reactivarEspecie
} from "@/app/services/especie-service"
import {
  obtenerTodosCultivares,
  crearCultivar,
  actualizarCultivar,
  eliminarCultivar,
  reactivarCultivar
} from "@/app/services/cultivar-service"
import {
  obtenerTodosActivosMalezasCultivos,
  obtenerInactivosMalezasCultivos,
  crearMalezaCultivo,
  actualizarMalezaCultivo,
  eliminarMalezaCultivo,
  reactivarMalezaCultivo
} from "@/app/services/malezas-service"

// Types
import type { CatalogoDTO, EspecieDTO, CultivarDTO, MalezasYCultivosCatalogoDTO, TipoMYCCatalogo } from "@/app/models"

// Tipo de catálogo
type TipoCatalogo = 
  | "HUMEDAD"
  | "ORIGEN"
  | "ESTADO"
  | "DEPOSITO"
  | "UNIDAD_EMBOLSADO"
  | "ARTICULO"

const TIPOS_CATALOGO = [
  { value: "HUMEDAD", label: "Tipos de Humedad", icon: FlaskConical },
  { value: "ORIGEN", label: "Orígenes", icon: Package },
  { value: "ESTADO", label: "Estados", icon: Tags },
  { value: "DEPOSITO", label: "Depósitos", icon: Warehouse },
  { value: "UNIDAD_EMBOLSADO", label: "Unidades de Embolsado", icon: Archive },
  { value: "ARTICULO", label: "Números de Artículo", icon: FileText },
]

export default function CatalogosPage() {
  // Estados generales
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("catalogos")

  // Estados de filtros
  const [filtroCatalogo, setFiltroCatalogo] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroEspecie, setFiltroEspecie] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroCultivar, setFiltroCultivar] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroMalezasCultivos, setFiltroMalezasCultivos] = useState<"activos" | "inactivos" | "todos">("activos")

  // Estados de catálogos
  const [catalogos, setCatalogos] = useState<CatalogoDTO[]>([])
  const [catalogosFiltrados, setCatalogosFiltrados] = useState<CatalogoDTO[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoCatalogo>("HUMEDAD")

  // Estados de especies
  const [especies, setEspecies] = useState<EspecieDTO[]>([])
  const [especiesFiltradas, setEspeciesFiltradas] = useState<EspecieDTO[]>([])
  const [especiesActivas, setEspeciesActivas] = useState<EspecieDTO[]>([])
  const [hayEspeciesActivas, setHayEspeciesActivas] = useState<boolean>(true)

  // Estados de cultivares
  const [cultivares, setCultivares] = useState<CultivarDTO[]>([])
  const [cultivaresFiltrados, setCultivaresFiltrados] = useState<CultivarDTO[]>([])

  // Estados de malezas y cultivos
  const [malezasCultivos, setMalezasCultivos] = useState<MalezasYCultivosCatalogoDTO[]>([])
  const [malezasCultivosFiltrados, setMalezasCultivosFiltrados] = useState<MalezasYCultivosCatalogoDTO[]>([])
  const [tipoMYCSeleccionado, setTipoMYCSeleccionado] = useState<TipoMYCCatalogo>("MALEZA")

  // Estados de diálogos
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [entityType, setEntityType] = useState<"catalogo" | "especie" | "cultivar" | "malezasCultivos">("catalogo")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Estados de formularios
  const [catalogoForm, setCatalogoForm] = useState({
    tipo: "HUMEDAD" as TipoCatalogo,
    valor: ""
  })

  const [especieForm, setEspecieForm] = useState({
    nombreComun: "",
    nombreCientifico: ""
  })

  const [cultivarForm, setCultivarForm] = useState({
    nombre: "",
    especieID: 0
  })

  const [malezasCultivosForm, setMalezasCultivosForm] = useState({
    nombreComun: "",
    nombreCientifico: "",
    tipoMYCCatalogo: "MALEZA" as TipoMYCCatalogo
  })

  // Cargar datos iniciales y cuando cambien los filtros
  useEffect(() => {
    loadAllData()
  }, [tipoSeleccionado, filtroCatalogo, filtroEspecie, filtroCultivar, filtroMalezasCultivos, tipoMYCSeleccionado])

  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Determinar el valor de activo para cada filtro
      const catalogoActivo = filtroCatalogo === "todos" ? null : filtroCatalogo === "activos"
      const especieActivo = filtroEspecie === "todos" ? null : filtroEspecie === "activos"
      const cultivarActivo = filtroCultivar === "todos" ? null : filtroCultivar === "activos"
      
      // Para malezas y cultivos, obtener según filtro y etiquetar 'activo' según la fuente
      let malezasCultivosData: MalezasYCultivosCatalogoDTO[] = []
      let malezasConActivo: MalezasYCultivosCatalogoDTO[] = []
      if (filtroMalezasCultivos === "activos") {
        const activos = await obtenerTodosActivosMalezasCultivos()
        // El backend no incluye el campo 'activo' en el DTO; marcar como true los provenientes de este endpoint
        malezasConActivo = activos.map((mc) => ({ ...mc, activo: true }))
      } else if (filtroMalezasCultivos === "inactivos") {
        const inactivos = await obtenerInactivosMalezasCultivos()
        // Marcar como false los provenientes del endpoint de inactivos
        malezasConActivo = inactivos.map((mc) => ({ ...mc, activo: false }))
      } else {
        // Para "todos", combinar activos e inactivos y preservar su estado
        const [activos, inactivos] = await Promise.all([
          obtenerTodosActivosMalezasCultivos(),
          obtenerInactivosMalezasCultivos(),
        ])
        malezasConActivo = [
          ...activos.map((mc) => ({ ...mc, activo: true })),
          ...inactivos.map((mc) => ({ ...mc, activo: false })),
        ]
      }
      
      const [catalogosData, especiesData, cultivaresData, especiesActivasData] = await Promise.all([
        obtenerCatalogoPorTipo(tipoSeleccionado, catalogoActivo),
        obtenerTodasEspecies(especieActivo),
        obtenerTodosCultivares(cultivarActivo),
        obtenerTodasEspecies(true) // Verificar si hay especies activas
      ])

      setCatalogos(catalogosData)
      setEspecies(especiesData)
      setCultivares(cultivaresData)
      setMalezasCultivos(malezasConActivo)
      setEspeciesActivas(especiesActivasData)
      setHayEspeciesActivas(especiesActivasData.length > 0)
      
      setCatalogosFiltrados(catalogosData)
      setEspeciesFiltradas(especiesData)
      setCultivaresFiltrados(cultivaresData)
      
      // Filtrar por tipo seleccionado
      const filtradosPorTipo = malezasConActivo.filter(
        (mc) => mc.tipoMYCCatalogo === tipoMYCSeleccionado
      )
      setMalezasCultivosFiltrados(filtradosPorTipo)
    } catch (error: any) {
      toast.error("Error al cargar datos", {
        description: error?.message || "No se pudieron cargar los catálogos"
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por búsqueda de texto (los datos ya vienen filtrados por estado desde el servidor)
  useEffect(() => {
    if (activeTab === "catalogos") {
      setCatalogosFiltrados(
        catalogos.filter(c => 
          c.valor?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, catalogos, activeTab])

  // Filtrar especies por búsqueda
  useEffect(() => {
    if (activeTab === "especies") {
      setEspeciesFiltradas(
        especies.filter(e => 
          e.nombreComun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.nombreCientifico?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, especies, activeTab])

  // Filtrar cultivares por búsqueda
  useEffect(() => {
    if (activeTab === "cultivares") {
      setCultivaresFiltrados(
        cultivares.filter(c => 
          c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, cultivares, activeTab])

  // Filtrar malezas y cultivos por búsqueda y tipo
  useEffect(() => {
    if (activeTab === "malezasCultivos") {
      const filtradosPorTipo = malezasCultivos.filter(
        mc => mc.tipoMYCCatalogo === tipoMYCSeleccionado
      )
      
      setMalezasCultivosFiltrados(
        filtradosPorTipo.filter(mc => 
          mc.nombreComun?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mc.nombreCientifico?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }
  }, [searchTerm, malezasCultivos, activeTab, tipoMYCSeleccionado])

  // Handlers para Catálogos
  const handleCreateCatalogo = () => {
    setCatalogoForm({
      tipo: tipoSeleccionado,
      valor: ""
    })
    setEntityType("catalogo")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditCatalogo = (catalogo: CatalogoDTO) => {
    setCatalogoForm({
      tipo: catalogo.tipo as TipoCatalogo,
      valor: catalogo.valor || ""
    })
    setEntityType("catalogo")
    setDialogMode("edit")
    setEditingId(catalogo.id)
    setDialogOpen(true)
  }

  const handleDeleteCatalogo = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este catálogo?")) {
      return
    }

    try {
      await eliminarCatalogo(id)
      toast.success("Catálogo desactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al desactivar catálogo", {
        description: error?.message || "No se pudo desactivar el catálogo"
      })
    }
  }

  const handleReactivarCatalogo = async (id: number) => {
    try {
      await reactivarCatalogo(id)
      toast.success("Catálogo reactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al reactivar catálogo", {
        description: error?.message || "No se pudo reactivar el catálogo"
      })
    }
  }

  const handleSaveCatalogo = async () => {
    if (!catalogoForm.valor.trim()) {
      toast.error("El valor es requerido")
      return
    }

    setSaving(true)
    try {
      const data: import("@/app/models/interfaces/catalogo").CatalogoRequestDTO = {
        tipo: catalogoForm.tipo,
        valor: catalogoForm.valor
      }

      if (dialogMode === "create") {
        await crearCatalogo(data)
        toast.success("Catálogo creado exitosamente")
      } else if (editingId) {
        await actualizarCatalogo(editingId, data)
        toast.success("Catálogo actualizado exitosamente")
      }

      setDialogOpen(false)
      await loadAllData()
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} catálogo`, {
        description: error?.message || "Error desconocido"
      })
    } finally {
      setSaving(false)
    }
  }

  // Handlers para Especies
  const handleCreateEspecie = () => {
    setEspecieForm({
      nombreComun: "",
      nombreCientifico: ""
    })
    setEntityType("especie")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditEspecie = (especie: EspecieDTO) => {
    setEspecieForm({
      nombreComun: especie.nombreComun || "",
      nombreCientifico: especie.nombreCientifico || ""
    })
    setEntityType("especie")
    setDialogMode("edit")
    setEditingId(especie.especieID)
    setDialogOpen(true)
  }

  const handleDeleteEspecie = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar esta especie?")) {
      return
    }

    try {
      await eliminarEspecie(id)
      toast.success("Especie desactivada exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al desactivar especie", {
        description: error?.message
      })
    }
  }

  const handleReactivarEspecie = async (id: number) => {
    try {
      await reactivarEspecie(id)
      toast.success("Especie reactivada exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al reactivar especie", {
        description: error?.message
      })
    }
  }

  const handleSaveEspecie = async () => {
    if (!especieForm.nombreComun.trim() || !especieForm.nombreCientifico.trim()) {
      toast.error("Nombre común y nombre científico son requeridos")
      return
    }

    setSaving(true)
    try {
      const data: import("@/app/models/interfaces/especie").EspecieRequestDTO = {
        nombreComun: especieForm.nombreComun,
        nombreCientifico: especieForm.nombreCientifico
      }

      if (dialogMode === "create") {
        await crearEspecie(data)
        toast.success("Especie creada exitosamente")
      } else if (editingId) {
        await actualizarEspecie(editingId, data)
        toast.success("Especie actualizada exitosamente")
      }

      setDialogOpen(false)
      await loadAllData()
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} especie`, {
        description: error?.message
      })
    } finally {
      setSaving(false)
    }
  }

  // Handlers para Cultivares
  const handleCreateCultivar = () => {
    setCultivarForm({
      nombre: "",
      especieID: especiesActivas.length > 0 ? especiesActivas[0].especieID : 0
    })
    setEntityType("cultivar")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditCultivar = (cultivar: CultivarDTO) => {
    setCultivarForm({
      nombre: cultivar.nombre || "",
      especieID: cultivar.especieID || 0
    })
    setEntityType("cultivar")
    setDialogMode("edit")
    setEditingId(cultivar.cultivarID)
    setDialogOpen(true)
  }

  const handleDeleteCultivar = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este cultivar?")) {
      return
    }

    try {
      await eliminarCultivar(id)
      toast.success("Cultivar desactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al desactivar cultivar", {
        description: error?.message
      })
    }
  }

  const handleReactivarCultivar = async (id: number) => {
    try {
      await reactivarCultivar(id)
      toast.success("Cultivar reactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al reactivar cultivar", {
        description: error?.message
      })
    }
  }

  const handleSaveCultivar = async () => {
    if (!cultivarForm.nombre.trim() || !cultivarForm.especieID) {
      toast.error("Nombre y especie son requeridos")
      return
    }

    setSaving(true)
    try {
      const data: import("@/app/models/interfaces/cultivar").CultivarRequestDTO = {
        nombre: cultivarForm.nombre,
        especieID: cultivarForm.especieID
      }

      if (dialogMode === "create") {
        await crearCultivar(data)
        toast.success("Cultivar creado exitosamente")
      } else if (editingId) {
        await actualizarCultivar(editingId, data)
        toast.success("Cultivar actualizado exitosamente")
      }

      setDialogOpen(false)
      await loadAllData()
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} cultivar`, {
        description: error?.message
      })
    } finally {
      setSaving(false)
    }
  }

  // Handlers para Malezas y Cultivos
  const handleCreateMalezaCultivo = () => {
    setMalezasCultivosForm({
      nombreComun: "",
      nombreCientifico: "",
      tipoMYCCatalogo: tipoMYCSeleccionado
    })
    setEntityType("malezasCultivos")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditMalezaCultivo = (malezaCultivo: MalezasYCultivosCatalogoDTO) => {
    setMalezasCultivosForm({
      nombreComun: malezaCultivo.nombreComun || "",
      nombreCientifico: malezaCultivo.nombreCientifico || "",
      tipoMYCCatalogo: malezaCultivo.tipoMYCCatalogo
    })
    setEntityType("malezasCultivos")
    setDialogMode("edit")
    setEditingId(malezaCultivo.catalogoID)
    setDialogOpen(true)
  }

  const handleDeleteMalezaCultivo = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este registro?")) {
      return
    }

    try {
      await eliminarMalezaCultivo(id)
      toast.success("Registro desactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al desactivar registro", {
        description: error?.message
      })
    }
  }

  const handleReactivarMalezaCultivo = async (id: number) => {
    try {
      await reactivarMalezaCultivo(id)
      toast.success("Registro reactivado exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al reactivar registro", {
        description: error?.message
      })
    }
  }

  const handleSaveMalezaCultivo = async () => {
    if (!malezasCultivosForm.nombreComun.trim() || !malezasCultivosForm.nombreCientifico.trim()) {
      toast.error("Nombre común y nombre científico son requeridos")
      return
    }

    setSaving(true)
    try {
      const data: import("@/app/models/interfaces/malezas").MalezasYCultivosCatalogoRequestDTO = {
        nombreComun: malezasCultivosForm.nombreComun,
        nombreCientifico: malezasCultivosForm.nombreCientifico,
        tipoMYCCatalogo: malezasCultivosForm.tipoMYCCatalogo
      }

      if (dialogMode === "create") {
        await crearMalezaCultivo(data)
        toast.success(`${data.tipoMYCCatalogo === "MALEZA" ? "Maleza" : "Cultivo"} creado exitosamente`)
      } else if (editingId) {
        await actualizarMalezaCultivo(editingId, data)
        toast.success(`${data.tipoMYCCatalogo === "MALEZA" ? "Maleza" : "Cultivo"} actualizado exitosamente`)
      }

      setDialogOpen(false)
      await loadAllData()
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} registro`, {
        description: error?.message
      })
    } finally {
      setSaving(false)
    }
  }

  // Handler general para guardar
  const handleSave = () => {
    switch (entityType) {
      case "catalogo":
        handleSaveCatalogo()
        break
      case "especie":
        handleSaveEspecie()
        break
      case "cultivar":
        handleSaveCultivar()
        break
      case "malezasCultivos":
        handleSaveMalezaCultivo()
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Cargando catálogos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="container max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <Link href="/administracion">
                <Button variant="ghost" size="sm" className="mt-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Database className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold">Gestión de Catálogos</h1>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">
                  Administra catálogos, especies y cultivares del sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <Card className="border-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Administrar Datos del Sistema</CardTitle>
                <CardDescription className="mt-2">
                  Crea, edita y gestiona los catálogos maestros del sistema
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="catalogos" className="text-sm sm:text-base">
                  <Database className="h-4 w-4 mr-2" />
                  Catálogos
                </TabsTrigger>
                <TabsTrigger value="especies" className="text-sm sm:text-base">
                  <Leaf className="h-4 w-4 mr-2" />
                  Especies
                </TabsTrigger>
                <TabsTrigger value="cultivares" className="text-sm sm:text-base">
                  <Sprout className="h-4 w-4 mr-2" />
                  Cultivares
                </TabsTrigger>
                <TabsTrigger value="malezasCultivos" className="text-sm sm:text-base">
                  <Bug className="h-4 w-4 mr-2" />
                  Malezas/Cultivos
                </TabsTrigger>
              </TabsList>

              {/* Tab Catálogos */}
              <TabsContent value="catalogos" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select value={tipoSeleccionado} onValueChange={(v) => setTipoSeleccionado(v as TipoCatalogo)}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CATALOGO.map((tipo) => {
                          const Icon = tipo.icon
                          return (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {tipo.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <Select value={filtroCatalogo} onValueChange={(v) => setFiltroCatalogo(v as "activos" | "inactivos" | "todos")}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activos">✓ Solo Activos</SelectItem>
                        <SelectItem value="inactivos">✕ Solo Inactivos</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateCatalogo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Catálogo
                  </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay catálogos registrados de este tipo</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        catalogosFiltrados.map((catalogo) => (
                          <TableRow key={catalogo.id}>
                            <TableCell className="font-mono">{catalogo.id}</TableCell>
                            <TableCell className="font-medium">{catalogo.valor}</TableCell>
                            <TableCell>
                              <Badge variant={catalogo.activo ? "default" : "secondary"}>
                                {catalogo.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditCatalogo(catalogo)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {catalogo.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCatalogo(catalogo.id)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivarCatalogo(catalogo.id)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Reactivar"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Tab Especies */}
              <TabsContent value="especies" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Select value={filtroEspecie} onValueChange={(v) => setFiltroEspecie(v as "activos" | "inactivos" | "todos")}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activos">✓ Solo Activos</SelectItem>
                      <SelectItem value="inactivos">✕ Solo Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateEspecie}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Especie
                  </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre Común</TableHead>
                        <TableHead>Nombre Científico</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {especiesFiltradas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay especies registradas</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        especiesFiltradas.map((especie) => (
                          <TableRow key={especie.especieID}>
                            <TableCell className="font-mono">{especie.especieID}</TableCell>
                            <TableCell className="font-medium">{especie.nombreComun}</TableCell>
                            <TableCell className="italic text-muted-foreground">
                              {especie.nombreCientifico}
                            </TableCell>
                            <TableCell>
                              <Badge variant={especie.activo ? "default" : "secondary"}>
                                {especie.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEspecie(especie)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {especie.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteEspecie(especie.especieID)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivarEspecie(especie.especieID)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Reactivar"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Tab Cultivares */}
              <TabsContent value="cultivares" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Select value={filtroCultivar} onValueChange={(v) => setFiltroCultivar(v as "activos" | "inactivos" | "todos")}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activos">✓ Solo Activos</SelectItem>
                      <SelectItem value="inactivos">✕ Solo Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateCultivar} disabled={!hayEspeciesActivas}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cultivar
                  </Button>
                </div>

                {!hayEspeciesActivas && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-yellow-800">
                        <AlertCircle className="h-6 w-6" />
                        <div>
                          <p className="font-medium">No hay especies activas registradas</p>
                          <p className="text-sm">Debes crear o reactivar al menos una especie antes de agregar cultivares</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Especie</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cultivaresFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay cultivares registrados</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        cultivaresFiltrados.map((cultivar) => {
                          const especie = especies.find(e => e.especieID === cultivar.especieID)
                          return (
                            <TableRow key={cultivar.cultivarID}>
                              <TableCell className="font-mono">{cultivar.cultivarID}</TableCell>
                              <TableCell className="font-medium">{cultivar.nombre}</TableCell>
                              <TableCell>
                                {cultivar.especieNombre ? (
                                  <div>
                                    <div>{cultivar.especieNombre}</div>
                                    {especie && (
                                      <div className="text-xs italic text-muted-foreground">
                                        {especie.nombreCientifico}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={cultivar.activo ? "default" : "secondary"}>
                                  {cultivar.activo ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCultivar(cultivar)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {cultivar.activo ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteCultivar(cultivar.cultivarID)}
                                      className="text-red-600 hover:text-red-700"
                                      title="Desactivar"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReactivarCultivar(cultivar.cultivarID)}
                                      className="text-green-600 hover:text-green-700"
                                      title="Reactivar"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Tab Malezas y Cultivos */}
              <TabsContent value="malezasCultivos" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select value={tipoMYCSeleccionado} onValueChange={(v) => setTipoMYCSeleccionado(v as TipoMYCCatalogo)}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALEZA">
                          <div className="flex items-center gap-2">
                            <Bug className="h-4 w-4" />
                            Malezas
                          </div>
                        </SelectItem>
                        <SelectItem value="CULTIVO">
                          <div className="flex items-center gap-2">
                            <Sprout className="h-4 w-4" />
                            Cultivos
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filtroMalezasCultivos} onValueChange={(v) => setFiltroMalezasCultivos(v as "activos" | "inactivos" | "todos")}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activos">✓ Solo Activos</SelectItem>
                        <SelectItem value="inactivos">✕ Solo Inactivos</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateMalezaCultivo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo {tipoMYCSeleccionado === "MALEZA" ? "Maleza" : "Cultivo"}
                  </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nombre Común</TableHead>
                        <TableHead>Nombre Científico</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {malezasCultivosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay {tipoMYCSeleccionado === "MALEZA" ? "malezas" : "cultivos"} registrados</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        malezasCultivosFiltrados.map((mc) => (
                          <TableRow key={mc.catalogoID}>
                            <TableCell className="font-mono">{mc.catalogoID}</TableCell>
                            <TableCell className="font-medium">{mc.nombreComun}</TableCell>
                            <TableCell className="italic text-muted-foreground">
                              {mc.nombreCientifico}
                            </TableCell>
                            <TableCell>
                              <Badge variant={mc.tipoMYCCatalogo === "MALEZA" ? "destructive" : "default"}>
                                {mc.tipoMYCCatalogo === "MALEZA" ? "Maleza" : "Cultivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={mc.activo ? "default" : "secondary"}>
                                {mc.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMalezaCultivo(mc)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {mc.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMalezaCultivo(mc.catalogoID)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivarMalezaCultivo(mc.catalogoID)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Reactivar"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Crear" : "Editar"}{" "}
              {entityType === "catalogo" 
                ? "Catálogo" 
                : entityType === "especie" 
                ? "Especie" 
                : entityType === "cultivar"
                ? "Cultivar"
                : malezasCultivosForm.tipoMYCCatalogo === "MALEZA" 
                ? "Maleza" 
                : "Cultivo"
              }
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? `Complete los datos para crear ${
                    entityType === "catalogo" 
                      ? "un nuevo catálogo" 
                      : entityType === "especie" 
                      ? "una nueva especie" 
                      : entityType === "cultivar"
                      ? "un nuevo cultivar"
                      : malezasCultivosForm.tipoMYCCatalogo === "MALEZA"
                      ? "una nueva maleza"
                      : "un nuevo cultivo"
                  }`
                : `Modifique los datos ${
                    entityType === "catalogo" 
                      ? "del catálogo" 
                      : entityType === "especie" 
                      ? "de la especie" 
                      : entityType === "cultivar"
                      ? "del cultivar"
                      : malezasCultivosForm.tipoMYCCatalogo === "MALEZA"
                      ? "de la maleza"
                      : "del cultivo"
                  }`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {entityType === "catalogo" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={catalogoForm.tipo}
                    onValueChange={(v) => setCatalogoForm({ ...catalogoForm, tipo: v as TipoCatalogo })}
                    disabled={dialogMode === "edit"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_CATALOGO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    value={catalogoForm.valor}
                    onChange={(e) => setCatalogoForm({ ...catalogoForm, valor: e.target.value })}
                    placeholder="Ingrese el valor"
                  />
                </div>
              </>
            )}

            {entityType === "especie" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Común *</Label>
                  <Input
                    id="nombre"
                    value={especieForm.nombreComun}
                    onChange={(e) => setEspecieForm({ ...especieForm, nombreComun: e.target.value })}
                    placeholder="Ej: Maíz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombreCientifico">Nombre Científico *</Label>
                  <Input
                    id="nombreCientifico"
                    value={especieForm.nombreCientifico}
                    onChange={(e) => setEspecieForm({ ...especieForm, nombreCientifico: e.target.value })}
                    placeholder="Ej: Zea mays"
                    className="italic"
                  />
                </div>
              </>
            )}

            {entityType === "cultivar" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre-cultivar">Nombre *</Label>
                  <Input
                    id="nombre-cultivar"
                    value={cultivarForm.nombre}
                    onChange={(e) => setCultivarForm({ ...cultivarForm, nombre: e.target.value })}
                    placeholder="Ej: Pioneer 3025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="especieID">Especie *</Label>
                  <Select
                    value={cultivarForm.especieID.toString()}
                    onValueChange={(v) => setCultivarForm({ ...cultivarForm, especieID: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {especiesActivas.map((especie) => (
                        <SelectItem key={especie.especieID} value={especie.especieID.toString()}>
                          {especie.nombreComun} ({especie.nombreCientifico})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {entityType === "malezasCultivos" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tipoMYC">Tipo *</Label>
                  <Select
                    value={malezasCultivosForm.tipoMYCCatalogo}
                    onValueChange={(v) => setMalezasCultivosForm({ ...malezasCultivosForm, tipoMYCCatalogo: v as TipoMYCCatalogo })}
                    disabled={dialogMode === "edit"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALEZA">
                        <div className="flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          Maleza
                        </div>
                      </SelectItem>
                      <SelectItem value="CULTIVO">
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4" />
                          Cultivo
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombreComun">Nombre Común *</Label>
                  <Input
                    id="nombreComun"
                    value={malezasCultivosForm.nombreComun}
                    onChange={(e) => setMalezasCultivosForm({ ...malezasCultivosForm, nombreComun: e.target.value })}
                    placeholder="Ej: Yuyo colorado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombreCientificoMYC">Nombre Científico *</Label>
                  <Input
                    id="nombreCientificoMYC"
                    value={malezasCultivosForm.nombreCientifico}
                    onChange={(e) => setMalezasCultivosForm({ ...malezasCultivosForm, nombreCientifico: e.target.value })}
                    placeholder="Ej: Amaranthus quitensis"
                    className="italic"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
