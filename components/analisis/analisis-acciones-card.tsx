"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { Restricted, AdminOnly, AnalistaOnly } from "@/components/restricted"

interface AnalisisAccionesCardProps {
  // Datos del análisis
  analisisId: number
  tipoAnalisis: "tetrazolio" | "pms" | "dosn" | "pureza" | "germinacion"
  estado: string

  // Funciones de acción
  onAprobar?: () => Promise<void>
  onMarcarParaRepetir?: () => Promise<void>
  onFinalizarYAprobar?: () => Promise<void>
  onFinalizar?: () => Promise<void>
}

export function AnalisisAccionesCard({
  analisisId,
  tipoAnalisis,
  estado,
  onAprobar,
  onMarcarParaRepetir,
  onFinalizarYAprobar,
  onFinalizar
}: AnalisisAccionesCardProps) {
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false)

  const handleAccion = async (accion: () => Promise<void>, nombreAccion: string) => {
    if (!window.confirm(`¿Está seguro que desea ${nombreAccion}?`)) {
      return
    }

    try {
      setEjecutandoAccion(true)
      await accion()
    } catch (error) {
      console.error(`Error al ${nombreAccion}:`, error)
      alert(`Error al ${nombreAccion}. Por favor, intente nuevamente.`)
    } finally {
      setEjecutandoAccion(false)
    }
  }

  // ========== CASOS PARA ADMINISTRADOR ==========

  // CASO 1: Admin y análisis en PENDIENTE_APROBACION
  if (estado === "PENDIENTE_APROBACION") {
    return (
      <AdminOnly>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Restricted feature="aprobar-analisis">
                <Button
                  onClick={() => onAprobar && handleAccion(onAprobar, "aprobar el análisis")}
                  disabled={ejecutandoAccion || !onAprobar}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Aprobando..." : "Aprobar Análisis"}
                </Button>
              </Restricted>

              <Restricted feature="marcar-repetir">
                <Button
                  onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
                  disabled={ejecutandoAccion || !onMarcarParaRepetir}
                  variant="destructive"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
                </Button>
              </Restricted>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    )
  }

  // CASO 2: Admin y análisis APROBADO (puede marcar para repetir)
  if (estado === "APROBADO") {
    return (
      <AdminOnly>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Restricted feature="marcar-repetir">
                <Button
                  onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
                  disabled={ejecutandoAccion || !onMarcarParaRepetir}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
                </Button>
              </Restricted>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    )
  }

  // CASO 3: Admin y análisis A_REPETIR (puede aprobar con menos énfasis)
  if (estado === "A_REPETIR") {
    return (
      <AdminOnly>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Restricted feature="aprobar-analisis">
                <Button
                  onClick={() => onAprobar && handleAccion(onAprobar, "aprobar el análisis marcado para repetir")}
                  disabled={ejecutandoAccion || !onAprobar}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Aprobando..." : "Aprobar Análisis"}
                </Button>
              </Restricted>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    )
  }

  // CASO 4: Admin puede finalizar y aprobar directamente + marcar para repetir
  // CASO 5: Analista solo puede finalizar (sin aprobar)
  return (
    <>
      <AdminOnly>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Restricted feature="aprobar-analisis">
                <Button
                  onClick={() => onFinalizarYAprobar && handleAccion(onFinalizarYAprobar, "finalizar y aprobar")}
                  disabled={ejecutandoAccion || !onFinalizarYAprobar}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Finalizando..." : "Finalizar y Aprobar"}
                </Button>
              </Restricted>

              <Restricted feature="marcar-repetir">
                <Button
                  onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
                  disabled={ejecutandoAccion || !onMarcarParaRepetir}
                  variant="destructive"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
                </Button>
              </Restricted>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>

      <AnalistaOnly>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Restricted feature="finalizar-analisis">
                <Button
                  onClick={() => onFinalizar && handleAccion(onFinalizar, "finalizar el análisis")}
                  disabled={ejecutandoAccion || !onFinalizar}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {ejecutandoAccion ? "Finalizando..." : "Finalizar Análisis"}
                </Button>
              </Restricted>
            </div>
          </CardContent>
        </Card>
      </AnalistaOnly>
    </>
  )
}
