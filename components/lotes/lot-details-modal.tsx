"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, ExternalLink } from "lucide-react"
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
  const router = useRouter()
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisType, setAnalysisType] = useState<string>("")
  const [analysisMode, setAnalysisMode] = useState<"create" | "view">("create")

  const handleEditClick = () => {
    if (lot?.loteID) {
      router.push(`/listado/lotes/${lot.loteID}/editar`)
      onClose()
    }
  }

  const handleCreateAnalysis = (type: string) => {
    if (type === "pureza-fisica") {
      onShowAnalysis()
    }
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
        <DialogContent className="w-[95vw] sm:w-[85vw] lg:w-[70vw] max-w-[1200px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4 sm:pb-6 border-b">
            <DialogTitle className="text-xl sm:text-2xl font-bold break-words">
              {lot.ficha || `Lote #${lot.loteID}`}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent w-full sm:w-auto"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4" />
              Editar Lote
              <ExternalLink className="h-3 w-3" />
            </Button>
          </DialogHeader>

          <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
            <div className="space-y-6">
              {/* Datos Section */}
              <DatosSection lot={lot} />

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
