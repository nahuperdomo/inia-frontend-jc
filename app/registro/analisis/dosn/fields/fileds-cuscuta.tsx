"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function CuscutaSection() {
  const [data, setData] = useState({
    gramos: "",
    numero: "",
    cumple: "no-contiene",
  })

  const updateField = (field: keyof typeof data, value: string) => {
    // Si selecciona "no-contiene", limpiamos los demás
    if (field === "cumple" && value === "no-contiene") {
      setData({ gramos: "", numero: "", cumple: "no-contiene" })
    } else {
      setData({ ...data, [field]: value })
    }
  }

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Determinación de Cuscuta spp.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* (g) */}
          <div>
            <Label>(g)</Label>
            <Input
              placeholder="Ej: 5"
              type="number"
              value={data.gramos}
              onChange={(e) => updateField("gramos", e.target.value)}
              disabled={data.cumple === "no-contiene"}
            />
          </div>

          {/* N° */}
          <div>
            <Label>N°</Label>
            <Input
              placeholder="Ej: 789"
              value={data.numero}
              onChange={(e) => updateField("numero", e.target.value)}
              disabled={data.cumple === "no-contiene"}
            />
          </div>

          {/* ¿Cumple con el estándar? */}
          <div>
            <Label>¿Cumple con el estándar?</Label>
            <Select
              value={data.cumple}
              onValueChange={(val) => updateField("cumple", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="si">Sí</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="no-contiene">No contiene</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
