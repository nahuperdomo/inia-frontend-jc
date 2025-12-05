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
  Building2,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  X,
  Phone,
  Mail,
  RefreshCw
} from "lucide-react"
import Pagination from "@/components/pagination"
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

// Servicios
import {
  obtenerContactosPaginados,
  crearContacto,
  actualizarContacto,
  eliminarContacto,
  reactivarContacto
} from "@/app/services/contacto-service"

// Types
import type { ContactoDTO, ContactoRequestDTO } from "@/app/models"
import type { TipoContacto } from "@/app/models/types/enums"

export default function ContactosPage() {
  // Estados generales
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("empresas")

  // Estados de filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState<"activos" | "inactivos" | "todos">("activos")
  const [filtroCliente, setFiltroCliente] = useState<"activos" | "inactivos" | "todos">("activos")

  // Estados de contactos
  const [empresas, setEmpresas] = useState<ContactoDTO[]>([])
  const [clientes, setClientes] = useState<ContactoDTO[]>([])

  // Estados de paginación
  const [empresaPagina, setEmpresaPagina] = useState(0)
  const [empresaTotalPages, setEmpresaTotalPages] = useState(0)
  const [empresaTotalElements, setEmpresaTotalElements] = useState(0)

  const [clientePagina, setClientePagina] = useState(0)
  const [clienteTotalPages, setClienteTotalPages] = useState(0)
  const [clienteTotalElements, setClienteTotalElements] = useState(0)

  // Estados de diálogos
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [tipoContacto, setTipoContacto] = useState<TipoContacto>("EMPRESA")

  // Estados de formulario
  const [contactoForm, setContactoForm] = useState({
    nombre: "",
    contacto: ""
  })

  // Cargar empresas paginadas
  const fetchEmpresas = useCallback(async (page: number = empresaPagina, search?: string) => {
    try {
      setLoading(true)
      const empresaActivo = filtroEmpresa === "todos" ? undefined : filtroEmpresa === "activos"
      const searchValue = search !== undefined ? search : searchTerm
      
      const response = await obtenerContactosPaginados(
        page,
        10,
        searchValue || undefined,
        empresaActivo,
        "EMPRESA"
      )
      
      const pageData = extractPageMetadata<ContactoDTO>(response, page)
      
      setEmpresas(pageData.content)
      setEmpresaTotalPages(pageData.totalPages)
      setEmpresaTotalElements(pageData.totalElements)
      setEmpresaPagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar empresas", {
        description: error?.message || "No se pudieron cargar las empresas"
      })
    } finally {
      setLoading(false)
    }
  }, [empresaPagina, filtroEmpresa, searchTerm])

  // Cargar clientes paginados
  const fetchClientes = useCallback(async (page: number = clientePagina, search?: string) => {
    try {
      setLoading(true)
      const clienteActivo = filtroCliente === "todos" ? undefined : filtroCliente === "activos"
      const searchValue = search !== undefined ? search : searchTerm
      
      const response = await obtenerContactosPaginados(
        page,
        10,
        searchValue || undefined,
        clienteActivo,
        "CLIENTE"
      )
      
      const pageData = extractPageMetadata<ContactoDTO>(response, page)
      
      setClientes(pageData.content)
      setClienteTotalPages(pageData.totalPages)
      setClienteTotalElements(pageData.totalElements)
      setClientePagina(pageData.currentPage)
    } catch (error: any) {
      toast.error("Error al cargar clientes", {
        description: error?.message || "No se pudieron cargar los clientes"
      })
    } finally {
      setLoading(false)
    }
  }, [clientePagina, filtroCliente, searchTerm])

  
  useEffect(() => {
    if (activeTab === "empresas") {
      fetchEmpresas(0)
    }
    
  }, [activeTab, filtroEmpresa])

  
  useEffect(() => {
    if (activeTab === "clientes") {
      fetchClientes(0)
    }
    
  }, [activeTab, filtroCliente])

  // Handler para búsqueda con Enter
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeTab === "empresas") {
        fetchEmpresas(0)
      } else {
        fetchClientes(0)
      }
    }
  }

  // Handler para botón de búsqueda
  const handleSearchClick = () => {
    if (activeTab === "empresas") {
      fetchEmpresas(0)
    } else {
      fetchClientes(0)
    }
  }

  // Handler para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm("")
    // Pasar string vacío explícitamente para forzar búsqueda sin filtro
    if (activeTab === "empresas") {
      fetchEmpresas(0, "")
    } else {
      fetchClientes(0, "")
    }
  }

  // Validaciones
  const esEmail = (valor: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(valor)
  }

  const esTelefono = (valor: string): boolean => {
    // Acepta números con espacios, guiones y paréntesis
    const telefonoRegex = /^[\d\s\-\(\)\+]+$/
    return telefonoRegex.test(valor) && valor.replace(/\D/g, '').length >= 8
  }

  const validarContacto = (contacto: string): { valido: boolean; tipo: 'email' | 'telefono' | null; mensaje?: string } => {
    if (!contacto.trim()) {
      return { valido: false, tipo: null, mensaje: "El contacto es requerido" }
    }

    if (esEmail(contacto)) {
      return { valido: true, tipo: 'email' }
    }

    if (esTelefono(contacto)) {
      return { valido: true, tipo: 'telefono' }
    }

    return { valido: false, tipo: null, mensaje: "Debe ser un email o teléfono válido" }
  }

  // Handlers para Empresas
  const handleCreateEmpresa = () => {
    setContactoForm({
      nombre: "",
      contacto: ""
    })
    setTipoContacto("EMPRESA")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditEmpresa = (empresa: ContactoDTO) => {
    setContactoForm({
      nombre: empresa.nombre || "",
      contacto: empresa.contacto || ""
    })
    setTipoContacto("EMPRESA")
    setDialogMode("edit")
    setEditingId(empresa.contactoID)
    setDialogOpen(true)
  }

  const handleDeleteEmpresa = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar esta empresa?")) {
      return
    }

    try {
      await eliminarContacto(id)
      toast.success("Empresa desactivada exitosamente")
      await fetchEmpresas(empresaPagina)
    } catch (error: any) {
      toast.error("Error al desactivar empresa", {
        description: error?.message
      })
    }
  }

  const handleReactivarEmpresa = async (id: number) => {
    try {
      await reactivarContacto(id)
      toast.success("Empresa reactivada exitosamente")
      await fetchEmpresas(empresaPagina)
    } catch (error: any) {
      toast.error("Error al reactivar empresa", {
        description: error?.message
      })
    }
  }

  // Handlers para Clientes
  const handleCreateCliente = () => {
    setContactoForm({
      nombre: "",
      contacto: ""
    })
    setTipoContacto("CLIENTE")
    setDialogMode("create")
    setEditingId(null)
    setDialogOpen(true)
  }

  const handleEditCliente = (cliente: ContactoDTO) => {
    setContactoForm({
      nombre: cliente.nombre || "",
      contacto: cliente.contacto || ""
    })
    setTipoContacto("CLIENTE")
    setDialogMode("edit")
    setEditingId(cliente.contactoID)
    setDialogOpen(true)
  }

  const handleDeleteCliente = async (id: number) => {
    if (!confirm("¿Está seguro de que desea desactivar este cliente?")) {
      return
    }

    try {
      await eliminarContacto(id)
      toast.success("Cliente desactivado exitosamente")
      await fetchClientes(clientePagina)
    } catch (error: any) {
      toast.error("Error al desactivar cliente", {
        description: error?.message
      })
    }
  }

  const handleReactivarCliente = async (id: number) => {
    try {
      await reactivarContacto(id)
      toast.success("Cliente reactivado exitosamente")
      await fetchClientes(clientePagina)
    } catch (error: any) {
      toast.error("Error al reactivar cliente", {
        description: error?.message
      })
    }
  }

  // Handler de guardado
  const handleSave = async () => {
    // Validaciones
    if (!contactoForm.nombre.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    // Validar el campo de contacto
    const validacion = validarContacto(contactoForm.contacto)
    if (!validacion.valido) {
      toast.error(validacion.mensaje || "Contacto inválido")
      return
    }

    setSaving(true)
    try {
      const data: ContactoRequestDTO = {
        nombre: contactoForm.nombre,
        contacto: contactoForm.contacto,
        tipo: tipoContacto
      }

      if (dialogMode === "create") {
        await crearContacto(data)
        toast.success(`${tipoContacto === "EMPRESA" ? "Empresa" : "Cliente"} creado exitosamente`)
      } else if (editingId) {
        await actualizarContacto(editingId, data)
        toast.success(`${tipoContacto === "EMPRESA" ? "Empresa" : "Cliente"} actualizado exitosamente`)
      }

      setDialogOpen(false)
      if (tipoContacto === "EMPRESA") {
        await fetchEmpresas(empresaPagina)
      } else {
        await fetchClientes(clientePagina)
      }
    } catch (error: any) {
      toast.error(`Error al ${dialogMode === "create" ? "crear" : "actualizar"} contacto`, {
        description: error?.message || "Error desconocido"
      })
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
            <p className="text-lg font-medium">Cargando contactos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
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
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Gestión de Contactos</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Administra empresas y clientes del sistema
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
                <CardTitle className="text-2xl">Administrar Contactos</CardTitle>
                <CardDescription className="mt-2">
                  Crea, edita y gestiona empresas y clientes del sistema
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
            <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setSearchTerm("") }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="empresas" className="text-sm sm:text-base">
                  <Building2 className="h-4 w-4 mr-2" />
                  Empresas
          </TabsTrigger>
          <TabsTrigger value="clientes" className="gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        {/* Tab Empresas */}
        <TabsContent value="empresas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Empresas
                  </CardTitle>
                  <CardDescription>Lista de empresas registradas en el sistema</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar empresas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filtroEmpresa} onValueChange={(v) => setFiltroEmpresa(v as "activos" | "inactivos" | "todos")}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activos">✓ Activos</SelectItem>
                      <SelectItem value="inactivos">✕ Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateEmpresa}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Empresa
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No hay empresas registradas</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      empresas.map((empresa) => (
                        <TableRow key={empresa.contactoID}>
                          <TableCell className="font-medium">{empresa.nombre}</TableCell>
                          <TableCell>
                            {empresa.contacto ? (
                              <div className="flex items-center gap-1 text-sm">
                                {esEmail(empresa.contacto) ? (
                                  <>
                                    <Mail className="h-3 w-3" />
                                    {empresa.contacto}
                                  </>
                                ) : (
                                  <>
                                    <Phone className="h-3 w-3" />
                                    {empresa.contacto}
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={empresa.activo ? "default" : "secondary"}>
                              {empresa.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEmpresa(empresa)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {empresa.activo ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEmpresa(empresa.contactoID)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Desactivar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReactivarEmpresa(empresa.contactoID)}
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

              {/* Paginación para empresas */}
              <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                <div className="text-sm text-muted-foreground">
                  {empresaTotalElements === 0 ? (
                    <>Mostrando 0 de 0 resultados</>
                  ) : (
                    <>Mostrando {empresaPagina * 10 + 1} a {Math.min((empresaPagina + 1) * 10, empresaTotalElements)} de {empresaTotalElements} resultados</>
                  )}
                </div>

                <Pagination
                  currentPage={empresaPagina}
                  totalPages={Math.max(empresaTotalPages, 1)}
                  onPageChange={(p) => fetchEmpresas(p)}
                  showRange={1}
                  alwaysShow={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Clientes */}
        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Clientes
                  </CardTitle>
                  <CardDescription>Lista de clientes registrados en el sistema</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={filtroCliente} onValueChange={(v) => setFiltroCliente(v as "activos" | "inactivos" | "todos")}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activos">✓ Activos</SelectItem>
                      <SelectItem value="inactivos">✕ Inactivos</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleCreateCliente}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No hay clientes registrados</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientes.map((cliente) => (
                        <TableRow key={cliente.contactoID}>
                          <TableCell className="font-medium">{cliente.nombre}</TableCell>
                          <TableCell>
                            {cliente.contacto ? (
                              <div className="flex items-center gap-1 text-sm">
                                {esEmail(cliente.contacto) ? (
                                  <>
                                    <Mail className="h-3 w-3" />
                                    {cliente.contacto}
                                  </>
                                ) : (
                                  <>
                                    <Phone className="h-3 w-3" />
                                    {cliente.contacto}
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cliente.activo ? "default" : "secondary"}>
                              {cliente.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCliente(cliente)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {cliente.activo ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCliente(cliente.contactoID)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Desactivar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReactivarCliente(cliente.contactoID)}
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

              {/* Paginación para clientes */}
              <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                <div className="text-sm text-muted-foreground">
                  {clienteTotalElements === 0 ? (
                    <>Mostrando 0 de 0 resultados</>
                  ) : (
                    <>Mostrando {clientePagina * 10 + 1} a {Math.min((clientePagina + 1) * 10, clienteTotalElements)} de {clienteTotalElements} resultados</>
                  )}
                </div>

                <Pagination
                  currentPage={clientePagina}
                  totalPages={Math.max(clienteTotalPages, 1)}
                  onPageChange={(p) => fetchClientes(p)}
                  showRange={1}
                  alwaysShow={true}
                />
              </div>
            </CardContent>
          </Card>
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
              {dialogMode === "create" ? "Nuevo" : "Editar"} {tipoContacto === "EMPRESA" ? "Empresa" : "Cliente"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" 
                ? `Complete la información para crear ${tipoContacto === "EMPRESA" ? "una nueva empresa" : "un nuevo cliente"}.`
                : `Modifique los datos ${tipoContacto === "EMPRESA" ? "de la empresa" : "del cliente"}.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={contactoForm.nombre}
                onChange={(e) => setContactoForm({ ...contactoForm, nombre: e.target.value })}
                placeholder={tipoContacto === "EMPRESA" ? "Ej: Agroinsumos S.A." : "Ej: Juan Pérez"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contacto">Contacto (Teléfono o Email) *</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contacto"
                  value={contactoForm.contacto}
                  onChange={(e) => setContactoForm({ ...contactoForm, contacto: e.target.value })}
                  placeholder="099123456 o contacto@empresa.com"
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ingrese un número de teléfono (mín. 8 dígitos) o un email válido
              </p>
            </div>
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
                  {dialogMode === "create" ? "Crear" : "Actualizar"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
