"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

interface AnalysisSectionProps {
  lot: any
  onCreateAnalysis: (type: string) => void
}

export function AnalysisSection({ lot, onCreateAnalysis }: AnalysisSectionProps) {
  const analysisTypes = [
    { id: "pureza-fisica", name: "Pureza física", color: "blue" },
    { id: "germinacion", name: "Germinación", color: "green" },
    { id: "vigor", name: "Vigor", color: "purple" },
    { id: "tetrazolio", name: "Tetrazolio", color: "red" },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-900",
      green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-900",
      purple: "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-900",
      red: "bg-red-50 border-red-200 hover:bg-red-100 text-red-900",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getTextColor = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      red: "text-red-600",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5" />
          Análisis Asociados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!lot.hasAnalysis ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin análisis asociados</h3>
            <p className="text-gray-500 mb-6">Este lote aún no tiene análisis asociados. Crea uno para comenzar.</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {analysisTypes.map((analysis) => (
                <Button
                  key={analysis.id}
                  variant="outline"
                  className={`h-16 flex flex-col gap-1 ${getColorClasses(analysis.color)}`}
                  onClick={() => onCreateAnalysis(analysis.id)}
                >
                  <span className="font-medium">{analysis.name}</span>
                  <span className={`text-xs ${getTextColor(analysis.color)}`}>Crear análisis</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Análisis Completados</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-green-300 rounded p-3">
                  <span className="font-medium text-green-900">Pureza física</span>
                  <div className="text-xs text-green-600 mt-1">Completado - 15/01/2024</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Análisis Disponibles</h4>
              <div className="grid grid-cols-2 gap-3">
                {analysisTypes.slice(1).map((analysis) => (
                  <Button
                    key={analysis.id}
                    variant="outline"
                    className={`h-16 flex flex-col gap-1 ${getColorClasses(analysis.color)}`}
                    onClick={() => onCreateAnalysis(analysis.id)}
                  >
                    <span className="font-medium">{analysis.name}</span>
                    <span className={`text-xs ${getTextColor(analysis.color)}`}>Crear análisis</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
