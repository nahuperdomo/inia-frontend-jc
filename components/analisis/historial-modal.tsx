"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Loader2, History, Clock } from "lucide-react"
import type { AnalisisHistorialDTO } from "@/app/models/interfaces/analisis"

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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch (error) {
    console.error("Error al formatear fecha:", fecha, error)
    return "Error en fecha"
  }
}

interface HistorialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analisisId: number
  analisisTipo: "germinacion" | "pureza" | "dosn" | "pms" | "tetrazolio"
}

export function HistorialModal({ open, onOpenChange, analisisId, analisisTipo }: HistorialModalProps) {
  const [historial, setHistorial] = useState<AnalisisHistorialDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchHistorial = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Obtener el análisis completo según el tipo
        let data
        switch (analisisTipo) {
          case "germinacion": {
            const { obtenerGerminacionPorId } = await import("@/app/services/germinacion-service")
            data = await obtenerGerminacionPorId(analisisId)
            break
          }
          case "pureza": {
            const { obtenerPurezaPorId } = await import("@/app/services/pureza-service")
            data = await obtenerPurezaPorId(analisisId)
            break
          }
          case "dosn": {
            const { obtenerDosnPorId } = await import("@/app/services/dosn-service")
            data = await obtenerDosnPorId(analisisId)
            break
          }
          case "pms": {
            const { obtenerPmsPorId } = await import("@/app/services/pms-service")
            data = await obtenerPmsPorId(analisisId)
            break
          }
          case "tetrazolio": {
            const { obtenerTetrazolioPorId } = await import("@/app/services/tetrazolio-service")
            data = await obtenerTetrazolioPorId(analisisId)
            break
          }
        }

        setHistorial(data.historial || [])
      } catch (err) {
        console.error("Error al cargar historial:", err)
        setError("No se pudo cargar el historial completo")
      } finally {
        setLoading(false)
      }
    }

    fetchHistorial()
  }, [open, analisisId, analisisTipo])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <History className="h-5 w-5 text-amber-600" />
            </div>
            Historial Completo de Actividades
          </DialogTitle>
          <DialogDescription>
            Registro completo de todos los cambios de estado del análisis #{analisisId}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Cargando historial...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">No hay registros en el historial</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-4 max-h-[50vh]">
            <div className="space-y-6 pb-4">
              {historial.map((item, index) => (
                <div key={item.id} className="relative pl-8">
                  <div className="absolute left-0 top-2 h-4 w-4 rounded-full bg-primary ring-4 ring-background border-2 border-background" />
                  {index !== historial.length - 1 && (
                    <div className="absolute left-[7px] top-6 bottom-0 w-0.5 bg-border" />
                  )}
                  
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-semibold text-base">
                          {item.estadoAnterior && item.estadoNuevo 
                            ? `${item.estadoAnterior} → ${item.estadoNuevo}`
                            : item.accion}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatearFechaHistorial(item.fechaHora)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-medium text-muted-foreground">Por:</span>
                      <span className="text-xs font-semibold">{item.usuario}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
