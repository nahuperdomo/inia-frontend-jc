"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoteFormData {
  numeroFicha: number | ""
  ficha: string
  cultivarID: number | ""
  tipo: string
  empresaID: number | ""
  clienteID: number | ""
  codigoCC: string
  codigoFF: string
  fechaEntrega: string
  fechaRecibo: string
  depositoID: number | ""
  unidadEmbalado: string
  remitente: string
  observaciones: string
  kilosLimpios: number | ""
  datosHumedad: Array<{
    tipoHumedadID: number | ""
    valor: number | ""
  }>
  numeroArticuloID: number | ""
  cantidad: number | ""
  origen: string
  estado: string
  fechaCosecha: string
}

interface LotFormTabsProps {
  formData: LoteFormData
  onInputChange: (field: keyof LoteFormData, value: any) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function LotFormTabs({ formData, onInputChange, activeTab, onTabChange }: LotFormTabsProps) {
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
  const unidadesEmbalado = ["Bolsas", "Granel", "Big Bags", "Contenedores"]

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
              <div>
                <Label htmlFor="numeroFicha">Número de ficha</Label>
                <Input
                  id="numeroFicha"
                  type="number"
                  value={formData.numeroFicha}
                  onChange={e => onInputChange("numeroFicha", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="ficha">Ficha</Label>
                <Input
                  id="ficha"
                  value={formData.ficha}
                  onChange={e => onInputChange("ficha", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cultivarID">Cultivar</Label>
                <Select
                  value={formData.cultivarID === "" ? "" : String(formData.cultivarID)}
                  onValueChange={value => onInputChange("cultivarID", value === "" ? "" : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cultivar" />
                  </SelectTrigger>
                  <SelectContent>
                    {cultivares.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={value => onInputChange("tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNO">Interno</SelectItem>
                    <SelectItem value="OTROS_CENTROS_COSTOS">Otros Centros de Costos</SelectItem>
                    <SelectItem value="EXTERNOS">Externos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresaID">Empresa</Label>
                <Select
                  value={formData.empresaID === "" ? "" : String(formData.empresaID)}
                  onValueChange={value => onInputChange("empresaID", value === "" ? "" : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>{e.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clienteID">Cliente</Label>
                <Select
                  value={formData.clienteID === "" ? "" : String(formData.clienteID)}
                  onValueChange={value => onInputChange("clienteID", value === "" ? "" : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="codigoCC">Código CC</Label>
                <Input
                  id="codigoCC"
                  value={formData.codigoCC}
                  onChange={e => onInputChange("codigoCC", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="codigoFF">Código FF</Label>
                <Input
                  id="codigoFF"
                  value={formData.codigoFF}
                  onChange={e => onInputChange("codigoFF", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Recepción y almacenamiento Tab */}
          <TabsContent value="recepcion" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaEntrega">Fecha de entrega</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={e => onInputChange("fechaEntrega", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaRecibo">Fecha de recibo</Label>
                <Input
                  id="fechaRecibo"
                  type="date"
                  value={formData.fechaRecibo}
                  onChange={e => onInputChange("fechaRecibo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="depositoID">Depósito</Label>
                <Select
                  value={formData.depositoID === "" ? "" : String(formData.depositoID)}
                  onValueChange={value => onInputChange("depositoID", value === "" ? "" : Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar depósito" />
                  </SelectTrigger>
                  <SelectContent>
                    {depositos.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unidadEmbalado">Unidad de embalado</Label>
                <Select
                  value={formData.unidadEmbalado}
                  onValueChange={value => onInputChange("unidadEmbalado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesEmbalado.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>{unidad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="remitente">Remitente</Label>
                <Input
                  id="remitente"
                  value={formData.remitente}
                  onChange={e => onInputChange("remitente", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={e => onInputChange("observaciones", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kilosLimpios">Kilos limpios</Label>
                <Input
                  id="kilosLimpios"
                  type="number"
                  value={formData.kilosLimpios}
                  onChange={e => onInputChange("kilosLimpios", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="tipoHumedadID">Tipo de humedad</Label>
                <Input
                  id="tipoHumedadID"
                  type="number"
                  value={formData.datosHumedad[0]?.tipoHumedadID ?? ""}
                  onChange={e => {
                    const newDatos = [...formData.datosHumedad]
                    newDatos[0] = {
                      ...newDatos[0],
                      tipoHumedadID: e.target.value === "" ? "" : Number(e.target.value)
                    }
                    onInputChange("datosHumedad", newDatos)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="valorHumedad">Valor humedad (%)</Label>
                <Input
                  id="valorHumedad"
                  type="number"
                  step="0.1"
                  value={formData.datosHumedad[0]?.valor ?? ""}
                  onChange={e => {
                    const newDatos = [...formData.datosHumedad]
                    newDatos[0] = {
                      ...newDatos[0],
                      valor: e.target.value === "" ? "" : Number(e.target.value)
                    }
                    onInputChange("datosHumedad", newDatos)
                  }}
                />
              </div>
              <div>
                <Label htmlFor="numeroArticuloID">Número Artículo</Label>
                <Input
                  id="numeroArticuloID"
                  type="number"
                  value={formData.numeroArticuloID}
                  onChange={e => onInputChange("numeroArticuloID", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={e => onInputChange("cantidad", e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="origen">Origen</Label>
                <Input
                  id="origen"
                  value={formData.origen}
                  onChange={e => onInputChange("origen", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={e => onInputChange("estado", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaCosecha">Fecha de cosecha</Label>
                <Input
                  id="fechaCosecha"
                  type="date"
                  value={formData.fechaCosecha}
                  onChange={e => onInputChange("fechaCosecha", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
