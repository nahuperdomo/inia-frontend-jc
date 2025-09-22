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
    { estado: "", listado: "", entidad: "", numero: "" },
  ])

  const addBrassica = () => {
    setBrassicas([
      ...brassicas,
      { estado: "", listado: "", entidad: "", numero: "" },
    ])
  }

  const updateBrassica = (index: number, field: keyof Brassica, value: string) => {
    const updated = [...brassicas]

    if (field === "estado" && value === "no-contiene") {
      updated[index] = { estado: "no-contiene", listado: "", entidad: "", numero: "" }
    } else {
      updated[index][field] = value
    }

    setBrassicas(updated)
  }

  // Opciones de ejemplo para listado
  const opcionesBrassicas = [
    "Brassica napus (Colza)",
    "Brassica rapa (Nabo)",
    "Brassica juncea (Mostaza parda)",
    "Brassica oleracea (Col)",
  ]

  return (
    <Card className="border-blue-200 bg-gray-50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl">
          Determinación de Brassica spp.
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {brassicas.map((brassica, index) => (
          <div
            key={index}
            className="border rounded-md p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {/* Estado */}
            <div>
              <Label className="text-sm sm:text-base">Estado</Label>
              <Select
                value={brassica.estado}
                onValueChange={(val) => updateBrassica(index, "estado", val)}
              >
                <SelectTrigger className="w-full h-10 px-3 text-sm sm:text-base">
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
              <Label className="text-sm sm:text-base">Listado</Label>
              <Select
                value={brassica.listado}
                onValueChange={(val) => updateBrassica(index, "listado", val)}
                disabled={brassica.estado === "no-contiene"}
              >
                <SelectTrigger className="w-full h-10 px-3 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar especie" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesBrassicas.map((opcion) => (
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
                value={brassica.entidad}
                onValueChange={(val) => updateBrassica(index, "entidad", val)}
                disabled={brassica.estado === "no-contiene"}
              >
                <SelectTrigger className="w-full h-10 px-3 text-sm sm:text-base">
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
                className="w-full h-10 px-3 text-sm sm:text-base"
                placeholder="Ej: 456"
                value={brassica.numero}
                onChange={(e) => updateBrassica(index, "numero", e.target.value)}
                disabled={brassica.estado === "no-contiene"}
              />
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button
            onClick={addBrassica}
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
