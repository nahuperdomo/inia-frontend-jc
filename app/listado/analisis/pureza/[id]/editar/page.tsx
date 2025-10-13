"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
    obtenerPurezaPorId,
    actualizarPureza,
    finalizarAnalisis,
    aprobarAnalisis
} from '@/app/services/pureza-service'
import { obtenerLotesActivos } from '@/app/services/lote-service'
import { PurezaDTO, PurezaRequestDTO } from '@/app/models/interfaces/pureza'
import { LoteSimpleDTO } from '@/app/models/interfaces/lote-simple'
import { CalendarDays, Beaker, CheckCircle, Edit, ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Función utilitaria para formatear fechas correctamente
const formatearFechaLocal = (fechaString: string): string => {
    if (!fechaString) return ''

    // Crear fecha como fecha local en lugar de UTC para evitar problemas de zona horaria
    const [year, month, day] = fechaString.split('-').map(Number)
    const fecha = new Date(year, month - 1, day) // month - 1 porque los meses son 0-indexed

    return fecha.toLocaleDateString('es-UY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

// Función para convertir fecha del backend al formato YYYY-MM-DD para inputs
const convertirFechaParaInput = (fechaString: string): string => {
    if (!fechaString) return ''

    // Si la fecha ya está en formato YYYY-MM-DD, devolverla tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
        return fechaString
    }

    // Si viene con hora o en otro formato, extraer solo la parte de fecha
    const fecha = new Date(fechaString)
    if (isNaN(fecha.getTime())) return '' // Fecha inválida

    // Formatear como YYYY-MM-DD
    return fecha.toISOString().split('T')[0]
}

export default function PurezaEditPage() {
    const params = useParams()
    const router = useRouter()
    const purezaId = params.id as string

    const [pureza, setPureza] = useState<PurezaDTO | null>(null)
    const [lotes, setLotes] = useState<LoteSimpleDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [finalizing, setFinalizing] = useState(false)
    const [error, setError] = useState<string>("")
    const [editandoPureza, setEditandoPureza] = useState(false)

    // Estado para los campos editables
    const [purezaEditada, setPurezaEditada] = useState<{
        idLote: number
        comentarios: string
        fecha: string
        cumpleEstandar: boolean | undefined
        pesoInicial_g: number
        semillaPura_g: number
        materiaInerte_g: number
        otrosCultivos_g: number
        malezas_g: number
        malezasToleradas_g: number
    }>({
        idLote: 0,
        comentarios: '',
        fecha: '',
        cumpleEstandar: undefined,
        pesoInicial_g: 0,
        semillaPura_g: 0,
        materiaInerte_g: 0,
        otrosCultivos_g: 0,
        malezas_g: 0,
        malezasToleradas_g: 0
    })

    const [purezaOriginal, setPurezaOriginal] = useState<typeof purezaEditada | null>(null)

    const cargarDatos = async () => {
        try {
            setLoading(true)
            console.log("🔄 Cargando pureza y lotes para ID:", purezaId)

            // Cargar datos en paralelo
            const [purezaData, lotesData] = await Promise.all([
                obtenerPurezaPorId(parseInt(purezaId)),
                obtenerLotesActivos()
            ])

            console.log("✅ Pureza cargada:", purezaData)
            console.log("✅ Lotes cargados:", lotesData)
            setPureza(purezaData)
            setLotes(lotesData)

        } catch (err: any) {
            console.error("❌ Error cargando datos:", err)
            setError(err?.message || "Error al cargar datos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (purezaId) {
            cargarDatos()
        }
    }, [purezaId])

    const handleFinalizarAnalisis = async () => {
        if (!window.confirm("¿Está seguro que desea finalizar este análisis? No podrá editarlo después.")) {
            return
        }

        try {
            setFinalizing(true)
            setError("")

            console.log("🏁 Finalizando análisis:", purezaId)

            const purezaFinalizada = await finalizarAnalisis(parseInt(purezaId))

            setPureza(purezaFinalizada)

            toast.success('Análisis finalizado correctamente')
            console.log("✅ Análisis finalizado:", purezaFinalizada)

        } catch (err: any) {
            console.error("❌ Error finalizando análisis:", err)
            setError(err?.message || "Error al finalizar análisis")
        } finally {
            setFinalizing(false)
        }
    }

    const handleEditarPureza = () => {
        if (!pureza) return

        console.log("🔍 Iniciando edición de pureza")

        // Preparar los campos editables
        const datosEdicion = {
            idLote: pureza.idLote || 0,
            comentarios: pureza.comentarios || '',
            fecha: convertirFechaParaInput(pureza.fecha),
            cumpleEstandar: pureza.cumpleEstandar,
            pesoInicial_g: pureza.pesoInicial_g || 0,
            semillaPura_g: pureza.semillaPura_g || 0,
            materiaInerte_g: pureza.materiaInerte_g || 0,
            otrosCultivos_g: pureza.otrosCultivos_g || 0,
            malezas_g: pureza.malezas_g || 0,
            malezasToleradas_g: pureza.malezasToleradas_g || 0
        }

        setPurezaEditada(datosEdicion)
        setPurezaOriginal({ ...datosEdicion })
        setEditandoPureza(true)
    }

    const handleCancelarEdicionPureza = () => {
        if (purezaOriginal) {
            setPurezaEditada({ ...purezaOriginal })
        }
        setEditandoPureza(false)
        setPurezaOriginal(null)
    }

    const handleGuardarEdicionPureza = async () => {
        try {
            setSaving(true)
            setError("")

            console.log("💾 Guardando cambios de pureza:", purezaEditada)

            // Crear el objeto de solicitud
            const solicitud: PurezaRequestDTO = {
                idLote: purezaEditada.idLote,
                comentarios: purezaEditada.comentarios,
                fecha: purezaEditada.fecha,
                cumpleEstandar: purezaEditada.cumpleEstandar,
                pesoInicial_g: purezaEditada.pesoInicial_g,
                semillaPura_g: purezaEditada.semillaPura_g,
                materiaInerte_g: purezaEditada.materiaInerte_g,
                otrosCultivos_g: purezaEditada.otrosCultivos_g,
                malezas_g: purezaEditada.malezas_g,
                malezasToleradas_g: purezaEditada.malezasToleradas_g,

                // Mantener otros campos existentes
                pesoTotal_g: (purezaEditada.semillaPura_g + purezaEditada.materiaInerte_g +
                    purezaEditada.otrosCultivos_g + purezaEditada.malezas_g +
                    purezaEditada.malezasToleradas_g),

                // Campos opcionales - mantener valores existentes si los hay
                redonSemillaPura: pureza?.redonSemillaPura,
                redonMateriaInerte: pureza?.redonMateriaInerte,
                redonOtrosCultivos: pureza?.redonOtrosCultivos,
                redonMalezas: pureza?.redonMalezas,
                redonMalezasToleradas: pureza?.redonMalezasToleradas,
                redonPesoTotal: pureza?.redonPesoTotal,

                inasePura: pureza?.inasePura,
                inaseMateriaInerte: pureza?.inaseMateriaInerte,
                inaseOtrosCultivos: pureza?.inaseOtrosCultivos,
                inaseMalezas: pureza?.inaseMalezas,
                inaseMalezasToleradas: pureza?.inaseMalezasToleradas,
                inaseFecha: pureza?.inaseFecha,

                // Arrays existentes
                otrasSemillas: [] // Array vacío para simplificar
            }

            const purezaActualizada = await actualizarPureza(parseInt(purezaId), solicitud)

            setPureza(purezaActualizada)
            setEditandoPureza(false)
            setPurezaOriginal(null)

            toast.success('Cambios guardados correctamente')
            console.log("✅ Pureza actualizada:", purezaActualizada)

        } catch (err: any) {
            console.error("❌ Error guardando cambios:", err)
            setError(err?.message || "Error al guardar cambios")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Cargando análisis</p>
                        <p className="text-sm text-muted-foreground">Obteniendo datos para edición...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!pureza) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md">
                    <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                        <X className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-balance">Análisis no encontrado</h2>
                        <p className="text-muted-foreground text-pretty">El análisis solicitado no existe o no tienes permisos para editarlo</p>
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
                        <Link href={`/listado/analisis/pureza/${purezaId}`}>
                            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                                <ArrowLeft className="h-4 w-4" />
                                Volver al detalle
                            </Button>
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl lg:text-4xl font-bold text-balance">Editar Análisis de Pureza #{pureza.analisisID}</h1>
                                    <Badge variant="secondary" className="text-sm px-3 py-1">
                                        {pureza.estado}
                                    </Badge>
                                </div>
                                <p className="text-base text-muted-foreground text-pretty">
                                    Modificar datos del análisis de pureza • Lote {pureza.lote}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                {pureza.estado === 'EN_PROCESO' && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="gap-2"
                                        onClick={handleFinalizarAnalisis}
                                        disabled={finalizing}
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        {finalizing ? 'Finalizando...' : 'Finalizar'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {error && (
                        <Card className="border-destructive">
                            <CardContent className="p-4">
                                <p className="text-destructive">{error}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Información del Análisis */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Beaker className="h-5 w-5" />
                                    Información del Análisis
                                </CardTitle>
                                {!editandoPureza && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditarPureza}
                                        className="min-w-fit"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editandoPureza ? (
                                <div className="space-y-6">
                                    <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p><strong>Modo de Edición:</strong> Puedes modificar los campos que se muestran a continuación. Los campos calculados se actualizarán automáticamente.</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Lote Asociado *</Label>
                                                <Select
                                                    value={purezaEditada.idLote?.toString() || ""}
                                                    onValueChange={(value) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        idLote: parseInt(value)
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar lote" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {lotes.map((lote) => (
                                                            <SelectItem key={lote.loteID} value={lote.loteID.toString()}>
                                                                {lote.ficha} - {lote.especieNombre || 'N/A'} {lote.cultivarNombre || 'N/A'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Fecha de Análisis *</Label>
                                                <Input
                                                    type="date"
                                                    value={purezaEditada.fecha}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        fecha: e.target.value
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Peso Inicial (g) *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.pesoInicial_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        pesoInicial_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Semilla Pura (g) *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.semillaPura_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        semillaPura_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Materia Inerte (g) *</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.materiaInerte_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        materiaInerte_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Otros Cultivos (g)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.otrosCultivos_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        otrosCultivos_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Malezas (g)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.malezas_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        malezas_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Malezas Toleradas (g)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={purezaEditada.malezasToleradas_g}
                                                    onChange={(e) => setPurezaEditada(prev => ({
                                                        ...prev,
                                                        malezasToleradas_g: parseFloat(e.target.value) || 0
                                                    }))}
                                                    className="h-11"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="cumpleEstandar"
                                                        checked={purezaEditada.cumpleEstandar === true}
                                                        onCheckedChange={(checked) => setPurezaEditada(prev => ({
                                                            ...prev,
                                                            cumpleEstandar: checked === true ? true : checked === false ? false : undefined
                                                        }))}
                                                    />
                                                    <Label htmlFor="cumpleEstandar" className="text-sm font-medium">
                                                        Cumple Estándar
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Peso Total Calculado</Label>
                                                <Input
                                                    type="number"
                                                    value={purezaEditada.semillaPura_g + purezaEditada.materiaInerte_g + purezaEditada.otrosCultivos_g + purezaEditada.malezas_g + purezaEditada.malezasToleradas_g}
                                                    disabled
                                                    className="h-11 bg-muted"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Comentarios</Label>
                                        <Textarea
                                            value={purezaEditada.comentarios}
                                            onChange={(e) => setPurezaEditada(prev => ({
                                                ...prev,
                                                comentarios: e.target.value
                                            }))}
                                            placeholder="Comentarios adicionales sobre el análisis..."
                                            className="h-20"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Información adicional o observaciones sobre el análisis
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleGuardarEdicionPureza}
                                            disabled={saving}
                                            className="gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancelarEdicionPureza}
                                            disabled={saving}
                                            className="gap-2"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">ID Análisis</p>
                                        <p className="font-semibold">{pureza.analisisID}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Lote</p>
                                        <p className="font-semibold">{pureza.lote || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                        <p className="font-semibold">{pureza.estado}</p>
                                    </div>
                                    {pureza.fecha && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Fecha de Análisis</p>
                                            <p className="font-semibold flex items-center gap-1">
                                                <CalendarDays className="h-4 w-4" />
                                                {formatearFechaLocal(pureza.fecha)}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Peso Total</p>
                                        <p className="font-semibold">{pureza.pesoTotal_g}g</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Cumple Estándar</p>
                                        <p className="font-semibold">
                                            {pureza.cumpleEstandar === undefined ? 'No evaluado' :
                                                pureza.cumpleEstandar ? 'Sí' : 'No'}
                                        </p>
                                    </div>
                                    {pureza.comentarios && (
                                        <div className="md:col-span-3">
                                            <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                                            <p className="font-medium bg-muted/50 p-3 rounded-lg mt-1">{pureza.comentarios}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información del lote seleccionado */}
                    {editandoPureza && purezaEditada.idLote && lotes.find(l => l.loteID === purezaEditada.idLote) && (
                        <Card className="bg-gray-50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Información del Lote</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {(() => {
                                    const selectedLoteInfo = lotes.find(l => l.loteID === purezaEditada.idLote);
                                    if (!selectedLoteInfo) return null;

                                    return (
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-600">Ficha:</span>
                                                <p className="font-semibold">{selectedLoteInfo.ficha}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Especie:</span>
                                                <p className="font-semibold">{selectedLoteInfo.especieNombre || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Cultivar:</span>
                                                <p className="font-semibold">{selectedLoteInfo.cultivarNombre || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Estado:</span>
                                                <p className="font-semibold">{selectedLoteInfo.activo ? 'Activo' : 'Inactivo'}</p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}