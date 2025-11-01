"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useConfirm } from "@/lib/hooks/useConfirm"

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
  const { isRole } = useAuth()
  const { confirm } = useConfirm()
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false)

  // Determinar roles
  const esAdmin = isRole("administrador")
  const esAnalista = isRole("analista")
  const esObservador = isRole("observador")

  // DEBUG: Log para ver qué está pasando
  console.log("🔍 AnalisisAccionesCard DEBUG:", {
    analisisId,
    tipoAnalisis,
    estado,
    esAdmin,
    esAnalista,
    esObservador
  })

  // Si es observador, no mostrar nada
  if (esObservador) {
    return null
  }

  const handleAccion = async (accion: () => Promise<void>, nombreAccion: string) => {
    const confirmed = await confirm({
      title: "Confirmar acción",
      message: `¿Está seguro que desea ${nombreAccion}?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      variant: "warning"
    })

    if (!confirmed) {
      return
    }

    try {
      setEjecutandoAccion(true)
      await accion()
    } catch (error: any) {
      console.error(`Error al ${nombreAccion}:`, error)
      const errorMessage = error?.message || `Error al ${nombreAccion}. Por favor, intente nuevamente.`
      alert(errorMessage)
    } finally {
      setEjecutandoAccion(false)
    }
  }

  // ========== CASOS PARA ADMINISTRADOR ==========
  
  if (esAdmin) {
    // CASO 1: Admin y análisis en PENDIENTE_APROBACION
    if (estado === "PENDIENTE_APROBACION") {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => onAprobar && handleAccion(onAprobar, "aprobar el análisis")}
                disabled={ejecutandoAccion || !onAprobar}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {ejecutandoAccion ? "Aprobando..." : "Aprobar Análisis"}
              </Button>
              
              <Button
                onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
                disabled={ejecutandoAccion || !onMarcarParaRepetir}
                variant="destructive"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // CASO 2: Admin y análisis APROBADO (puede marcar para repetir)
    if (estado === "APROBADO") {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Button
                onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
                disabled={ejecutandoAccion || !onMarcarParaRepetir}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // CASO 3: Admin y análisis A_REPETIR (puede aprobar con menos énfasis)
    if (estado === "A_REPETIR") {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Button
                onClick={() => onAprobar && handleAccion(onAprobar, "aprobar el análisis marcado para repetir")}
                disabled={ejecutandoAccion || !onAprobar}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {ejecutandoAccion ? "Aprobando..." : "Aprobar Análisis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // CASO 4: Admin y análisis en otro estado (REGISTRADO, etc.) - Finalizar y aprobar + Marcar para repetir
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => onFinalizarYAprobar && handleAccion(onFinalizarYAprobar, "finalizar y aprobar")}
              disabled={ejecutandoAccion || !onFinalizarYAprobar}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {ejecutandoAccion ? "Finalizando..." : "Finalizar y Aprobar"}
            </Button>
            
            <Button
              onClick={() => onMarcarParaRepetir && handleAccion(onMarcarParaRepetir, "marcar para repetir")}
              disabled={ejecutandoAccion || !onMarcarParaRepetir}
              variant="destructive"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {ejecutandoAccion ? "Marcando..." : "Marcar para Repetir"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ========== CASOS PARA ANALISTA ==========
  
  if (esAnalista) {
    // Analistas solo pueden finalizar análisis que no estén en PENDIENTE_APROBACION, APROBADO o A_REPETIR
    if (estado !== "PENDIENTE_APROBACION" && estado !== "APROBADO" && estado !== "A_REPETIR") {
      return (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <Button
                onClick={() => onFinalizar && handleAccion(onFinalizar, "finalizar el análisis")}
                disabled={ejecutandoAccion || !onFinalizar}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {ejecutandoAccion ? "Finalizando..." : "Finalizar Análisis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // Si el analista está viendo un análisis en PENDIENTE_APROBACION, APROBADO o A_REPETIR, no mostrar acciones
    return null
  }

  // Si no es admin ni analista, no mostrar nada
  return null
}
