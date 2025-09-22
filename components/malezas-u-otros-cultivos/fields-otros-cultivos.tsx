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
    { cultivo: "", listado: "", entidad: "", numero: "" },
  ])

  const addCultivo = () => {
    setCultivos([
      ...cultivos,
      { cultivo: "", listado: "", entidad: "", numero: "" },
    ])
  }

  const updateCultivo = (index: number, field: keyof Cultivo, value: string) => {
    const updated = [...cultivos]

    if (field === "cultivo" && value === "no-contiene") {
      updated[index] = { cultivo: "no-contiene", listado: "", entidad: "", numero: "" }
    } else {
      updated[index][field] = value
    }

    setCultivos(updated)
  }

  // Opciones para el desplegable de listado
  const opcionesCultivos = [
    "Trigo",
    "Maíz",
    "Soja",
    "Girasol",
    "Cebada",
    "Avena",
  ]

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl">
          Otros Cultivos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {cultivos.map((cultivo, index) => (
          <div
            key={index}
            className="border rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {/* Seleccionar Cultivo */}
            <div>
              <Label className="text-sm sm:text-base">Tipo de Cultivo</Label>
              <Select
                value={cultivo.cultivo}
                onValueChange={(val) => updateCultivo(index, "cultivo", val)}
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
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
              <Label className="text-sm sm:text-base">Listado</Label>
              <Select
                value={cultivo.listado}
                onValueChange={(val) => updateCultivo(index, "listado", val)}
                disabled={cultivo.cultivo === "no-contiene"}
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar especie" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesCultivos.map((opcion) => (
                    <SelectItem key={opcion} value={opcion}>
                      {opcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* INIA / INASE */}
            <div>
              <Label className="text-sm sm:text-base">INIA / INASE</Label>
              <Select
                value={cultivo.entidad}
                onValueChange={(val) => updateCultivo(index, "entidad", val)}
                disabled={cultivo.cultivo === "no-contiene"}
              >
                <SelectTrigger className="w-full text-sm sm:text-base">
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
              <Label className="text-sm sm:text-base">N°</Label>
              <Input
                className="w-full text-sm sm:text-base"
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
            className="border-blue-600 text-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
          >
            + Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
