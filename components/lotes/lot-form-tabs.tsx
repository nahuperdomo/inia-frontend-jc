"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import { LoteFormData } from "@/lib/validations/lotes-validation"

interface LotFormTabsProps {
  formData: LoteFormData
  onInputChange: (field: keyof LoteFormData, value: any) => void
  activeTab: string
  onTabChange: (tab: string) => void
  handleBlur: (field: string) => void
  hasError: (field: string) => boolean
  getErrorMessage: (field: string) => string
}

export function LotFormTabs({
  formData,
  onInputChange,
  activeTab,
  onTabChange,
  handleBlur,
  hasError,
  getErrorMessage
}: LotFormTabsProps) {
  // Simulación de opciones, reemplaza por tus datos reales si tienes catálogos
  const cultivares = [
    { id: 1, nombre: "Cultivar 1" },
    { id: 2, nombre: "Cultivar 2" },
    { id: 3, nombre: "Cultivar 3" },
  ]
  const empresas = [
    { id: 1, nombre: "Empresa 1" },
    { id: 2, nombre: "Empresa 2" },
  ]
  const clientes = [
    { id: 1, nombre: "Cliente 1" },
    { id: 2, nombre: "Cliente 2" },
  ]
  const depositos = [
    { id: 1, nombre: "Depósito A" },
    { id: 2, nombre: "Depósito B" },
  ]
  const unidadesEmbalado = [
    { id: "Bolsas", nombre: "Bolsas" },
    { id: "Granel", nombre: "Granel" },
    { id: "Big Bags", nombre: "Big Bags" },
    { id: "Contenedores", nombre: "Contenedores" }
  ]

  // Nuevos datos hardcodeados para los selects
  const tiposHumedad = [
    { id: 1, nombre: "Humedad Base Húmeda" },
    { id: 2, nombre: "Humedad Base Seca" },
    { id: 3, nombre: "Humedad Relativa" },
    { id: 4, nombre: "Humedad Absoluta" },
  ]

  const origenes = [
    { id: 1, nombre: "Nacional" },
    { id: 2, nombre: "Importado - Argentina" },
    { id: 3, nombre: "Importado - Brasil" },
    { id: 4, nombre: "Importado - Chile" },
    { id: 5, nombre: "Importado - Paraguay" },
  ]

  const estados = [
    { id: 1, nombre: "Ingresado" },
    { id: 2, nombre: "En Proceso" },
    { id: 3, nombre: "En Análisis" },
    { id: 4, nombre: "Aprobado" },
    { id: 5, nombre: "Rechazado" },
    { id: 6, nombre: "Liberado" },
  ]

  const tipoOptions = [
    { id: "INTERNO", nombre: "Interno" },
    { id: "OTROS_CENTROS_COSTOS", nombre: "Otros Centros de Costos" },
    { id: "EXTERNOS", nombre: "Externos" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro - Lotes</CardTitle>
        <CardDescription>Complete la información del lote en las siguientes pestañas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="recepcion">Recepción y almacenamiento</TabsTrigger>
            <TabsTrigger value="calidad">Calidad y producción</TabsTrigger>
          </TabsList>

          {/* Datos Tab */}
          <TabsContent value="datos" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="ficha"
                label="Ficha"
                value={formData.ficha}
                onChange={(e) => onInputChange("ficha", e.target.value)}
                onBlur={() => handleBlur("ficha")}
                error={hasError("ficha") ? getErrorMessage("ficha") : undefined}
                required={true}
              />

              <FormSelect
                id="cultivarID"
                label="Cultivar"
                value={formData.cultivarID}
                onChange={(value) => onInputChange("cultivarID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("cultivarID")}
                options={cultivares}
                error={hasError("cultivarID") ? getErrorMessage("cultivarID") : undefined}
                required={true}
                placeholder="Seleccionar cultivar"
              />

              <FormSelect
                id="tipo"
                label="Tipo"
                value={formData.tipo}
                onChange={(value) => onInputChange("tipo", value)}
                onBlur={() => handleBlur("tipo")}
                options={tipoOptions}
                error={hasError("tipo") ? getErrorMessage("tipo") : undefined}
                required={true}
                placeholder="Seleccionar tipo"
              />
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                id="empresaID"
                label="Empresa"
                value={formData.empresaID}
                onChange={(value) => onInputChange("empresaID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("empresaID")}
                options={empresas}
                error={hasError("empresaID") ? getErrorMessage("empresaID") : undefined}
                required={true}
                placeholder="Seleccionar empresa"
              />

              <FormSelect
                id="clienteID"
                label="Cliente"
                value={formData.clienteID}
                onChange={(value) => onInputChange("clienteID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("clienteID")}
                options={clientes}
                error={hasError("clienteID") ? getErrorMessage("clienteID") : undefined}
                required={true}
                placeholder="Seleccionar cliente"
              />

              <FormField
                id="codigoCC"
                label="Código CC"
                value={formData.codigoCC}
                onChange={(e) => onInputChange("codigoCC", e.target.value)}
                onBlur={() => handleBlur("codigoCC")}
                error={hasError("codigoCC") ? getErrorMessage("codigoCC") : undefined}
              />

              <FormField
                id="codigoFF"
                label="Código FF"
                value={formData.codigoFF}
                onChange={(e) => onInputChange("codigoFF", e.target.value)}
                onBlur={() => handleBlur("codigoFF")}
                error={hasError("codigoFF") ? getErrorMessage("codigoFF") : undefined}
              />
            </div>
          </TabsContent>

          {/* Recepción y almacenamiento Tab */}
          <TabsContent value="recepcion" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="fechaEntrega"
                label="Fecha de entrega"
                type="date"
                value={formData.fechaEntrega}
                onChange={(e) => onInputChange("fechaEntrega", e.target.value)}
                onBlur={() => handleBlur("fechaEntrega")}
                error={hasError("fechaEntrega") ? getErrorMessage("fechaEntrega") : undefined}
                required={true}
              />

              <FormField
                id="fechaRecibo"
                label="Fecha de recibo"
                type="date"
                value={formData.fechaRecibo}
                onChange={(e) => onInputChange("fechaRecibo", e.target.value)}
                onBlur={() => handleBlur("fechaRecibo")}
                error={hasError("fechaRecibo") ? getErrorMessage("fechaRecibo") : undefined}
                required={true}
              />

              <FormSelect
                id="depositoID"
                label="Depósito"
                value={formData.depositoID}
                onChange={(value) => onInputChange("depositoID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("depositoID")}
                options={depositos}
                error={hasError("depositoID") ? getErrorMessage("depositoID") : undefined}
                required={true}
                placeholder="Seleccionar depósito"
              />

              <FormSelect
                id="unidadEmbolsado"
                label="Unidad de embalado"
                value={formData.unidadEmbolsado}
                onChange={(value) => onInputChange("unidadEmbolsado", value)}
                onBlur={() => handleBlur("unidadEmbolsado")}
                options={unidadesEmbalado}
                error={hasError("unidadEmbolsado") ? getErrorMessage("unidadEmbolsado") : undefined}
                required={true}
                placeholder="Seleccionar unidad"
              />

              <FormField
                id="remitente"
                label="Remitente"
                value={formData.remitente}
                onChange={(e) => onInputChange("remitente", e.target.value)}
                onBlur={() => handleBlur("remitente")}
                error={hasError("remitente") ? getErrorMessage("remitente") : undefined}
                required={true}
              />

              <FormField
                id="observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => onInputChange("observaciones", e.target.value)}
                onBlur={() => handleBlur("observaciones")}
                error={hasError("observaciones") ? getErrorMessage("observaciones") : undefined}
              />
            </div>
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="kilosLimpios"
                label="Kilos limpios"
                type="number"
                value={formData.kilosLimpios}
                onChange={(e) => onInputChange("kilosLimpios", e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => handleBlur("kilosLimpios")}
                error={hasError("kilosLimpios") ? getErrorMessage("kilosLimpios") : undefined}
                required={true}
              />

              <FormSelect
                id="tipoHumedadID"
                label="Tipo de humedad"
                value={formData.datosHumedad[0]?.tipoHumedadID || ""}
                onChange={(value) => {
                  const newDatos = [...formData.datosHumedad]
                  newDatos[0] = {
                    ...newDatos[0],
                    tipoHumedadID: value === "" ? "" : Number(value)
                  }
                  onInputChange("datosHumedad", newDatos)
                }}
                onBlur={() => handleBlur("tipoHumedadID")}
                options={tiposHumedad}
                error={hasError("tipoHumedadID") ? getErrorMessage("tipoHumedadID") : undefined}
                placeholder="Seleccionar tipo de humedad"
              />

              <FormField
                id="valorHumedad"
                label="Valor humedad (%)"
                type="number"
                step="0.1"
                value={formData.datosHumedad[0]?.valor ?? ""}
                onChange={(e) => {
                  const newDatos = [...formData.datosHumedad]
                  newDatos[0] = {
                    ...newDatos[0],
                    valor: e.target.value === "" ? "" : Number(e.target.value)
                  }
                  onInputChange("datosHumedad", newDatos)
                }}
                onBlur={() => handleBlur("valorHumedad")}
                error={hasError("valorHumedad") ? getErrorMessage("valorHumedad") : undefined}
              />

              <FormField
                id="numeroArticuloID"
                label="Número Artículo"
                type="number"
                value={formData.numeroArticuloID}
                onChange={(e) => onInputChange("numeroArticuloID", e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => handleBlur("numeroArticuloID")}
                error={hasError("numeroArticuloID") ? getErrorMessage("numeroArticuloID") : undefined}
              />

              <FormField
                id="cantidad"
                label="Cantidad"
                type="number"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => onInputChange("cantidad", e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => handleBlur("cantidad")}
                error={hasError("cantidad") ? getErrorMessage("cantidad") : undefined}
                required={true}
              />

              <FormSelect
                id="origenID"
                label="Origen"
                value={formData.origenID}
                onChange={(value) => onInputChange("origenID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("origenID")}
                options={origenes}
                error={hasError("origenID") ? getErrorMessage("origenID") : undefined}
                required={true}
                placeholder="Seleccionar origen"
              />

              <FormSelect
                id="estadoID"
                label="Estado"
                value={formData.estadoID}
                onChange={(value) => onInputChange("estadoID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("estadoID")}
                options={estados}
                error={hasError("estadoID") ? getErrorMessage("estadoID") : undefined}
                required={true}
                placeholder="Seleccionar estado"
              />

              <FormField
                id="fechaCosecha"
                label="Fecha de cosecha"
                type="date"
                value={formData.fechaCosecha}
                onChange={(e) => onInputChange("fechaCosecha", e.target.value)}
                onBlur={() => handleBlur("fechaCosecha")}
                error={hasError("fechaCosecha") ? getErrorMessage("fechaCosecha") : undefined}
                required={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
