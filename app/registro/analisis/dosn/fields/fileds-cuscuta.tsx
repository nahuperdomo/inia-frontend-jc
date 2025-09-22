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
    if (field === "cumple" && value === "no-contiene") {
      setData({ gramos: "", numero: "", cumple: "no-contiene" })
    } else {
      setData({ ...data, [field]: value })
    }
  }

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl">
          Determinación de Cuscuta spp.
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* (g) */}
          <div>
            <Label className="text-sm sm:text-base">(g)</Label>
            <Input
              className="text-sm sm:text-base"
              placeholder="Ej: 5"
              type="number"
              value={data.gramos}
              onChange={(e) => updateField("gramos", e.target.value)}
              disabled={data.cumple === "no-contiene"}
            />
          </div>

          {/* N° */}
          <div>
            <Label className="text-sm sm:text-base">N°</Label>
            <Input
              className="text-sm sm:text-base"
              placeholder="Ej: 789"
              value={data.numero}
              onChange={(e) => updateField("numero", e.target.value)}
              disabled={data.cumple === "no-contiene"}
            />
          </div>

          {/* ¿Cumple con el estándar? */}
          <div>
            <Label className="text-sm sm:text-base">¿Cumple con el estándar?</Label>
            <Select
              value={data.cumple}
              onValueChange={(val) => updateField("cumple", val)}
            >
              <SelectTrigger className="text-sm sm:text-base">
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
