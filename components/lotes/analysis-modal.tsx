"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  lot: any
  onSave: (data: any) => void
}

export function AnalysisModal({ isOpen, onClose, lot, onSave }: AnalysisModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    pesoMuestraInicial: "",
    semillaPura: "",
    materiaInerte: "",
    otrosCultivos: "",
    malezas: "",
    observaciones: "",
    fechaAnalisis: new Date().toISOString().split("T")[0],
    responsable: "",
    metodologia: "ISTA",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      onSave(formData)
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const calculateTotal = () => {
    const total =
      Number.parseFloat(formData.semillaPura || "0") +
      Number.parseFloat(formData.materiaInerte || "0") +
      Number.parseFloat(formData.otrosCultivos || "0") +
      Number.parseFloat(formData.malezas || "0")
    return total.toFixed(2)
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
            Análisis de Pureza Física
          </DialogTitle>
          <DialogDescription>Crear nuevo análisis de pureza física para el lote {lot.lote}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Lote */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Información del Lote</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Lote:</span>
                <span className="ml-2 font-medium">{lot.lote}</span>
              </div>
              <div>
                <span className="text-blue-600">Especie:</span>
                <span className="ml-2 font-medium">{lot.especie}</span>
              </div>
              <div>
                <span className="text-blue-600">Cultivar:</span>
                <span className="ml-2 font-medium">{lot.cultivar}</span>
              </div>
              <div>
                <span className="text-blue-600">Origen:</span>
                <span className="ml-2 font-medium">{lot.origen}</span>
              </div>
            </div>
          </div>

          {/* Datos del Análisis */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Datos del Análisis</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaAnalisis">Fecha de Análisis</Label>
                <Input
                  id="fechaAnalisis"
                  type="date"
                  value={formData.fechaAnalisis}
                  onChange={(e) => handleInputChange("fechaAnalisis", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="responsable">Responsable</Label>
                <Select value={formData.responsable} onValueChange={(value) => handleInputChange("responsable", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-perez">Dr. Juan Pérez</SelectItem>
                    <SelectItem value="dra-gonzalez">Dra. María González</SelectItem>
                    <SelectItem value="ing-martinez">Ing. Carlos Martínez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metodologia">Metodología</Label>
                <Select value={formData.metodologia} onValueChange={(value) => handleInputChange("metodologia", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISTA">ISTA</SelectItem>
                    <SelectItem value="AOSA">AOSA</SelectItem>
                    <SelectItem value="INASE">INASE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pesoMuestraInicial">Peso Muestra Inicial (g)</Label>
                <Input
                  id="pesoMuestraInicial"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.pesoMuestraInicial}
                  onChange={(e) => handleInputChange("pesoMuestraInicial", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Componentes de Pureza */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Componentes de Pureza (%)</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="semillaPura" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Semilla Pura
                </Label>
                <Input
                  id="semillaPura"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.semillaPura}
                  onChange={(e) => handleInputChange("semillaPura", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="materiaInerte" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  Materia Inerte
                </Label>
                <Input
                  id="materiaInerte"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.materiaInerte}
                  onChange={(e) => handleInputChange("materiaInerte", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="otrosCultivos" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  Otros Cultivos
                </Label>
                <Input
                  id="otrosCultivos"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.otrosCultivos}
                  onChange={(e) => handleInputChange("otrosCultivos", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="malezas" className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Malezas
                </Label>
                <Input
                  id="malezas"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.malezas}
                  onChange={(e) => handleInputChange("malezas", e.target.value)}
                />
              </div>
            </div>

            {/* Vista Previa de Resultados */}
            {(formData.semillaPura || formData.materiaInerte || formData.otrosCultivos || formData.malezas) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Vista Previa de Resultados</h5>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">{formData.semillaPura || "0.00"}%</div>
                    <div className="text-xs text-gray-600">Semilla Pura</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-gray-600">{formData.materiaInerte || "0.00"}%</div>
                    <div className="text-xs text-gray-600">Materia Inerte</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-orange-600">{formData.otrosCultivos || "0.00"}%</div>
                    <div className="text-xs text-gray-600">Otros Cultivos</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-bold text-red-600">{formData.malezas || "0.00"}%</div>
                    <div className="text-xs text-gray-600">Malezas</div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold">{calculateTotal()}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <textarea
              id="observaciones"
              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observaciones adicionales sobre el análisis..."
              value={formData.observaciones}
              onChange={(e) => handleInputChange("observaciones", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Análisis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
