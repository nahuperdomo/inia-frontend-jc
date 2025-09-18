"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  lot: any
  onSave: (data: any) => void
  mode?: "create" | "view"
  existingData?: any
}

export function AnalysisModal({ isOpen, onClose, lot, onSave, mode = "create", existingData }: AnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(mode === "create")

  const [formData, setFormData] = useState({
    metodologia: existingData?.metodologia || "INIA",
    unidad: existingData?.unidad || "g",
    pesoInicial: existingData?.pesoInicial || "",
    semillaPura: existingData?.semillaPura || "",
    materiaInerte: existingData?.materiaInerte || "",
    otrosCultivos: existingData?.otrosCultivos || "",
    malezas: existingData?.malezas || "",
    malezasToleradas: existingData?.malezasToleradas || "",
    pesoTotal: existingData?.pesoTotal || "",
  })

  const [showWeightAlert, setShowWeightAlert] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    if (!isEditMode) return
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "pesoTotal" || field === "pesoInicial") {
      checkWeightDifference()
    }
  }

  const checkWeightDifference = () => {
    const inicial = Number.parseFloat(formData.pesoInicial || "0")
    const total = Number.parseFloat(formData.pesoTotal || "0")
    const diferencia = Math.abs(inicial - total)
    const porcentajeDiferencia = inicial > 0 ? (diferencia / inicial) * 100 : 0

    if (porcentajeDiferencia < 5 && porcentajeDiferencia > 0) {
      setShowWeightAlert(true)
    } else {
      setShowWeightAlert(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setTimeout(() => {
      onSave(formData)
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  if (!lot) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            {mode === "view" ? "Pureza física" : "Pureza"}
            {mode === "view" && <span className="text-sm text-gray-500 ml-2">02/04/2025</span>}
            <div className="ml-auto flex gap-2">
              {mode === "view" && !isEditMode && (
                <Button variant="outline" size="sm" className="bg-transparent" onClick={handleEdit}>
                  EDITAR
                </Button>
              )}
              {mode === "view" && (
                <Button variant="outline" size="sm" className="bg-transparent">
                  OTRAS SEMILLAS
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={formData.metodologia} onValueChange={(value) => handleInputChange("metodologia", value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="INIA">INIA</TabsTrigger>
              <TabsTrigger value="INASE">INASE%</TabsTrigger>
            </TabsList>

            <TabsContent value="INIA" className="space-y-4">
              {mode === "view" && !isEditMode ? (
                <div className="space-y-4">
                  <div className="text-right text-sm text-gray-500">%redondeado</div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Peso inicial</span>
                      <span className="font-mono">{existingData?.pesoInicial || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Semilla pura</span>
                      <span className="font-mono">{existingData?.semillaPura || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Materia inerte</span>
                      <span className="font-mono">{existingData?.materiaInerte || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Otros cultivos</span>
                      <span className="font-mono">{existingData?.otrosCultivos || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Malezas</span>
                      <span className="font-mono">{existingData?.malezas || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Malezas toleradas</span>
                      <span className="font-mono">{existingData?.malezasToleradas || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Peso total</span>
                      <span className="font-mono">{existingData?.pesoTotal || "XXXX"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs value={formData.unidad} onValueChange={(value) => handleInputChange("unidad", value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="g">g</TabsTrigger>
                    <TabsTrigger value="%">%</TabsTrigger>
                    <TabsTrigger value="%redondeado">%redondeado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="g" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial">Peso inicial</Label>
                        <Input
                          id="peso-inicial"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura">Semilla pura</Label>
                        <Input
                          id="semilla-pura"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte">Materia inerte</Label>
                        <Input
                          id="materia-inerte"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas">Malezas</Label>
                        <Input
                          id="malezas"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total">Peso total</Label>
                      <Input
                        id="peso-total"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="%" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial-pct">Peso inicial</Label>
                        <Input
                          id="peso-inicial-pct"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura-pct">Semilla pura</Label>
                        <Input
                          id="semilla-pura-pct"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte-pct">Materia inerte</Label>
                        <Input
                          id="materia-inerte-pct"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos-pct">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos-pct"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas-pct">Malezas</Label>
                        <Input
                          id="malezas-pct"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas-pct">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas-pct"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total-pct">Peso total</Label>
                      <Input
                        id="peso-total-pct"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="%redondeado" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial-red">Peso inicial</Label>
                        <Input
                          id="peso-inicial-red"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura-red">Semilla pura</Label>
                        <Input
                          id="semilla-pura-red"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte-red">Materia inerte</Label>
                        <Input
                          id="materia-inerte-red"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos-red">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos-red"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas-red">Malezas</Label>
                        <Input
                          id="malezas-red"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas-red">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas-red"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total-red">Peso total</Label>
                      <Input
                        id="peso-total-red"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>

            <TabsContent value="INASE" className="space-y-4">
              {mode === "view" && !isEditMode ? (
                <div className="space-y-4">
                  <div className="text-right text-sm text-gray-500">%redondeado</div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Peso inicial</span>
                      <span className="font-mono">{existingData?.pesoInicial || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Semilla pura</span>
                      <span className="font-mono">{existingData?.semillaPura || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Materia inerte</span>
                      <span className="font-mono">{existingData?.materiaInerte || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Otros cultivos</span>
                      <span className="font-mono">{existingData?.otrosCultivos || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Malezas</span>
                      <span className="font-mono">{existingData?.malezas || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Malezas toleradas</span>
                      <span className="font-mono">{existingData?.malezasToleradas || "XXXX"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-700">Peso total</span>
                      <span className="font-mono">{existingData?.pesoTotal || "XXXX"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs value={formData.unidad} onValueChange={(value) => handleInputChange("unidad", value)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="g">g</TabsTrigger>
                    <TabsTrigger value="%">%</TabsTrigger>
                    <TabsTrigger value="%redondeado">%redondeado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="g" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial-inase">Peso inicial</Label>
                        <Input
                          id="peso-inicial-inase"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura-inase">Semilla pura</Label>
                        <Input
                          id="semilla-pura-inase"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte-inase">Materia inerte</Label>
                        <Input
                          id="materia-inerte-inase"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos-inase">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos-inase"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas-inase">Malezas</Label>
                        <Input
                          id="malezas-inase"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas-inase">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas-inase"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total-inase">Peso total</Label>
                      <Input
                        id="peso-total-inase"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="%" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial-inase-pct">Peso inicial</Label>
                        <Input
                          id="peso-inicial-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura-inase-pct">Semilla pura</Label>
                        <Input
                          id="semilla-pura-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte-inase-pct">Materia inerte</Label>
                        <Input
                          id="materia-inerte-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos-inase-pct">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas-inase-pct">Malezas</Label>
                        <Input
                          id="malezas-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas-inase-pct">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas-inase-pct"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total-inase-pct">Peso total</Label>
                      <Input
                        id="peso-total-inase-pct"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="%redondeado" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-inicial-inase-red">Peso inicial</Label>
                        <Input
                          id="peso-inicial-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.pesoInicial}
                          onChange={(e) => handleInputChange("pesoInicial", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semilla-pura-inase-red">Semilla pura</Label>
                        <Input
                          id="semilla-pura-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.semillaPura}
                          onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="materia-inerte-inase-red">Materia inerte</Label>
                        <Input
                          id="materia-inerte-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.materiaInerte}
                          onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otros-cultivos-inase-red">Otros cultivos</Label>
                        <Input
                          id="otros-cultivos-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.otrosCultivos}
                          onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="malezas-inase-red">Malezas</Label>
                        <Input
                          id="malezas-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.malezas}
                          onChange={(e) => handleInputChange("malezas", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="malezas-toleradas-inase-red">Malezas toleradas</Label>
                        <Input
                          id="malezas-toleradas-inase-red"
                          type="number"
                          placeholder="0"
                          value={formData.malezasToleradas}
                          onChange={(e) => handleInputChange("malezasToleradas", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peso-total-inase-red">Peso total</Label>
                      <Input
                        id="peso-total-inase-red"
                        type="number"
                        placeholder="0"
                        value={formData.pesoTotal}
                        onChange={(e) => handleInputChange("pesoTotal", e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="flex items-center justify-between">
              <span>Diferencia de peso: &lt;5%</span>
              <Button size="sm" variant="outline" className="ml-4 bg-transparent">
                Aceptar
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <DialogFooter>
          {mode === "view" && !isEditMode ? (
            <Button onClick={onClose}>Cerrar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Siguiente"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
