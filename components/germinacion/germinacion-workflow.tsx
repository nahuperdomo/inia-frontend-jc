"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Calculator,
  Percent,
  CheckCircle,
  Building,
  FileCheck,
  AlertTriangle,
} from "lucide-react"
import { TableManagement } from "@/components/germinacion/table-management" // Import the new TableManagement component
import { RepetitionDataEntry } from "@/components/germinacion/repetition-data-entry"
import { CalculationEngine } from "@/components/germinacion/calculation-engine"
import { InstituteValuesEditor } from "@/components/germinacion/institute-values-editor"
import { useAnalysisState, analysisUtils } from "@/components/germinacion/analysis-state-provider"

interface WorkflowStep {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  status: "pending" | "in-progress" | "completed" | "blocked"
}

interface GerminacionWorkflowProps {
  analysisId: string
  initialStep?: number
  onStepChange?: (step: number) => void
  onSave?: (data: any) => void
}

export function GerminacionWorkflow({ analysisId, initialStep = 1, onStepChange, onSave }: GerminacionWorkflowProps) {
  const { state, dispatch, saveAnalysis } = useAnalysisState()
  const [currentStep, setCurrentStep] = useState(initialStep)

  const handleStepChange = (newStep: number) => {
    if (newStep >= 1 && newStep <= 8 && analysisUtils.canAccessStep(state, newStep)) {
      setCurrentStep(newStep)
      dispatch({ type: "SET_CURRENT_STEP", payload: newStep })
      onStepChange?.(newStep)
    }
  }

  const handleNext = () => {
    if (currentStep < 8 && analysisUtils.canAccessStep(state, currentStep + 1)) {
      handleStepChange(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1)
    }
  }

  const handleSave = async () => {
    await saveAnalysis()
    onSave?.(state)
  }

  const getStepProgress = () => {
    return analysisUtils.getOverallProgress(state)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1ConfiguracionInicial />
      case 2:
        return <Step2CreacionTablas />
      case 3:
        return <Step3RegistroRepeticiones />
      case 4:
        return <Step4CalculosAutomaticos />
      case 5:
        return <Step5PorcentajesManuales />
      case 6:
        return <Step6FinalizacionTablas />
      case 7:
        return <Step7ValoresInstituto />
      case 8:
        return <Step8Finalizacion />
      default:
        return null
    }
  }

  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: "Configuración Inicial",
      description: "Definir parámetros básicos del análisis",
      icon: Settings,
      status: analysisUtils.getStepStatus(state, 1),
    },
    {
      id: 2,
      title: "Creación de Tablas",
      description: "Configurar tablas con parámetros de tratamiento",
      icon: Plus,
      status: analysisUtils.getStepStatus(state, 2),
    },
    {
      id: 3,
      title: "Registro de Repeticiones",
      description: "Ingresar conteos por fecha para cada repetición",
      icon: FileCheck,
      status: analysisUtils.getStepStatus(state, 3),
    },
    {
      id: 4,
      title: "Cálculos Automáticos",
      description: "Generar totales y promedios automáticamente",
      icon: Calculator,
      status: analysisUtils.getStepStatus(state, 4),
    },
    {
      id: 5,
      title: "Porcentajes Manuales",
      description: "Ingresar porcentajes con redondeo (deben sumar 100%)",
      icon: Percent,
      status: analysisUtils.getStepStatus(state, 5),
    },
    {
      id: 6,
      title: "Finalización de Tablas",
      description: "Marcar tablas como finalizadas",
      icon: CheckCircle,
      status: analysisUtils.getStepStatus(state, 6),
    },
    {
      id: 7,
      title: "Valores por Instituto",
      description: "Editar valores INIA/INASE",
      icon: Building,
      status: analysisUtils.getStepStatus(state, 7),
    },
    {
      id: 8,
      title: "Finalización",
      description: "Cambiar estado a PENDIENTE_APROBACION o APROBADO",
      icon: AlertTriangle,
      status: analysisUtils.getStepStatus(state, 8),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Flujo de Trabajo - Paso {currentStep} de 8</span>
            <Badge variant="outline">{steps[currentStep - 1]?.title}</Badge>
          </CardTitle>
          <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={getStepProgress()} className="w-full mb-4" />
          <div className="grid grid-cols-8 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded cursor-pointer transition-colors ${
                  step.id === currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => handleStepChange(step.id)}
              >
                <step.icon className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs font-medium">{step.id}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep - 1]?.icon, { className: "h-5 w-5" })}
            {steps[currentStep - 1]?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            Guardar Progreso
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentStep === 8 || !analysisUtils.canAccessStep(state, currentStep + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Step1ConfiguracionInicial() {
  const { state, dispatch } = useAnalysisState()

  const handleChange = (field: string, value: any) => {
    if (field === "fechaConteos") {
      dispatch({ type: "SET_FECHAS_CONTEO", payload: value })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="numeroRepeticiones">Número de Repeticiones</Label>
          <Select value="4" onValueChange={(value) => console.log("[v0] Repeticiones:", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar número de repeticiones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 repeticiones</SelectItem>
              <SelectItem value="4">4 repeticiones</SelectItem>
              <SelectItem value="8">8 repeticiones</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">Define cuántas repeticiones crear para el análisis</p>
        </div>

        <div>
          <Label htmlFor="numeroConteos">Número de Conteos</Label>
          <Select value="7" onValueChange={(value) => console.log("[v0] Conteos:", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar número de conteos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 conteos</SelectItem>
              <SelectItem value="7">7 conteos</SelectItem>
              <SelectItem value="10">10 conteos</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Define el tamaño del array normales[] para cada repetición
          </p>
        </div>
      </div>

      <div>
        <Label>Fechas de Conteo</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i}>
              <Label htmlFor={`fecha-${i}`} className="text-sm">
                Conteo {i + 1}
              </Label>
              <Input
                id={`fecha-${i}`}
                type="date"
                value={state.fechasConteo?.[i] || ""}
                onChange={(e) => {
                  const newFechas = [...(state.fechasConteo || [])]
                  newFechas[i] = e.target.value
                  handleChange("fechaConteos", newFechas)
                }}
              />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2">Las fechas de evaluación son obligatorias (no-null)</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-sm">Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• El array normales[] se inicializa con 7 posiciones</li>
            <li>• Se crearán 4 repeticiones automáticamente</li>
            <li>• Los totales y promedios se calcularán automáticamente</li>
            <li>• Las fechas de conteo son obligatorias para el proceso</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function Step2CreacionTablas() {
  const { state, dispatch } = useAnalysisState()

  const handleTablesChange = (tables: any[]) => {
    tables.forEach((table) => {
      if (!state.tablas.find((t) => t.id === table.id)) {
        dispatch({ type: "ADD_TABLA", payload: table })
      }
    })
  }

  return (
    <div className="space-y-4">
      <TableManagement
        analysisId={state.id}
        numeroRepeticiones={4}
        numeroConteos={7}
        onTablesChange={handleTablesChange}
      />
    </div>
  )
}

function Step3RegistroRepeticiones() {
  const { state, dispatch } = useAnalysisState()

  const handleRepetitionChange = (tableId: string, repetitionId: string, repData: any) => {
    dispatch({
      type: "UPDATE_REPETICION",
      payload: { tablaId: tableId, repeticionId: repetitionId, data: repData },
    })
  }

  return (
    <div className="space-y-4">
      <RepetitionDataEntry
        tables={state.tablas || []}
        fechaConteos={state.fechasConteo || []}
        onRepetitionChange={handleRepetitionChange}
        onSave={() => console.log("[v0] Repetition data saved")}
      />
    </div>
  )
}

function Step4CalculosAutomaticos() {
  const { state, dispatch } = useAnalysisState()

  const handleCalculationsComplete = (results: any[], summaries: any[]) => {
    dispatch({
      type: "SET_CALCULOS_REALIZADOS",
      payload: { calculosRealizados: true, calculationResults: results, tableSummaries: summaries },
    })
    console.log("[v0] Calculations completed:", { results, summaries })
  }

  const handleUpdateRepetitions = (tableId: string, repetitions: any[]) => {
    dispatch({ type: "UPDATE_REPETICIONES", payload: { tablaId: tableId, repetitions: repetitions } })
  }

  return (
    <div className="space-y-4">
      <CalculationEngine
        tables={state.tablas || []}
        onCalculationsComplete={handleCalculationsComplete}
        onUpdateRepetitions={handleUpdateRepetitions}
      />
    </div>
  )
}

function Step5PorcentajesManuales() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Porcentajes Manuales</h3>
        <p className="text-muted-foreground mb-4">
          Este paso se implementará en la siguiente tarea del flujo de trabajo.
        </p>
        <p className="text-sm text-muted-foreground">
          Incluirá el ingreso manual de porcentajes con validación de suma 100%.
        </p>
      </div>
    </div>
  )
}

function Step6FinalizacionTablas() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Finalización de Tablas</h3>
        <p className="text-muted-foreground mb-4">
          Este paso se implementará en la siguiente tarea del flujo de trabajo.
        </p>
        <p className="text-sm text-muted-foreground">
          Incluirá la marcación de tablas como finalizadas (finalizada = true).
        </p>
      </div>
    </div>
  )
}

function Step7ValoresInstituto() {
  const { state, dispatch } = useAnalysisState()

  const handleValuesChange = (valores: any[]) => {
    dispatch({
      type: "SET_VALORES_INSTITUTO",
      payload: {
        INIA: valores.filter((v) => v.instituto === "INIA"),
        INASE: valores.filter((v) => v.instituto === "INASE"),
      },
    })
  }

  return (
    <div className="space-y-4">
      <InstituteValuesEditor
        tableSummaries={state.tableSummaries || []}
        valoresGerm={[...(state.valoresInstituto?.INIA || []), ...(state.valoresInstituto?.INASE || [])]}
        onValuesChange={handleValuesChange}
        onSave={() => console.log("[v0] Institute values saved")}
      />
    </div>
  )
}

function Step8Finalizacion() {
  const { state, dispatch } = useAnalysisState()

  const handleEstadoChange = (estado: string) => {
    dispatch({ type: "SET_ESTADO_FINAL", payload: estado })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Finalización del Análisis</h3>
        <p className="text-muted-foreground">Selecciona el estado final del análisis según tus permisos</p>
      </div>

      <div className="max-w-md mx-auto">
        <Label htmlFor="estadoFinal">Estado Final</Label>
        <Select value={state.estadoFinal} onValueChange={handleEstadoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado final" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDIENTE_APROBACION">Pendiente de Aprobación (Analistas)</SelectItem>
            <SelectItem value="APROBADO">Aprobado (Administradores)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-2">
          Los analistas pueden marcar como "Pendiente", los administradores pueden aprobar directamente
        </p>
      </div>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 text-sm">Resumen del Proceso</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-green-700">
          <ul className="space-y-1">
            <li>✓ Configuración inicial completada</li>
            <li>✓ Tablas creadas con parámetros</li>
            <li>✓ Repeticiones registradas</li>
            <li>✓ Cálculos automáticos realizados</li>
            <li>✓ Porcentajes manuales ingresados</li>
            <li>✓ Tablas finalizadas</li>
            <li>✓ Valores por instituto configurados</li>
            <li>→ Listo para finalización</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
