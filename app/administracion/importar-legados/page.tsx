"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { toast, Toaster } from "sonner"
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Validar tipo de archivo
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                toast.error('Archivo invÃ¡lido', {
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
                toast.success('ValidaciÃ³n exitosa', {
                    description: 'El archivo es vÃ¡lido y estÃ¡ listo para importar'
                })
            } else {
                toast.warning('Archivo con errores', {
                    description: `Se encontraron ${resultado.filasConErrores || 0} filas con errores`
                })
            }
        } catch (error: any) {
            console.error('Error al validar archivo:', error)
            toast.error('Error en validaciÃ³n', {
                description: error.message || 'No se pudo validar el archivo'
            })
        } finally {
            setValidando(false)
        }
    }

    const handleImportar = async () => {
        if (!archivo) {
            toast.error('Sin archivo', {
                description: 'Por favor seleccione un archivo primero'
            })
            return
        }

        // Confirmar antes de importar
        const confirmar = window.confirm(
            'Â¿EstÃ¡ seguro de que desea importar estos datos?\n\n' +
            'Esta acciÃ³n crearÃ¡ registros en la base de datos y no se puede deshacer fÃ¡cilmente.'
        )

        if (!confirmar) return

        setImportando(true)
        setResultadoImportacion(null)

        try {
            const resultado = await importarLegadosDesdeExcel(archivo)
            setResultadoImportacion(resultado)

            if (resultado.exitoso) {
                toast.success('ImportaciÃ³n exitosa', {
                    description: `Se importaron ${resultado.filasImportadas || 0} registros correctamente`,
                    duration: 5000
                })
            } else {
                toast.warning('ImportaciÃ³n con errores', {
                    description: `${resultado.filasImportadas || 0} importados, ${resultado.filasConErrores || 0} con errores`,
                    duration: 5000
                })
            }
        } catch (error: any) {
            console.error('Error al importar archivo:', error)
            toast.error('Error en importaciÃ³n', {
                description: error.message || 'No se pudo importar el archivo'
            })
        } finally {
            setImportando(false)
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
            <Toaster position="top-right" richColors closeButton />
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
                                Importar datos histÃ³ricos desde archivos Excel
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
                            <p className="font-medium">InformaciÃ³n importante:</p>
                            <ul className="text-sm space-y-1 ml-4">
                                <li>â€¢ El archivo debe ser formato Excel (.xlsx o .xls)</li>
                                <li>â€¢ Primero valide el archivo para verificar que no tenga errores</li>
                                <li>â€¢ Solo usuarios ADMIN pueden importar datos</li>
                                <li>â€¢ La importaciÃ³n crearÃ¡ registros nuevos en la base de datos</li>
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
                                                TamaÃ±o: {(archivo.size / 1024).toFixed(2)} KB
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
                                    onClick={handleImportar}
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

                {/* Resultado de ValidaciÃ³n */}
                {resultadoValidacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {resultadoValidacion.exitoso ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                )}
                                Resultado de ValidaciÃ³n
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

                {/* Resultado de ImportaciÃ³n */}
                {resultadoImportacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {resultadoImportacion.exitoso ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                )}
                                Resultado de ImportaciÃ³n
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
        </div>
    )
}
