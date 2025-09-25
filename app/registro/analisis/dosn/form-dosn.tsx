"use client"

import type React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Microscope,
  Calendar,
  Weight,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from "lucide-react"

// Subcomponentes de registros
import MalezaFields from "@/components/malezas-u-otros-cultivos/fields-maleza"
import BrassicaFields from "@/app/registro/analisis/dosn/fields/fields-brassica"
import CuscutaFields from "@/app/registro/analisis/dosn/fields/fileds-cuscuta"
import CumplimientoEstandarFields from "@/app/registro/analisis/dosn/fields/fields-cumplio-estandar"
import OtrosCultivosFields from "../../../../components/malezas-u-otros-cultivos/fields-otros-cultivos"


type Props = {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  dosn?: any;
  modoDetalle?: boolean;
  onChangeListadosMalezas?: (list: any[]) => void;
  onChangeListadosCultivos?: (list: any[]) => void;
};

export default function DosnFields({ formData, handleInputChange, dosn, modoDetalle, onChangeListadosMalezas, onChangeListadosCultivos }: Props) {
  // Si hay dosn, usarlo como fuente de datos
  const data = dosn || formData || {};
  const isReadOnly = !!modoDetalle;
  const analysisTypes = [
    { key: "Completo", field: "Completo", description: "Análisis exhaustivo de todas las categorías" },
    { key: "Reducido", field: "Reducido", description: "Análisis de categorías principales" },
    { key: "Limitado", field: "Limitado", description: "Análisis básico de categorías críticas" },
    { key: "Reducido - Limitado", field: "ReducidoLimitado", description: "Análisis híbrido optimizado" },
  ];

  // Separar listados en malezas y cultivos
  const listados = dosn?.listados || [];
  // Separar listados en malezas y cultivos
  const malezas = listados.filter(
    (l: any) =>
      l.listadoTipo === "MAL_TOLERANCIA_CERO" ||
      l.listadoTipo === "MAL_TOLERANCIA" ||
      l.listadoTipo === "MAL_COMUNES"
  );

  const cultivos = listados.filter((l: any) => l.listadoTipo === "OTROS");


  const renderInstitutionSection = (
    institution: "INIA" | "INASE",
    icon: React.ReactNode,
    color: string
  ) => {
    const prefix = institution.toLowerCase()

    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{institution}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {institution === "INIA"
                  ? "Instituto Nacional de Investigación Agropecuaria"
                  : "Instituto Nacional de Semillas"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos básicos */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`${prefix}Fecha`}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Fecha de análisis
                </Label>
                <Input
                  id={`${prefix}Fecha`}
                  type="date"
                  value={data[`${prefix}Fecha`] || ""}
                  onChange={isReadOnly ? undefined : (e) => handleInputChange && handleInputChange(`${prefix}Fecha`, e.target.value)}
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20${isReadOnly ? ' bg-gray-100 cursor-not-allowed' : ''}`}
                  readOnly={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`${prefix}Gramos`}
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Weight className="h-4 w-4 text-muted-foreground" />
                  Gramos analizados
                </Label>
                <Input
                  id={`${prefix}Gramos`}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={data[`${prefix}Gramos`] || ""}
                  onChange={isReadOnly ? undefined : (e) => handleInputChange && handleInputChange(`${prefix}Gramos`, e.target.value)}
                  className={`h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20${isReadOnly ? ' bg-gray-100 cursor-not-allowed' : ''}`}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            {/* Tipos de análisis */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Tipo de análisis
              </Label>
              <div className="space-y-3">
                {analysisTypes.map(({ key, field, description }) => {
                  const fieldName = `${prefix}${field}`
                  return (
                    <div
                      key={field}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={fieldName}
                        checked={data[fieldName] || false}
                        onCheckedChange={isReadOnly ? undefined : (checked) => handleInputChange && handleInputChange(fieldName, checked)}
                        disabled={isReadOnly}
                        className="mt-1 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={fieldName}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {key}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Microscope className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">
              Determinación de Otras Semillas en Número (DOSN)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Análisis cuantitativo de semillas no deseadas en muestras
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="generales" className="w-full">
          <TabsList className="flex flex-wrap gap-2 w-full mb-6">
            <TabsTrigger value="generales" className="flex items-center gap-2 px-3 py-2 text-sm">
              <FileText className="h-4 w-4" />
              Datos generales
            </TabsTrigger>
            <TabsTrigger value="registros" className="flex items-center gap-2 px-3 py-2 text-sm">
              <ClipboardList className="h-4 w-4" />
              Registros
            </TabsTrigger>
          </TabsList>

          {/* --- TAB: Datos generales --- */}
          <TabsContent value="generales" className="space-y-6">
            {renderInstitutionSection(
              "INIA",
              <Building2 className="h-5 w-5 text-emerald-600" />,
              "bg-emerald-50"
            )}
            {renderInstitutionSection(
              "INASE",
              <Building2 className="h-5 w-5 text-blue-600" />,
              "bg-blue-50"
            )}
          </TabsContent>

          {/* --- TAB: Registros --- */}
          <TabsContent value="registros" className="space-y-6 mt-6">
            <MalezaFields
              titulo="Malezas"
              registros={malezas}
              onChangeListados={onChangeListadosMalezas}
            />
            <OtrosCultivosFields
              registros={cultivos}
              onChangeListados={onChangeListadosCultivos}
            />
            <BrassicaFields />
            <CuscutaFields />
            <Separator />

            <CumplimientoEstandarFields formData={formData} handleInputChange={handleInputChange ?? (() => { })} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
