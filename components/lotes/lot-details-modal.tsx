"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Save } from "lucide-react"
import { AnalysisModal } from "./analysis-modal"
import { DatosSection } from "./sections/DatosSection"
import { EmpresaSection } from "./sections/EmpresaSection"
import { RecepcionSection } from "./sections/RecepcionSection"
import { CalidadSection } from "./sections/CalidadSection"
import { LoteDTO } from "@/app/models"

interface LotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  lot: LoteDTO
  onEdit: (lot: LoteDTO) => void
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
            <DialogTitle className="text-2xl font-bold">{lot.numeroReferencia || `Lote #${lot.loteID}`}</DialogTitle>
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
              <DatosSection
                lot={lot}
                isEditMode={isEditMode}
                editFormData={editFormData}
                handleEditFormChange={handleEditFormChange}
                especies={especies}
                origenes={origenes}
              />

              {/* Empresa Section */}
              <EmpresaSection lot={lot} />

              {/* Recepción y almacenamiento Section */}
              <RecepcionSection lot={lot} />

              {/* Calidad y producción Section */}
              <CalidadSection lot={lot} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        lot={lot}
        mode={analysisMode}
        onSave={() => {
          setIsAnalysisModalOpen(false)
          // Handle save logic here
        }}
      />
    </>
  )
}
