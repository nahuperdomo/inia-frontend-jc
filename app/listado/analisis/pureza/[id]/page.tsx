"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Edit,
    Download,
    Calendar,
    FileText,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Beaker,
    Scale,
    Microscope,
    Calculator,
    Target,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { obtenerPurezaPorId } from "@/app/services/pureza-service"
import type { PurezaDTO } from "@/app/models/interfaces/pureza"
import type { EstadoAnalisis } from "@/app/models/types/enums"

// Función utilitaria para formatear fechas correctamente
const formatearFechaLocal = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            const [year, month, day] = fechaString.split('-').map(Number)
            const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

        // Si viene en otro formato, parsearlo de manera segura
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch (error) {
        console.warn("Error al formatear fecha:", fechaString, error)
        return fechaString
    }
}

const formatearFechaHora = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        console.warn("Error al formatear fecha y hora:", fechaString, error)
        return fechaString
    }
}

export default function PurezaDetailPage() {
    const params = useParams()
    const purezaId = params.id as string
    const [pureza, setPureza] = useState<PurezaDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                const purezaData = await obtenerPurezaPorId(Number.parseInt(purezaId))

                setPureza(purezaData)
            } catch (err) {
                setError("Error al cargar los detalles del análisis de pureza")
                console.error("Error fetching pureza:", err)
            } finally {
                setLoading(false)
            }
        }

        if (purezaId) {
            fetchData()
        }
    }, [purezaId])

    const getEstadoBadgeVariant = (estado: EstadoAnalisis) => {
        switch (estado) {
            case "FINALIZADO":
                return "default"
            case "EN_PROCESO":
                return "secondary"
            case "APROBADO":
                return "outline"
            case "PENDIENTE":
                return "destructive"
            default:
                return "outline"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Cargando análisis</p>
                        <p className="text-sm text-muted-foreground">Obteniendo detalles de pureza...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !pureza) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el análisis</h2>
                        <p className="text-muted-foreground text-pretty">{error || "El análisis solicitado no existe"}</p>
                    </div>
                    <Link href="/listado/analisis/pureza">
                        <Button size="lg" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al listado
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="bg-background border-b sticky top-0 z-10">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col gap-6">
                        <Link href="/listado/analisis/pureza">
                            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                                <ArrowLeft className="h-4 w-4" />
                                Volver
                            </Button>
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-balance">Análisis de Pureza #{pureza.analisisID}</h1>
                                    <Badge variant={getEstadoBadgeVariant(pureza.estado)} className="text-sm px-3 py-1">
                                        {pureza.estado}
                                    </Badge>
                                </div>
                                <p className="text-base text-muted-foreground text-pretty">
                                    Análisis de pureza física • Lote {pureza.lote}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                                    <Download className="h-4 w-4" />
                                    Exportar
                                </Button>
                                <Link href={`/listado/analisis/pureza/${pureza.analisisID}/editar`}>
                                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                                        <Edit className="h-4 w-4" />
                                        Editar análisis
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    Información General
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            ID Análisis
                                        </label>
                                        <p className="text-2xl font-bold">{pureza.analisisID}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lote</label>
                                        <p className="text-2xl font-semibold">{pureza.lote}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Fecha de Análisis
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg font-medium">
                                                {formatearFechaLocal(pureza.fecha)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            Fecha de Inicio
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-lg font-medium">
                                                {formatearFechaHora(pureza.fechaInicio)}
                                            </p>
                                        </div>
                                    </div>

                                    {pureza.fechaFin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Fecha de Finalización
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-lg font-medium">
                                                    {formatearFechaHora(pureza.fechaFin)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {pureza.cumpleEstandar !== undefined && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Cumple Estándar
                                            </label>
                                            <div className="flex items-center gap-2">
                                                {pureza.cumpleEstandar ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <p className="text-lg font-medium text-green-600">Sí</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        <p className="text-lg font-medium text-red-600">No</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {pureza.comentarios && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                Comentarios
                                            </label>
                                            <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">{pureza.comentarios}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Datos de Peso */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Scale className="h-5 w-5 text-blue-600" />
                                    </div>
                                    Datos de Peso (gramos)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Peso Inicial</p>
                                        <p className="text-xl font-bold text-blue-600">{pureza.pesoInicial_g}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Semilla Pura</p>
                                        <p className="text-xl font-bold text-green-600">{pureza.semillaPura_g}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Materia Inerte</p>
                                        <p className="text-xl font-bold text-gray-600">{pureza.materiaInerte_g}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Otros Cultivos</p>
                                        <p className="text-xl font-bold text-orange-600">{pureza.otrosCultivos_g}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Malezas</p>
                                        <p className="text-xl font-bold text-red-600">{pureza.malezas_g}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-200/50 rounded-xl p-4 text-center space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground">Malezas Toleradas</p>
                                        <p className="text-xl font-bold text-yellow-600">{pureza.malezasToleradas_g}g</p>
                                    </div>
                                </div>
                                <div className="mt-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/50 rounded-xl p-4 text-center">
                                    <p className="text-sm font-medium text-muted-foreground">Peso Total</p>
                                    <p className="text-2xl font-bold text-purple-600">{pureza.pesoTotal_g}g</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Porcentajes Redondeados */}
                        {(pureza.redonSemillaPura !== undefined ||
                            pureza.redonMateriaInerte !== undefined ||
                            pureza.redonOtrosCultivos !== undefined ||
                            pureza.redonMalezas !== undefined ||
                            pureza.redonMalezasToleradas !== undefined) && (
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 border-b">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <div className="p-2 rounded-lg bg-green-500/10">
                                                <Calculator className="h-5 w-5 text-green-600" />
                                            </div>
                                            Porcentajes Redondeados
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pureza.redonSemillaPura !== undefined && (
                                                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Semilla Pura</p>
                                                    <p className="text-xl font-bold text-green-600">{pureza.redonSemillaPura}%</p>
                                                </div>
                                            )}
                                            {pureza.redonMateriaInerte !== undefined && (
                                                <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Materia Inerte</p>
                                                    <p className="text-xl font-bold text-gray-600">{pureza.redonMateriaInerte}%</p>
                                                </div>
                                            )}
                                            {pureza.redonOtrosCultivos !== undefined && (
                                                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Otros Cultivos</p>
                                                    <p className="text-xl font-bold text-orange-600">{pureza.redonOtrosCultivos}%</p>
                                                </div>
                                            )}
                                            {pureza.redonMalezas !== undefined && (
                                                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Malezas</p>
                                                    <p className="text-xl font-bold text-red-600">{pureza.redonMalezas}%</p>
                                                </div>
                                            )}
                                            {pureza.redonMalezasToleradas !== undefined && (
                                                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Malezas Toleradas</p>
                                                    <p className="text-xl font-bold text-yellow-600">{pureza.redonMalezasToleradas}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Valores INASE */}
                        {(pureza.inasePura !== undefined ||
                            pureza.inaseMateriaInerte !== undefined ||
                            pureza.inaseOtrosCultivos !== undefined ||
                            pureza.inaseMalezas !== undefined ||
                            pureza.inaseMalezasToleradas !== undefined) && (
                                <Card className="overflow-hidden">
                                    <CardHeader className="bg-muted/50 border-b">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <div className="p-2 rounded-lg bg-purple-500/10">
                                                <Target className="h-5 w-5 text-purple-600" />
                                            </div>
                                            Valores INASE
                                            {pureza.inaseFecha && (
                                                <Badge variant="outline" className="ml-auto">
                                                    {formatearFechaLocal(pureza.inaseFecha)}
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {pureza.inasePura !== undefined && (
                                                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Pura INASE</p>
                                                    <p className="text-xl font-bold text-green-600">{pureza.inasePura}%</p>
                                                </div>
                                            )}
                                            {pureza.inaseMateriaInerte !== undefined && (
                                                <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Materia Inerte INASE</p>
                                                    <p className="text-xl font-bold text-gray-600">{pureza.inaseMateriaInerte}%</p>
                                                </div>
                                            )}
                                            {pureza.inaseOtrosCultivos !== undefined && (
                                                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Otros Cultivos INASE</p>
                                                    <p className="text-xl font-bold text-orange-600">{pureza.inaseOtrosCultivos}%</p>
                                                </div>
                                            )}
                                            {pureza.inaseMalezas !== undefined && (
                                                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Malezas INASE</p>
                                                    <p className="text-xl font-bold text-red-600">{pureza.inaseMalezas}%</p>
                                                </div>
                                            )}
                                            {pureza.inaseMalezasToleradas !== undefined && (
                                                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-200/50 rounded-xl p-4 text-center space-y-2">
                                                    <p className="text-sm font-medium text-muted-foreground">Malezas Toleradas INASE</p>
                                                    <p className="text-xl font-bold text-yellow-600">{pureza.inaseMalezasToleradas}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                        {/* Otras Semillas */}
                        {pureza.otrasSemillas && pureza.otrasSemillas.length > 0 && (
                            <Card className="overflow-hidden">
                                <CardHeader className="bg-muted/50 border-b">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <div className="p-2 rounded-lg bg-amber-500/10">
                                            <Microscope className="h-5 w-5 text-amber-600" />
                                        </div>
                                        Otras Semillas Identificadas
                                        <Badge variant="secondary" className="ml-auto">
                                            {pureza.otrasSemillas.length} especies
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {pureza.otrasSemillas.map((semilla, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-amber-50/50 border-amber-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Microscope className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                                    <span className="font-medium text-amber-700 break-words">
                                                        {semilla.catalogo.nombreComun}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="text-center">
                                                        <label className="text-xs text-muted-foreground block">Cantidad</label>
                                                        <p className="font-medium break-words">{semilla.listadoNum}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <label className="text-xs text-muted-foreground block">Nombre Científico</label>
                                                        <p className="font-medium break-words text-xs">{semilla.catalogo.nombreCientifico || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-center sm:col-span-2">
                                                        <label className="text-xs text-muted-foreground block">Tipo</label>
                                                        <p className="font-medium break-words">{semilla.listadoTipo}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <Link href={`/registro/analisis?tipo=pureza&lote=${pureza.idLote}`} className="block">
                                        <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                            <div className="p-1.5 rounded-md bg-primary/10">
                                                <Beaker className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="font-medium">Nuevo Análisis</span>
                                        </Button>
                                    </Link>
                                    <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                        <div className="p-1.5 rounded-md bg-primary/10">
                                            <Download className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Descargar Certificado</span>
                                    </Button>
                                    <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                        <div className="p-1.5 rounded-md bg-primary/10">
                                            <Calendar className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Programar Seguimiento</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Estado del Análisis */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b">
                                <CardTitle className="text-lg">Estado del Análisis</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Estado</p>
                                            <p className="font-medium">{pureza.estado}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Cumple Estándar</p>
                                            <p className="font-medium">
                                                {pureza.cumpleEstandar === undefined ? 'No evaluado' :
                                                    pureza.cumpleEstandar ? 'Sí' : 'No'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Historial de Actividades */}
                        {pureza.historial && pureza.historial.length > 0 && (
                            <Card className="overflow-hidden">
                                <CardHeader className="bg-muted/50 border-b">
                                    <CardTitle className="text-lg">Historial de Actividades</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {pureza.historial.map((item, index) => (
                                            <div key={index} className="relative pl-6 pb-4 last:pb-0">
                                                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                                                {index !== pureza.historial.length - 1 && (
                                                    <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-border" />
                                                )}
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-semibold leading-tight">
                                                            {item.estadoAnterior} → {item.estadoNuevo}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(item.fechaCambio).toLocaleDateString("es-ES", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Por: {item.usuario}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}