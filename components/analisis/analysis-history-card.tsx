"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import type { AnalisisHistorialDTO } from "@/app/models/interfaces/analisis"
import { HistorialModal } from "./historial-modal"
import { useAuth } from "@/components/auth-provider"

// Función auxiliar para convertir fecha del backend
// El backend envía fechas como string ISO: "2025-10-24T17:41:49.056709"
function formatearFechaHistorial(fecha: any): string {
  try {
    if (!fecha) return "Sin fecha"
    
    const date = new Date(fecha)
    
    // Verificar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error("Fecha inválida:", fecha)
      return "Fecha inválida"
    }
    
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", fecha, error)
    return "Error en fecha"
  }
}

interface AnalysisHistoryCardProps {
  analisisId: number
  analisisTipo: "germinacion" | "pureza" | "dosn" | "pms" | "tetrazolio"
  historial: AnalisisHistorialDTO[]
}

export function AnalysisHistoryCard({ analisisId, analisisTipo, historial }: AnalysisHistoryCardProps) {
  const [showModal, setShowModal] = useState(false)
  const { user, isLoading } = useAuth()
  
  // Mostrar solo los últimos 6 registros
  const historialMostrado = historial.slice(0, 6)
  const tieneMarRegistros = historial.length > 6

  // Mientras está cargando, no mostrar nada (evitar flickering)
  if (isLoading) {
    return null
  }

  // Solo mostrar para administradores y si hay historial
  const esAdmin = user?.role === "administrador"
  
  if (!user || !esAdmin || historial.length === 0) {
    return null
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            Historial de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {historialMostrado.map((item, index) => (
              <div key={item.id} className="relative pl-6 pb-4 last:pb-0">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                {index !== historialMostrado.length - 1 && (
                  <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-border" />
                )}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">
                      {item.estadoAnterior && item.estadoNuevo 
                        ? `${item.estadoAnterior} → ${item.estadoNuevo}`
                        : item.accion}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatearFechaHistorial(item.fechaHora)}
                  </p>
                  <p className="text-xs text-muted-foreground">Por: {item.usuario}</p>
                </div>
              </div>
            ))}
            
            {tieneMarRegistros && (
              <div className="pt-2 border-t">
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs font-medium text-primary hover:underline"
                  onClick={() => setShowModal(true)}
                >
                  Ver más ({historial.length - 6} registros adicionales)
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <HistorialModal
        open={showModal}
        onOpenChange={setShowModal}
        analisisId={analisisId}
        analisisTipo={analisisTipo}
      />
    </>
  )
}
