"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wheat, XCircle } from "lucide-react"

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
    setCultivos([...cultivos, { cultivo: "", listado: "", entidad: "", numero: "" }])
  }

  const removeCultivo = (index: number) => {
    if (cultivos.length > 1) {
      setCultivos(cultivos.filter((_, i) => i !== index))
    }
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

  const opcionesCultivos = ["Trigo", "Maíz", "Soja", "Girasol", "Cebada", "Avena"]

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Wheat className="h-5 w-5 text-primary" />
          Otros Cultivos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {cultivos.map((cultivo, index) => {
          const isDisabled = cultivo.cultivo === "no-contiene"

          return (
            <Card key={index} className="bg-background border shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                {/* Header de cada registro */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wheat className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {cultivo.cultivo && <Badge>{cultivo.cultivo}</Badge>}
                  </div>
                  {cultivos.length > 1 && (
                    <Button
                      onClick={() => removeCultivo(index)}
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
                  {/* Tipo de Cultivo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Tipo de Cultivo</Label>
                    <Select value={cultivo.cultivo} onValueChange={(val) => updateCultivo(index, "cultivo", val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar cultivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trigo">Trigo</SelectItem>
                        <SelectItem value="maiz">Maíz</SelectItem>
                        <SelectItem value="soja">Soja</SelectItem>
                        <SelectItem value="girasol">Girasol</SelectItem>
                        <SelectItem value="cebada">Cebada</SelectItem>
                        <SelectItem value="avena">Avena</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
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
                      value={cultivo.listado}
                      onValueChange={(val) => updateCultivo(index, "listado", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
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

                  {/* Entidad */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      INIA / INASE
                    </Label>
                    <Select
                      value={cultivo.entidad}
                      onValueChange={(val) => updateCultivo(index, "entidad", val)}
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
                      placeholder="Ej: 789"
                      value={cultivo.numero}
                      onChange={(e) => updateCultivo(index, "numero", e.target.value)}
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
            onClick={addCultivo}
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
