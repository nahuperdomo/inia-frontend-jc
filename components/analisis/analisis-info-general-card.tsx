import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  FileText,
  Sprout,
  Wheat,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { EstadoAnalisis } from "@/app/models/types/enums"

// Función utilitaria para formatear fechas correctamente
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
    
    // Si viene en otro formato (LocalDateTime), parsearlo
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

interface AnalisisInfoGeneralCardProps {
  analisisID: number
  estado: EstadoAnalisis
  fechaInicio: string
  fechaFin?: string
  lote: string // nomLote
  ficha?: string
  idLote?: number
  cultivarNombre?: string
  especieNombre?: string
  comentarios?: string
  cumpleEstandar?: boolean // Para Pureza y DOSN
  className?: string
}

export function AnalisisInfoGeneralCard({
  analisisID,
  estado,
  fechaInicio,
  fechaFin,
  lote,
  ficha,
  idLote,
  cultivarNombre,
  especieNombre,
  comentarios,
  cumpleEstandar,
  className = ""
}: AnalisisInfoGeneralCardProps) {
  // Mostrar fecha de finalización solo en estados finales
  const mostrarFechaFin = fechaFin && (
    estado === 'PENDIENTE_APROBACION' || 
    estado === 'APROBADO' || 
    estado === 'A_REPETIR'
  )

  return (
    <Card className={`overflow-hidden ${className}`}>
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
            <p className="text-2xl font-bold">{analisisID}</p>
          </div>

          {ficha && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ficha del Lote
              </label>
              <p className="text-lg font-semibold">{ficha}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lote</label>
            <p className="text-lg font-semibold">{lote || 'N/A'}</p>
          </div>

          {especieNombre && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Sprout className="h-3 w-3" />
                Especie
              </label>
              <p className="text-lg font-medium">{especieNombre}</p>
            </div>
          )}

          {cultivarNombre && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Wheat className="h-3 w-3" />
                Cultivar
              </label>
              <p className="text-lg font-medium">{cultivarNombre}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Fecha de Creación
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-lg font-medium">
                {formatearFechaLocal(fechaInicio)}
              </p>
            </div>
          </div>

          {mostrarFechaFin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fecha de Finalización
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-lg font-medium">
                  {formatearFechaLocal(fechaFin)}
                </p>
              </div>
            </div>
          )}

          {cumpleEstandar !== undefined && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Cumple Estándar
              </label>
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${cumpleEstandar ? "bg-green-500/10" : "bg-destructive/10"}`}
                >
                  {cumpleEstandar ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <span
                  className={`text-lg font-semibold ${cumpleEstandar ? "text-green-600" : "text-destructive"}`}
                >
                  {cumpleEstandar ? "Cumple con el estándar" : "No cumple con el estándar"}
                </span>
              </div>
            </div>
          )}
        </div>

        {comentarios && (
          <>
            <Separator className="my-6" />
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Comentarios
              </label>
              <p className="text-base leading-relaxed bg-muted/50 p-4 rounded-lg">{comentarios}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
