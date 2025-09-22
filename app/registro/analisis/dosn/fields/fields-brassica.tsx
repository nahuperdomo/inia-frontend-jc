"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type Brassica = {
  estado: string
  listado: string
  entidad: string
  numero: string
}

export default function BrassicaSection() {
  const [brassicas, setBrassicas] = useState<Brassica[]>([
    { estado: "no-contiene", listado: "", entidad: "", numero: "" },
  ])

  const addBrassica = () => {
    setBrassicas([
      ...brassicas,
      { estado: "no-contiene", listado: "", entidad: "", numero: "" },
    ])
  }

  const updateBrassica = (index: number, field: keyof Brassica, value: string) => {
    const updated = [...brassicas]

    // Si eligen "no-contiene", limpiamos todo lo demás
    if (field === "estado" && value === "no-contiene") {
      updated[index] = { estado: "no-contiene", listado: "", entidad: "", numero: "" }
    } else {
      updated[index][field] = value
    }

    setBrassicas(updated)
  }

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Determinación de Brassica spp.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {brassicas.map((brassica, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            {/* Estado: contiene / no contiene */}
            <div>
              <Label>Estado</Label>
              <Select
                value={brassica.estado}
                onValueChange={(val) => updateBrassica(index, "estado", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contiene">Contiene</SelectItem>
                  <SelectItem value="no-contiene">No contiene</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listado */}
            <div>
              <Label>Listado</Label>
              <Input
                placeholder="Escribir especie..."
                value={brassica.listado}
                onChange={(e) =>
                  updateBrassica(index, "listado", e.target.value)
                }
                disabled={brassica.estado === "no-contiene"}
              />
            </div>

            {/* INIA / INASE */}
            <div>
              <Label>INIA / INASE</Label>
              <Select
                value={brassica.entidad}
                onValueChange={(val) => updateBrassica(index, "entidad", val)}
                disabled={brassica.estado === "no-contiene"}
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
                placeholder="Ej: 456"
                value={brassica.numero}
                onChange={(e) =>
                  updateBrassica(index, "numero", e.target.value)
                }
                disabled={brassica.estado === "no-contiene"}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            onClick={addBrassica}
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
