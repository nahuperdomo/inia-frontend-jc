"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

import { LotFormTabs } from "@/components/lotes/lot-form-tabs"
import { LotList } from "@/components/lotes/lot-list"
import { LotDetailsModal } from "@/components/lotes/lot-details-modal"
import { AnalysisModal } from "@/components/lotes/analysis-modal"

import { createLote } from "@/app/services/lotes-service"

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
  // Agrega aquí otros campos según el backend (numeroArticuloID, cantidad, origen, estado, fechaCosecha, etc.)
}

export default function RegistroLotesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  const [formData, setFormData] = useState<LoteFormData>({
    numeroFicha: "",
    ficha: "",
    cultivarID: "",
    tipo: "",
    empresaID: "",
    clienteID: "",
    codigoCC: "",
    codigoFF: "",
    fechaEntrega: "",
    fechaRecibo: "",
    depositoID: "",
    unidadEmbalado: "",
    remitente: "",
    observaciones: "",
    kilosLimpios: "",
    datosHumedad: [
      {
        tipoHumedadID: "",
        valor: "",
      },
    ],
    numeroArticuloID: "",
    cantidad: "",
    origen: "",
    estado: "",
    fechaCosecha: "",
  })

  const recentLots = [
    {
      id: "1",
      lote: "SOJ-2024-001",
      numeroReferencia: "REF-001",
      numeroFicha: "F-001",
      ficha: "001",
      cultivar: "DM 4670",
      tipo: "Comercial",
      especie: "Soja",
      origen: "Nacional",
      empresa: "AgroSemillas SA",
      cliente: "Cooperativa Norte",
      codigoCC: "CC-001",
      codigoFF: "FF-001",
      fechaEntrega: "2024-01-10",
      fechaRecibo: "2024-01-12",
      depositoAsignado: "Depósito A",
      unidadEmbalado: "Bolsas",
      resultados: "Aprobado",
      observaciones: "Lote en excelente estado",
      kilosBrutos: "1000",
      humedad: "12.5",
      catSeed: "CS-001",
      estado: "Activo",
      hasAnalysis: false,
    }
  ]

  const handleInputChange = (field: keyof LoteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createLote(formData)
      router.push("/registro")
    } catch (error) {
      // Maneja el error (puedes mostrar un toast, alerta, etc.)
      console.error("Error al registrar lote:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (lot: any) => {
    setSelectedLot(lot)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedLot(null)
  }

  const handleEditLot = (updatedLot: any) => {
    // Update lot in the list
    console.log("Lot updated:", updatedLot)
  }

  const handleShowAnalysis = () => {
    setShowAnalysisModal(true)
  }

  const handleCloseAnalysisModal = () => {
    setShowAnalysisModal(false)
  }

  const handleSaveAnalysis = (analysisData: any) => {
    console.log("Analysis saved:", analysisData)
    // Update lot to show it has analysis
    if (selectedLot) {
      setSelectedLot({ ...selectedLot, hasAnalysis: true })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/registro">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Registro
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">Registro de Lotes</h1>
            <p className="text-muted-foreground text-pretty">Registra un nuevo lote de semillas en el sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <LotFormTabs
            formData={formData}
            onInputChange={handleInputChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-[200px]">
              {isLoading ? "Registrando..." : "Registrar Lote"}
            </Button>
          </div>
        </div>
      </form>

      <LotList lots={recentLots} onViewDetails={handleViewDetails} />

      <LotDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        lot={selectedLot}
        onEdit={handleEditLot}
        onShowAnalysis={handleShowAnalysis}
      />

      <AnalysisModal
        isOpen={showAnalysisModal}
        onClose={handleCloseAnalysisModal}
        lot={selectedLot}
        onSave={handleSaveAnalysis}
      />
    </div>
  )
}
