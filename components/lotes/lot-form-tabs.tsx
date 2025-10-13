"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import { LoteFormData } from "@/lib/validations/lotes-validation"
import { DatosHumedadManager } from "./datos-humedad-manager"
import { TiposAnalisisSelector } from "./tipos-analisis-selector"
import {
  obtenerCultivares,
  obtenerEmpresas,
  obtenerClientes,
  obtenerDepositos,
  obtenerTiposHumedad,
  obtenerOrigenes,
  obtenerEstados,
  obtenerEspecies,
  obtenerUnidadesEmbolsado,
  obtenerArticulos,
  tipoOptions
} from "@/app/services/catalogo-form-service"
import {
  type CultivarOption,
  type EmpresaOption,
  type ClienteOption,
  type DepositoOption,
  type TipoHumedadOption,
  type OrigenOption,
  type EstadoOption,
  type EspecieOption,
  type UnidadEmbolsadoOption,
  type ArticuloOption
} from "@/app/models/interfaces/lote"
import { TipoAnalisis } from "@/app/models/types/enums"
import { CatalogoDTO, ContactoDTO, CultivarDTO } from "@/app/models"

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
  // Estados para los catálogos
  const [cultivaresLocal, setCultivaresLocal] = useState<CultivarOption[]>([])
  const [empresasLocal, setEmpresasLocal] = useState<EmpresaOption[]>([])
  const [clientesLocal, setClientesLocal] = useState<ClienteOption[]>([])
  const [depositosLocal, setDepositosLocal] = useState<DepositoOption[]>([])
  const [tiposHumedadLocal, setTiposHumedadLocal] = useState<TipoHumedadOption[]>([])
  const [origenesLocal, setOrigenesLocal] = useState<OrigenOption[]>([])
  const [estadosLocal, setEstadosLocal] = useState<EstadoOption[]>([])
  const [especiesLocal, setEspeciesLocal] = useState<EspecieOption[]>([])
  const [unidadesEmbolsadoLocal, setUnidadesEmbolsadoLocal] = useState<UnidadEmbolsadoOption[]>([])
  const [articulosLocal, setArticulosLocal] = useState<ArticuloOption[]>([])
  const [loading, setLoading] = useState(true)

  // Opciones estáticas
  const tipoOptions = [
    { id: "INTERNO", nombre: "Interno" },
    { id: "EXTERNO", nombre: "Externo" }
  ]

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        setLoading(true)
        const [
          cultivaresData,
          empresasData,
          clientesData,
          depositosData,
          tiposHumedadData,
          origenesData,
          estadosData,
          especiesData,
          unidadesEmbolsadoData,
          articulosData
        ] = await Promise.all([
          obtenerCultivares(),
          obtenerEmpresas(),
          obtenerClientes(),
          obtenerDepositos(),
          obtenerTiposHumedad(),
          obtenerOrigenes(),
          obtenerEstados(),
          obtenerEspecies(),
          obtenerUnidadesEmbolsado(),
          obtenerArticulos()
        ])

        setCultivaresLocal(cultivaresData)
        setEmpresasLocal(empresasData)
        setClientesLocal(clientesData)
        setDepositosLocal(depositosData)
        setTiposHumedadLocal(tiposHumedadData)
        setOrigenesLocal(origenesData)
        setEstadosLocal(estadosData)
        setEspeciesLocal(especiesData)
        setUnidadesEmbolsadoLocal(unidadesEmbolsadoData)
        setArticulosLocal(articulosData)
      } catch (error) {
        console.error("Error al cargar catálogos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCatalogos()
  }, [])

  // Función para manejar cambios sin validación automática
  const handleInputChange = (field: keyof LoteFormData, value: any) => {
    onInputChange(field, value)
  }
  // Map backend data to the format expected by FormSelect
  const cultivaresOptions = cultivaresLocal.map(cultivar => ({
    id: cultivar.id,
    nombre: cultivar.nombre
  }));

  const empresasOptions = empresasLocal.map(empresa => ({
    id: empresa.id,
    nombre: empresa.nombre
  }));

  const clientesOptions = clientesLocal.map(cliente => ({
    id: cliente.id,
    nombre: cliente.nombre
  }));

  // Mapeo que maneja la estructura real del backend
  const depositosOptions = depositosLocal.map((deposito: any) => ({
    id: deposito.id,
    nombre: deposito.valor
  }));

  const tiposHumedadOptions = tiposHumedadLocal.map((tipo: any) => ({
    id: tipo.id,
    nombre: tipo.valor
  }));

  const origenesOptions = origenesLocal.map((origen: any) => ({
    id: origen.id,
    nombre: origen.valor
  }));

  const estadosOptions = estadosLocal.map((estado: any) => ({
    id: estado.id,
    nombre: estado.valor
  }));

  const articulosOptions = articulosLocal.map((articulo: any) => ({
    id: articulo.id,
    nombre: articulo.valor
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
            {loading ? (
              <div className="text-center py-8">Cargando catálogos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  options={cultivaresLocal}
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
            )}
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-8">Cargando catálogos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  id="empresaID"
                  label="Empresa"
                  value={formData.empresaID}
                  onChange={(value) => handleInputChange("empresaID", value === "" ? "" : Number(value))}
                  onBlur={() => handleBlur("empresaID")}
                  options={empresasLocal}
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
                  options={clientesLocal}
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
            )}
          </TabsContent>

          {/* Recepción y almacenamiento Tab */}
          <TabsContent value="recepcion" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-8">Cargando catálogos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  options={depositosLocal}
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
                  options={unidadesEmbolsadoLocal}
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
            )}
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-8">Cargando catálogos...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    options={origenesLocal}
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
                    options={estadosLocal}
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
                  tiposHumedad={tiposHumedadLocal}
                  hasError={hasError}
                  getErrorMessage={getErrorMessage}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
