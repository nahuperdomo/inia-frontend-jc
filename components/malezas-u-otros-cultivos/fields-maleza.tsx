"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Maleza = {
  tipoMaleza: string
  listado: string
  entidad: string
  numero: string
}

type Props = {
  titulo: string
}

export default function MalezaFields({ titulo }: Props) {
  const [malezas, setMalezas] = useState<Maleza[]>([
    { tipoMaleza: "", listado: "", entidad: "", numero: "" },
  ])

  const addMaleza = () => {
    setMalezas([
      ...malezas,
      { tipoMaleza: "", listado: "", entidad: "", numero: "" },
    ])
  }

  const updateMaleza = (index: number, field: keyof Maleza, value: string) => {
    const updated = [...malezas]
    updated[index][field] = value
    setMalezas(updated)
  }

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl">
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {malezas.map((maleza, index) => (
          <div
            key={index}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end"
          >
            {/* Tipo de maleza */}
            <div>
              <Label className="text-sm sm:text-base">Tipo de Maleza</Label>
              <Select
                value={maleza.tipoMaleza}
                onValueChange={(val) => updateMaleza(index, "tipoMaleza", val)}
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tolerancia-cero">Tolerancia cero</SelectItem>
                  <SelectItem value="comunes">Comunes</SelectItem>
                  <SelectItem value="con-tolerancia">Con tolerancia</SelectItem>
                  <SelectItem value="no-contiene">No contiene</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listado */}
            <div>
              <Label className="text-sm sm:text-base">Listado</Label>
              <Input
                className="text-sm sm:text-base"
                placeholder="Escribir o seleccionar..."
                value={maleza.listado}
                onChange={(e) =>
                  updateMaleza(index, "listado", e.target.value)
                }
                disabled={maleza.tipoMaleza === "no-contiene"}
              />
            </div>

            {/* INIA / INASE */}
            <div>
              <Label className="text-sm sm:text-base">INIA / INASE</Label>
              <Select
                value={maleza.entidad}
                onValueChange={(val) => updateMaleza(index, "entidad", val)}
                disabled={maleza.tipoMaleza === "no-contiene"}
              >
                <SelectTrigger className="text-sm sm:text-base">
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
                className="text-sm sm:text-base"
                placeholder="Ej: 123"
                value={maleza.numero}
                onChange={(e) =>
                  updateMaleza(index, "numero", e.target.value)
                }
                disabled={maleza.tipoMaleza === "no-contiene"}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            onClick={addMaleza}
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
