"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Cultivo = {
  cultivo: string
  listado: string
  entidad: string
  numero: string
}

export default function OtrosCultivosFields() {
  const [cultivos, setCultivos] = useState<Cultivo[]>([
    { cultivo: "no-contiene", listado: "", entidad: "", numero: "" },
  ])

  const addCultivo = () => {
    setCultivos([
      ...cultivos,
      { cultivo: "no-contiene", listado: "", entidad: "", numero: "" },
    ])
  }

  const updateCultivo = (index: number, field: keyof Cultivo, value: string) => {
    const updated = [...cultivos]

    // Si selecciona "no-contiene", limpiamos los otros valores
    if (field === "cultivo" && value === "no-contiene") {
      updated[index] = { cultivo: "no-contiene", listado: "", entidad: "", numero: "" }
    } else {
      updated[index][field] = value
    }

    setCultivos(updated)
  }

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Otros Cultivos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {cultivos.map((cultivo, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
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
                  <SelectItem value="no-contiene">No contiene</SelectItem>
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
                disabled={cultivo.cultivo === "no-contiene"}
              />
            </div>

            {/* INIA / INASE */}
            <div>
              <Label>INIA / INASE</Label>
              <Select
                value={cultivo.entidad}
                onValueChange={(val) => updateCultivo(index, "entidad", val)}
                disabled={cultivo.cultivo === "no-contiene"}
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
                disabled={cultivo.cultivo === "no-contiene"}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            onClick={addCultivo}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-700"
          >
            + Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
