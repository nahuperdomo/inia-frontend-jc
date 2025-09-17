"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Calculator, TestTube } from "lucide-react"
import Link from "next/link"

interface GerminacionResults {
  // Repetición 1
  rep1Normales4: string
  rep1Anormales4: string
  rep1Frescas4: string
  rep1Duras4: string
  rep1Vacias4: string
  rep1Muertas4: string
  rep1Normales7: string
  rep1Anormales7: string
  rep1Frescas7: string
  rep1Duras7: string
  rep1Vacias7: string
  rep1Muertas7: string
  // Repetición 2
  rep2Normales4: string
  rep2Anormales4: string
  rep2Frescas4: string
  rep2Duras4: string
  rep2Vacias4: string
  rep2Muertas4: string
  rep2Normales7: string
  rep2Anormales7: string
  rep2Frescas7: string
  rep2Duras7: string
  rep2Vacias7: string
  rep2Muertas7: string
  // Repetición 3
  rep3Normales4: string
  rep3Anormales4: string
  rep3Frescas4: string
  rep3Duras4: string
  rep3Vacias4: string
  rep3Muertas4: string
  rep3Normales7: string
  rep3Anormales7: string
  rep3Frescas7: string
  rep3Duras7: string
  rep3Vacias7: string
  rep3Muertas7: string
  // Repetición 4
  rep4Normales4: string
  rep4Anormales4: string
  rep4Frescas4: string
  rep4Duras4: string
  rep4Vacias4: string
  rep4Muertas4: string
  rep4Normales7: string
  rep4Anormales7: string
  rep4Frescas7: string
  rep4Duras7: string
  rep4Vacias7: string
  rep4Muertas7: string
  observaciones: string
}

export default function GerminacionAnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("rep1")
  const [results, setResults] = useState<GerminacionResults>({
    // Initialize all fields as empty strings
    rep1Normales4: "",
    rep1Anormales4: "",
    rep1Frescas4: "",
    rep1Duras4: "",
    rep1Vacias4: "",
    rep1Muertas4: "",
    rep1Normales7: "",
    rep1Anormales7: "",
    rep1Frescas7: "",
    rep1Duras7: "",
    rep1Vacias7: "",
    rep1Muertas7: "",
    rep2Normales4: "",
    rep2Anormales4: "",
    rep2Frescas4: "",
    rep2Duras4: "",
    rep2Vacias4: "",
    rep2Muertas4: "",
    rep2Normales7: "",
    rep2Anormales7: "",
    rep2Frescas7: "",
    rep2Duras7: "",
    rep2Vacias7: "",
    rep2Muertas7: "",
    rep3Normales4: "",
    rep3Anormales4: "",
    rep3Frescas4: "",
    rep3Duras4: "",
    rep3Vacias4: "",
    rep3Muertas4: "",
    rep3Normales7: "",
    rep3Anormales7: "",
    rep3Frescas7: "",
    rep3Duras7: "",
    rep3Vacias7: "",
    rep3Muertas7: "",
    rep4Normales4: "",
    rep4Anormales4: "",
    rep4Frescas4: "",
    rep4Duras4: "",
    rep4Vacias4: "",
    rep4Muertas4: "",
    rep4Normales7: "",
    rep4Anormales7: "",
    rep4Frescas7: "",
    rep4Duras7: "",
    rep4Vacias7: "",
    rep4Muertas7: "",
    observaciones: "",
  })

  // Mock analysis data
  const analysisData = {
    id: params.id,
    muestra: "RG-LE-ex-0022",
    cliente: "Cooperativa Central",
    especie: "Glycine max",
    cultivar: "Don Mario 6.2",
    lote: "LT-2024-005",
    fechaInicio: "2024-12-14",
    responsable: "Dra. María González",
    estado: "En progreso",
    temperaturaGerminacion: "25°C",
    semillasPorRepeticion: 100,
  }

  const handleInputChange = (field: keyof GerminacionResults, value: string) => {
    setResults((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotals = () => {
    const reps = [1, 2, 3, 4]
    const totals = {
      normales4: 0,
      anormales4: 0,
      frescas4: 0,
      duras4: 0,
      vacias4: 0,
      muertas4: 0,
      normales7: 0,
      anormales7: 0,
      frescas7: 0,
      duras7: 0,
      vacias7: 0,
      muertas7: 0,
    }

    reps.forEach((rep) => {
      totals.normales4 += Number.parseInt(results[`rep${rep}Normales4` as keyof GerminacionResults] as string) || 0
      totals.anormales4 += Number.parseInt(results[`rep${rep}Anormales4` as keyof GerminacionResults] as string) || 0
      totals.frescas4 += Number.parseInt(results[`rep${rep}Frescas4` as keyof GerminacionResults] as string) || 0
      totals.duras4 += Number.parseInt(results[`rep${rep}Duras4` as keyof GerminacionResults] as string) || 0
      totals.vacias4 += Number.parseInt(results[`rep${rep}Vacias4` as keyof GerminacionResults] as string) || 0
      totals.muertas4 += Number.parseInt(results[`rep${rep}Muertas4` as keyof GerminacionResults] as string) || 0

      totals.normales7 += Number.parseInt(results[`rep${rep}Normales7` as keyof GerminacionResults] as string) || 0
      totals.anormales7 += Number.parseInt(results[`rep${rep}Anormales7` as keyof GerminacionResults] as string) || 0
      totals.frescas7 += Number.parseInt(results[`rep${rep}Frescas7` as keyof GerminacionResults] as string) || 0
      totals.duras7 += Number.parseInt(results[`rep${rep}Duras7` as keyof GerminacionResults] as string) || 0
      totals.vacias7 += Number.parseInt(results[`rep${rep}Vacias7` as keyof GerminacionResults] as string) || 0
      totals.muertas7 += Number.parseInt(results[`rep${rep}Muertas7` as keyof GerminacionResults] as string) || 0
    })

    const totalSemillas = analysisData.semillasPorRepeticion * 4
    const germinacionFinal = totalSemillas > 0 ? ((totals.normales7 / totalSemillas) * 100).toFixed(1) : "0.0"

    return { ...totals, totalSemillas, germinacionFinal }
  }

  const calculations = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/analisis/germinacion")
    }, 2000)
  }

  const RepetitionForm = ({ repNumber }: { repNumber: number }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conteo Día 4</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`rep${repNumber}Normales4`}>Normales</Label>
                <Input
                  id={`rep${repNumber}Normales4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Normales4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Normales4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Anormales4`}>Anormales</Label>
                <Input
                  id={`rep${repNumber}Anormales4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Anormales4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Anormales4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Frescas4`}>Frescas</Label>
                <Input
                  id={`rep${repNumber}Frescas4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Frescas4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Frescas4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Duras4`}>Duras</Label>
                <Input
                  id={`rep${repNumber}Duras4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Duras4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Duras4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Vacias4`}>Vacías</Label>
                <Input
                  id={`rep${repNumber}Vacias4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Vacias4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Vacias4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Muertas4`}>Muertas</Label>
                <Input
                  id={`rep${repNumber}Muertas4`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Muertas4` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Muertas4` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conteo Día 7</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`rep${repNumber}Normales7`}>Normales</Label>
                <Input
                  id={`rep${repNumber}Normales7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Normales7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Normales7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Anormales7`}>Anormales</Label>
                <Input
                  id={`rep${repNumber}Anormales7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Anormales7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Anormales7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Frescas7`}>Frescas</Label>
                <Input
                  id={`rep${repNumber}Frescas7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Frescas7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Frescas7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Duras7`}>Duras</Label>
                <Input
                  id={`rep${repNumber}Duras7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Duras7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Duras7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Vacias7`}>Vacías</Label>
                <Input
                  id={`rep${repNumber}Vacias7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Vacias7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Vacias7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor={`rep${repNumber}Muertas7`}>Muertas</Label>
                <Input
                  id={`rep${repNumber}Muertas7`}
                  type="number"
                  min="0"
                  max="100"
                  value={results[`rep${repNumber}Muertas7` as keyof GerminacionResults] as string}
                  onChange={(e) =>
                    handleInputChange(`rep${repNumber}Muertas7` as keyof GerminacionResults, e.target.value)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/analisis/germinacion">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Germinación
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Ensayo de Germinación - {analysisData.id}</h1>
            <p className="text-muted-foreground text-pretty">Registro de conteos de germinación</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{analysisData.estado}</Badge>
          <TestTube className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sample Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Ensayo</CardTitle>
                <CardDescription>Datos del ensayo de germinación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Muestra</Label>
                    <p className="font-medium">{analysisData.muestra}</p>
                  </div>
                  <div>
                    <Label>Cliente</Label>
                    <p className="font-medium">{analysisData.cliente}</p>
                  </div>
                  <div>
                    <Label>Especie</Label>
                    <p className="font-medium">{analysisData.especie}</p>
                  </div>
                  <div>
                    <Label>Cultivar</Label>
                    <p className="font-medium">{analysisData.cultivar}</p>
                  </div>
                  <div>
                    <Label>Temperatura</Label>
                    <p className="font-medium">{analysisData.temperaturaGerminacion}</p>
                  </div>
                  <div>
                    <Label>Semillas/Repetición</Label>
                    <p className="font-medium">{analysisData.semillasPorRepeticion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Entry */}
            <Card>
              <CardHeader>
                <CardTitle>Conteos por Repetición</CardTitle>
                <CardDescription>Ingrese los conteos para cada repetición en los días 4 y 7</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="rep1">Repetición 1</TabsTrigger>
                    <TabsTrigger value="rep2">Repetición 2</TabsTrigger>
                    <TabsTrigger value="rep3">Repetición 3</TabsTrigger>
                    <TabsTrigger value="rep4">Repetición 4</TabsTrigger>
                  </TabsList>
                  <TabsContent value="rep1" className="mt-6">
                    <RepetitionForm repNumber={1} />
                  </TabsContent>
                  <TabsContent value="rep2" className="mt-6">
                    <RepetitionForm repNumber={2} />
                  </TabsContent>
                  <TabsContent value="rep3" className="mt-6">
                    <RepetitionForm repNumber={3} />
                  </TabsContent>
                  <TabsContent value="rep4" className="mt-6">
                    <RepetitionForm repNumber={4} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
                <CardDescription>Notas adicionales sobre el ensayo</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Ingrese observaciones sobre el ensayo, condiciones ambientales, anomalías, etc."
                  value={results.observaciones}
                  onChange={(e) => handleInputChange("observaciones", e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Results Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resultados Finales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Germinación Final</p>
                  <p className="text-3xl font-bold text-green-600">{calculations.germinacionFinal}%</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plántulas Normales:</span>
                    <span className="font-medium text-green-600">{calculations.normales7}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plántulas Anormales:</span>
                    <span className="font-medium">{calculations.anormales7}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semillas Frescas:</span>
                    <span className="font-medium">{calculations.frescas7}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semillas Duras:</span>
                    <span className="font-medium">{calculations.duras7}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semillas Vacías:</span>
                    <span className="font-medium">{calculations.vacias7}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semillas Muertas:</span>
                    <span className="font-medium">{calculations.muertas7}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Guardando..." : "Guardar Resultados"}
                </Button>
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalcular
                </Button>
                <Button type="button" variant="ghost" className="w-full">
                  Limpiar Formulario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
