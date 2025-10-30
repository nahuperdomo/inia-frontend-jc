'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
    const handleRefresh = () => {
        if (typeof window !== 'undefined') {
            window.location.reload()
        }
    }

    return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <WifiOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-2xl">Sin conexión</CardTitle>
                    <CardDescription>
                        No tienes conexión a internet en este momento. Algunas funciones pueden no estar disponibles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Funciones disponibles offline:</h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Ver datos previamente cargados</li>
                            <li>• Navegar por la aplicación</li>
                            <li>• Acceder a páginas ya visitadas</li>
                        </ul>
                    </div>

                    <Button
                        onClick={handleRefresh}
                        className="w-full gap-2"
                        variant="outline"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reintentar conexión
                    </Button>

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            INIA - Sistema de Análisis de Semillas
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
