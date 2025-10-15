"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, Shield, ArrowRight, Settings, Database, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdministracionPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">Administracin del Sistema</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Panel de control y configuracin del sistema INIA
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Gestin de Usuarios */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Gestin de Usuarios</CardTitle>
                                <CardDescription>
                                    Administrar usuarios y permisos del sistema
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Validar solicitudes de registro<br />
                                • Gestionar usuarios existentes<br />
                                • Asignar roles y permisos<br />
                                • Activar/desactivar cuentas
                            </div>
                            <Link href="/administracion/usuario">
                                <Button className="w-full">
                                    Gestionar Usuarios
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Configuracin del Sistema */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Settings className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Configuracin</CardTitle>
                                <CardDescription>
                                    Configurar parámetros del sistema
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Configurar catálogos<br />
                                • Parámetros de análisis<br />
                                • Configuracin de reportes<br />
                                • Mantenimiento general
                            </div>
                            <Link href="/administracion/configuracion">
                                <Button className="w-full" variant="outline">
                                    Configurar Sistema
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Gestin de Datos */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Gestin de Datos</CardTitle>
                                <CardDescription>
                                    Respaldos y mantenimiento de datos
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Respaldos automáticos<br />
                                • Exportar/importar datos<br />
                                • Limpieza de datos<br />
                                • Logs del sistema
                            </div>
                            <Link href="/administracion/datos">
                                <Button className="w-full" variant="outline">
                                    Gestionar Datos
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Reportes del Sistema */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100">
                                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Reportes de Sistema</CardTitle>
                                <CardDescription>
                                    Estadísticas y análisis del sistema
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Uso del sistema<br />
                                • Estadísticas de usuarios<br />
                                • Rendimiento del sistema<br />
                                • Reportes de actividad
                            </div>
                            <Link href="/administracion/reportes">
                                <Button className="w-full" variant="outline">
                                    Ver Reportes
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentacin */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100">
                                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Documentacin</CardTitle>
                                <CardDescription>
                                    Guías y documentacin del sistema
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Manual de usuario<br />
                                • Guía de administracin<br />
                                • Procedimientos<br />
                                • Soporte técnico
                            </div>
                            <Link href="/administracion/documentacion">
                                <Button className="w-full" variant="outline">
                                    Ver Documentacin
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Auditoría */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100">
                                <UserCheck className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Auditoría</CardTitle>
                                <CardDescription>
                                    Registro de actividades del sistema
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground">
                                • Registro de accesos<br />
                                • Cambios en el sistema<br />
                                • Actividad de usuarios<br />
                                • Logs de seguridad
                            </div>
                            <Link href="/administracion/auditoria">
                                <Button className="w-full" variant="outline">
                                    Ver Auditoría
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Informacin del Sistema */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Estado del Sistema
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-600">✓</div>
                            <div className="text-sm font-medium">Sistema Operativo</div>
                            <div className="text-xs text-muted-foreground">Funcionando correctamente</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200 dark:border-blue-800">
                            <div className="text-2xl font-bold text-blue-600">•</div>
                            <div className="text-sm font-medium">Base de Datos</div>
                            <div className="text-xs text-muted-foreground">Conectada</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200 dark:border-purple-800">
                            <div className="text-2xl font-bold text-purple-600">⚡</div>
                            <div className="text-sm font-medium">Rendimiento</div>
                            <div className="text-xs text-muted-foreground">ptimo</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200 dark:border-orange-800">
                            <div className="text-2xl font-bold text-orange-600">🔒</div>
                            <div className="text-sm font-medium">Seguridad</div>
                            <div className="text-xs text-muted-foreground">Protegido</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}