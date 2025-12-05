"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    ArrowLeft,
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Download,
    Info
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { importarLegadosDesdeExcel, validarArchivoLegados } from "@/app/services/importacion-service"

interface ResultadoImportacion {
    exitoso: boolean
    mensaje: string
    filasImportadas?: number
    filasConErrores?: number
    errores?: Array<{
        fila: number
        campo: string
        error: string
    }>
}

export default function ImportarLegadosPage() {
    const [archivo, setArchivo] = useState<File | null>(null)
    const [validando, setValidando] = useState(false)
    const [importando, setImportando] = useState(false)
    const [resultadoValidacion, setResultadoValidacion] = useState<ResultadoImportacion | null>(null)
    const [resultadoImportacion, setResultadoImportacion] = useState<ResultadoImportacion | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validar tipo de archivo
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                toast.error('Archivo inválido', {
                    description: 'Por favor seleccione un archivo Excel (.xlsx o .xls)'
                })
                return
            }

            setArchivo(file)
            setResultadoValidacion(null)
            setResultadoImportacion(null)
            toast.success('Archivo seleccionado', {
                description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
            })
        }
    }

    const handleValidar = async () => {
        if (!archivo) {
            toast.error('Sin archivo', {
                description: 'Por favor seleccione un archivo primero'
            })
            return
        }

        setValidando(true)
        setResultadoValidacion(null)

        try {
            const resultado = await validarArchivoLegados(archivo)
            setResultadoValidacion(resultado)

            if (resultado.exitoso) {
                toast.success('Validación exitosa', {
                    description: 'El archivo es válido y está listo para importar'
                })
            } else {
                toast.warning('Archivo con errores', {
                    description: `Se encontraron ${resultado.filasConErrores || 0} filas con errores`
                })
            }
        } catch (error: any) {
            console.error('Error al validar archivo:', error)
            toast.error('Error en validación', {
                description: error.message || 'No se pudo validar el archivo'
            })
        } finally {
            setValidando(false)
        }
    }

    const handleImportarClick = () => {
        if (!archivo) {
            toast.error('Sin archivo', {
                description: 'Por favor seleccione un archivo primero'
            })
            return
        }
        setShowConfirmDialog(true)
    }

    const handleImportar = async () => {
        if (!archivo) return

        setImportando(true)
        setResultadoImportacion(null)

        try {
            const resultado = await importarLegadosDesdeExcel(archivo)
            setResultadoImportacion(resultado)

            if (resultado.exitoso) {
                toast.success('Importación exitosa', {
                    description: `Se importaron ${resultado.filasImportadas || 0} registros correctamente`,
                    duration: 5000
                })
            } else {
                toast.warning('Importación con errores', {
                    description: `${resultado.filasImportadas || 0} importados, ${resultado.filasConErrores || 0} con errores`,
                    duration: 5000
                })
            }
        } catch (error: any) {
            console.error('Error al importar archivo:', error)
            toast.error('Error en importación', {
                description: error.message || 'No se pudo importar el archivo'
            })
        } finally {
            setImportando(false)
            setShowConfirmDialog(false)
        }
    }

    const handleNuevoArchivo = () => {
        setArchivo(null)
        setResultadoValidacion(null)
        setResultadoImportacion(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card sticky top-0 z-10">
                <div className="flex h-16 items-center px-4 md:px-6">
                    <Link href="/administracion">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3 ml-4">
                        <div className="bg-primary rounded-full p-2">
                            <Upload className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold">Importar Datos Legados</h1>
                            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                                Importar datos históricos desde archivos Excel
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
                {/* InformaciÃ³n del formato */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p className="font-medium">Información importante:</p>
                            <ul className="text-sm space-y-1 ml-4">
                                <li>• El archivo debe ser formato Excel (.xlsx o .xls)</li>
                                <li>• Primero valide el archivo para verificar que no tenga errores</li>
                                <li>• Solo usuarios ADMIN pueden importar datos</li>
                                <li>• La importación creará registros nuevos en la base de datos</li>
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>

                {/* Card de carga de archivo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Seleccionar Archivo Excel
                        </CardTitle>
                        <CardDescription>
                            Cargue el archivo Excel que contiene los datos legados a importar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={validando || importando}
                                    className="w-full sm:w-auto"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Seleccionar Archivo
                                </Button>
                                {archivo && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleNuevoArchivo}
                                        disabled={validando || importando}
                                        size="sm"
                                    >
                                        Cambiar
                                    </Button>
                                )}
                            </div>

                            {archivo && (
                                <div className="bg-muted p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{archivo.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Tamaño: {(archivo.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {archivo && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={handleValidar}
                                    disabled={validando || importando}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {validando ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Validando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Validar Archivo
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleImportarClick}
                                    disabled={validando || importando || Boolean(resultadoValidacion && !resultadoValidacion.exitoso)}
                                    className="flex-1"
                                >
                                    {importando ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Importar Datos
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resultado de Validación */}
                {resultadoValidacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {resultadoValidacion.exitoso ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                )}
                                Resultado de Validación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert variant={resultadoValidacion.exitoso ? "default" : "destructive"}>
                                    <AlertDescription>
                                        {resultadoValidacion.mensaje}
                                    </AlertDescription>
                                </Alert>

                                {resultadoValidacion.filasConErrores && resultadoValidacion.filasConErrores > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            Errores encontrados ({resultadoValidacion.filasConErrores} filas)
                                        </h4>
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {resultadoValidacion.errores?.map((error, idx) => (
                                                <div key={idx} className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-sm">
                                                    <p className="font-medium">Fila {error.fila} - Campo: {error.campo}</p>
                                                    <p className="text-muted-foreground">{error.error}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Resultado de Importación */}
                {resultadoImportacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {resultadoImportacion.exitoso ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                )}
                                Resultado de Importación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Alert variant={resultadoImportacion.exitoso ? "default" : "destructive"}>
                                    <AlertDescription>
                                        {resultadoImportacion.mensaje}
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                            {resultadoImportacion.filasImportadas || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Filas importadas</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                                            {resultadoImportacion.filasConErrores || 0}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Filas con errores</p>
                                    </div>
                                </div>

                                {resultadoImportacion.errores && resultadoImportacion.errores.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            Detalle de errores
                                        </h4>
                                        <div className="max-h-64 overflow-y-auto space-y-2">
                                            {resultadoImportacion.errores.map((error, idx) => (
                                                <div key={idx} className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-sm">
                                                    <p className="font-medium">Fila {error.fila} - Campo: {error.campo}</p>
                                                    <p className="text-muted-foreground">{error.error}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}  
            </div>

            {/* Diálogo de Confirmación */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 mb-2">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Confirmar Importación</DialogTitle>
                        <DialogDescription className="text-center">
                            ¿Está seguro de que desea importar estos datos?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border p-3 bg-muted/50">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-muted-foreground">
                                <p className="font-medium mb-1">Esta acción creará registros en la base de datos.</p>
                                <p>Los datos se importarán de forma permanente y no se pueden deshacer fácilmente.</p>
                            </div>
                        </div>
                    </div>

                    {archivo && (
                        <div className="rounded-lg border p-3 bg-muted/50">
                            <p className="text-sm">
                                <strong>Archivo:</strong> {archivo.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Tamaño: {(archivo.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={importando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleImportar}
                            disabled={importando}
                        >
                            {importando ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Confirmar Importación
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
