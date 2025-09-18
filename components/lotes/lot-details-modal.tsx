"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Building2, Truck, BarChart3, Edit, Save } from "lucide-react"
import { AnalysisSection } from "./analysis-section"
import { AnalysisModal } from "./analysis-modal"

interface LotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lot: any
  onEdit: (lot: any) => void
  onShowAnalysis: () => void
  onViewAnalysis?: (type: string) => void
}

export function LotDetailsModal({
  isOpen,
  onClose,
  lot,
  onEdit,
  onShowAnalysis,
  onViewAnalysis,
}: LotDetailsModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisType, setAnalysisType] = useState<string>("")
  const [analysisMode, setAnalysisMode] = useState<"create" | "view">("create")

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

  const handleCreateAnalysis = (type: string) => {
    if (type === "pureza-fisica") {
      onShowAnalysis()
    }
    // Handle other analysis types here
  }

  const handleViewAnalysis = (type: string) => {
    setAnalysisType(type)
    setAnalysisMode("view")
    setIsAnalysisModalOpen(true)
  }

  if (!lot) return null

  return (
    <>
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

              <AnalysisSection lot={lot} onCreateAnalysis={handleCreateAnalysis} onViewAnalysis={handleViewAnalysis} />

              {/* Deactivation Button */}
              <Button variant="destructive" className="w-full">
                Desactivación de Lote
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        lot={lot}
        analysisType={analysisType}
        mode={analysisMode}
        onSave={() => {
          setIsAnalysisModalOpen(false)
          // Handle save logic here
        }}
      />
    </>
  )
}
