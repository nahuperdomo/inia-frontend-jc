"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Building2, Truck, BarChart3, Edit, Save } from "lucide-react"

interface LotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lot: any
  onEdit: (lot: any) => void
  onShowAnalysis: () => void
}

export function LotDetailsModal({ isOpen, onClose, lot, onEdit, onShowAnalysis }: LotDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})

  const especies = ["Soja", "Maíz", "Trigo", "Arroz", "Girasol", "Sorgo", "Cebada"]
  const origenes = ["Nacional", "Importado", "Propio", "Terceros"]

  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditFormData({ ...lot })
    }
    setIsEditMode(!isEditMode)
  }

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSaveEdit = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onEdit(editFormData)
      setIsEditMode(false)
      setIsLoading(false)
    }, 1000)
  }

  if (!lot) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] min-w-[800px] max-w-none max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b">
          <DialogTitle className="text-2xl font-bold">{lot.numeroReferencia}</DialogTitle>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveEdit} disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleEditToggle}>
                <Edit className="h-4 w-4" />
                EDITAR
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <div className="space-y-6">
            {/* Datos Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Número de referencia</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.numeroReferencia || ""}
                        onChange={(e) => handleEditFormChange("numeroReferencia", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.numeroReferencia}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Número de ficha</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.numeroFicha || ""}
                        onChange={(e) => handleEditFormChange("numeroFicha", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.numeroFicha}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Ficha</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.ficha || ""}
                        onChange={(e) => handleEditFormChange("ficha", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.ficha}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Lote</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.lote || ""}
                        onChange={(e) => handleEditFormChange("lote", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.lote}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cultivar</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.cultivar || ""}
                        onChange={(e) => handleEditFormChange("cultivar", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.cultivar}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.tipo || ""}
                        onChange={(e) => handleEditFormChange("tipo", e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="font-semibold">{lot.tipo}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Especie</Label>
                    {isEditMode ? (
                      <Select
                        value={editFormData.especie || ""}
                        onValueChange={(value) => handleEditFormChange("especie", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {especies.map((especie) => (
                            <SelectItem key={especie} value={especie}>
                              {especie}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-semibold">{lot.especie}</div>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Origen</Label>
                    {isEditMode ? (
                      <Select
                        value={editFormData.origen || ""}
                        onValueChange={(value) => handleEditFormChange("origen", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {origenes.map((origen) => (
                            <SelectItem key={origen} value={origen}>
                              {origen}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="font-semibold">{lot.origen}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empresa Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Empresa</Label>
                    <div className="font-semibold">{lot.empresa}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                    <div className="font-semibold">{lot.cliente}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código CC</Label>
                    <div className="font-semibold">{lot.codigoCC}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código FF</Label>
                    <div className="font-semibold">{lot.codigoFF}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recepción y almacenamiento Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5" />
                  Recepción y almacenamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de entrega</Label>
                    <div className="font-semibold">{lot.fechaEntrega}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de recibo</Label>
                    <div className="font-semibold">{lot.fechaRecibo}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Depósito asignado</Label>
                    <div className="font-semibold">{lot.depositoAsignado}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Unidad de embalado</Label>
                    <div className="font-semibold">{lot.unidadEmbalado}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Resultados</Label>
                    <div className="font-semibold">{lot.resultados}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Observaciones</Label>
                    <div className="font-semibold">{lot.observaciones}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calidad y producción Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Calidad y producción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Kilos brutos</Label>
                    <div className="font-semibold">{lot.kilosBrutos}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Humedad (%)</Label>
                    <div className="font-semibold">{lot.humedad}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">CatSeed</Label>
                    <div className="font-semibold">{lot.catSeed}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análisis Asociados Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Análisis Asociados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!lot.hasAnalysis ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin análisis asociados</h3>
                    <p className="text-gray-500 mb-6">
                      Este lote aún no tiene análisis asociados. Crea uno para comenzar.
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100"
                        onClick={onShowAnalysis}
                      >
                        <span className="font-medium text-blue-900">Pureza física</span>
                        <span className="text-xs text-blue-600">Crear análisis</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1 bg-green-50 border-green-200 hover:bg-green-100"
                      >
                        <span className="font-medium text-green-900">Germinación</span>
                        <span className="text-xs text-green-600">Crear análisis</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1 bg-purple-50 border-purple-200 hover:bg-purple-100"
                      >
                        <span className="font-medium text-purple-900">Vigor</span>
                        <span className="text-xs text-purple-600">Crear análisis</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-16 flex flex-col gap-1 bg-red-50 border-red-200 hover:bg-red-100"
                      >
                        <span className="font-medium text-red-900">Tetrazolio</span>
                        <span className="text-xs text-red-600">Crear análisis</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3">Análisis Completados</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-green-300 rounded p-3">
                          <span className="font-medium text-green-900">Pureza física</span>
                          <div className="text-xs text-green-600 mt-1">Completado - 15/01/2024</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Análisis Disponibles</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-16 flex flex-col gap-1 bg-green-50 border-green-200 hover:bg-green-100"
                        >
                          <span className="font-medium text-green-900">Germinación</span>
                          <span className="text-xs text-green-600">Crear análisis</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 flex flex-col gap-1 bg-purple-50 border-purple-200 hover:bg-purple-100"
                        >
                          <span className="font-medium text-purple-900">Vigor</span>
                          <span className="text-xs text-purple-600">Crear análisis</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-16 flex flex-col gap-1 bg-red-50 border-red-200 hover:bg-red-100"
                        >
                          <span className="font-medium text-red-900">Tetrazolio</span>
                          <span className="text-xs text-red-600">Crear análisis</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deactivation Button */}
            <Button variant="destructive" className="w-full">
              Desactivación de Lote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
