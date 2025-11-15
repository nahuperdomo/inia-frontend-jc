"use client"
import { useMemo, useState, useEffect } from "react"
import { useAsyncValidation } from "@/lib/hooks/useAsyncValidation"
import { LotFormTabsProps } from "./types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import FormCombobox from "@/components/ui/form-combobox"
import { LoteFormData, loteValidationSchema } from "@/lib/validations/lotes-validation"
import { DatosHumedadManager } from "./datos-humedad-manager"
import { TiposAnalisisSelector } from "./tipos-analisis-selector"
import { useAllCatalogs } from "@/lib/hooks/useCatalogs"

export function LotFormTabs({
  formData,
  onInputChange,
  activeTab,
  onTabChange,
  isLoading = false,
  loteId
}: LotFormTabsProps) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const {
    fichaError,
    nomLoteError,
    validateFicha,
    validateNomLote,
    clearValidation
  } = useAsyncValidation(loteId);

  const validateSyncField = (field: keyof LoteFormData, value: any, allData: LoteFormData): string | null => {
    const validator = loteValidationSchema[field];
    if (!validator) return null;

    if (typeof validator === 'function') {
      return validator(value, allData);
    }
    return null;
  };

  const validateField = async (field: string, value: any) => {
    // Validaciones asíncronas
    if (field === "ficha") {
      return await validateFicha(value);
    } else if (field === "nomLote") {
      return await validateNomLote(value);
    }

    // Validaciones síncronas
    const syncError = validateSyncField(field as keyof LoteFormData, value, formData);
    if (syncError) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: syncError
      }));
      return syncError;
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    return null;
  };

  // Use React Query hook for all catalogs - centralized caching
  const { data: catalogsData, isLoading: catalogsLoading, isError, refetch } = useAllCatalogs()

  // Refrescar catálogos cuando se cambia a la tab de empresa o datos
  useEffect(() => {
    if (activeTab === "empresa" || activeTab === "datos") {
      refetch()
    }
  }, [activeTab, refetch])

  // Opciones estáticas
  const tipoOptions = useMemo(() => [
    { id: "INTERNO", nombre: "Interno" },
    { id: "OTROS_CENTROS_COSTOS", nombre: "Otros Centros de Costos" },
    { id: "EXTERNOS", nombre: "Externos" }
  ], [])

  // Función para manejar cambios y validación
  const handleFieldChange = async (field: keyof LoteFormData, value: any) => {
    // Primero marcar el campo como tocado
    setTouchedFields(prev => ({ ...prev, [field]: true }));

    // Actualizar el valor
    onInputChange(field, value);

    // Validar el campo (asíncrono para ficha/nomLote, síncrono para otros)
    setIsValidating(true);
    await validateField(field, value);
    setIsValidating(false);
  }

  const getError = (field: keyof LoteFormData) => {
    // Solo mostrar errores si el campo ha sido tocado
    if (!touchedFields[field]) return undefined;

    if (field === "ficha") return fichaError;
    if (field === "nomLote") return nomLoteError;
    return fieldErrors[field];
  }

  const hasFieldError = (field: string) => {
    return !!getError(field as keyof LoteFormData);
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
      <CardHeader>
        <CardTitle>Registro - Lotes</CardTitle>
        <CardDescription>Complete la información del lote en las siguientes pestañas</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto">
            <TabsTrigger value="datos" className="text-xs sm:text-sm py-2">Datos</TabsTrigger>
            <TabsTrigger value="empresa" className="text-xs sm:text-sm py-2">Empresa</TabsTrigger>
            <TabsTrigger value="recepcion" className="text-xs sm:text-sm py-2 whitespace-normal">Recepción y almacenamiento</TabsTrigger>
            <TabsTrigger value="calidad" className="text-xs sm:text-sm py-2">Calidad</TabsTrigger>
          </TabsList>

          {/* Datos Tab */}
          <TabsContent value="datos" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                id="ficha"
                label="Ficha"
                value={formData.ficha}
                onChange={(e) => handleFieldChange("ficha", e.target.value)}
                onBlur={() => handleFieldChange("ficha", formData.ficha)}
                error={getError("ficha")}
              />

              <FormField
                id="nomLote"
                label="Lote"
                value={formData.nomLote}
                onChange={(e) => handleFieldChange("nomLote", e.target.value)}
                onBlur={() => handleFieldChange("nomLote", formData.nomLote)}
                error={getError("nomLote")}
                placeholder="Ingrese un nombre único para el lote"
              />

              <FormCombobox
                id="cultivarID"
                label="Cultivar"
                value={formData.cultivarID}
                onChange={(value) => handleFieldChange("cultivarID", value === "" ? "" : Number(value))}
                onBlur={() => handleFieldChange("cultivarID", formData.cultivarID)}
                options={cultivaresOptions}
                error={getError("cultivarID")}
                required={true}
                placeholder="Seleccionar cultivar"
                searchPlaceholder="Buscar cultivar..."
              />

              <FormSelect
                id="tipo"
                label="Tipo"
                value={formData.tipo}
                onChange={(value) => handleFieldChange("tipo", value)}
                onBlur={() => handleFieldChange("tipo", formData.tipo)}
                options={tipoOptions}
                error={getError("tipo")}
                required={true}
                placeholder="Seleccionar tipo"
              />
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormCombobox
                id="empresaID"
                label="Empresa"
                value={formData.empresaID}
                onChange={(value) => handleFieldChange("empresaID", value === "" ? "" : Number(value))}
                onBlur={() => handleFieldChange("empresaID", formData.empresaID)}
                options={empresasOptions}
                error={getError("empresaID")}
                required={true}
                placeholder="Seleccionar empresa"
                searchPlaceholder="Buscar empresa..."
              />

              <FormCombobox
                id="clienteID"
                label="Cliente"
                value={formData.clienteID}
                onChange={(value) => handleFieldChange("clienteID", value === "" ? "" : Number(value))}
                onBlur={() => handleFieldChange("clienteID", formData.clienteID)}
                options={clientesOptions}
                error={getError("clienteID")}
                required={true}
                placeholder="Seleccionar cliente"
                searchPlaceholder="Buscar cliente..."
              />

              <FormField
                id="codigoCC"
                label="Código CC"
                value={formData.codigoCC}
                onChange={(e) => handleFieldChange("codigoCC", e.target.value)}
                onBlur={() => handleFieldChange("codigoCC", formData.codigoCC)}
                error={getError("codigoCC")}
              />

              <FormField
                id="codigoFF"
                label="Código FF"
                value={formData.codigoFF}
                onChange={(e) => handleFieldChange("codigoFF", e.target.value)}
                onBlur={() => handleFieldChange("codigoFF", formData.codigoFF)}
                error={getError("codigoFF")}
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
                onChange={(e) => handleFieldChange("fechaEntrega", e.target.value)}
                onBlur={() => handleFieldChange("fechaEntrega", formData.fechaEntrega)}
                error={getError("fechaEntrega")}
              />

              <FormField
                id="fechaRecibo"
                label="Fecha de recibo"
                type="date"
                value={formData.fechaRecibo}
                onChange={(e) => handleFieldChange("fechaRecibo", e.target.value)}
                onBlur={() => handleFieldChange("fechaRecibo", formData.fechaRecibo)}
                error={getError("fechaRecibo")}
                required={true}
              />

              <FormCombobox
                id="depositoID"
                label="Depósito"
                value={formData.depositoID}
                onChange={(value) => handleFieldChange("depositoID", value === "" ? "" : Number(value))}
                onBlur={() => handleFieldChange("depositoID", formData.depositoID)}
                options={depositosOptions}
                error={getError("depositoID")}
                placeholder="Seleccionar depósito"
                searchPlaceholder="Buscar depósito..."
              />

              <FormCombobox
                id="unidadEmbolsado"
                label="Unidad de embolsado"
                value={formData.unidadEmbolsado}
                onChange={(value) => handleFieldChange("unidadEmbolsado", value)}
                onBlur={() => handleFieldChange("unidadEmbolsado", formData.unidadEmbolsado)}
                options={unidadesEmbolsadoOptions}
                error={getError("unidadEmbolsado")}
                placeholder="Seleccionar unidad"
                searchPlaceholder="Buscar unidad..."
              />

              <FormField
                id="remitente"
                label="Remitente"
                value={formData.remitente}
                onChange={(e) => handleFieldChange("remitente", e.target.value)}
                onBlur={() => handleFieldChange("remitente", formData.remitente)}
                error={getError("remitente")}
              />

              <FormField
                id="observaciones"
                label="Observaciones"
                value={formData.observaciones}
                onChange={(e) => handleFieldChange("observaciones", e.target.value)}
                onBlur={() => handleFieldChange("observaciones", formData.observaciones)}
                error={getError("observaciones")}
              />
            </div>
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-4 mt-6">
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="kilosLimpios"
                  label="Kilos limpios"
                  type="number"
                  value={formData.kilosLimpios}
                  onChange={(e) => handleFieldChange("kilosLimpios", e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={() => handleFieldChange("kilosLimpios", formData.kilosLimpios)}
                  error={getError("kilosLimpios")}
                  required={true}
                />

                <FormCombobox
                  id="numeroArticuloID"
                  label="Número Artículo"
                  value={formData.numeroArticuloID}
                  onChange={(value) => handleFieldChange("numeroArticuloID", value)}
                  onBlur={() => handleFieldChange("numeroArticuloID", formData.numeroArticuloID)}
                  options={articulosOptions}
                  error={getError("numeroArticuloID")}
                  placeholder="Seleccionar artículo"
                  searchPlaceholder="Buscar artículo..."
                />

                <FormCombobox
                  id="origenID"
                  label="Origen"
                  value={formData.origenID}
                  onChange={(value) => handleFieldChange("origenID", value === "" ? "" : Number(value))}
                  onBlur={() => handleFieldChange("origenID", formData.origenID)}
                  options={origenesOptions}
                  error={getError("origenID")}
                  required={true}
                  placeholder="Seleccionar origen"
                  searchPlaceholder="Buscar origen..."
                />

                <FormSelect
                  id="estadoID"
                  label="Estado"
                  value={formData.estadoID}
                  onChange={(value) => handleFieldChange("estadoID", value === "" ? "" : Number(value))}
                  onBlur={() => handleFieldChange("estadoID", formData.estadoID)}
                  options={estadosOptions}
                  error={getError("estadoID")}
                  required={true}
                  placeholder="Seleccionar estado"
                />

                <FormField
                  id="fechaCosecha"
                  label="Fecha de cosecha"
                  type="date"
                  value={formData.fechaCosecha}
                  onChange={(e) => handleFieldChange("fechaCosecha", e.target.value)}
                  onBlur={() => handleFieldChange("fechaCosecha", formData.fechaCosecha)}
                  error={getError("fechaCosecha")}
                />
              </div>

              {/* Selector de tipos de análisis */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipos de Análisis <span className="text-red-500">*</span>
                </label>
                <TiposAnalisisSelector
                  tiposSeleccionados={formData.tiposAnalisisAsignados || []}
                onChange={(tipos) => handleFieldChange("tiposAnalisisAsignados", tipos)}
                error={getError("tiposAnalisisAsignados")}
                />
              </div>

              {/* Componente para gestionar datos de humedad */}
              <DatosHumedadManager
                datos={formData.datosHumedad}
                onChange={(datos) => handleFieldChange("datosHumedad", datos)}
                tiposHumedad={catalogsData.tiposHumedad}
                hasError={field => !!getError(field as keyof LoteFormData)}
                getErrorMessage={(field) => getError(field as keyof LoteFormData) || ""}
              />
            </>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}