"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Droplet } from "lucide-react"
import { TipoHumedadOption } from "@/app/models/interfaces/lote"

interface DatosHumedadEntry {
  tipoHumedadID: number | "";
  valor: number | "";
}

interface DatosHumedadManagerProps {
  datos: DatosHumedadEntry[];
  onChange: (datos: DatosHumedadEntry[]) => void;
  tiposHumedad: TipoHumedadOption[];
  hasError?: (field: string) => boolean;
  getErrorMessage?: (field: string) => string;
}

export function DatosHumedadManager({
  datos,
  onChange,
  tiposHumedad,
  hasError,
  getErrorMessage
}: DatosHumedadManagerProps) {
  const handleAddDato = () => {
    const newDatos: DatosHumedadEntry[] = [...datos, { tipoHumedadID: "", valor: "" }];
    onChange(newDatos);
  };

  const handleRemoveDato = (index: number) => {
    if (datos.length > 1) {
      const newDatos = datos.filter((_, i) => i !== index);
      onChange(newDatos);
    }
  };

  const handleDatoChange = (index: number, field: keyof DatosHumedadEntry, value: any) => {
    const newDatos = [...datos];
    newDatos[index] = {
      ...newDatos[index],
      [field]: field === 'tipoHumedadID' ? (value === "" ? "" : Number(value)) : (value === "" ? "" : Number(value))
    };
    onChange(newDatos);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Droplet className="h-4 w-4" />
          Datos de Humedad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {datos.map((dato, index) => (
          <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Tipo de Humedad
              </Label>
              <Select
                value={dato.tipoHumedadID?.toString() || ""}
                onValueChange={(value) => handleDatoChange(index, 'tipoHumedadID', value)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposHumedad.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasError && hasError(`tipoHumedadID_${index}`) && (
                <p className="text-xs text-destructive mt-1">
                  {getErrorMessage && getErrorMessage(`tipoHumedadID_${index}`)}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Valor (%)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={dato.valor?.toString() || ""}
                onChange={(e) => handleDatoChange(index, 'valor', e.target.value)}
                className="h-8 text-sm"
                placeholder="0.0"
              />
              {hasError && hasError(`valorHumedad_${index}`) && (
                <p className="text-xs text-destructive mt-1">
                  {getErrorMessage && getErrorMessage(`valorHumedad_${index}`)}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveDato(index)}
              disabled={datos.length <= 1}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddDato}
          className="w-full h-8 text-sm"
        >
          <Plus className="h-3 w-3 mr-2" />
          Agregar Dato de Humedad
        </Button>
      </CardContent>
    </Card>
  );
}