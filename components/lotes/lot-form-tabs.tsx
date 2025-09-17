"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LoteFormData {
  numeroReferencia: string
  numeroFicha: string
  ficha: string
  lote: string
  cultivar: string
  tipo: string
  especie: string
  origen: string
  empresa: string
  cliente: string
  codigoCC: string
  codigoFF: string
  fechaEntrega: string
  fechaRecibo: string
  depositoAsignado: string
  unidadEmbalado: string
  resultados: string
  observaciones: string
  kilosBrutos: string
  humedad: string
  catSeed: string
}

interface LotFormTabsProps {
  formData: LoteFormData
  onInputChange: (field: keyof LoteFormData, value: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function LotFormTabs({ formData, onInputChange, activeTab, onTabChange }: LotFormTabsProps) {
  const especies = ["Soja", "Maíz", "Trigo", "Arroz", "Girasol", "Sorgo", "Cebada"]
  const origenes = ["Nacional", "Importado", "Propio", "Terceros"]
  const depositosAsignados = ["Depósito A", "Depósito B", "Depósito C", "Depósito Principal"]
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
                <Label htmlFor="numeroReferencia">Número de referencia</Label>
                <Input
                  id="numeroReferencia"
                  placeholder="0"
                  value={formData.numeroReferencia}
                  onChange={(e) => onInputChange("numeroReferencia", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="numeroFicha">Número de ficha</Label>
                <Input
                  id="numeroFicha"
                  value={formData.numeroFicha}
                  onChange={(e) => onInputChange("numeroFicha", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ficha">Ficha</Label>
                <Input
                  id="ficha"
                  placeholder="0"
                  value={formData.ficha}
                  onChange={(e) => onInputChange("ficha", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lote">Lote</Label>
                <Input id="lote" value={formData.lote} onChange={(e) => onInputChange("lote", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cultivar">Cultivar</Label>
                <Select value={formData.cultivar} onValueChange={(value) => onInputChange("cultivar", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cultivar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cultivar1">Cultivar 1</SelectItem>
                    <SelectItem value="cultivar2">Cultivar 2</SelectItem>
                    <SelectItem value="cultivar3">Cultivar 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  placeholder="XXXX"
                  value={formData.tipo}
                  onChange={(e) => onInputChange("tipo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="especie">Especie</Label>
                <Select value={formData.especie} onValueChange={(value) => onInputChange("especie", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especie" />
                  </SelectTrigger>
                  <SelectContent>
                    {especies.map((especie) => (
                      <SelectItem key={especie} value={especie}>
                        {especie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="origen">Origen</Label>
                <Select value={formData.origen} onValueChange={(value) => onInputChange("origen", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {origenes.map((origen) => (
                      <SelectItem key={origen} value={origen}>
                        {origen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Empresa Tab */}
          <TabsContent value="empresa" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => onInputChange("empresa", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => onInputChange("cliente", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="codigoCC">Código CC</Label>
                <Input
                  id="codigoCC"
                  value={formData.codigoCC}
                  onChange={(e) => onInputChange("codigoCC", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="codigoFF">Código FF</Label>
                <Input
                  id="codigoFF"
                  value={formData.codigoFF}
                  onChange={(e) => onInputChange("codigoFF", e.target.value)}
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
                  onChange={(e) => onInputChange("fechaEntrega", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaRecibo">Fecha de recibo</Label>
                <Input
                  id="fechaRecibo"
                  type="date"
                  value={formData.fechaRecibo}
                  onChange={(e) => onInputChange("fechaRecibo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="depositoAsignado">Depósito asignado</Label>
                <Select
                  value={formData.depositoAsignado}
                  onValueChange={(value) => onInputChange("depositoAsignado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar depósito" />
                  </SelectTrigger>
                  <SelectContent>
                    {depositosAsignados.map((deposito) => (
                      <SelectItem key={deposito} value={deposito}>
                        {deposito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="unidadEmbalado">Unidad de embalado</Label>
                <Select
                  value={formData.unidadEmbalado}
                  onValueChange={(value) => onInputChange("unidadEmbalado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesEmbalado.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resultados">Resultados</Label>
                <Input
                  id="resultados"
                  value={formData.resultados}
                  onChange={(e) => onInputChange("resultados", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Input
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => onInputChange("observaciones", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Calidad y producción Tab */}
          <TabsContent value="calidad" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kilosBrutos">Kilos brutos</Label>
                <Input
                  id="kilosBrutos"
                  type="number"
                  value={formData.kilosBrutos}
                  onChange={(e) => onInputChange("kilosBrutos", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="humedad">Humedad (%)</Label>
                <Input
                  id="humedad"
                  type="number"
                  step="0.1"
                  value={formData.humedad}
                  onChange={(e) => onInputChange("humedad", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="catSeed">CatSeed</Label>
                <Input
                  id="catSeed"
                  value={formData.catSeed}
                  onChange={(e) => onInputChange("catSeed", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
