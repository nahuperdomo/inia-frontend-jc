"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Leaf, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

type Maleza = {
  tipoMaleza: string
  listado: string
  entidad: string
  numero: string
}

type Props = {
  titulo: string
}

const opcionesMalezas = [
  "Cenchrus echinatus",
  "Sorghum halepense",
  "Cyperus rotundus",
  "Amaranthus spp.",
  "Chenopodium album",
]

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

  const removeMaleza = (index: number) => {
    if (malezas.length > 1) {
      setMalezas(malezas.filter((_, i) => i !== index))
    }
  }

  const updateMaleza = (index: number, field: keyof Maleza, value: string) => {
    const updated = [...malezas]
    updated[index][field] = value
    setMalezas(updated)
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          {titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {malezas.map((maleza, index) => {
          const isDisabled = maleza.tipoMaleza === "no-contiene"

          return (
            <Card key={index} className="bg-background border shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {maleza.tipoMaleza && <Badge>{maleza.tipoMaleza}</Badge>}
                  </div>
                  {malezas.length > 1 && (
                    <Button
                      onClick={() => removeMaleza(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo de maleza */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Tipo de Maleza</Label>
                    <Select
                      value={maleza.tipoMaleza}
                      onValueChange={(val) => updateMaleza(index, "tipoMaleza", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tolerancia-cero">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Tolerancia cero
                          </div>
                        </SelectItem>
                        <SelectItem value="comunes">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-amber-500" />
                            Comunes
                          </div>
                        </SelectItem>
                        <SelectItem value="con-tolerancia">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Con tolerancia
                          </div>
                        </SelectItem>
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
                      Especie
                    </Label>
                    <Select
                      value={maleza.listado}
                      onValueChange={(val) => updateMaleza(index, "listado", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar especie" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesMalezas.map((opcion) => (
                          <SelectItem key={opcion} value={opcion}>
                            <span className="italic">{opcion}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* INIA / INASE */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Entidad
                    </Label>
                    <Select
                      value={maleza.entidad}
                      onValueChange={(val) => updateMaleza(index, "entidad", val)}
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
                      placeholder="Ej: 123"
                      value={maleza.numero}
                      onChange={(e) => updateMaleza(index, "numero", e.target.value)}
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
            onClick={addMaleza}
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
