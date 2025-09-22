"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"

import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza"
import BrassicaFields from "@/app/registro/analisis/dosn/fields/fields-brassica"
import CuscutaFields from "@/app/registro/analisis/dosn/fields/fileds-cuscuta"
import OtrosCultivosFields from "../../../../components/malezas-u-otros-cultivos/fields-otros-cultivos"

type Props = {
  formData: any
  handleInputChange: (field: string, value: any) => void
}

export default function DosnFields({ formData, handleInputChange }: Props) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl font-bold">
          Determinación de Otras Semillas en Número (DOSN)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <Tabs defaultValue="generales" className="w-full">
          {/* Barra de pestañas */}
          <TabsList className="flex flex-wrap w-full gap-2">
            <TabsTrigger
              value="generales"
              className="flex-1 min-w-[120px] text-sm sm:text-base"
            >
              Datos generales
            </TabsTrigger>
            <TabsTrigger
              value="registros"
              className="flex-1 min-w-[120px] text-sm sm:text-base"
            >
              Registros
            </TabsTrigger>
          </TabsList>

          {/* --- TAB: Datos generales --- */}
          <TabsContent value="generales" className="space-y-6 sm:space-y-10 mt-6">
            {/* INIA */}
            <section>
              <h3 className="font-semibold text-sm sm:text-md mb-4">INIA</h3>
              <div className="border border-blue-200 rounded-md bg-gray-50 p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm sm:text-base" htmlFor="iniaFecha">Fecha</Label>
                      <Input
                        id="iniaFecha"
                        type="date"
                        value={formData.iniaFecha || ""}
                        onChange={(e) => handleInputChange("iniaFecha", e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base" htmlFor="iniaGramos">Gramos analizados</Label>
                      <Input
                        id="iniaGramos"
                        type="number"
                        step="0.01"
                        value={formData.iniaGramos || ""}
                        onChange={(e) => handleInputChange("iniaGramos", e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Tipo de análisis</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { key: "Completo", field: "iniaCompleto" },
                        { key: "Reducido", field: "iniaReducido" },
                        { key: "Limitado", field: "iniaLimitado" },
                        { key: "Reducido - Limitado", field: "iniaReducidoLimitado" },
                      ].map(({ key, field }) => (
                        <label key={field} className="flex items-center gap-2 text-sm sm:text-base">
                          <Checkbox
                            id={field}
                            checked={formData[field] || false}
                            onCheckedChange={(checked) => handleInputChange(field, checked)}
                            className="border border-gray-400 rounded-sm shadow-sm data-[state=checked]:bg-blue-700"
                          />
                          <span>{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div></div>
            </section>

            {/* INASE */}
            <section>
              <h3 className="font-semibold text-sm sm:text-md mb-4">INASE</h3>
              <div className="border border-blue-200 rounded-md bg-gray-50 p-4 sm:p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm sm:text-base" htmlFor="inaseFecha">Fecha</Label>
                      <Input
                        id="inaseFecha"
                        type="date"
                        value={formData.inaseFecha || ""}
                        onChange={(e) => handleInputChange("inaseFecha", e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label className="text-sm sm:text-base" htmlFor="inaseGramos">Gramos analizados</Label>
                      <Input
                        id="inaseGramos"
                        type="number"
                        step="0.01"
                        value={formData.inaseGramos || ""}
                        onChange={(e) => handleInputChange("inaseGramos", e.target.value)}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Tipo de análisis</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { key: "Completo", field: "inaseCompleto" },
                        { key: "Reducido", field: "inaseReducido" },
                        { key: "Limitado", field: "inaseLimitado" },
                        { key: "Reducido - Limitado", field: "inaseReducidoLimitado" },
                      ].map(({ key, field }) => (
                        <label key={field} className="flex items-center gap-2 text-sm sm:text-base">
                          <Checkbox
                            id={field}
                            checked={formData[field] || false}
                            onCheckedChange={(checked) => handleInputChange(field, checked)}
                            className="border border-gray-400 rounded-sm shadow-sm data-[state=checked]:bg-blue-700"
                          />
                          <span>{key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div></div>
            </section>
          </TabsContent>

          {/* --- TAB: Registros --- */}
          <TabsContent value="registros" className="space-y-6 mt-6">
            <MalezaFields titulo="Malezas" />
            <OtrosCultivosFields />
            <BrassicaFields />
            <CuscutaFields />

            <Card className="border-blue-200 bg-gray-50 mt-6">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-blue-800 text-base sm:text-lg lg:text-xl">
                  Cumplimiento del Estándar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-sm sm:text-base" htmlFor="cumpleFecha">Fecha</Label>
                    <Input
                      id="cumpleFecha"
                      type="date"
                      value={formData.cumpleFecha || ""}
                      onChange={(e) => handleInputChange("cumpleFecha", e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Cumple con el estándar</Label>
                    <Select
                      value={formData.cumpleEstandar || ""}
                      onValueChange={(val) => handleInputChange("cumpleEstandar", val)}
                    >
                      <SelectTrigger className="w-full text-sm sm:text-base shadow-sm rounded-md border px-3 py-2">
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
