"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

type Cultivo = {
  cultivo: string
  listado: string
  entidad: string
  numero: string
}

export default function OtrosCultivosFields() {
  const [cultivos, setCultivos] = useState<Cultivo[]>([
    { cultivo: "", listado: "", entidad: "", numero: "" },
  ])

  const updateCultivo = (index: number, field: keyof Cultivo, value: string) => {
    const updated = [...cultivos]
    updated[index][field] = value
    setCultivos(updated)
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-purple-800">Otros Cultivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cultivos.map((cultivo, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Seleccionar Cultivo */}
            <div>
              <Label>Tipo de Cultivo</Label>
              <Select
                value={cultivo.cultivo}
                onValueChange={(val) => updateCultivo(index, "cultivo", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cultivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trigo">Trigo</SelectItem>
                  <SelectItem value="maiz">Maíz</SelectItem>
                  <SelectItem value="soja">Soja</SelectItem>
                  <SelectItem value="girasol">Girasol</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listado */}
            <div>
              <Label>Listado</Label>
              <Input
                placeholder="Escribir especie..."
                value={cultivo.listado}
                onChange={(e) => updateCultivo(index, "listado", e.target.value)}
              />
            </div>

            {/* INIA / INASE */}
            <div>
              <Label>INIA / INASE</Label>
              <Select
                value={cultivo.entidad}
                onValueChange={(val) => updateCultivo(index, "entidad", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inia">INIA</SelectItem>
                  <SelectItem value="inase">INASE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* N° */}
            <div>
              <Label>N°</Label>
              <Input
                placeholder="Ej: 789"
                value={cultivo.numero}
                onChange={(e) => updateCultivo(index, "numero", e.target.value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
