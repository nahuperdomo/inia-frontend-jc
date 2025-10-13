"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X, Loader2, AlertTriangle, FileText, Calendar, Building2, Package } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { obtenerLotePorId, actualizarLote } from "@/app/services/lote-service"
import { LoteDTO, LoteRequestDTO } from "@/app/models"

export default function EditLotePage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [lote, setLote] = useState<LoteDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        ficha: "",
        tipo: "",
        observaciones: "",
        codigoCC: "",
        codigoFF: "",
        fechaEntrega: "",
        fechaRecibo: "",
        remitente: "",
        kilosLimpios: 0,
        humedad: ""
    })

    useEffect(() => {
        const fetchLote = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await obtenerLotePorId(parseInt(id))
                setLote(data)

                setFormData({
                    ficha: data.ficha || "",
                    tipo: data.tipo || "",
                    observaciones: data.observaciones || "",
                    codigoCC: data.codigoCC || "",
                    codigoFF: data.codigoFF || "",
                    fechaEntrega: data.fechaEntrega || "",
                    fechaRecibo: data.fechaRecibo || "",
                    remitente: data.remitente || "",
                    kilosLimpios: data.kilosLimpios || 0,
                    humedad: data.humedad || ""
                })
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

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSave = async () => {
        if (!lote) return

        try {
            setSaving(true)

            const updateData: LoteRequestDTO = {
                ficha: formData.ficha,
                cultivarID: lote.cultivarID,
                tipo: formData.tipo,
                empresaID: lote.empresaID,
                clienteID: lote.clienteID || 0,
                codigoCC: formData.codigoCC,
                codigoFF: formData.codigoFF,
                fechaEntrega: formData.fechaEntrega,
                fechaRecibo: formData.fechaRecibo,
                depositoID: lote.depositoID || 0,
                unidadEmbolsado: lote.unidadEmbolsado || "",
                remitente: formData.remitente,
                observaciones: formData.observaciones,
                kilosLimpios: formData.kilosLimpios,
                datosHumedad: [],
                numeroArticuloID: 0,
                cantidad: 0,
                origenID: 0,
                estadoID: 0,
                fechaCosecha: ""
            }

            await actualizarLote(parseInt(id), updateData)
            toast.success("Lote actualizado exitosamente")
            router.push(`/lotes/${id}`)
        } catch (error) {
            console.error("Error updating lote:", error)
            toast.error("Error al actualizar el lote")
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        router.back()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Cargando lote</p>
                        <p className="text-sm text-muted-foreground">Preparando formulario de edición...</p>
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
                    <Button onClick={() => router.back()} size="lg" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header de la página */}
            <div className="flex flex-col gap-6">
                <Link href={`/lotes/${id}`}>
                    <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al detalle
                    </Button>
                </Link>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl lg:text-4xl font-bold text-balance">
                                Editar Lote #{lote.loteID}
                            </h1>
                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                Modo Edición
                            </Badge>
                        </div>
                        <p className="text-base text-muted-foreground text-pretty">
                            Lote {lote.ficha} • {lote.cultivarNombre || 'Cultivar'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            <X className="h-4 w-4" />
                            Cancelar
                        </Button>
                        <Button
                            size="lg"
                            className="gap-2 w-full sm:w-auto"
                            disabled={saving}
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Formulario de edición */}
            <div className="space-y-6">
                <Card className="overflow-hidden bg-background">
                    <CardHeader className="bg-background border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            Información General
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Ficha
                                </Label>
                                <Input
                                    value={formData.ficha}
                                    onChange={(e) => handleInputChange('ficha', e.target.value)}
                                    placeholder="Ingrese la ficha del lote"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Tipo
                                </Label>
                                <Input
                                    value={formData.tipo}
                                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                                    placeholder="Tipo de lote"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Observaciones
                                </Label>
                                <Textarea
                                    value={formData.observaciones}
                                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                                    placeholder="Observaciones del lote"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            Códigos de Identificación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Código CC
                                </Label>
                                <Input
                                    value={formData.codigoCC}
                                    onChange={(e) => handleInputChange('codigoCC', e.target.value)}
                                    placeholder="Código CC"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Código FF
                                </Label>
                                <Input
                                    value={formData.codigoFF}
                                    onChange={(e) => handleInputChange('codigoFF', e.target.value)}
                                    placeholder="Código FF"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            Fechas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Fecha de Entrega
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.fechaEntrega}
                                    onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Fecha de Recibo
                                </Label>
                                <Input
                                    type="date"
                                    value={formData.fechaRecibo}
                                    onChange={(e) => handleInputChange('fechaRecibo', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/50 border-b">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            Datos Adicionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Remitente
                                </Label>
                                <Input
                                    value={formData.remitente}
                                    onChange={(e) => handleInputChange('remitente', e.target.value)}
                                    placeholder="Nombre del remitente"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Kilos Limpios
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.kilosLimpios}
                                    onChange={(e) => handleInputChange('kilosLimpios', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Humedad
                                </Label>
                                <Input
                                    value={formData.humedad}
                                    onChange={(e) => handleInputChange('humedad', e.target.value)}
                                    placeholder="Valor de humedad"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}