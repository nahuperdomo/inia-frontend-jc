"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save } from "lucide-react"
import Link from "next/link"

interface AnalisisHeaderBarProps {
  tipoAnalisis: string // "Tetrazolio", "PMS", "DOSN", "Pureza"
  analisisId: number
  estado: string
  volverUrl: string
  // Modo edición (opcional, solo para algunos análisis)
  modoEdicion?: boolean
  onToggleEdicion?: () => void
  onGuardarCambios?: () => void
  guardando?: boolean
  tieneCambios?: boolean
  // Ocultar botón de editar/guardar (para Germinación)
  ocultarBotonEdicion?: boolean
}

const getEstadoBadgeVariant = (estado: string) => {
  switch (estado) {
    case "APROBADO":
      return "default"
    case "EN_PROCESO":
    case "REGISTRADO":
    case "PENDIENTE_APROBACION":
      return "secondary"
    case "PARA_REPETIR":
    case "A_REPETIR":
      return "destructive"
    default:
      return "outline"
  }
}

const getEstadoLabel = (estado: string) => {
  switch (estado) {
    case "APROBADO":
      return "Aprobado"
    case "EN_PROCESO":
      return "En Proceso"
    case "REGISTRADO":
      return "Registrado"
    case "PENDIENTE_APROBACION":
      return "Pendiente Aprobación"
    case "PARA_REPETIR":
    case "A_REPETIR":
      return "Para Repetir"
    case "FINALIZADO":
      return "Finalizado"
    default:
      return estado
  }
}

export function AnalisisHeaderBar({
  tipoAnalisis,
  analisisId,
  estado,
  volverUrl,
  modoEdicion = false,
  onToggleEdicion,
  onGuardarCambios,
  guardando = false,
  tieneCambios = false,
  ocultarBotonEdicion = false
}: AnalisisHeaderBarProps) {
  return (
    <div className="bg-background border-b sticky top-0 z-40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          <Link href={volverUrl}>
            <Button variant="ghost" size="sm" className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Análisis de {tipoAnalisis} #{analisisId}
                </h1>
                <Badge variant={getEstadoBadgeVariant(estado)}>
                  {getEstadoLabel(estado)}
                </Badge>
              </div>
            </div>

            {!ocultarBotonEdicion && (
              <div className="flex gap-3">
                {modoEdicion ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2"
                      onClick={onToggleEdicion}
                      disabled={guardando}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={onGuardarCambios}
                      disabled={guardando || !tieneCambios}
                    >
                      <Save className="h-4 w-4" />
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    className="gap-2"
                    onClick={onToggleEdicion}
                  >
                    <Edit className="h-4 w-4" />
                    Editar análisis
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
