"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import { LoteFormData } from "@/lib/validations/lotes-validation"
import { CatalogoDTO, ContactoDTO, CultivarDTO } from "@/app/models"

interface LotFormTabsProps {
  formData: LoteFormData
  onInputChange: (field: keyof LoteFormData, value: any) => void
  activeTab: string
  onTabChange: (tab: string) => void
  handleBlur: (field: string) => void
  hasError: (field: string) => boolean
  getErrorMessage: (field: string) => string
  // Catalog data
  cultivares: CultivarDTO[]
  empresas: ContactoDTO[]
  clientes: ContactoDTO[]
  depositos: any[] // Cambiar tipo para manejar respuesta real del backend
  tiposHumedad: any[] // Cambiar tipo para manejar respuesta real del backend
  origenes: any[] // Cambiar tipo para manejar respuesta real del backend
  estados: any[] // Cambiar tipo para manejar respuesta real del backend
  numerosArticulo?: any[] // Cambiar tipo para manejar respuesta real del backend
  tipoOptions: { id: string, nombre: string }[]
  unidadesEmbolsado: { id: string, nombre: string }[]
  // Loading states
  isLoading?: boolean
}

export function LotFormTabs({
  formData,
  onInputChange,
  activeTab,
  onTabChange,
  handleBlur,
  hasError,
  getErrorMessage,
  // Catalog data
  cultivares,
  empresas,
  clientes,
  depositos,
  tiposHumedad,
  origenes,
  estados,
  numerosArticulo = [],
  tipoOptions,
  unidadesEmbolsado,
  // Loading state
  isLoading = false
}: LotFormTabsProps) {
  // Map backend data to the format expected by FormSelect
  const cultivaresOptions = cultivares.map(cultivar => ({
    id: cultivar.cultivarID,
    nombre: cultivar.nombre
  }));

  const empresasOptions = empresas.map(empresa => ({
    id: empresa.contactoID,
    nombre: empresa.nombre
  }));

  const clientesOptions = clientes.map(cliente => ({
    id: cliente.contactoID,
    nombre: cliente.nombre
  }));

  // Mapeo que maneja la estructura real del backend
  const depositosOptions = depositos.map((deposito: any) => ({
    id: deposito.id,
    nombre: deposito.valor
  }));

  const tiposHumedadOptions = tiposHumedad.map((tipo: any) => ({
    id: tipo.id,
    nombre: tipo.valor
  }));

  const origenesOptions = origenes.map((origen: any) => ({
    id: origen.id,
    nombre: origen.valor
  }));

  const estadosOptions = estados.map((estado: any) => ({
    id: estado.id,
    nombre: estado.valor
  }));

  const numerosArticuloOptions = numerosArticulo.map((num: any) => ({
    id: num.id,
    nombre: num.valor
  }));

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
                id="numeroFicha"
                label="Número de ficha"
                type="number"
                value={formData.numeroFicha}
                onChange={(e) => onInputChange("numeroFicha", e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => handleBlur("numeroFicha")}
                error={hasError("numeroFicha") ? getErrorMessage("numeroFicha") : undefined}
                required={true}
              />

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
                options={cultivaresOptions}
                error={hasError("cultivarID") ? getErrorMessage("cultivarID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar cultivar"}
                disabled={isLoading}
              />              <FormSelect
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
                options={empresasOptions}
                error={hasError("empresaID") ? getErrorMessage("empresaID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar empresa"}
                disabled={isLoading}
              />

              <FormSelect
                id="clienteID"
                label="Cliente"
                value={formData.clienteID}
                onChange={(value) => onInputChange("clienteID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("clienteID")}
                options={clientesOptions}
                error={hasError("clienteID") ? getErrorMessage("clienteID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar cliente"}
                disabled={isLoading}
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
                options={depositosOptions}
                error={hasError("depositoID") ? getErrorMessage("depositoID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar depósito"}
                disabled={isLoading}
              />

              <FormSelect
                id="unidadEmbolsado"
                label="Unidad de embalado"
                value={formData.unidadEmbolsado}
                onChange={(value) => onInputChange("unidadEmbolsado", value)}
                onBlur={() => handleBlur("unidadEmbolsado")}
                options={unidadesEmbolsado}
                error={hasError("unidadEmbolsado") ? getErrorMessage("unidadEmbolsado") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar unidad"}
                disabled={isLoading}
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
                options={tiposHumedadOptions}
                error={hasError("tipoHumedadID") ? getErrorMessage("tipoHumedadID") : undefined}
                placeholder={isLoading ? "Cargando..." : "Seleccionar tipo de humedad"}
                disabled={isLoading}
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
                options={origenesOptions}
                error={hasError("origenID") ? getErrorMessage("origenID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar origen"}
                disabled={isLoading}
              />

              <FormSelect
                id="estadoID"
                label="Estado"
                value={formData.estadoID}
                onChange={(value) => onInputChange("estadoID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("estadoID")}
                options={estadosOptions}
                error={hasError("estadoID") ? getErrorMessage("estadoID") : undefined}
                required={true}
                placeholder={isLoading ? "Cargando..." : "Seleccionar estado"}
                disabled={isLoading}
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
