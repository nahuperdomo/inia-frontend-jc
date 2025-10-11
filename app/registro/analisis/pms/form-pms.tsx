"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Scale,
  Hash,
  Layers,
  CheckCircle,
  Info,
  BarChart3,
} from "lucide-react"

type Props = {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

// Función para validar número de repeticiones
const validarNumeroRepeticiones = (numero: number): boolean => {
  return numero != null && numero > 0 && numero <= 20; // Límite razonable
}

// Función para validar semilla brozosa (opcional)
const validarSemillaBrozosa = (): boolean => {
  return true; // Campo opcional, siempre válido
}

export default function PmsFields({ formData, handleInputChange }: Props) {
  const data = formData || {}
  
  // Validaciones
  const repeticionesValidas = validarNumeroRepeticiones(data.numRepeticionesEsperadas)
  const semillaBrozosaValida = validarSemillaBrozosa()
  
  const esFormularioValido = repeticionesValidas && semillaBrozosaValida

  // Calcular el número de tandas - siempre inicia con 1 tanda
  React.useEffect(() => {
    if (data.numTandas !== 1) {
      handleInputChange("numTandas", 1)
    }
  }, [data.numRepeticionesEsperadas, data.esSemillaBrozosa])

  // Establecer valores por defecto
  React.useEffect(() => {
    if (data.numRepeticionesEsperadas === undefined) {
      handleInputChange("numRepeticionesEsperadas", 8) // Valor típico para PMS
    }
    if (data.esSemillaBrozosa === undefined) {
      handleInputChange("esSemillaBrozosa", false)
    }
  }, [])

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Scale className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Análisis de Peso de Mil Semillas (PMS)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los parámetros para el análisis de peso de mil semillas
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Configuración de repeticiones */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Configuración de Repeticiones</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="numRepeticionesEsperadas" className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Número de Repeticiones Esperadas *
              </Label>
              <Input
                id="numRepeticionesEsperadas"
                type="number"
                min="1"
                max="20"
                value={data.numRepeticionesEsperadas || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  handleInputChange("numRepeticionesEsperadas", Math.min(20, Math.max(1, value)))
                }}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                  !repeticionesValidas ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!repeticionesValidas && (
                <p className="text-xs text-red-600">
                  Debe especificar un número válido de repeticiones (1-20)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Controla cuántas repeticiones se podrán crear para este análisis
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numTandas" className="text-sm font-medium flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Número de Tandas (Inicial)
              </Label>
              <Input
                id="numTandas"
                type="number"
                value={1}
                className="h-11 bg-gray-50 cursor-not-allowed"
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Siempre inicia con 1 tanda. Se agregarán automáticamente más tandas si es necesario.
              </p>
            </div>
          </div>
        </div>

        {/* Configuración de tipo de semilla */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Tipo de Semilla</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="esSemillaBrozosa"
                checked={data.esSemillaBrozosa || false}
                onCheckedChange={(checked) => handleInputChange("esSemillaBrozosa", checked)}
                className="h-5 w-5"
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="esSemillaBrozosa" 
                  className="text-sm font-medium cursor-pointer"
                >
                  ¿Es semilla brozosa?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Marca esta opción si la semilla contiene material extraño que requiere procesamiento adicional
                </p>
              </div>
            </div>
            
            <Card className={`border-2 ${data.esSemillaBrozosa ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    data.esSemillaBrozosa ? 'bg-orange-200' : 'bg-green-200'
                  }`}>
                    {data.esSemillaBrozosa ? (
                      <Layers className="h-4 w-4 text-orange-700" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium mb-2 ${
                      data.esSemillaBrozosa ? 'text-orange-900' : 'text-green-900'
                    }`}>
                      {data.esSemillaBrozosa ? 'Semilla Brozosa Detectada' : 'Semilla Normal'}
                    </h4>
                    <div className={`space-y-1 text-sm ${
                      data.esSemillaBrozosa ? 'text-orange-800' : 'text-green-800'
                    }`}>
                      {data.esSemillaBrozosa ? (
                        <>
                          <p>• Umbral de coeficiente de variación: <strong>≤ 6%</strong></p>
                          <p>• Se requiere separación de material extraño antes del pesado</p>
                          <p>• El análisis puede requerir tiempo adicional</p>
                        </>
                      ) : (
                        <>
                          <p>• Umbral de coeficiente de variación: <strong>≤ 4%</strong></p>
                          <p>• Procedimiento estándar de pesado directo</p>
                          <p>• Análisis con tiempo normal de procesamiento</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Información de resumen */}
        <Card className={`border-2 ${esFormularioValido ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                esFormularioValido ? 'bg-blue-200' : 'bg-red-200'
              }`}>
                <Scale className={`h-4 w-4 ${esFormularioValido ? 'text-blue-700' : 'text-red-700'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium mb-2 ${
                  esFormularioValido ? 'text-blue-900' : 'text-red-900'
                }`}>
                  {esFormularioValido ? 'Configuración de PMS Lista' : 'Configuración Incompleta'}
                </h4>
                <div className={`space-y-1 text-sm ${
                  esFormularioValido ? 'text-blue-800' : 'text-red-800'
                }`}>
                  <p>• Se crearán <strong>{data.numRepeticionesEsperadas || 0} repeticiones</strong></p>
                  <p>• Iniciará con <strong>1 tanda</strong></p>
                  <p>• Tipo de semilla: <strong>{data.esSemillaBrozosa ? 'Brozosa' : 'Normal'}</strong></p>
                  <p>• Umbral CV: <strong>{data.esSemillaBrozosa ? '≤ 6%' : '≤ 4%'}</strong></p>
                  {!esFormularioValido && (
                    <p className="font-medium">Por favor, corrige la configuración antes de crear el análisis</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional sobre el proceso */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <Info className="h-4 w-4 text-gray-700" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-2 text-gray-900">
                  Información del Proceso PMS
                </h4>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>• <strong>Objetivo:</strong> Determinar el peso promedio de 1000 semillas</p>
                  <p>• <strong>Método:</strong> Se pesan repeticiones de grupos de semillas</p>
                  <p>• <strong>Resultado:</strong> Se calcula automáticamente el promedio, desviación estándar y coeficiente de variación</p>
                  <p>• <strong>Criterio:</strong> El coeficiente de variación debe ser ≤ 4% para ser válido</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}