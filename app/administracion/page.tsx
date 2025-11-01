"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Shield, ArrowRight, Database, Contact } from "lucide-react"
import Link from "next/link"

export default function AdministracionPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-full p-2">
                            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">Administración del Sistema</h1>
                            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                                Panel de control y configuración del sistema INIA
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 md:p-6 space-y-6">
                {/* Cards Grid - Opciones Funcionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Gestión de Usuarios */}
                    <Link href="/administracion/usuario" className="group">
                        <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                                        <Users className="h-6 w-6 md:h-7 md:w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg md:text-xl mb-1">Gestión de Usuarios</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">
                                            Administrar usuarios y permisos
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Gestionar usuarios existentes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Asignar roles y permisos</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Activar/desactivar cuentas</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        Gestionar Usuarios
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Gestión de Catálogos */}
                    <Link href="/administracion/catalogos" className="group">
                        <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
                                        <Database className="h-6 w-6 md:h-7 md:w-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg md:text-xl mb-1">Gestión de Catálogos</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">
                                            Administrar catálogos del sistema
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Catálogos generales del sistema</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Especies y cultivares</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Malezas y otros cultivos</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        Gestionar Catálogos
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Gestión de Contactos */}
                    <Link href="/administracion/contactos" className="group">
                        <Card className="h-full hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 group-hover:scale-110 transition-transform">
                                        <Contact className="h-6 w-6 md:h-7 md:w-7 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg md:text-xl mb-1">Gestión de Contactos</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">
                                            Administrar contactos del sistema
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Empresas y Clientes</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Información de contacto</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">•</span>
                                            <span>Directorio completo</span>
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        Gestionar Contactos
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
