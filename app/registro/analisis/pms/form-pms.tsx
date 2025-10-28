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
  return numero != null && numero >= 4 && numero <= 20; // Mínimo 4, máximo 20
}

// Función para validar semilla brozosa (opcional)
const validarSemillaBrozosa = (): boolean => {
  return true; // Campo opcional, siempre válido
}

export default function PmsFields({ formData, handleInputChange }: Props) {
  const data = formData || {}
  
  // Validaciones
  // Usar el mismo nombre de campo que el formulario padre (`numRepeticionesEsperadasPms`)
  const repeticionesValidas = validarNumeroRepeticiones(data.numRepeticionesEsperadasPms)
  const semillaBrozosaValida = validarSemillaBrozosa()
  
  const esFormularioValido = repeticionesValidas && semillaBrozosaValida

  // Establecer valores por defecto SOLO UNA VEZ al montar el componente
  React.useEffect(() => {
    if (data.numTandas !== 1) {
      handleInputChange("numTandas", 1)
    }
    if (data.esSemillaBrozosa === undefined || data.esSemillaBrozosa === null) {
      handleInputChange("esSemillaBrozosa", false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vacío = solo se ejecuta una vez al montar

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
                id="numRepeticionesEsperadasPms"
                type="number"
                min="4"
                max="20"
                value={data.numRepeticionesEsperadasPms || ""}
                onChange={(e) => {
                  // parseInt puede devolver NaN cuando el campo está vacío; en ese caso no sobrescribimos con 4 aquí
                  const raw = e.target.value
                  const parsed = parseInt(raw, 10)
                  const value = Number.isNaN(parsed) ? raw === "" ? "" : 4 : parsed
                  // Solo enviar números válidos al estado padre; el padre mantiene el estado completo
                  if (value === "") {
                    handleInputChange("numRepeticionesEsperadasPms", undefined)
                  } else {
                    handleInputChange("numRepeticionesEsperadasPms", Math.min(20, Math.max(4, Number(value))))
                  }
                }}
                className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-200 ${
                  !repeticionesValidas ? 'border-red-500 bg-red-50' : ''
                }`}
                required
              />
              {!repeticionesValidas && (
                <p className="text-xs text-red-600">
                  Debe especificar un número válido de repeticiones (4-20)
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
            <div className="p-4 border border-orange-300 rounded-lg">
              <div className="flex items-start space-x-4">
                <Checkbox
                  id="esSemillaBrozosa"
                  checked={data.esSemillaBrozosa || false}
                  onCheckedChange={(checked) => handleInputChange("esSemillaBrozosa", checked)}
                  className="h-6 w-6 mt-1"
                />
                <div className="space-y-2 flex-1">
                  <Label 
                    htmlFor="esSemillaBrozosa" 
                    className="text-base font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Info className="h-5 w-5" />
                    ¿Es semilla brozosa?
                  </Label>
                  <p className="text-sm text-orange-700">
                    Marca esta opción si la semilla es brozosa.
                    Esto afecta el umbral del coeficiente de variación permitido (6% vs 4%).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de resumen */}
        <Card className={`border ${esFormularioValido ? 'border-blue-300' : 'border-red-300'}`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                esFormularioValido ? 'border-blue-300' : 'border-red-300'
              }`}>
                <Scale className={`h-4 w-4 ${esFormularioValido ? 'text-blue-600' : 'text-red-600'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-medium mb-2 ${
                  esFormularioValido ? 'text-blue-900' : 'text-red-900'
                }`}>
                  {esFormularioValido ? 'Configuración de PMS Lista' : 'Configuración Incompleta'}
                </h4>
                <div className={`space-y-1 text-sm ${
                  esFormularioValido ? 'text-blue-700' : 'text-red-700'
                }`}>
                  <p>• Se crearán <strong>{data.numRepeticionesEsperadasPms || 0} repeticiones</strong></p>
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

      </CardContent>
    </Card>
  )
}
