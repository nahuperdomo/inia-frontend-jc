"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Clock, ArrowLeft, Mail, UserCheck, UserX, Users, Edit, Trash2, AlertTriangle, Search, Filter, RefreshCw } from "lucide-react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    listarSolicitudesPendientesPaginadas,
    listarUsuariosPaginados,
    aprobarUsuario,
    rechazarSolicitud,
    gestionarUsuario
} from "@/app/services/auth-service"
import {
    type AuthUsuarioDTO,
    type AprobarUsuarioRequest,
    type GestionarUsuarioRequest
} from "@/app/models"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Pagination from "@/components/pagination"
import { extractPageMetadata } from "@/lib/utils/pagination-helper"

// Mapeo de roles - coincide con el enum Rol del backend
const ROLES_OPCIONES = [
    { value: "ADMIN", label: "Administrador" },
    { value: "ANALISTA", label: "Analista" },
    { value: "OBSERVADOR", label: "Observador" }
] as const;

// Para mostrar el rol en español
const ROLES_LABELS: Record<string, string> = {
    "ADMIN": "Administrador",
    "ANALISTA": "Analista",
    "OBSERVADOR": "Observador"
};

export default function UsuarioValidacionPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    
    // Estado de solicitudes pendientes con paginación
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<AuthUsuarioDTO[]>([])
    const [currentPagePendientes, setCurrentPagePendientes] = useState(0)
    const [totalPagesPendientes, setTotalPagesPendientes] = useState(0)
    const [totalElementsPendientes, setTotalElementsPendientes] = useState(0)
    const [searchTermPendientes, setSearchTermPendientes] = useState("")
    
    // Estado de usuarios registrados con paginación
    const [usuariosRegistrados, setUsuariosRegistrados] = useState<AuthUsuarioDTO[]>([])
    const [currentPageUsuarios, setCurrentPageUsuarios] = useState(0)
    const [totalPagesUsuarios, setTotalPagesUsuarios] = useState(0)
    const [totalElementsUsuarios, setTotalElementsUsuarios] = useState(0)
    const [searchTermUsuarios, setSearchTermUsuarios] = useState("")
    
    // Stats globales
    const [statsUsuariosActivos, setStatsUsuariosActivos] = useState(0)
    const [statsAdministradores, setStatsAdministradores] = useState(0)
    
    const [selectedUser, setSelectedUser] = useState<AuthUsuarioDTO | null>(null)
    const [selectedRegisteredUser, setSelectedRegisteredUser] = useState<AuthUsuarioDTO | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"pendientes" | "registrados">("pendientes")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    
    const pageSize = 10

    useEffect(() => {
        if (activeTab === "pendientes") {
            fetchSolicitudesPendientes(0)
        } else {
            fetchUsuariosRegistrados(0)
        }
    }, [activeTab])
    
    useEffect(() => {
        if (activeTab === "registrados") {
            setCurrentPageUsuarios(0)
            fetchUsuariosRegistrados(0)
        }
    }, [roleFilter, statusFilter])

    const fetchSolicitudesPendientes = async (page: number = 0) => {
        setIsLoading(true)
        try {
            const data = await listarSolicitudesPendientesPaginadas(page, pageSize, searchTermPendientes)
            
            // Extraer metadata de paginación usando helper
            const pageData = extractPageMetadata<AuthUsuarioDTO>(data, page)
            
            setSolicitudesPendientes(pageData.content)
            setTotalPagesPendientes(pageData.totalPages)
            setTotalElementsPendientes(pageData.totalElements)
            setCurrentPagePendientes(pageData.currentPage)
        } catch (error) {
            console.error(" Error:", error)
            toast.error("Error al cargar solicitudes pendientes", {
                description: "No se pudieron cargar las solicitudes"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const fetchUsuariosRegistrados = async (page: number = 0) => {
        setIsLoading(true)
        try {
            const data = await listarUsuariosPaginados(page, pageSize, searchTermUsuarios, roleFilter, statusFilter)
            
            // Extraer metadata de paginación usando helper
            const pageData = extractPageMetadata<AuthUsuarioDTO>(data, page)
            
            setUsuariosRegistrados(pageData.content)
            setTotalPagesUsuarios(pageData.totalPages)
            setTotalElementsUsuarios(pageData.totalElements)
            setCurrentPageUsuarios(pageData.currentPage)
            
            // Calcular stats solo si es la primera carga (sin búsqueda)
            if (!searchTermUsuarios) {
                const activos = pageData.content.filter(u => u.activo).length || 0
                const admins = pageData.content.filter(u => {
                    const rol = getRolFromUsuario(u)
                    return rol && rol.toUpperCase() === "ADMIN"
                }).length || 0
                
                // Si tenemos todos los usuarios en una página, usar ese conteo
                // Si no, hacer una aproximación basada en la proporción
                if (pageData.totalElements <= pageSize) {
                    setStatsUsuariosActivos(activos)
                    setStatsAdministradores(admins)
                } else {
                    // Estimación basada en la proporción de la primera página
                    const usersInPage = pageData.content.length || 1
                    setStatsUsuariosActivos(Math.round((activos / usersInPage) * pageData.totalElements))
                    setStatsAdministradores(Math.round((admins / usersInPage) * pageData.totalElements))
                }
            }
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cargar usuarios", {
                description: "No se pudieron cargar los usuarios"
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Handlers para búsqueda pendientes
    const handleSearchPendientesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setCurrentPagePendientes(0)
            fetchSolicitudesPendientes(0)
        }
    }

    const handleSearchPendientesClick = () => {
        setCurrentPagePendientes(0)
        fetchSolicitudesPendientes(0)
    }

    // Handlers para búsqueda usuarios
    const handleSearchUsuariosKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setCurrentPageUsuarios(0)
            fetchUsuariosRegistrados(0)
        }
    }

    const handleSearchUsuariosClick = () => {
        setCurrentPageUsuarios(0)
        fetchUsuariosRegistrados(0)
    }

    const handleApprovalClick = (usuario: AuthUsuarioDTO) => {
        setSelectedUser(usuario)
        setSelectedRole("ANALISTA")
        setShowApprovalDialog(true)
    }

    const handleRejectClick = (usuario: AuthUsuarioDTO) => {
        setSelectedUser(usuario)
        setShowRejectDialog(true)
    }

    const aprobarUsuarioLocal = async () => {
        if (!selectedUser || !selectedRole) return

        setIsSubmitting(true)
        try {
            await aprobarUsuario(selectedUser.usuarioID, { rol: selectedRole } as AprobarUsuarioRequest)

            toast.success("Usuario aprobado exitosamente", {
                description: `${selectedUser.nombres} ${selectedUser.apellidos} ha sido aprobado como ${ROLES_LABELS[selectedRole]}`
            })

            setShowApprovalDialog(false)
            setSelectedUser(null)
            setSelectedRole("")
            
            // Recargar la página actual
            fetchSolicitudesPendientes(currentPagePendientes)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al aprobar usuario", {
                description: "No se pudo aprobar el usuario. Intenta nuevamente."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const rechazarUsuarioLocal = async () => {
        if (!selectedUser) return

        setIsSubmitting(true)
        try {
            await rechazarSolicitud(selectedUser.usuarioID)

            toast.success("Solicitud rechazada", {
                description: `La solicitud de ${selectedUser.nombres} ${selectedUser.apellidos} ha sido rechazada`
            })

            setShowRejectDialog(false)
            setSelectedUser(null)
            
            // Recargar la página actual
            fetchSolicitudesPendientes(currentPagePendientes)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al rechazar solicitud", {
                description: "No se pudo rechazar la solicitud. Intenta nuevamente."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) return "N/A"
        try {
            // El backend devuelve fechas en formato ISO o LocalDateTime
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "Fecha inválida"
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return "Fecha inválida"
        }
    }

    const formatDateShort = (dateString: string | undefined | null) => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "N/A"
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            return "N/A"
        }
    }

    const handleEditClick = (usuario: AuthUsuarioDTO) => {
        setSelectedRegisteredUser(usuario)
        const currentRole = getRolFromUsuario(usuario)
        setSelectedRole(currentRole === "Sin rol" ? "ANALISTA" : currentRole.toUpperCase())
        setShowEditDialog(true)
    }

    const handleDeleteClick = (usuario: AuthUsuarioDTO) => {
        setSelectedRegisteredUser(usuario)
        setShowDeleteDialog(true)
    }

    const actualizarRol = async () => {
        if (!selectedRegisteredUser || !selectedRole) return

        setIsSubmitting(true)
        try {
            await gestionarUsuario(selectedRegisteredUser.usuarioID, {
                rol: selectedRole
            } as GestionarUsuarioRequest)

            toast.success("Rol actualizado exitosamente", {
                description: `El rol de ${selectedRegisteredUser.nombres} ${selectedRegisteredUser.apellidos} ha sido actualizado a ${ROLES_LABELS[selectedRole]}`
            })

            setShowEditDialog(false)
            setSelectedRegisteredUser(null)
            setSelectedRole("")
            
            // Recargar la página actual
            fetchUsuariosRegistrados(currentPageUsuarios)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al actualizar rol", {
                description: "No se pudo actualizar el rol del usuario. Intenta nuevamente."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const eliminarUsuarioConfirm = async () => {
        if (!selectedRegisteredUser) return

        setIsSubmitting(true)
        try {
            await gestionarUsuario(selectedRegisteredUser.usuarioID, {
                activo: false
            } as GestionarUsuarioRequest)

            toast.success("Usuario desactivado", {
                description: `${selectedRegisteredUser.nombres} ${selectedRegisteredUser.apellidos} ha sido desactivado del sistema`
            })

            setShowDeleteDialog(false)
            setSelectedRegisteredUser(null)
            
            // Recargar la página actual
            fetchUsuariosRegistrados(currentPageUsuarios)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al desactivar usuario", {
                description: "No se pudo desactivar el usuario. Intenta nuevamente."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleUsuarioActivo = async (usuario: AuthUsuarioDTO) => {
        try {
            await gestionarUsuario(usuario.usuarioID, {
                activo: !usuario.activo
            } as GestionarUsuarioRequest)

            toast.success(`Usuario ${!usuario.activo ? 'activado' : 'desactivado'}`, {
                description: `${usuario.nombres} ${usuario.apellidos} ha sido ${!usuario.activo ? 'activado' : 'desactivado'}`
            })

            // Recargar la página actual
            fetchUsuariosRegistrados(currentPageUsuarios)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cambiar estado", {
                description: "No se pudo cambiar el estado del usuario."
            })
        }
    }

    // Helper para obtener el rol del usuario (maneja ambos formatos del backend)
    const getRolFromUsuario = (usuario: AuthUsuarioDTO): string => {
        // El backend devuelve 'rol' (singular), no 'roles' (plural)
        if (usuario.rol) return usuario.rol
        if (usuario.roles && usuario.roles.length > 0) return usuario.roles[0]
        return "Sin rol"
    }

    const getRolLabel = (usuario: AuthUsuarioDTO | undefined): string => {
        if (!usuario) return "Sin rol"
        const rol = getRolFromUsuario(usuario)
        if (!rol || rol === "Sin rol") return "Sin rol"
        const roleUpper = rol.toUpperCase()
        return ROLES_LABELS[roleUpper] || rol
    }

    // Helper para obtener la fecha de registro (maneja ambos formatos del backend)
    const getFechaRegistro = (usuario: AuthUsuarioDTO): string | null => {
        // El backend devuelve 'fechaCreacion', no 'fechaRegistro'
        return usuario.fechaCreacion || usuario.fechaRegistro || null
    }

    const getEstadoSolicitud = (usuario: AuthUsuarioDTO): string => {
        // El backend devuelve 'estado', no 'estadoSolicitud'
        return usuario.estado || usuario.estadoSolicitud || "PENDIENTE"
    }

    const getRoleBadgeVariant = (usuario: AuthUsuarioDTO | undefined) => {
        if (!usuario) return "outline" as const
        const rol = getRolFromUsuario(usuario)
        if (!rol || rol === "Sin rol") return "outline" as const
        const roleUpper = rol.toUpperCase()
        switch (roleUpper) {
            case "ADMIN":
            case "ADMINISTRADOR":
                return "destructive" as const
            case "ANALISTA":
                return "default" as const
            case "OBSERVADOR":
                return "secondary" as const
            default:
                return "outline" as const
        }
    }

    return (
        <div className="p-6 space-y-6">{/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Link href="/administracion">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Administración
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-balance">Gestión Completa de Usuarios</h1>
                    <p className="text-muted-foreground text-pretty">
                        Validación de solicitudes y administración de usuarios existentes
                    </p>
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{totalElementsPendientes}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{statsUsuariosActivos}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{statsAdministradores}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalElementsUsuarios}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant={activeTab === "pendientes" ? "default" : "outline"}
                            onClick={() => setActiveTab("pendientes")}
                            className="flex items-center gap-2 justify-center w-full sm:w-auto py-6 sm:py-2"
                        >
                            <UserCheck className="h-4 w-4" />
                            Solicitudes Pendientes ({totalElementsPendientes})
                        </Button>
                        <Button
                            variant={activeTab === "registrados" ? "default" : "outline"}
                            onClick={() => setActiveTab("registrados")}
                            className="flex items-center gap-2 justify-center w-full sm:w-auto py-6 sm:py-2"
                        >
                            <Users className="h-4 w-4" />
                            Usuarios Registrados ({totalElementsUsuarios})
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === "pendientes" ? (
                        /* Vista de Solicitudes Pendientes */
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Solicitudes de Registro Pendientes</h3>
                                <p className="text-sm text-muted-foreground">
                                    Revisa y gestiona las solicitudes de nuevos usuarios
                                </p>
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por nombre de usuario, nombre o apellido..."
                                        value={searchTermPendientes}
                                        onChange={(e) => setSearchTermPendientes(e.target.value)}
                                        onKeyDown={handleSearchPendientesKeyDown}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="button" onClick={handleSearchPendientesClick} variant="secondary" size="sm" className="px-4">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center">
                                        <Clock className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                        <p className="text-muted-foreground">Cargando solicitudes...</p>
                                    </div>
                                </div>
                            ) : solicitudesPendientes.length === 0 ? (
                                <div className="text-center p-8">
                                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay solicitudes pendientes</h3>
                                    <p className="text-muted-foreground">
                                        Todas las solicitudes han sido procesadas
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Nombre Completo</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Fecha de Solicitud</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {solicitudesPendientes.map((usuario) => (
                                                <TableRow key={usuario.usuarioID}>
                                                    <TableCell className="font-medium">
                                                        {usuario.nombre}
                                                    </TableCell>
                                                    <TableCell>
                                                        {usuario.nombres} {usuario.apellidos}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            {usuario.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(getFechaRegistro(usuario))}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleApprovalClick(usuario)}
                                                            >
                                                                <UserCheck className="h-4 w-4 mr-1" />
                                                                Aprobar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => handleRejectClick(usuario)}
                                                            >
                                                                <UserX className="h-4 w-4 mr-1" />
                                                                Rechazar
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Paginación */}
                                    <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                                        <div className="text-sm text-muted-foreground">
                                            {totalElementsPendientes === 0 ? (
                                                <>Mostrando 0 de 0 resultados</>
                                            ) : (
                                                <>Mostrando {currentPagePendientes * pageSize + 1} a {Math.min((currentPagePendientes + 1) * pageSize, totalElementsPendientes)} de {totalElementsPendientes} resultados</>
                                            )}
                                        </div>
                                        <Pagination
                                            currentPage={currentPagePendientes}
                                            totalPages={Math.max(totalPagesPendientes, 1)}
                                            onPageChange={(p) => fetchSolicitudesPendientes(p)}
                                            showRange={1}
                                            alwaysShow={true}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Vista de Usuarios Registrados */
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Usuarios Registrados</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Administra usuarios existentes del sistema
                                    </p>
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px] flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            placeholder="Buscar por nombre de usuario, nombre o apellido..."
                                            value={searchTermUsuarios}
                                            onChange={(e) => setSearchTermUsuarios(e.target.value)}
                                            onKeyDown={handleSearchUsuariosKeyDown}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Button type="button" onClick={handleSearchUsuariosClick} variant="secondary" size="sm" className="px-4">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="min-w-[150px]">
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filtrar por rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos los roles</SelectItem>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                            <SelectItem value="ANALISTA">Analista</SelectItem>
                                            <SelectItem value="OBSERVADOR">Observador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="min-w-[150px]">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <Filter className="h-4 w-4 mr-2" />
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            <SelectItem value="true">Activos</SelectItem>
                                            <SelectItem value="false">Inactivos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
                                        <p className="text-muted-foreground">Cargando usuarios...</p>
                                    </div>
                                </div>
                            ) : usuariosRegistrados.length === 0 ? (
                                <div className="text-center p-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay usuarios</h3>
                                    <p className="text-muted-foreground">
                                        No se encontraron usuarios con los filtros aplicados
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Nombre Completo</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Rol</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Registro</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usuariosRegistrados.map((usuario) => (
                                                <TableRow key={usuario.usuarioID}>
                                                    <TableCell className="font-medium">
                                                        {usuario.nombre}
                                                    </TableCell>
                                                    <TableCell>
                                                        {usuario.nombres} {usuario.apellidos}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                                            {usuario.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getRolLabel(usuario)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={usuario.activo ? "default" : "secondary"}>
                                                            {usuario.activo ? "Activo" : "Inactivo"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(getFechaRegistro(usuario))}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditClick(usuario)}
                                                                className="text-blue-600 hover:text-blue-700"
                                                                title="Editar rol"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            {usuario.activo ? (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteClick(usuario)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                    title="Desactivar"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => toggleUsuarioActivo(usuario)}
                                                                    className="text-green-600 hover:text-green-700"
                                                                    title="Reactivar"
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Paginación */}
                                    <div className="flex flex-col items-center justify-center mt-6 gap-2 text-center">
                                        <div className="text-sm text-muted-foreground">
                                            {totalElementsUsuarios === 0 ? (
                                                <>Mostrando 0 de 0 resultados</>
                                            ) : (
                                                <>Mostrando {currentPageUsuarios * pageSize + 1} a {Math.min((currentPageUsuarios + 1) * pageSize, totalElementsUsuarios)} de {totalElementsUsuarios} resultados</>
                                            )}
                                        </div>
                                        <Pagination
                                            currentPage={currentPageUsuarios}
                                            totalPages={Math.max(totalPagesUsuarios, 1)}
                                            onPageChange={(p) => fetchUsuariosRegistrados(p)}
                                            showRange={1}
                                            alwaysShow={true}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de Aprobación */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent className="max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Aprobar Usuario</DialogTitle>
                        <DialogDescription className="text-center">
                            ¿Estás seguro de que deseas aprobar a {selectedUser?.nombres} {selectedUser?.apellidos}?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Asignar Rol</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="ANALISTA">Analista</SelectItem>
                                    <SelectItem value="OBSERVADOR">Observador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedUser && (
                            <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm"><strong>Usuario:</strong> {selectedUser.nombre}</p>
                                <p className="text-sm"><strong>Email:</strong> {selectedUser.email}</p>
                                <p className="text-sm"><strong>Fecha:</strong> {formatDate(getFechaRegistro(selectedUser))}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowApprovalDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={aprobarUsuarioLocal}
                            disabled={isSubmitting || !selectedRole}
                        >
                            {isSubmitting ? "Aprobando..." : "Aprobar Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Rechazo */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
                            <UserX className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Rechazar Solicitud</DialogTitle>
                        <DialogDescription className="text-center">
                            ¿Estás seguro de que deseas rechazar la solicitud de {selectedUser?.nombres} {selectedUser?.apellidos}?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="rounded-lg border p-3 bg-muted/50">
                            <p className="text-sm"><strong>Usuario:</strong> {selectedUser.nombre}</p>
                            <p className="text-sm"><strong>Email:</strong> {selectedUser.email}</p>
                            <p className="text-sm"><strong>Fecha:</strong> {formatDate(selectedUser.fechaRegistro)}</p>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRejectDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={rechazarUsuarioLocal}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Rechazando..." : "Rechazar Solicitud"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Edición de Usuario Registrado */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-2">
                            <Edit className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Editar Usuario</DialogTitle>
                        <DialogDescription className="text-center">
                            Actualizar el rol de {selectedRegisteredUser?.nombres} {selectedRegisteredUser?.apellidos}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Rol del Usuario</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES_OPCIONES.map((rol) => (
                                        <SelectItem key={rol.value} value={rol.value}>
                                            {rol.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedRegisteredUser && (
                            <div className="rounded-lg border p-3 bg-muted/50">
                                <p className="text-sm"><strong>Usuario:</strong> {selectedRegisteredUser.nombre}</p>
                                <p className="text-sm"><strong>Email:</strong> {selectedRegisteredUser.email}</p>
                                <p className="text-sm"><strong>Rol Actual:</strong> {getRolLabel(selectedRegisteredUser)}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowEditDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={actualizarRol}
                            disabled={isSubmitting || !selectedRole}
                        >
                            {isSubmitting ? "Actualizando..." : "Actualizar Rol"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Desactivación de Usuario Registrado */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md" showCloseButton={false}>
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Desactivar Usuario</DialogTitle>
                        <DialogDescription className="text-center">
                            ¿Estás seguro de que deseas desactivar a {selectedRegisteredUser?.nombres} {selectedRegisteredUser?.apellidos}?
                            El usuario no podrá acceder al sistema hasta ser reactivado.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegisteredUser && (
                        <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-900/20">
                            <p className="text-sm"><strong>Usuario:</strong> {selectedRegisteredUser.nombre}</p>
                            <p className="text-sm"><strong>Email:</strong> {selectedRegisteredUser.email}</p>
                            <p className="text-sm"><strong>Rol:</strong> {getRolLabel(selectedRegisteredUser)}</p>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={eliminarUsuarioConfirm}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Desactivando..." : "Desactivar Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
