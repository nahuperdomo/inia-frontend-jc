"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

import MalezaFields from "@/app/registro/analisis/dosn/fields/fields-maleza"
import BrassicaFields from "@/app/registro/analisis/dosn/fields/fields-brassica"
import CuscutaFields from "@/app/registro/analisis/dosn/fields/fileds-cuscuta"
import OtrosCultivosFields from "./fields/fields-otros-cultivos"
import { Select, SelectContent, SelectValue } from "@radix-ui/react-select"
import { SelectItem, SelectTrigger } from "@/components/ui/select"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export default function DosnFields({ formData, handleInputChange }: Props) {
  return (
    <Card className="border-red-200 bg-red-50 shadow-md">
      <CardHeader>
        <CardTitle className="text-red-800 text-lg font-bold">
          Determinación de Otras Semillas en Número (DOSN)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-10">

        {/* INIA */}
        <section>
          <h3 className="font-semibold text-md mb-4">INIA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="iniaFecha">Fecha</Label>
                <Input
                  id="iniaFecha"
                  type="date"
                  value={formData.iniaFecha || ""}
                  onChange={(e) => handleInputChange("iniaFecha", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="iniaGramos">Gramos analizados</Label>
                <Input
                  id="iniaGramos"
                  type="number"
                  step="0.01"
                  value={formData.iniaGramos || ""}
                  onChange={(e) => handleInputChange("iniaGramos", e.target.value)}
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Tipo de análisis</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "Completo", field: "iniaCompleto" },
                  { key: "Reducido", field: "iniaReducido" },
                  { key: "Limitado", field: "iniaLimitado" },
                  { key: "Reducido - Limitado", field: "iniaReducidoLimitado" },
                ].map(({ key, field }) => (
                  <label key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={field}
                      checked={formData[field] || false}
                      onCheckedChange={(checked) => handleInputChange(field, checked)}
                      className="border-2 border-gray-400 rounded-sm shadow-sm data-[state=checked]:bg-green-700"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INASE */}
        <section>
          <h3 className="font-semibold text-md mb-4">INASE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Columna izquierda */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="inaseFecha">Fecha</Label>
                <Input
                  id="inaseFecha"
                  type="date"
                  value={formData.inaseFecha || ""}
                  onChange={(e) => handleInputChange("inaseFecha", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="inaseGramos">Gramos analizados</Label>
                <Input
                  id="inaseGramos"
                  type="number"
                  step="0.01"
                  value={formData.inaseGramos || ""}
                  onChange={(e) => handleInputChange("inaseGramos", e.target.value)}
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Tipo de análisis</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "Completo", field: "inaseCompleto" },
                  { key: "Reducido", field: "inaseReducido" },
                  { key: "Limitado", field: "inaseLimitado" },
                  { key: "Reducido - Limitado", field: "inaseReducidoLimitado" },
                ].map(({ key, field }) => (
                  <label key={field} className="flex items-center gap-2">
                    <Checkbox
                      id={field}
                      checked={formData[field] || false}
                      onCheckedChange={(checked) => handleInputChange(field, checked)}
                      className="border-2 border-gray-400 rounded-sm shadow-sm data-[state=checked]:bg-green-700"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-6">
          {/* Malezas */}
          <MalezaFields titulo="Malezas" />

          {/* Otros cultivos */}
          <OtrosCultivosFields />

          {/* Brassica */}
          <BrassicaFields />

          {/* Cuscuta */}
          <CuscutaFields />
        </div>

        {/* Cumple con el estándar */}
        <Card className="border-gray-200 bg-gray-50 mt-6">
          <CardHeader>
            <CardTitle className="text-gray-800">Cumplimiento del Estándar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha */}
              <div>
                <Label htmlFor="cumpleFecha">Fecha</Label>
                <Input
                  id="cumpleFecha"
                  type="date"
                  value={formData.cumpleFecha || ""}
                  onChange={(e) => handleInputChange("cumpleFecha", e.target.value)}
                />
              </div>

              {/* Cumple con el estándar */}
              <div>
                <Label>Cumple con el estándar</Label>
                <Select
                  value={formData.cumpleEstandar || ""}
                  onValueChange={(val) => handleInputChange("cumpleEstandar", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

      </CardContent>
    </Card>
  )
}
