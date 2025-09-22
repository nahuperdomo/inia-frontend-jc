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
      <CardHeader>
        <CardTitle className="text-blue-800">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {malezas.map((maleza, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            {/* Tipo de maleza */}
            <div>
              <Label>Tipo de Maleza</Label>
              <Select
                value={maleza.tipoMaleza}
                onValueChange={(val) => updateMaleza(index, "tipoMaleza", val)}
              >
                <SelectTrigger>
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
              <Label>Listado</Label>
              <Input
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
              <Label>INIA / INASE</Label>
              <Select
                value={maleza.entidad}
                onValueChange={(val) => updateMaleza(index, "entidad", val)}
                disabled={maleza.tipoMaleza === "no-contiene"}
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
            className="border-blue-600 text-blue-600 hover:bg-blue-700"
          >
            + Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
