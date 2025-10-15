"use client"
import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import { LoteFormData } from "@/lib/validations/lotes-validation"
import { DatosHumedadManager } from "./datos-humedad-manager"
import { TiposAnalisisSelector } from "./tipos-analisis-selector"
import { useAllCatalogs } from "@/lib/hooks/useCatalogs"
import { TipoAnalisis } from "@/app/models/types/enums"

interface LotFormTabsProps {
  formData: LoteFormData
  onInputChange: (field: keyof LoteFormData, value: any) => void
  activeTab: string
  onTabChange: (tab: string) => void
  handleBlur: (field: string) => void
  hasError: (field: string) => boolean
  getErrorMessage: (field: string) => string
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
  // Loading state
  isLoading = false
}: LotFormTabsProps) {
  // Use React Query hook for all catalogs - centralized caching
  const { data: catalogsData, isLoading: catalogsLoading, isError } = useAllCatalogs()

  // Opciones estáticas
  const tipoOptions = useMemo(() => [
    { id: "INTERNO", nombre: "Interno" },
    { id: "EXTERNO", nombre: "Externo" }
  ], [])

  // Función para manejar cambios sin validación automática
  const handleInputChange = (field: keyof LoteFormData, value: any) => {
    onInputChange(field, value)
  }

  // Memoized options to avoid recalculating on every render
  const cultivaresOptions = useMemo(() =>
    catalogsData.cultivares.map(cultivar => ({
      id: cultivar.id,
      nombre: cultivar.nombre
    })), [catalogsData.cultivares])

  const empresasOptions = useMemo(() =>
    catalogsData.empresas.map(empresa => ({
      id: empresa.id,
      nombre: empresa.nombre
    })), [catalogsData.empresas])

  const clientesOptions = useMemo(() =>
    catalogsData.clientes.map(cliente => ({
      id: cliente.id,
      nombre: cliente.nombre
    })), [catalogsData.clientes])

  const depositosOptions = useMemo(() =>
    catalogsData.depositos.map((deposito: any) => ({
      id: deposito.id,
      nombre: deposito.nombre
    })), [catalogsData.depositos])

  const tiposHumedadOptions = useMemo(() =>
    catalogsData.tiposHumedad.map((tipo: any) => ({
      id: tipo.id,
      nombre: tipo.nombre
    })), [catalogsData.tiposHumedad])

  const origenesOptions = useMemo(() =>
    catalogsData.origenes.map((origen: any) => ({
      id: origen.id,
      nombre: origen.nombre
    })), [catalogsData.origenes])

  const estadosOptions = useMemo(() =>
    catalogsData.estados.map((estado: any) => ({
      id: estado.id,
      nombre: estado.nombre
    })), [catalogsData.estados])

  const articulosOptions = useMemo(() =>
    catalogsData.articulos.map((articulo: any) => ({
      id: articulo.id,
      nombre: articulo.nombre
    })), [catalogsData.articulos])

  const unidadesEmbolsadoOptions = useMemo(() =>
    catalogsData.unidadesEmbolsado.map((unidad: any) => ({
      id: unidad.id,
      nombre: unidad.nombre
    })), [catalogsData.unidadesEmbolsado])

  // Show loading state while catalogs are being fetched
  if (catalogsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro - Lotes</CardTitle>
          <CardDescription>Complete la información del lote en las siguientes pestañas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando catálogos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state if catalogs failed to load
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro - Lotes</CardTitle>
          <CardDescription>Complete la información del lote en las siguientes pestañas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">Error al cargar los catálogos</p>
              <p className="text-muted-foreground">Por favor, recarga la página</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Registro - Lotes</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Complete la información del lote en las siguientes pestañas</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {/* Responsive Tabs List */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger value="datos" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Datos</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="empresa" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Empresa</span>
              <span className="sm:hidden">Emp.</span>
            </TabsTrigger>
            <TabsTrigger value="recepcion" className="text-xs sm:text-sm py-2">
              <span className="hidden md:inline">Recepción y almacenamiento</span>
              <span className="hidden sm:inline md:hidden">Recepción</span>
              <span className="sm:hidden">Recep.</span>
            </TabsTrigger>
            <TabsTrigger value="calidad" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Calidad y producción</span>
              <span className="sm:hidden">Calidad</span>
            </TabsTrigger>
          </TabsList>

          {/* Datos Tab */}
          <TabsContent value="datos" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="ficha"
                label="Ficha"
                value={formData.ficha}
                onChange={(e) => handleInputChange("ficha", e.target.value)}
                onBlur={() => handleBlur("ficha")}
                error={hasError("ficha") ? getErrorMessage("ficha") : undefined}
                required={true}
              />

              <FormSelect
                id="cultivarID"
                label="Cultivar"
                value={formData.cultivarID}
                onChange={(value) => handleInputChange("cultivarID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("cultivarID")}
                options={cultivaresOptions}
                error={hasError("cultivarID") ? getErrorMessage("cultivarID") : undefined}
                required={true}
                placeholder="Seleccionar cultivar"
              />

              <FormSelect
                id="tipo"
                label="Tipo"
                value={formData.tipo}
                onChange={(value) => handleInputChange("tipo", value)}
                onBlur={() => handleBlur("tipo")}
                options={tipoOptions}
                error={hasError("tipo") ? getErrorMessage("tipo") : undefined}
                required={true}
                placeholder="Seleccionar tipo"
              />
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormSelect
                id="empresaID"
                label="Empresa"
                value={formData.empresaID}
                onChange={(value) => handleInputChange("empresaID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("empresaID")}
                options={empresasOptions}
                error={hasError("empresaID") ? getErrorMessage("empresaID") : undefined}
                required={true}
                placeholder="Seleccionar empresa"
              />

              <FormSelect
                id="clienteID"
                label="Cliente"
                value={formData.clienteID}
                onChange={(value) => handleInputChange("clienteID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("clienteID")}
                options={clientesOptions}
                error={hasError("clienteID") ? getErrorMessage("clienteID") : undefined}
                required={true}
                placeholder="Seleccionar cliente"
              />

              <FormField
                id="codigoCC"
                label="Código CC"
                value={formData.codigoCC}
                onChange={(e) => handleInputChange("codigoCC", e.target.value)}
                onBlur={() => handleBlur("codigoCC")}
                error={hasError("codigoCC") ? getErrorMessage("codigoCC") : undefined}
              />

              <FormField
                id="codigoFF"
                label="Código FF"
                value={formData.codigoFF}
                onChange={(e) => handleInputChange("codigoFF", e.target.value)}
                onBlur={() => handleBlur("codigoFF")}
                error={hasError("codigoFF") ? getErrorMessage("codigoFF") : undefined}
              />
            </div>
          </TabsContent>

          {/* Recepción y almacenamiento Tab */}
          <TabsContent value="recepcion" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="fechaEntrega"
                label="Fecha de entrega"
                type="date"
                value={formData.fechaEntrega}
                onChange={(e) => handleInputChange("fechaEntrega", e.target.value)}
                onBlur={() => handleBlur("fechaEntrega")}
                error={hasError("fechaEntrega") ? getErrorMessage("fechaEntrega") : undefined}
                required={true}
              />

              <FormField
                id="fechaRecibo"
                label="Fecha de recibo"
                type="date"
                value={formData.fechaRecibo}
                onChange={(e) => handleInputChange("fechaRecibo", e.target.value)}
                onBlur={() => handleBlur("fechaRecibo")}
                error={hasError("fechaRecibo") ? getErrorMessage("fechaRecibo") : undefined}
                required={true}
              />

              <FormSelect
                id="depositoID"
                label="Depósito"
                value={formData.depositoID}
                onChange={(value) => handleInputChange("depositoID", value === "" ? "" : Number(value))}
                onBlur={() => handleBlur("depositoID")}
                options={depositosOptions}
                error={hasError("depositoID") ? getErrorMessage("depositoID") : undefined}
                required={true}
                placeholder="Seleccionar depósito"
              />

              <FormSelect
                id="unidadEmbolsado"
                label="Unidad de embolsado"
                value={formData.unidadEmbolsado}
                onChange={(value) => handleInputChange("unidadEmbolsado", value)}
                onBlur={() => handleBlur("unidadEmbolsado")}
                options={unidadesEmbolsadoOptions}
                error={hasError("unidadEmbolsado") ? getErrorMessage("unidadEmbolsado") : undefined}
                required={true}
                placeholder="Seleccionar unidad"
              />

              <FormField
                id="remitente"
                label="Remitente"
                value={formData.remitente}
                onChange={(e) => handleInputChange("remitente", e.target.value)}
                onBlur={() => handleBlur("remitente")}
                error={hasError("remitente") ? getErrorMessage("remitente") : undefined}
                required={true}
              />

              <FormField
                id="observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                onBlur={() => handleBlur("observaciones")}
                error={hasError("observaciones") ? getErrorMessage("observaciones") : undefined}
              />
            </div>
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  id="kilosLimpios"
                  label="Kilos limpios"
                  type="number"
                  value={formData.kilosLimpios}
                  onChange={(e) => handleInputChange("kilosLimpios", e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => handleBlur("kilosLimpios")}
                  error={hasError("kilosLimpios") ? getErrorMessage("kilosLimpios") : undefined}
                  required={true}
                />

                <FormSelect
                  id="numeroArticuloID"
                  label="Número Artículo"
                  value={formData.numeroArticuloID}
                  onChange={(value) => handleInputChange("numeroArticuloID", value)}
                  onBlur={() => handleBlur("numeroArticuloID")}
                  options={articulosOptions}
                  error={hasError("numeroArticuloID") ? getErrorMessage("numeroArticuloID") : undefined}
                  required={true}
                  placeholder="Seleccionar artículo"
                />

                <FormField
                  id="cantidad"
                  label="Cantidad"
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange("cantidad", e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => handleBlur("cantidad")}
                  error={hasError("cantidad") ? getErrorMessage("cantidad") : undefined}
                  required={true}
                />

                <FormSelect
                  id="origenID"
                  label="Origen"
                  value={formData.origenID}
                  onChange={(value) => handleInputChange("origenID", value === "" ? "" : Number(value))}
                  onBlur={() => handleBlur("origenID")}
                  options={origenesOptions}
                  error={hasError("origenID") ? getErrorMessage("origenID") : undefined}
                  required={true}
                  placeholder="Seleccionar origen"
                />

                <FormSelect
                  id="estadoID"
                  label="Estado"
                  value={formData.estadoID}
                  onChange={(value) => handleInputChange("estadoID", value === "" ? "" : Number(value))}
                  onBlur={() => handleBlur("estadoID")}
                  options={estadosOptions}
                  error={hasError("estadoID") ? getErrorMessage("estadoID") : undefined}
                  required={true}
                  placeholder="Seleccionar estado"
                />

                <FormField
                  id="fechaCosecha"
                  label="Fecha de cosecha"
                  type="date"
                  value={formData.fechaCosecha}
                  onChange={(e) => handleInputChange("fechaCosecha", e.target.value)}
                  onBlur={() => handleBlur("fechaCosecha")}
                  error={hasError("fechaCosecha") ? getErrorMessage("fechaCosecha") : undefined}
                  required={true}
                />
              </div>

              {/* Selector de tipos de análisis */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipos de Análisis <span className="text-red-500">*</span>
                </label>
                <TiposAnalisisSelector
                  tiposSeleccionados={formData.tiposAnalisisAsignados || []}
                  onChange={(tipos) => handleInputChange("tiposAnalisisAsignados", tipos)}
                  error={hasError("tiposAnalisisAsignados") ? getErrorMessage("tiposAnalisisAsignados") : undefined}
                />
              </div>

              {/* Componente para gestionar datos de humedad */}
              <DatosHumedadManager
                datos={formData.datosHumedad}
                onChange={(datos) => handleInputChange("datosHumedad", datos)}
                tiposHumedad={catalogsData.tiposHumedad}
                hasError={hasError}
                getErrorMessage={getErrorMessage}
              />
            </>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
