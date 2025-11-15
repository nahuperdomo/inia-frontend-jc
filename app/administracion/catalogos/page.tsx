"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"
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
  ArrowLeft,
  Save,
  X,
  Tags,
  Package,
  FlaskConical,
  Archive,
  Warehouse,
  FileText,
  RefreshCw,
  Bug
} from "lucide-react"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import Pagination from "@/components/pagination"
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

// Servicios
import {
  obtenerCatalogosPaginados,
  crearCatalogo,
  actualizarCatalogo,
  eliminarCatalogo,
  reactivarCatalogo
} from "@/app/services/catalogo-service"
import {
  obtenerTodasEspecies,
  obtenerEspeciesPaginadas,
  crearEspecie,
  actualizarEspecie,
  eliminarEspecie,
  reactivarEspecie
} from "@/app/services/especie-service"
import {
  obtenerCultivaresPaginados,
  crearCultivar,
  actualizarCultivar,
  eliminarCultivar,
  reactivarCultivar
} from "@/app/services/cultivar-service"
import {
  obtenerMalezasPaginadas,
  crearMaleza,
  actualizarMaleza,
  eliminarMaleza,
  reactivarMaleza
} from "@/app/services/malezas-service"

// Types
import type { CatalogoDTO, EspecieDTO, CultivarDTO, MalezasCatalogoDTO } from "@/app/models"

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
  const [searchTerm, setSearchTerm] = useState("") // Búsqueda unificada
  const [activeTab, setActiveTab] = useState("catalogos")

  // Estados de paginación
  const [catalogoPagina, setCatalogoPagina] = useState(0)
  const [catalogoTotalPages, setCatalogoTotalPages] = useState(0)
  const [catalogoTotalElements, setCatalogoTotalElements] = useState(0)

  const [especiePagina, setEspeciePagina] = useState(0)
  const [especieTotalPages, setEspecieTotalPages] = useState(0)
  const [especieTotalElements, setEspecieTotalElements] = useState(0)

  const [cultivarPagina, setCultivarPagina] = useState(0)
  const [cultivarTotalPages, setCultivarTotalPages] = useState(0)
  const [cultivarTotalElements, setCultivarTotalElements] = useState(0)

  const [malezasPagina, setMalezasPagina] = useState(0)
  const [malezasTotalPages, setMalezasTotalPages] = useState(0)
  const [malezasTotalElements, setMalezasTotalElements] = useState(0)

  const pageSize = 10

  // Estados de filtros
  const [filtroCatalogo, setFiltroCatalogo] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroEspecie, setFiltroEspecie] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroCultivar, setFiltroCultivar] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroMalezas, setFiltroMalezas] = useState<"activos" | "inactivos" | "todos">("activos")

  // Estados de catálogos
  const [catalogos, setCatalogos] = useState<CatalogoDTO[]>([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoCatalogo>("HUMEDAD")

  // Estados de especies
  const [especies, setEspecies] = useState<EspecieDTO[]>([])
  const [especiesActivas, setEspeciesActivas] = useState<EspecieDTO[]>([])
  const [hayEspeciesActivas, setHayEspeciesActivas] = useState<boolean>(true)

  // Estados de cultivares
  const [cultivares, setCultivares] = useState<CultivarDTO[]>([])

  // Estados de malezas
  const [malezas, setMalezas] = useState<MalezasCatalogoDTO[]>([])

  // Estados de diálogos
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [entityType, setEntityType] = useState<"catalogo" | "especie" | "cultivar" | "malezas">("catalogo")
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

  const [malezasForm, setMalezasForm] = useState({
    nombreComun: "",
    nombreCientifico: ""
  })

  // Cargar catálogos paginados
  useEffect(() => {
    if (activeTab === "catalogos") {
      fetchCatalogos(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tipoSeleccionado, filtroCatalogo]) // searchTerm NO debe estar aquí

  // Cargar especies paginadas
  useEffect(() => {
    if (activeTab === "especies") {
      fetchEspecies(0)
    }
    // Cargar especies activas para el selector de cultivares
    loadEspeciesActivas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtroEspecie]) // searchTerm NO debe estar aquí

  // Cargar cultivares paginados
  useEffect(() => {
    if (activeTab === "cultivares") {
      fetchCultivares(0)
      // Cargar especies activas al entrar al tab de cultivares
      loadEspeciesActivas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtroCultivar]) // searchTerm NO debe estar aquí

  // Cargar malezas paginadas
  useEffect(() => {
    if (activeTab === "malezas") {
      fetchMalezas(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtroMalezas]) // searchTerm NO debe estar aquí

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchClick()
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    switch (activeTab) {
      case "catalogos":
        fetchCatalogos(0)
        break
      case "especies":
        fetchEspecies(0)
        break
      case "cultivares":
        fetchCultivares(0)
        break
      case "malezas":
        fetchMalezas(0)
        break
    }
  }

  // Handler para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm("")
    // Pasar string vacío explícitamente para forzar búsqueda sin filtro
    switch (activeTab) {
      case "catalogos":
        fetchCatalogos(0, "")
        break
      case "especies":
        fetchEspecies(0, "")
        break
      case "cultivares":
        fetchCultivares(0, "")
        break
      case "malezas":
        fetchMalezas(0, "")
        break
    }
  }

  const fetchCatalogos = useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true)
      const activoValue = filtroCatalogo === "todos" ? undefined : filtroCatalogo === "activos"
      const searchValue = search !== undefined ? search : searchTerm

      const data = await obtenerCatalogosPaginados(
        page,
        pageSize,
        searchValue || undefined,
        activoValue,
        tipoSeleccionado
      )

      const pageData = extractPageMetadata<CatalogoDTO>(data, page)

      setCatalogos(pageData.content)
      setCatalogoTotalPages(pageData.totalPages)
      setCatalogoTotalElements(pageData.totalElements)
      setCatalogoPagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar catálogos", {
        description: error?.message || "No se pudieron cargar los catálogos"
      })
      setCatalogos([])
    } finally {
      setLoading(false)
    }
  }, [filtroCatalogo, searchTerm, tipoSeleccionado])

  const fetchEspecies = useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true)
      const activoValue = filtroEspecie === "todos" ? undefined : filtroEspecie === "activos"
      const searchValue = search !== undefined ? search : searchTerm

      const data = await obtenerEspeciesPaginadas(
        page,
        pageSize,
        searchValue || undefined,
        activoValue
      )

      const pageData = extractPageMetadata<EspecieDTO>(data, page)

      setEspecies(pageData.content)
      setEspecieTotalPages(pageData.totalPages)
      setEspecieTotalElements(pageData.totalElements)
      setEspeciePagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar especies", {
        description: error?.message
      })
      setEspecies([])
    } finally {
      setLoading(false)
    }
  }, [filtroEspecie, searchTerm])

  const loadEspeciesActivas = async () => {
    try {
      const especiesActivasData = await obtenerTodasEspecies(true)
      setEspeciesActivas(especiesActivasData)
      setHayEspeciesActivas(especiesActivasData.length > 0)
    } catch (error: any) {
      console.error("Error cargando especies activas:", error)
    }
  }

  const fetchCultivares = useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true)
      const activoValue = filtroCultivar === "todos" ? undefined : filtroCultivar === "activos"
      const searchValue = search !== undefined ? search : searchTerm

      const data = await obtenerCultivaresPaginados(
        page,
        pageSize,
        searchValue || undefined,
        activoValue
      )

      const pageData = extractPageMetadata<CultivarDTO>(data, page)

      setCultivares(pageData.content)
      setCultivarTotalPages(pageData.totalPages)
      setCultivarTotalElements(pageData.totalElements)
      setCultivarPagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar cultivares", {
        description: error?.message
      })
      setCultivares([])
    } finally {
      setLoading(false)
    }
  }, [filtroCultivar, searchTerm])

  const fetchMalezas = useCallback(async (page: number, search?: string) => {
    try {
      setLoading(true)
      const activoValue = filtroMalezas === "todos" ? undefined : filtroMalezas === "activos"
      const searchValue = search !== undefined ? search : searchTerm

      const data = await obtenerMalezasPaginadas(
        page,
        pageSize,
        searchValue || undefined,
        activoValue
      )

      const pageData = extractPageMetadata<MalezasCatalogoDTO>(data, page)

      setMalezas(pageData.content)
      setMalezasTotalPages(pageData.totalPages)
      setMalezasTotalElements(pageData.totalElements)
      setMalezasPagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar malezas", {
        description: error?.message
      })
      setMalezas([])
    } finally {
      setLoading(false)
    }
  }, [filtroMalezas, searchTerm])

  const loadAllData = async () => {
    // Esta función ahora solo se usa para recargar después de crear/editar/eliminar
    switch (activeTab) {
      case "catalogos":
        await fetchCatalogos(catalogoPagina)
        break
      case "especies":
        await fetchEspecies(especiePagina)
        await loadEspeciesActivas()
        break
      case "cultivares":
        await fetchCultivares(cultivarPagina)
        break
      case "malezas":
        await fetchMalezas(malezasPagina)
        break
    }
  }

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
  const handleCreateCultivar = async () => {
    // Cargar especies activas antes de abrir el diálogo
    await loadEspeciesActivas()

    setCultivarForm({
      nombre: "",
      especieID: especiesActivas.length > 0 ? especiesActivas[0].especieID : 0
    })
    setEntityType("cultivar")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditCultivar = async (cultivar: CultivarDTO) => {
    // Cargar especies activas antes de abrir el diálogo
    await loadEspeciesActivas()

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

  // Handlers para Malezas
  const handleCreateMaleza = () => {
    setMalezasForm({
      nombreComun: "",
      nombreCientifico: ""
    })
    setEntityType("malezas")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditMaleza = (maleza: MalezasCatalogoDTO) => {
    setMalezasForm({
      nombreComun: maleza.nombreComun || "",
      nombreCientifico: maleza.nombreCientifico || ""
    })
    setEntityType("malezas")
    setDialogMode("edit")
    setEditingId(maleza.catalogoID)
    setDialogOpen(true)
  }

  const handleDeleteMaleza = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar esta maleza?")) {
      return
    }

    try {
      await eliminarMaleza(id)
      toast.success("Maleza desactivada exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al desactivar maleza", {
        description: error?.message
      })
    }
  }

  const handleReactivarMaleza = async (id: number) => {
    try {
      await reactivarMaleza(id)
      toast.success("Maleza reactivada exitosamente")
      await loadAllData()
    } catch (error: any) {
      toast.error("Error al reactivar maleza", {
        description: error?.message
      })
    }
  }

  const handleSaveMaleza = async () => {
    if (!malezasForm.nombreComun.trim() || !malezasForm.nombreCientifico.trim()) {
      toast.error("Nombre común y nombre científico son requeridos")
      return
    }

    setSaving(true)
    try {
      const data: import("@/app/models/interfaces/malezas").MalezasCatalogoRequestDTO = {
        nombreComun: malezasForm.nombreComun,
        nombreCientifico: malezasForm.nombreCientifico
      }

      if (dialogMode === "create") {
        await crearMaleza(data)
        toast.success("Maleza creada exitosamente")
      } else if (editingId) {
        await actualizarMaleza(editingId, data)
        toast.success("Maleza actualizada exitosamente")
      }

      setDialogOpen(false)
      await loadAllData()
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} maleza`, {
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
      case "malezas":
        handleSaveMaleza()
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link href="/administracion">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Database className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestión de Catálogos</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Administra catálogos, especies y cultivares del sistema
              </p>
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
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchClick()
                }}
                className="flex gap-2 w-full sm:w-auto"
              >
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10"
                  />
                </div>
                <Button type="button" onClick={handleSearchClick} variant="secondary" size="sm" className="px-4">
                  <Search className="h-4 w-4" />
                </Button>
                {searchTerm && (
                  <Button type="button" onClick={handleClearSearch} variant="ghost" size="sm" className="px-4">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6 h-auto">
                <TabsTrigger value="catalogos" className="text-sm sm:text-base py-2">
                  <Database className="h-4 w-4 mr-2" />
                  Catálogos
                </TabsTrigger>
                <TabsTrigger value="especies" className="text-sm sm:text-base py-2">
                  <Leaf className="h-4 w-4 mr-2" />
                  Especies
                </TabsTrigger>
                <TabsTrigger value="cultivares" className="text-sm sm:text-base py-2">
                  <Sprout className="h-4 w-4 mr-2" />
                  Cultivares
                </TabsTrigger>
                <TabsTrigger value="malezas" className="text-sm sm:text-base py-2">
                  <Bug className="h-4 w-4 mr-2" />
                  Malezas
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
                        <TableHead>Valor</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {catalogos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay catálogos registrados de este tipo</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        catalogos.map((catalogo) => (
                          <TableRow key={catalogo.id}>
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

                {/* Paginación de catálogos */}
                <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                  <div className="text-sm text-muted-foreground">
                    {catalogoTotalElements === 0 ? (
                      <>Mostrando 0 de 0 resultados</>
                    ) : (
                      <>Mostrando {catalogoPagina * pageSize + 1} a {Math.min((catalogoPagina + 1) * pageSize, catalogoTotalElements)} de {catalogoTotalElements} resultados</>
                    )}
                  </div>

                  <Pagination
                    currentPage={catalogoPagina}
                    totalPages={Math.max(catalogoTotalPages, 1)}
                    onPageChange={(p) => fetchCatalogos(p)}
                    showRange={1}
                    alwaysShow={true}
                  />
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
                        <TableHead>Nombre Común</TableHead>
                        <TableHead>Nombre Científico</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {especies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay especies registradas</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        especies.map((especie) => (
                          <TableRow key={especie.especieID}>
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

                {/* Paginación de especies */}
                <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                  <div className="text-sm text-muted-foreground">
                    {especieTotalElements === 0 ? (
                      <>Mostrando 0 de 0 resultados</>
                    ) : (
                      <>Mostrando {especiePagina * pageSize + 1} a {Math.min((especiePagina + 1) * pageSize, especieTotalElements)} de {especieTotalElements} resultados</>
                    )}
                  </div>

                  <Pagination
                    currentPage={especiePagina}
                    totalPages={Math.max(especieTotalPages, 1)}
                    onPageChange={(p) => fetchEspecies(p)}
                    showRange={1}
                    alwaysShow={true}
                  />
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
                        <TableHead>Nombre</TableHead>
                        <TableHead>Especie</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cultivares.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay cultivares registrados</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        cultivares.map((cultivar) => {
                          const especie = especies.find(e => e.especieID === cultivar.especieID)
                          return (
                            <TableRow key={cultivar.cultivarID}>
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

                {/* Paginación para cultivares */}
                {cultivarTotalPages > 0 && (
                  <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                    <div className="text-sm text-muted-foreground">
                      {cultivarTotalElements === 0 ? (
                        <>Mostrando 0 de 0 resultados</>
                      ) : (
                        <>Mostrando {cultivarPagina * pageSize + 1} a {Math.min((cultivarPagina + 1) * pageSize, cultivarTotalElements)} de {cultivarTotalElements} resultados</>
                      )}
                    </div>

                    <Pagination
                      currentPage={cultivarPagina}
                      totalPages={Math.max(cultivarTotalPages, 1)}
                      onPageChange={(p) => fetchCultivares(p)}
                      showRange={1}
                      alwaysShow={true}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Tab Malezas */}
              <TabsContent value="malezas" className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <Select value={filtroMalezas} onValueChange={(v) => setFiltroMalezas(v as "activos" | "inactivos" | "todos")}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activos">✓ Solo Activos</SelectItem>
                      <SelectItem value="inactivos">✕ Solo Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateMaleza}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Maleza
                  </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre Común</TableHead>
                        <TableHead>Nombre Científico</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {malezas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No hay malezas registradas</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        malezas.map((maleza) => (
                          <TableRow key={maleza.catalogoID}>
                            <TableCell className="font-medium">{maleza.nombreComun}</TableCell>
                            <TableCell className="italic text-muted-foreground">
                              {maleza.nombreCientifico}
                            </TableCell>
                            <TableCell>
                              <Badge variant={maleza.activo ? "default" : "secondary"}>
                                {maleza.activo ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditMaleza(maleza)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {maleza.activo ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMaleza(maleza.catalogoID)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Desactivar"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReactivarMaleza(maleza.catalogoID)}
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

                {/* Paginación de malezas */}
                <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                  <div className="text-sm text-muted-foreground">
                    {malezasTotalElements === 0 ? (
                      <>Mostrando 0 de 0 resultados</>
                    ) : (
                      <>Mostrando {malezasPagina * pageSize + 1} a {Math.min((malezasPagina + 1) * pageSize, malezasTotalElements)} de {malezasTotalElements} resultados</>
                    )}
                  </div>

                  <Pagination
                    currentPage={malezasPagina}
                    totalPages={Math.max(malezasTotalPages, 1)}
                    onPageChange={(p) => fetchMalezas(p)}
                    showRange={1}
                    alwaysShow={true}
                  />
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
                : "Maleza"
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
                      : "una nueva maleza"
                  }`
                : `Modifique los datos ${
                    entityType === "catalogo"
                      ? "del catálogo"
                      : entityType === "especie"
                      ? "de la especie"
                      : entityType === "cultivar"
                      ? "del cultivar"
                      : "de la maleza"
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

            {entityType === "malezas" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Común *</Label>
                  <Input
                    id="nombre"
                    value={malezasForm.nombreComun}
                    onChange={(e) => setMalezasForm({ ...malezasForm, nombreComun: e.target.value })}
                    placeholder="Ej: Yuyo colorado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombreCientifico">Nombre Científico *</Label>
                  <Input
                    id="nombreCientifico"
                    value={malezasForm.nombreCientifico}
                    onChange={(e) => setMalezasForm({ ...malezasForm, nombreCientifico: e.target.value })}
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
function setMalezasCultivosForm(arg0: { nombreComun: string; nombreCientifico: string; tipoMYCCatalogo: any }) {
  throw new Error("Function not implemented.")
}


