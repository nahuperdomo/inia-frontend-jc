"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CheckCircle, X, User, Clock, ArrowLeft, Mail, UserCheck, UserX, Users, Edit, Trash2, AlertTriangle, Search, Filter } from "lucide-react"
import { Toaster } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    listarSolicitudesPendientes,
    listarUsuarios,
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

// Interfaces basadas en el backend se importan desde el servicio

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
    const [solicitudesPendientes, setSolicitudesPendientes] = useState<AuthUsuarioDTO[]>([])
    const [usuariosRegistrados, setUsuariosRegistrados] = useState<AuthUsuarioDTO[]>([])
    const [selectedUser, setSelectedUser] = useState<AuthUsuarioDTO | null>(null)
    const [selectedRegisteredUser, setSelectedRegisteredUser] = useState<AuthUsuarioDTO | null>(null)
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"pendientes" | "registrados">("pendientes")
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setIsLoading(true)
        try {
            const [solicitudes, usuarios] = await Promise.all([
                listarSolicitudesPendientes(),
                listarUsuarios()
            ])
            setSolicitudesPendientes(solicitudes)
            setUsuariosRegistrados(usuarios)
        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cargar datos", {
                description: "No se pudieron cargar los datos de usuarios"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprovalClick = (usuario: AuthUsuarioDTO) => {
        setSelectedUser(usuario)
        setSelectedRole("2") // Por defecto ANALISTA
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
            // Enviar el rol como string que coincide con el enum del backend
            await aprobarUsuario(selectedUser.usuarioID, { rol: selectedRole } as AprobarUsuarioRequest)

            toast.success("Usuario aprobado exitosamente", {
                description: `${selectedUser.nombres} ${selectedUser.apellidos} ha sido aprobado como ${ROLES_LABELS[selectedRole]}`
            })

            // Actualizar la lista removiendo el usuario aprobado
            setSolicitudesPendientes(prev =>
                prev.filter(u => u.usuarioID !== selectedUser.usuarioID)
            )

            setShowApprovalDialog(false)
            setSelectedUser(null)
            setSelectedRole("")

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

            // Actualizar la lista removiendo el usuario rechazado
            setSolicitudesPendientes(prev =>
                prev.filter(u => u.usuarioID !== selectedUser.usuarioID)
            )

            setShowRejectDialog(false)
            setSelectedUser(null)

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al rechazar solicitud", {
                description: "No se pudo rechazar la solicitud. Intenta nuevamente."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Funciones para usuarios registrados
    const handleEditClick = (usuario: AuthUsuarioDTO) => {
        setSelectedRegisteredUser(usuario)
        // Extraer el rol (ya viene en el formato correcto del backend)
        const currentRole = (usuario.roles && usuario.roles[0]) || "ANALISTA"
        setSelectedRole(currentRole)
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
            // Enviar el rol como string que coincide con el enum del backend
            await gestionarUsuario(selectedRegisteredUser.usuarioID, {
                rol: selectedRole
            } as GestionarUsuarioRequest)

            toast.success("Rol actualizado exitosamente", {
                description: `El rol de ${selectedRegisteredUser.nombres} ${selectedRegisteredUser.apellidos} ha sido actualizado a ${ROLES_LABELS[selectedRole]}`
            })

            // Recargar datos para reflejar cambios
            await cargarDatos()

            setShowEditDialog(false)
            setSelectedRegisteredUser(null)
            setSelectedRole("")

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

            // Recargar datos para reflejar cambios
            await cargarDatos()

            setShowDeleteDialog(false)
            setSelectedRegisteredUser(null)

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

            // Recargar datos para reflejar cambios
            await cargarDatos()

        } catch (error) {
            console.error("Error:", error)
            toast.error("Error al cambiar estado", {
                description: "No se pudo cambiar el estado del usuario."
            })
        }
    }

    // Filtros para usuarios registrados
    const filteredUsuarios = usuariosRegistrados.filter(usuario => {
        const matchesSearch = (
            usuario.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const userRole = (usuario.roles && usuario.roles[0]) || ""
        const matchesRole = roleFilter === "all" || userRole === roleFilter

        return matchesSearch && matchesRole
    })

    const getRoleBadgeVariant = (roles: string[]) => {
        const firstRole = roles[0]?.toUpperCase() || ""
        switch (firstRole) {
            case "ADMIN":
            case "ADMINISTRADOR":
                return "destructive"
            case "ANALISTA":
                return "default"
            case "OBSERVADOR":
                return "secondary"
            default:
                return "outline"
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/administracion">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Administración
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-balance">Gestión Completa de Usuarios</h1>
                        <p className="text-muted-foreground text-pretty">
                            Validación de solicitudes y administración de usuarios existentes
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-primary" />
                </div>
            </div>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{solicitudesPendientes.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {usuariosRegistrados.filter(u => u.activo).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Administradores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {usuariosRegistrados.filter(u => u.roles && u.roles.some((role: string) => role.toUpperCase().includes("ADMIN"))).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usuariosRegistrados.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Card>
                <CardHeader>
                    <div className="flex gap-2">
                        <Button
                            variant={activeTab === "pendientes" ? "default" : "outline"}
                            onClick={() => setActiveTab("pendientes")}
                            className="flex items-center gap-2"
                        >
                            <UserCheck className="h-4 w-4" />
                            Solicitudes Pendientes ({solicitudesPendientes.length})
                        </Button>
                        <Button
                            variant={activeTab === "registrados" ? "default" : "outline"}
                            onClick={() => setActiveTab("registrados")}
                            className="flex items-center gap-2"
                        >
                            <Users className="h-4 w-4" />
                            Usuarios Registrados ({usuariosRegistrados.length})
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
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead>Nombre Completo</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Fecha de Solicitud</TableHead>
                                            <TableHead>Estado</TableHead>
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
                                                    {formatDate(usuario.fechaRegistro)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {usuario.estadoSolicitud}
                                                    </Badge>
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
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar usuarios..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
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
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-center">
                                        <Users className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
                                        <p className="text-muted-foreground">Cargando usuarios...</p>
                                    </div>
                                </div>
                            ) : filteredUsuarios.length === 0 ? (
                                <div className="text-center p-8">
                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-medium mb-2">No hay usuarios</h3>
                                    <p className="text-muted-foreground">
                                        No se encontraron usuarios con los filtros aplicados
                                    </p>
                                </div>
                            ) : (
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
                                        {filteredUsuarios.map((usuario) => (
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
                                                    <Badge variant={getRoleBadgeVariant(usuario.roles || [])}>
                                                        {(usuario.roles && usuario.roles[0]) || "Sin rol"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={usuario.activo ? "default" : "secondary"}>
                                                        {usuario.activo ? "Activo" : "Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(usuario.fechaRegistro).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditClick(usuario)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={usuario.activo ? "secondary" : "default"}
                                                            onClick={() => toggleUsuarioActivo(usuario)}
                                                        >
                                                            {usuario.activo ? (
                                                                <UserX className="h-4 w-4" />
                                                            ) : (
                                                                <UserCheck className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteClick(usuario)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                                <p className="text-sm"><strong>Fecha:</strong> {formatDate(selectedUser.fechaRegistro)}</p>
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
                <DialogContent className="max-w-md">
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
                                        <SelectItem key={rol.value} value={rol.value.toString()}>
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
                                <p className="text-sm"><strong>Rol Actual:</strong> {(selectedRegisteredUser.roles && selectedRegisteredUser.roles[0]) || "Sin rol"}</p>
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

            {/* Dialog de Eliminación de Usuario Registrado */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Eliminar Usuario</DialogTitle>
                        <DialogDescription className="text-center">
                            ¿Estás seguro de que deseas eliminar a {selectedRegisteredUser?.nombres} {selectedRegisteredUser?.apellidos}?
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRegisteredUser && (
                        <div className="rounded-lg border p-3 bg-red-50 dark:bg-red-900/20">
                            <p className="text-sm"><strong>Usuario:</strong> {selectedRegisteredUser.nombre}</p>
                            <p className="text-sm"><strong>Email:</strong> {selectedRegisteredUser.email}</p>
                            <p className="text-sm"><strong>Rol:</strong> {(selectedRegisteredUser.roles && selectedRegisteredUser.roles[0]) || "Sin rol"}</p>
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
                            {isSubmitting ? "Eliminando..." : "Eliminar Usuario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Toaster richColors />
        </div>
    )
}
