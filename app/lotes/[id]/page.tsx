"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    Edit,
    Trash2,
    Plus,
    Calendar,
    Package,
    Building,
    User,
    Thermometer,
    Scale,
    FileText,
    Droplets,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Eye,
    Download
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { obtenerLotePorId, eliminarLote } from "@/app/services/lote-service"
import { LoteDTO } from "@/app/models"
import { LoteDetailView } from "@/components/lotes/lote-detail-view"

// Función utilitaria para formatear fechas localmente
const formatearFechaLocal = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        // Si la fecha ya está en formato YYYY-MM-DD, usarla directamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            const [year, month, day] = fechaString.split('-').map(Number)
            const fecha = new Date(year, month - 1, day)
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        }

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

const getEstadoBadgeVariant = (estado: string) => {
    switch (estado?.toLowerCase()) {
        case "activo":
            return "default"
        case "en_proceso":
            return "secondary"
        case "aprobado":
            return "outline"
        case "pendiente":
            return "destructive"
        default:
            return "outline"
    }
}

export default function LoteDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [lote, setLote] = useState<LoteDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLote = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await obtenerLotePorId(parseInt(id))
                setLote(data)
            } catch (error) {
                console.error("Error fetching lote:", error)
                setError("Error al cargar el lote")
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchLote()
        }
    }, [id])

    const handleDelete = async () => {
        if (!confirm("¿Está seguro de que desea eliminar este lote?")) return

        try {
            setDeleting(true)
            await eliminarLote(parseInt(id))
            toast.success("Lote eliminado exitosamente")
            router.push("/listado/lotes")
        } catch (error) {
            console.error("Error deleting lote:", error)
            toast.error("Error al eliminar el lote")
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Cargando lote</p>
                        <p className="text-sm text-muted-foreground">Obteniendo detalles del lote...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !lote) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el lote</h2>
                        <p className="text-muted-foreground text-pretty">{error || "El lote solicitado no existe"}</p>
                    </div>
                    <Link href="/listado/lotes">
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
        <div className="space-y-6">
            {/* Header de la página */}
            <div className="flex flex-col gap-6">
                <Link href="/listado/lotes">
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al listado
                    </Button>
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl lg:text-4xl font-bold text-balance">Lote {lote.ficha}</h1>
                            <Badge variant={getEstadoBadgeVariant(lote.estado)} className="text-sm px-3 py-1">
                                {lote.estado}
                            </Badge>
                        </div>
                        <p className="text-base text-muted-foreground text-pretty">
                            {lote.cultivarNombre || 'Cultivar'} • {lote.empresaNombre || 'Empresa'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
                            <Download className="h-4 w-4" />
                            Exportar
                        </Button>
                        <Link href={`/lotes/${id}/edit`}>
                            <Button size="lg" className="gap-2 w-full sm:w-auto">
                                <Edit className="h-4 w-4" />
                                Editar lote
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Contenido principal */}
                <div className="lg:col-span-2 space-y-6">
                    <LoteDetailView lote={lote} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Acciones rápidas */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <Link href={`/registro/analisis?lote=${lote.loteID}`} className="block">
                                    <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                        <div className="p-1.5 rounded-md bg-primary/10">
                                            <Plus className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Crear Análisis</span>
                                    </Button>
                                </Link>
                                <Link href={`/lotes/${id}/edit`} className="block">
                                    <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                        <div className="p-1.5 rounded-md bg-primary/10">
                                            <Edit className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">Editar Información</span>
                                    </Button>
                                </Link>
                                <Button className="w-full justify-start gap-3 h-auto py-3 bg-transparent" variant="outline">
                                    <div className="p-1.5 rounded-md bg-primary/10">
                                        <Download className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="font-medium">Descargar Certificado</span>
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="w-full justify-start gap-3 h-auto py-3 bg-transparent text-destructive hover:text-destructive"
                                    variant="outline"
                                >
                                    <div className="p-1.5 rounded-md bg-destructive/10">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </div>
                                    <span className="font-medium">{deleting ? "Eliminando..." : "Eliminar Lote"}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estado del lote */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="text-lg">Estado del Lote</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Estado</p>
                                        <p className="font-medium">{lote.estado}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Análisis</p>
                                        <p className="font-medium">{lote.hasAnalysis ? "Disponible" : "Pendiente"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Lote verificado y activo</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de fecha */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b">
                            <CardTitle className="text-lg">Información Temporal</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de Ingreso</p>
                                    <p className="font-medium">{formatearFechaLocal(lote.fechaIngreso)}</p>
                                </div>
                                {lote.fechaVencimiento && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                                        <p className="font-medium">{formatearFechaLocal(lote.fechaVencimiento)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                                    <p className="font-medium">{formatearFechaLocal(lote.fechaCreacion)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}