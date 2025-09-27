"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Calculator, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"

interface RepGerm {
  id: string
  numRep: number
  numSemillasPRep: number
  normales: number[]
  totalNormales: number
  totalAnormales: number
  totalNoGerminadas: number
  promedioGerminacion: number
}

interface TablaGerm {
  id: string
  numeroTabla: number
  finalizada: boolean
  temperatura: string
  humedad: string
  sustrato: string
  repeticiones: RepGerm[]
}

interface CalculationResult {
  tableId: string
  repetitionId: string
  totalNormales: number
  promedioGerminacion: number
  isValid: boolean
  errors: string[]
}

interface TableSummary {
  tableId: string
  numeroTabla: number
  totalRepeticiones: number
  promedioGeneral: number
  desviacionEstandar: number
  coeficienteVariacion: number
  isComplete: boolean
}

interface CalculationEngineProps {
  tables: TablaGerm[]
  onCalculationsComplete?: (results: CalculationResult[], summaries: TableSummary[]) => void
  onUpdateRepetitions?: (tableId: string, repetitions: RepGerm[]) => void
}

export function CalculationEngine({ tables, onCalculationsComplete, onUpdateRepetitions }: CalculationEngineProps) {
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([])
  const [tableSummaries, setTableSummaries] = useState<TableSummary[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationsPerformed, setCalculationsPerformed] = useState(false)

  // Función para calcular totales y promedios de una repetición
  const calculateRepetition = (rep: RepGerm): CalculationResult => {
    const errors: string[] = []

    // Validar que los conteos sean cumulativos
    for (let i = 1; i < rep.normales.length; i++) {
      if (rep.normales[i] < rep.normales[i - 1]) {
        errors.push(`Conteo ${i + 1} es menor que el anterior`)
      }
    }

    // Calcular total de normales (último conteo)
    const totalNormales = rep.normales[rep.normales.length - 1] || 0

    // Validar que el total no exceda las semillas por repetición
    const totalContabilizado = totalNormales + rep.totalAnormales + rep.totalNoGerminadas
    if (totalContabilizado > rep.numSemillasPRep) {
      errors.push(`Total contabilizado (${totalContabilizado}) excede semillas por repetición (${rep.numSemillasPRep})`)
    }

    // Calcular promedio de germinación
    const promedioGerminacion =
      rep.numSemillasPRep > 0
        ? Math.round((totalNormales / rep.numSemillasPRep) * 100 * 100) / 100 // Redondear a 2 decimales
        : 0

    return {
      tableId: "", // Se asignará desde el contexto
      repetitionId: rep.id,
      totalNormales,
      promedioGerminacion,
      isValid: errors.length === 0,
      errors,
    }
  }

  // Función para calcular estadísticas de una tabla
  const calculateTableSummary = (table: TablaGerm): TableSummary => {
    const promedios = table.repeticiones
      .map((rep) => {
        const result = calculateRepetition(rep)
        return result.promedioGerminacion
      })
      .filter((p) => p > 0) // Solo considerar repeticiones con datos

    const promedioGeneral = promedios.length > 0 ? promedios.reduce((sum, p) => sum + p, 0) / promedios.length : 0

    // Calcular desviación estándar
    const desviacionEstandar =
      promedios.length > 1
        ? Math.sqrt(promedios.reduce((sum, p) => sum + Math.pow(p - promedioGeneral, 2), 0) / (promedios.length - 1))
        : 0

    // Calcular coeficiente de variación
    const coeficienteVariacion = promedioGeneral > 0 ? (desviacionEstandar / promedioGeneral) * 100 : 0

    const isComplete = table.repeticiones.every(
      (rep) =>
        rep.normales.some((n) => n > 0) &&
        rep.totalAnormales + rep.totalNoGerminadas + rep.normales[rep.normales.length - 1] === rep.numSemillasPRep,
    )

    return {
      tableId: table.id,
      numeroTabla: table.numeroTabla,
      totalRepeticiones: table.repeticiones.length,
      promedioGeneral: Math.round(promedioGeneral * 100) / 100,
      desviacionEstandar: Math.round(desviacionEstandar * 100) / 100,
      coeficienteVariacion: Math.round(coeficienteVariacion * 100) / 100,
      isComplete,
    }
  }

  // Función principal para ejecutar todos los cálculos
  const performCalculations = async () => {
    setIsCalculating(true)

    try {
      const allResults: CalculationResult[] = []
      const allSummaries: TableSummary[] = []
      const updatedTables: TablaGerm[] = []

      for (const table of tables) {
        // Calcular cada repetición
        const updatedRepetitions = table.repeticiones.map((rep) => {
          const result = calculateRepetition(rep)
          result.tableId = table.id
          allResults.push(result)

          // Actualizar la repetición con los valores calculados
          return {
            ...rep,
            totalNormales: result.totalNormales,
            promedioGerminacion: result.promedioGerminacion,
          }
        })

        // Crear tabla actualizada
        const updatedTable = {
          ...table,
          repeticiones: updatedRepetitions,
        }
        updatedTables.push(updatedTable)

        // Calcular resumen de la tabla
        const summary = calculateTableSummary(updatedTable)
        allSummaries.push(summary)

        // Notificar actualización de repeticiones
        onUpdateRepetitions?.(table.id, updatedRepetitions)
      }

      setCalculationResults(allResults)
      setTableSummaries(allSummaries)
      setCalculationsPerformed(true)

      // Notificar finalización de cálculos
      onCalculationsComplete?.(allResults, allSummaries)
    } catch (error) {
      console.error("[v0] Error performing calculations:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  // Auto-calcular cuando cambien las tablas
  useEffect(() => {
    if (tables.length > 0) {
      const hasData = tables.some((table) => table.repeticiones.some((rep) => rep.normales.some((n) => n > 0)))

      if (hasData && !calculationsPerformed) {
        performCalculations()
      }
    }
  }, [tables])

  const getOverallProgress = () => {
    if (tableSummaries.length === 0) return 0
    const completeTables = tableSummaries.filter((s) => s.isComplete).length
    return (completeTables / tableSummaries.length) * 100
  }

  const hasErrors = calculationResults.some((r) => !r.isValid)
  const totalErrors = calculationResults.reduce((sum, r) => sum + r.errors.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Motor de Cálculos Automáticos</h3>
          <p className="text-sm text-muted-foreground">Generación automática de totales, promedios y estadísticas</p>
        </div>
        <Button onClick={performCalculations} disabled={isCalculating || tables.length === 0}>
          <Calculator className="h-4 w-4 mr-2" />
          {isCalculating ? "Calculando..." : "Recalcular"}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progreso General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tablas Completas</span>
                <span>{Math.round(getOverallProgress())}%</span>
              </div>
              <Progress value={getOverallProgress()} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{tables.length}</div>
                <div className="text-sm text-muted-foreground">Total Tablas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tableSummaries.filter((s) => s.isComplete).length}
                </div>
                <div className="text-sm text-muted-foreground">Completas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalErrors}</div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{calculationResults.filter((r) => r.isValid).length}</div>
                <div className="text-sm text-muted-foreground">Cálculos Válidos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors Alert */}
      {hasErrors && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Se encontraron {totalErrors} errores en los cálculos. Revisa los datos ingresados.
          </AlertDescription>
        </Alert>
      )}

      {/* Table Summaries */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold">Resumen por Tabla</h4>

        {tableSummaries.map((summary) => {
          const table = tables.find((t) => t.id === summary.tableId)
          if (!table) return null

          return (
            <Card key={summary.tableId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tabla {summary.numeroTabla}</CardTitle>
                  <Badge variant={summary.isComplete ? "default" : "outline"}>
                    {summary.isComplete ? "Completa" : "Incompleta"}
                  </Badge>
                </div>
                <CardDescription>
                  {table.temperatura} • {table.humedad} • {table.sustrato.replace("-", " ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">{summary.promedioGeneral}%</div>
                    <div className="text-sm text-muted-foreground">Promedio General</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{summary.desviacionEstandar}</div>
                    <div className="text-sm text-muted-foreground">Desv. Estándar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{summary.coeficienteVariacion}%</div>
                    <div className="text-sm text-muted-foreground">Coef. Variación</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{summary.totalRepeticiones}</div>
                    <div className="text-sm text-muted-foreground">Repeticiones</div>
                  </div>
                </div>

                {/* Repetitions Detail */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rep.</TableHead>
                        <TableHead>Semillas</TableHead>
                        <TableHead>Normales</TableHead>
                        <TableHead>Anormales</TableHead>
                        <TableHead>No Germ.</TableHead>
                        <TableHead>% Germ.</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {table.repeticiones.map((rep) => {
                        const result = calculationResults.find((r) => r.repetitionId === rep.id)
                        const hasErrors = result && !result.isValid

                        return (
                          <TableRow key={rep.id} className={hasErrors ? "bg-red-50" : ""}>
                            <TableCell className="font-medium">{rep.numRep}</TableCell>
                            <TableCell>{rep.numSemillasPRep}</TableCell>
                            <TableCell>{result?.totalNormales || rep.totalNormales}</TableCell>
                            <TableCell>{rep.totalAnormales}</TableCell>
                            <TableCell>{rep.totalNoGerminadas}</TableCell>
                            <TableCell className="font-medium">
                              {result?.promedioGerminacion || rep.promedioGerminacion}%
                            </TableCell>
                            <TableCell>
                              {hasErrors ? (
                                <Badge variant="destructive">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              ) : result?.totalNormales > 0 ? (
                                <Badge variant="secondary">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Calculado
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pendiente</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Errors for this table */}
                {calculationResults
                  .filter((r) => r.tableId === summary.tableId && !r.isValid)
                  .map((result) => (
                    <Alert key={result.repetitionId} className="mt-4 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>
                          Repetición {table.repeticiones.find((r) => r.id === result.repetitionId)?.numRep}:
                        </strong>
                        <ul className="list-disc list-inside mt-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Calculation Status */}
      <Card className={calculationsPerformed ? "bg-green-50 border-green-200" : "bg-gray-50"}>
        <CardHeader>
          <CardTitle className={`text-sm ${calculationsPerformed ? "text-green-800" : "text-gray-700"}`}>
            Estado de los Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent className={`text-sm ${calculationsPerformed ? "text-green-700" : "text-gray-600"}`}>
          {calculationsPerformed ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Cálculos completados automáticamente</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span>Los cálculos se ejecutarán automáticamente cuando ingreses datos</span>
            </div>
          )}

          <ul className="mt-2 space-y-1">
            <li>• Total de normales = último conteo de la secuencia</li>
            <li>• Promedio de germinación = (normales / semillas totales) × 100</li>
            <li>• Validación de secuencias cumulativas</li>
            <li>• Cálculo de estadísticas por tabla (promedio, desviación, CV)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
