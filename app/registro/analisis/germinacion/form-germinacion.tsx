"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  Sprout,
  Info,
} from "lucide-react"

type Props = {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
}

export default function GerminacionFields({ formData, handleInputChange }: Props) {
  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <Sprout className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Análisis de Germinación
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ensayo de germinación estándar
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-sm font-semibold text-blue-900">
                Configuración de Tablas de Germinación
              </h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Después de registrar este análisis, podrás crear y configurar las <strong>tablas de germinación</strong> de forma individual. 
                Cada tabla tendrá sus propias configuraciones de:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>Fechas de inicio y conteos</li>
                <li>Número de repeticiones y conteos</li>
                <li>Prefrío y pretratamiento (opcional)</li>
                <li>Método, temperatura y tratamientos</li>
              </ul>
              <p className="text-sm text-blue-700 leading-relaxed mt-3">
                💡 <strong>Tip:</strong> Esto te permite tener diferentes condiciones experimentales 
                en un mismo análisis de germinación.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-muted/50 rounded-lg p-4 border border-muted">
          <p className="text-sm text-muted-foreground">
            📋 <strong>Nota:</strong> Solo necesitas seleccionar el lote y opcionalmente agregar comentarios 
            para este análisis. La configuración detallada se realiza al crear cada tabla.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
