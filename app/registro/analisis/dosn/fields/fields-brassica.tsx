"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Sprout, XCircle } from "lucide-react"

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
    setBrassicas([...brassicas, { estado: "", listado: "", entidad: "", numero: "" }])
  }

  const removeBrassica = (index: number) => {
    if (brassicas.length > 1) {
      setBrassicas(brassicas.filter((_, i) => i !== index))
    }
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

  const opcionesBrassicas = [
    "Brassica napus (Colza)",
    "Brassica rapa (Nabo)",
    "Brassica juncea (Mostaza parda)",
    "Brassica oleracea (Col)",
  ]

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          Determinación de Brassica spp.
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {brassicas.map((brassica, index) => {
          const isDisabled = brassica.estado === "no-contiene"

          return (
            <Card key={index} className="bg-background border shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                {/* Header de cada registro */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {brassica.estado && <Badge>{brassica.estado}</Badge>}
                  </div>
                  {brassicas.length > 1 && (
                    <Button
                      onClick={() => removeBrassica(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Estado</Label>
                    <Select value={brassica.estado} onValueChange={(val) => updateBrassica(index, "estado", val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contiene">Contiene</SelectItem>
                        <SelectItem value="no-contiene">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-slate-500" />
                            No contiene
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listado */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Listado
                    </Label>
                    <Select
                      value={brassica.listado}
                      onValueChange={(val) => updateBrassica(index, "listado", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      INIA / INASE
                    </Label>
                    <Select
                      value={brassica.entidad}
                      onValueChange={(val) => updateBrassica(index, "entidad", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar entidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inia">INIA</SelectItem>
                        <SelectItem value="inase">INASE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Número
                    </Label>
                    <Input
                      className="w-full"
                      placeholder="Ej: 456"
                      value={brassica.numero}
                      onChange={(e) => updateBrassica(index, "numero", e.target.value)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            onClick={addBrassica}
            variant="outline"
            className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors bg-transparent 
               text-sm px-2 py-1 [@media(max-width:350px)]:text-xs [@media(max-width:350px)]:px-1"
          >
            <Plus className="h-3 w-3 mr-1 [@media(max-width:350px)]:h-2.5 [@media(max-width:350px)]:w-2.5" />
            Agregar registro
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
