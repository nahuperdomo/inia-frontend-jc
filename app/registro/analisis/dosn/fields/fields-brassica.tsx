"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function BrassicaSection() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Determinación de Brassica spp.</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Listado</Label>
            <Input placeholder="Escribir especie..." />
          </div>

          <div>
            <Label>INIA / INASE</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inia">INIA</SelectItem>
                <SelectItem value="inase">INASE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>N°</Label>
            <Input placeholder="Ej: 456" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
