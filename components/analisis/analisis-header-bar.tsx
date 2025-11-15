"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Save } from "lucide-react"
import Link from "next/link"
import { getEstadoBadgeVariant, formatEstado } from "@/lib/utils/format-helpers"

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
                  {formatEstado(estado)}
                </Badge>
              </div>
            </div>

            {!ocultarBotonEdicion && (
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full sm:w-auto">
                {modoEdicion ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                      onClick={onToggleEdicion}
                      disabled={guardando}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="lg"
                      className="gap-2 w-full sm:w-auto"
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
                    className="gap-2 w-full sm:w-auto"
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
