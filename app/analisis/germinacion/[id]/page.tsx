"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, User, Thermometer, Droplets, Save, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { GerminacionWorkflow } from "@/components/germinacion/germinacion-workflow"

// Interfaces basadas en la arquitectura descrita
interface GerminacionAnalysis {
  id: string
  loteId: string
  loteName: string
  analyst: string
  fechaInicio: string
  fechaFin: string | null
  estado: "REGISTRADO" | "EN_PROCESO" | "PENDIENTE_APROBACION" | "APROBADO"
  temperatura: string
  humedad: string
  duracion: string
  numeroRepeticiones: number
  numeroConteos: number
  fechaConteos: string[]
  tablas: TablaGerm[]
  valoresGerm: ValoresGerm[]
}

interface TablaGerm {
  id: string
  numeroTabla: number
  finalizada: boolean
  repeticiones: RepGerm[]
  // Parámetros de tratamiento
  temperatura: string
  humedad: string
  sustrato: string
}

interface RepGerm {
  id: string
  numRep: number
  numSemillasPRep: number
  normales: number[] // Array de conteos por fecha
  totalNormales: number
  totalAnormales: number
  totalNoGerminadas: number
  promedioGerminacion: number
}

interface ValoresGerm {
  id: string
  instituto: "INIA" | "INASE"
  porcentajeGerminacion: number
  porcentajePlantulasNormales: number
  porcentajePlantulasAnormales: number
  porcentajeSemillasNoGerminadas: number
}

export default function GerminacionAnalysisPage() {
  const params = useParams()
  const analysisId = params.id as string

  const [analysis, setAnalysis] = useState<GerminacionAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  // Mock data - en producción vendría del backend
  useEffect(() => {
    const mockAnalysis: GerminacionAnalysis = {
      id: analysisId,
      loteId: "RG-LE-ex-0018",
      loteName: "Trigo Don Mario",
      analyst: "Dr. María González",
      fechaInicio: "2024-09-15",
      fechaFin: null,
      estado: "EN_PROCESO",
      temperatura: "20°C",
      humedad: "85%",
      duracion: "7 días",
      numeroRepeticiones: 4,
      numeroConteos: 7,
      fechaConteos: ["2024-09-16", "2024-09-17", "2024-09-18", "2024-09-19", "2024-09-20", "2024-09-21", "2024-09-22"],
      tablas: [
        {
          id: "tabla1",
          numeroTabla: 1,
          finalizada: false,
          temperatura: "20°C",
          humedad: "85%",
          sustrato: "Papel filtro",
          repeticiones: [
            {
              id: "rep1",
              numRep: 1,
              numSemillasPRep: 100,
              normales: [0, 5, 15, 25, 35, 40, 42],
              totalNormales: 42,
              totalAnormales: 8,
              totalNoGerminadas: 50,
              promedioGerminacion: 42,
            },
            {
              id: "rep2",
              numRep: 2,
              numSemillasPRep: 100,
              normales: [0, 3, 12, 28, 38, 43, 45],
              totalNormales: 45,
              totalAnormales: 5,
              totalNoGerminadas: 50,
              promedioGerminacion: 45,
            },
          ],
        },
      ],
      valoresGerm: [],
    }

    setAnalysis(mockAnalysis)
    setLoading(false)
  }, [analysisId])

  const getStepProgress = () => {
    if (!analysis) return 0

    // Lógica para determinar el paso actual basado en el estado
    switch (analysis.estado) {
      case "REGISTRADO":
        return 12.5 // Paso 1
      case "EN_PROCESO":
        return 50 // Pasos 2-4
      case "PENDIENTE_APROBACION":
        return 87.5 // Paso 7
      case "APROBADO":
        return 100 // Paso 8
      default:
        return 0
    }
  }

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "default"
      case "EN_PROCESO":
        return "secondary"
      case "PENDIENTE_APROBACION":
        return "outline"
      case "REGISTRADO":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Análisis no encontrado</h1>
          <p className="text-gray-600 mb-4">El análisis solicitado no existe o no tienes permisos para verlo.</p>
          <Link href="/listado/analisis/germinacion">
            <Button>Volver al listado</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/listado/analisis/germinacion">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Listado
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Análisis de Germinación</h1>
            <p className="text-muted-foreground text-pretty">
              ID: {analysis.id} - {analysis.loteName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Guardar Progreso
          </Button>
          <Button>
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Análisis
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Progreso del Análisis
          </CardTitle>
          <CardDescription>
            Estado actual: <Badge variant={getEstadoBadgeVariant(analysis.estado)}>{analysis.estado}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={getStepProgress()} className="w-full" />
            <div className="grid grid-cols-8 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">Paso 1</div>
                <div className="text-muted-foreground">Registro</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 2</div>
                <div className="text-muted-foreground">Tablas</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 3</div>
                <div className="text-muted-foreground">Repeticiones</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 4</div>
                <div className="text-muted-foreground">Cálculos</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 5</div>
                <div className="text-muted-foreground">Porcentajes</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 6</div>
                <div className="text-muted-foreground">Finalizar</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 7</div>
                <div className="text-muted-foreground">Institutos</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Paso 8</div>
                <div className="text-muted-foreground">Aprobación</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lote</p>
                <p className="text-2xl font-bold">{analysis.loteId}</p>
                <p className="text-sm text-muted-foreground">{analysis.loteName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Condiciones</p>
                <div className="flex items-center gap-2 mt-1">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{analysis.temperatura}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{analysis.humedad}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Configuración</p>
                <p className="text-lg font-bold">{analysis.numeroRepeticiones} repeticiones</p>
                <p className="text-sm text-muted-foreground">{analysis.numeroConteos} conteos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analista</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{analysis.analyst}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{new Date(analysis.fechaInicio).toLocaleDateString("es-ES")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="workflow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflow">Flujo de Trabajo</TabsTrigger>
          <TabsTrigger value="tables">Gestión de Tablas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-4">
          <GerminacionWorkflow
            analysisId={analysisId}
            initialStep={1}
            onStepChange={(step) => console.log("[v0] Step changed to:", step)}
            onSave={(data) => console.log("[v0] Workflow data saved:", data)}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Tablas de Germinación</CardTitle>
              <CardDescription>Administra las tablas y repeticiones del análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  El sistema de gestión de tablas se implementará en el siguiente paso.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados del Análisis</CardTitle>
              <CardDescription>Visualiza los resultados finales y valores por instituto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Los resultados se mostrarán una vez completado el análisis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
              <CardDescription>Registro de todas las modificaciones realizadas al análisis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Análisis creado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.fechaInicio).toLocaleString("es-ES")} - {analysis.analyst}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
