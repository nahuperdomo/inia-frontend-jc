"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export default function CuscutaSection({ formData, handleInputChange }: Props) {
  const data = {
    gramos: formData.cuscutaGramos || "",
    numero: formData.cuscutaNumero || "",
    cumple: formData.cuscutaCumple || "",
  }

  const updateField = (field: string, value: string) => {
    const fieldMap: { [key: string]: string } = {
      gramos: "cuscutaGramos",
      numero: "cuscutaNumero",
      cumple: "cuscutaCumple"
    }

    if (field === "cumple" && value === "no-contiene") {
      handleInputChange("cuscutaGramos", "")
      handleInputChange("cuscutaNumero", "")
      handleInputChange("cuscutaCumple", "no-contiene")
    } else {
      handleInputChange(fieldMap[field], value)
    }
  }

  const getBadge = () => {
    switch (data.cumple) {
      case "si":
        return <Badge className="bg-emerald-100 text-emerald-700">Cumple</Badge>
      case "no":
        return <Badge className="bg-red-100 text-red-700">No cumple</Badge>
      case "no-contiene":
        return <Badge className="bg-slate-100 text-slate-700">No contiene</Badge>
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
          {/* Peso en gramos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Peso (g)</Label>
            <Input
              type="number"
              placeholder="Ej: 5.5"
              step="0.01"
              value={data.gramos}
              onChange={(e) => updateField("gramos", e.target.value)}
              disabled={data.cumple === "no-contiene"}
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
              onChange={(e) => updateField("numero", e.target.value)}
              disabled={data.cumple === "no-contiene"}
              className="w-full"
            />
          </div>

          {/* Estado del análisis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Estado del análisis</Label>
            <Select value={data.cumple} onValueChange={(val) => updateField("cumple", val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Cumple
                  </div>
                </SelectItem>
                <SelectItem value="no">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    No cumple
                  </div>
                </SelectItem>
                <SelectItem value="no-contiene">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    No contiene
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
