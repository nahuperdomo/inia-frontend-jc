"use client"

import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle2, XCircle } from "lucide-react"
import { usePersistentForm } from "@/lib/hooks/use-form-persistence"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export default function CumplimientoEstandar({ formData, handleInputChange }: Props) {
  // ✅ Persistir el campo cumpleEstandar
  const { formState: persistedData, updateField } = usePersistentForm<{ cumpleEstandar: string }>({
    storageKey: "dosn-cumple-estandar",
    initialData: {
      cumpleEstandar: formData.cumpleEstandar || "",
    }
  })

  const cumpleEstandar = formData.cumpleEstandar || persistedData.cumpleEstandar

  // Sincronizar con persistencia
  useEffect(() => {
    updateField("cumpleEstandar", cumpleEstandar)
  }, [cumpleEstandar])

  const handleChange = (value: string) => {
    handleInputChange("cumpleEstandar", value)
    updateField("cumpleEstandar", value)
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Cumplimiento del Estándar
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado de cumplimiento</Label>
            <Select
              value={cumpleEstandar}
              onValueChange={handleChange}
            >
              <SelectTrigger className="w-full h-11 border rounded-md shadow-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Cumple con el estándar
                  </div>
                </SelectItem>
                <SelectItem value="no">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    No cumple con el estándar
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mensaje dinámico */}
        {formData.cumpleEstandar && (
          <div
            className={`mt-4 rounded-lg border p-4 transition-colors ${formData.cumpleEstandar === "si"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
              }`}
          >
            <div
              className={`flex items-center gap-2 ${formData.cumpleEstandar === "si"
                ? "text-emerald-800"
                : "text-red-800"
                }`}
            >
              {formData.cumpleEstandar === "si" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <p className="text-sm font-medium">
                {formData.cumpleEstandar === "si"
                  ? "La muestra cumple con todos los estándares requeridos."
                  : "La muestra no cumple con los estándares establecidos."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
