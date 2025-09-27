"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { toast } from "sonner"

// Types for the germinacion analysis state
export interface RepeticionData {
  id: string
  numero: number
  normales: number[]
  anormales: number[]
  muertas: number[]
  total: number
  porcentajeGerminacion: number
}

export interface TablaGerm {
  id: string
  nombre: string
  temperatura: number
  humedad: number
  sustrato: string
  duracion: number
  repeticiones: RepeticionData[]
  finalizada: boolean
  totales: number[]
  promedios: number[]
  desviacionEstandar: number[]
  coeficienteVariacion: number[]
}

export interface ValoresInstituto {
  inia: number[]
  inase: number[]
  iniaManual: boolean[]
  inaseManual: boolean[]
}

export interface GerminacionAnalysis {
  id: string
  currentStep: number
  fechasConteo: string[]
  tablas: TablaGerm[]
  valoresInstituto: ValoresInstituto
  configuracionFinalizada: boolean
  datosIngresados: boolean
  calculosRealizados: boolean
  valoresEditados: boolean
  reporteGenerado: boolean
  analisisAprobado: boolean
  lastSaved: string | null
}

// Action types
type AnalysisAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "SET_FECHAS_CONTEO"; payload: string[] }
  | { type: "ADD_TABLA"; payload: Omit<TablaGerm, "id"> }
  | { type: "UPDATE_TABLA"; payload: { id: string; updates: Partial<TablaGerm> } }
  | { type: "DELETE_TABLA"; payload: string }
  | { type: "UPDATE_REPETICION"; payload: { tablaId: string; repeticionId: string; data: Partial<RepeticionData> } }
  | { type: "SET_VALORES_INSTITUTO"; payload: ValoresInstituto }
  | { type: "SET_CONFIGURACION_FINALIZADA"; payload: boolean }
  | { type: "SET_DATOS_INGRESADOS"; payload: boolean }
  | { type: "SET_CALCULOS_REALIZADOS"; payload: boolean }
  | { type: "SET_VALORES_EDITADOS"; payload: boolean }
  | { type: "SET_REPORTE_GENERADO"; payload: boolean }
  | { type: "SET_ANALISIS_APROBADO"; payload: boolean }
  | { type: "LOAD_ANALYSIS"; payload: GerminacionAnalysis }
  | { type: "SAVE_SUCCESS" }

// Initial state
const initialState: GerminacionAnalysis = {
  id: "",
  currentStep: 1,
  fechasConteo: [],
  tablas: [],
  valoresInstituto: {
    inia: [],
    inase: [],
    iniaManual: [],
    inaseManual: [],
  },
  configuracionFinalizada: false,
  datosIngresados: false,
  calculosRealizados: false,
  valoresEditados: false,
  reporteGenerado: false,
  analisisAprobado: false,
  lastSaved: null,
}

// Reducer
function analysisReducer(state: GerminacionAnalysis, action: AnalysisAction): GerminacionAnalysis {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return { ...state, currentStep: action.payload }

    case "SET_FECHAS_CONTEO":
      return { ...state, fechasConteo: action.payload }

    case "ADD_TABLA":
      const newTabla: TablaGerm = {
        ...action.payload,
        id: `tabla-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }
      return { ...state, tablas: [...state.tablas, newTabla] }

    case "UPDATE_TABLA":
      return {
        ...state,
        tablas: state.tablas.map((tabla) =>
          tabla.id === action.payload.id ? { ...tabla, ...action.payload.updates } : tabla,
        ),
      }

    case "DELETE_TABLA":
      return {
        ...state,
        tablas: state.tablas.filter((tabla) => tabla.id !== action.payload),
      }

    case "UPDATE_REPETICION":
      return {
        ...state,
        tablas: state.tablas.map((tabla) =>
          tabla.id === action.payload.tablaId
            ? {
                ...tabla,
                repeticiones: tabla.repeticiones.map((rep) =>
                  rep.id === action.payload.repeticionId ? { ...rep, ...action.payload.data } : rep,
                ),
              }
            : tabla,
        ),
      }

    case "SET_VALORES_INSTITUTO":
      return { ...state, valoresInstituto: action.payload }

    case "SET_CONFIGURACION_FINALIZADA":
      return { ...state, configuracionFinalizada: action.payload }

    case "SET_DATOS_INGRESADOS":
      return { ...state, datosIngresados: action.payload }

    case "SET_CALCULOS_REALIZADOS":
      return { ...state, calculosRealizados: action.payload }

    case "SET_VALORES_EDITADOS":
      return { ...state, valoresEditados: action.payload }

    case "SET_REPORTE_GENERADO":
      return { ...state, reporteGenerado: action.payload }

    case "SET_ANALISIS_APROBADO":
      return { ...state, analisisAprobado: action.payload }

    case "LOAD_ANALYSIS":
      return action.payload

    case "SAVE_SUCCESS":
      return { ...state, lastSaved: new Date().toISOString() }

    default:
      return state
  }
}

// Context
const AnalysisStateContext = createContext<{
  state: GerminacionAnalysis
  dispatch: React.Dispatch<AnalysisAction>
  saveAnalysis: () => Promise<void>
  loadAnalysis: (id: string) => Promise<void>
} | null>(null)

// Provider component
export function AnalysisStateProvider({
  children,
  analysisId,
}: {
  children: React.ReactNode
  analysisId: string
}) {
  const [state, dispatch] = useReducer(analysisReducer, {
    ...initialState,
    id: analysisId,
  })

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (state.lastSaved !== new Date().toISOString().split("T")[0]) {
        saveAnalysis()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSave)
  }, [state])

  const saveAnalysis = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/germinacion/${state.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      })

      if (!response.ok) {
        throw new Error("Error al guardar el análisis")
      }

      dispatch({ type: "SAVE_SUCCESS" })
      toast.success("Análisis guardado correctamente")
    } catch (error) {
      console.error("Error saving analysis:", error)
      toast.error("Error al guardar el análisis")
    }
  }

  const loadAnalysis = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/germinacion/${id}`)

      if (!response.ok) {
        throw new Error("Error al cargar el análisis")
      }

      const analysisData = await response.json()
      dispatch({ type: "LOAD_ANALYSIS", payload: analysisData })
      toast.success("Análisis cargado correctamente")
    } catch (error) {
      console.error("Error loading analysis:", error)
      toast.error("Error al cargar el análisis")
    }
  }

  // Load analysis on mount
  useEffect(() => {
    if (analysisId && analysisId !== "new") {
      loadAnalysis(analysisId)
    }
  }, [analysisId])

  return (
    <AnalysisStateContext.Provider
      value={{
        state,
        dispatch,
        saveAnalysis,
        loadAnalysis,
      }}
    >
      {children}
    </AnalysisStateContext.Provider>
  )
}

// Hook to use the analysis state
export function useAnalysisState() {
  const context = useContext(AnalysisStateContext)
  if (!context) {
    throw new Error("useAnalysisState must be used within an AnalysisStateProvider")
  }
  return context
}

// Utility functions for state management
export const analysisUtils = {
  // Check if step can be accessed
  canAccessStep: (state: GerminacionAnalysis, step: number): boolean => {
    switch (step) {
      case 1:
        return true // Configuration always accessible
      case 2:
        return state.configuracionFinalizada
      case 3:
        return state.configuracionFinalizada && state.tablas.length > 0
      case 4:
        return state.datosIngresados
      case 5:
        return state.calculosRealizados
      case 6:
        return state.valoresEditados
      case 7:
        return state.reporteGenerado
      case 8:
        return state.reporteGenerado
      default:
        return false
    }
  },

  // Get step completion status
  getStepStatus: (state: GerminacionAnalysis, step: number): "completed" | "current" | "pending" => {
    if (step < state.currentStep) return "completed"
    if (step === state.currentStep) return "current"
    return "pending"
  },

  // Calculate overall progress
  getOverallProgress: (state: GerminacionAnalysis): number => {
    let completedSteps = 0
    if (state.configuracionFinalizada) completedSteps++
    if (state.tablas.length > 0) completedSteps++
    if (state.datosIngresados) completedSteps++
    if (state.calculosRealizados) completedSteps++
    if (state.valoresEditados) completedSteps++
    if (state.reporteGenerado) completedSteps++
    if (state.analisisAprobado) completedSteps++

    return Math.round((completedSteps / 7) * 100)
  },

  // Validate step completion
  validateStepCompletion: (state: GerminacionAnalysis, step: number): boolean => {
    switch (step) {
      case 1:
        return state.fechasConteo.length > 0
      case 2:
        return state.tablas.length > 0 && state.tablas.every((t) => t.finalizada)
      case 3:
        return state.tablas.every((t) => t.repeticiones.every((r) => r.normales.length === state.fechasConteo.length))
      case 4:
        return state.calculosRealizados
      case 5:
        return state.valoresInstituto.inia.length > 0
      case 6:
        return state.reporteGenerado
      case 7:
        return true // Review step
      case 8:
        return state.analisisAprobado
      default:
        return false
    }
  },
}
