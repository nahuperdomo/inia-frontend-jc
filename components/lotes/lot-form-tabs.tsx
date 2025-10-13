"use client"
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormField from "@/components/ui/form-field"
import FormSelect from "@/components/ui/form-select"
import { LoteFormData } from "@/lib/validations/lotes-validation"
import { CatalogoDTO, ContactoDTO, CultivarDTO } from "@/app/models"
import { DatosHumedadManager } from "./datos-humedad-manager"
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
  const [cultivares, setCultivares] = useState<CultivarOption[]>([])
  const [empresas, setEmpresas] = useState<EmpresaOption[]>([])
  const [clientes, setClientes] = useState<ClienteOption[]>([])
  const [depositos, setDepositos] = useState<DepositoOption[]>([])
  const [tiposHumedad, setTiposHumedad] = useState<TipoHumedadOption[]>([])
  const [origenes, setOrigenes] = useState<OrigenOption[]>([])
  const [estados, setEstados] = useState<EstadoOption[]>([])
  const [especies, setEspecies] = useState<EspecieOption[]>([])
  const [unidadesEmbolsado, setUnidadesEmbolsado] = useState<UnidadEmbolsadoOption[]>([])
  const [articulos, setArticulos] = useState<ArticuloOption[]>([])
  const [tipoOptionsLocal, setTipoOptionsLocal] = useState<{ id: string, nombre: string }[]>([])
  const [loading, setLoading] = useState(true)

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

        setCultivares(cultivaresData)
        setEmpresas(empresasData)
        setClientes(clientesData)
        setDepositos(depositosData)
        setTiposHumedad(tiposHumedadData)
        setOrigenes(origenesData)
        setEstados(estadosData)
        setEspecies(especiesData)
        setUnidadesEmbolsado(unidadesEmbolsadoData)
        setArticulos(articulosData)

        // Establecer tipoOptions de forma estática para evitar bucles
        setTipoOptionsLocal([
          { id: "MADRE", nombre: "Madre" },
          { id: "COMERCIAL", nombre: "Comercial" },
          { id: "BASICO", nombre: "Básico" },
          { id: "CERTIFICADO", nombre: "Certificado" }
        ])
      } catch (error) {
        console.error("Error al cargar catálogos:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarCatalogos()
  }, [])

  // Función para manejar cambios sin validación automática - memoizada para evitar re-renders
  const handleInputChange = useCallback((field: keyof LoteFormData, value: any) => {
    onInputChange(field, value)
  }, [onInputChange])

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
                  options={cultivares}
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
                  options={tipoOptionsLocal}
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
                  options={empresas}
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
                  options={clientes}
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
                  options={depositos}
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
                  options={unidadesEmbolsado}
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
                    options={origenes}
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
                    onChange={(e) => handleInputChange("fechaCosecha", e.target.value)}
                    onBlur={() => handleBlur("fechaCosecha")}
                    error={hasError("fechaCosecha") ? getErrorMessage("fechaCosecha") : undefined}
                    required={true}
                  />
                </div>

                {/* Componente para gestionar datos de humedad */}
                <DatosHumedadManager
                  datos={formData.datosHumedad}
                  onChange={(datos) => handleInputChange("datosHumedad", datos)}
                  tiposHumedad={tiposHumedad}
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
