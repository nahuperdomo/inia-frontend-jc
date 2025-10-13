"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, CheckCircle2, XCircle } from "lucide-react"
import { usePersistentForm } from "@/lib/hooks/use-form-persistence"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

type CuscutaData = {
  gramos: string
  numero: string
  cumple: string
}

export default function CuscutaSection({ formData, handleInputChange }: Props) {
  // ✅ Persistir datos de Cuscuta
  const { formState: persistedData, updateField } = usePersistentForm<CuscutaData>({
    storageKey: "dosn-cuscuta",
    initialData: {
      gramos: formData.cuscutaGramos || "",
      numero: formData.cuscutaNumero || "",
      cumple: formData.cuscutaCumple || "",
    }
  })

  const data = {
    gramos: formData.cuscutaGramos || persistedData.gramos,
    numero: formData.cuscutaNumero || persistedData.numero,
    cumple: formData.cuscutaCumple || persistedData.cumple,
  }

  // Sincronizar con persistencia
  useEffect(() => {
    updateField("gramos", data.gramos)
    updateField("numero", data.numero)
    updateField("cumple", data.cumple)
  }, [data.gramos, data.numero, data.cumple])

  const updateFieldValue = (field: string, value: string) => {
    const fieldMap: { [key: string]: string } = {
      gramos: "cuscutaGramos",
      numero: "cuscutaNumero",
      cumple: "cuscutaCumple"
    }

    // Make 'contiene / no contiene' behave like Brassica: values 'si'|'no'
    if (field === "cumple" && value === "no") {
      handleInputChange("cuscutaGramos", "")
      handleInputChange("cuscutaNumero", "")
      handleInputChange("cuscutaCumple", "no")
      updateField("gramos", "")
      updateField("numero", "")
      updateField("cumple", "no")
    } else {
      handleInputChange(fieldMap[field], value)
      updateField(field as keyof CuscutaData, value)
    }
  }

  const getBadge = () => {
    // Match Brassica badge style: 'Contiene' (si) purple, 'No contiene' (no) gray
    switch (data.cumple) {
      case "si":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">Contiene</Badge>
        )
      case "no":
        return <Badge className="bg-gray-100 text-gray-700">No contiene</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-semibold text-foreground">
            Determinación de Cuscuta spp.
          </CardTitle>
        </div>
        {getBadge()}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Contiene o no contiene */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">¿Contiene Cuscuta?</Label>
            <Select value={data.cumple} onValueChange={(val) => updateFieldValue("cumple", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si">Sí, contiene</SelectItem>
                <SelectItem value="no">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-slate-500" />
                    No contiene
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Peso en gramos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Peso (g)</Label>
            <Input
              type="number"
              placeholder="Ej: 5.5"
              step="0.01"
              value={data.gramos}
              onChange={(e) => updateFieldValue("gramos", e.target.value)}
              disabled={data.cumple === "no"}
              className="w-full"
            />
          </div>

          {/* Número de semillas */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Número de semillas</Label>
            <Input
              type="number"
              placeholder="Ej: 789"
              value={data.numero}
              onChange={(e) => updateFieldValue("numero", e.target.value)}
              disabled={data.cumple === "no"}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
