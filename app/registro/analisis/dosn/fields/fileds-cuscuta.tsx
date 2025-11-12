"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlaskConical, XCircle, Plus, Trash2 } from "lucide-react"
import { Instituto } from "@/app/models/types/enums"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

type CuscutaRegistro = {
  contiene: "si" | "no" | ""
  instituto: Instituto | ""
  gramos: string
  numero: string
}

export default function CuscutaSection({ formData, handleInputChange }: Props) {
  // NO usar persistencia - los datos solo deben vivir en la sesión actual
  const [registros, setRegistros] = useState<CuscutaRegistro[]>([
    { contiene: "", instituto: "", gramos: "", numero: "" }
  ])

  //  Eliminar sincronización con persistencia
  // Los datos NO deben guardarse en localStorage durante el registro

  // Notificar cambios al padre (enviar array completo)
  useEffect(() => {
    // Filtrar registros válidos:
    // - Si contiene "si" con instituto y datos → enviar
    // - Si NO contiene con instituto → enviar también (para registrar verificación)
    const registrosValidos = registros
      .filter(r => {
        // Si contiene "si" y tiene instituto y algún dato
        if (r.contiene === "si" && r.instituto && (r.gramos || r.numero)) {
          return true;
        }
        // Si NO contiene y tiene instituto (para registrar verificación)
        if (r.contiene === "no" && r.instituto) {
          return true;
        }
        return false;
      })
      .map(r => ({
        instituto: r.instituto,
        cuscuta_g: r.gramos ? parseFloat(r.gramos) : undefined,
        cuscutaNum: r.numero ? parseInt(r.numero) : undefined,
        fechaCuscuta: new Date().toISOString().split('T')[0] // Fecha actual por defecto
      }))
    
    handleInputChange("cuscutaRegistros", registrosValidos)
    
    // Mantener cuscutaCumple para validación
    const tieneNoContiene = registros.some(r => r.contiene === "no")
    const tieneSiContiene = registros.some(r => r.contiene === "si")
    handleInputChange("cuscutaCumple", tieneNoContiene ? "no" : (tieneSiContiene ? "si" : ""))
  }, [registros])

  const addRegistro = () => {
    setRegistros([...registros, { contiene: "", instituto: "", gramos: "", numero: "" }])
  }

  const removeRegistro = (index: number) => {
    if (registros.length > 1) {
      setRegistros(registros.filter((_, i) => i !== index))
    }
  }

  const updateRegistro = (index: number, field: keyof CuscutaRegistro, value: any) => {
    const updated = [...registros]
    if (field === "contiene" && value === "no") {
      // Cuando selecciona "No contiene", limpiar gramos y numero pero MANTENER instituto
      updated[index] = { contiene: "no", instituto: updated[index].instituto, gramos: "", numero: "" }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setRegistros(updated)
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          Determinación de Cuscuta spp.
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {registros.map((registro, index) => {
          const isDisabled = registro.contiene === "no"

          return (
            <Card key={index} className="bg-background border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {registro.contiene && <Badge>{registro.contiene === "si" ? "Contiene" : "No contiene"}</Badge>}
                  </div>
                  {registros.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRegistro(index)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Contiene */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">¿Contiene Cuscuta?</Label>
                    <Select
                      value={registro.contiene}
                      onValueChange={(val) => updateRegistro(index, "contiene", val as "si" | "no")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-slate-500" />
                            No contiene
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Instituto */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Instituto</Label>
                    <Select
                      value={registro.instituto}
                      onValueChange={(val) => updateRegistro(index, "instituto", val)}
                      disabled={false} // Siempre habilitado
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar instituto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INIA">INIA</SelectItem>
                        <SelectItem value="INASE">INASE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gramos */}
                  <div className="space-y-2">
                    <Label className={isDisabled ? "text-muted-foreground" : "text-foreground"}>Peso (g)</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 5.5"
                      step="0.01"
                      value={registro.gramos}
                      onChange={(e) => updateRegistro(index, "gramos", e.target.value)}
                      disabled={isDisabled}
                      className="w-full"
                    />
                  </div>

                  {/* Número */}
                  <div className="space-y-2">
                    <Label className={isDisabled ? "text-muted-foreground" : "text-foreground"}>Número de semillas</Label>
                    <Input
                      type="number"
                      placeholder="Ej: 789"
                      value={registro.numero}
                      onChange={(e) => updateRegistro(index, "numero", e.target.value)}
                      disabled={isDisabled}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            onClick={addRegistro}
            variant="outline"
            className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors bg-transparent text-sm px-2 py-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
