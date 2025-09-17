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

export default function RegistroLotesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  const [formData, setFormData] = useState<LoteFormData>({
    numeroReferencia: "",
    numeroFicha: "",
    ficha: "",
    lote: "",
    cultivar: "",
    tipo: "",
    especie: "",
    origen: "",
    empresa: "",
    cliente: "",
    codigoCC: "",
    codigoFF: "",
    fechaEntrega: "",
    fechaRecibo: "",
    depositoAsignado: "",
    unidadEmbalado: "",
    resultados: "",
    observaciones: "",
    kilosBrutos: "",
    humedad: "",
    catSeed: "",
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
    },
    {
      id: "2",
      lote: "MAI-2024-002",
      numeroReferencia: "REF-002",
      numeroFicha: "F-002",
      ficha: "002",
      cultivar: "Pioneer 30F35",
      tipo: "Híbrido",
      especie: "Maíz",
      origen: "Importado",
      empresa: "Semillas del Sur",
      cliente: "Estancia La Pampa",
      codigoCC: "CC-002",
      codigoFF: "FF-002",
      fechaEntrega: "2024-01-08",
      fechaRecibo: "2024-01-10",
      depositoAsignado: "Depósito B",
      unidadEmbalado: "Big Bags",
      resultados: "En proceso",
      observaciones: "Pendiente análisis de humedad",
      kilosBrutos: "2500",
      humedad: "14.2",
      catSeed: "CS-002",
      estado: "En proceso",
      hasAnalysis: true,
    },
    {
      id: "3",
      lote: "TRI-2024-003",
      numeroReferencia: "REF-003",
      numeroFicha: "F-003",
      ficha: "003",
      cultivar: "Klein Guerrero",
      tipo: "Comercial",
      especie: "Trigo",
      origen: "Nacional",
      empresa: "Cereales Unidos",
      cliente: "Molino Central",
      codigoCC: "CC-003",
      codigoFF: "FF-003",
      fechaEntrega: "2024-01-05",
      fechaRecibo: "2024-01-07",
      depositoAsignado: "Depósito C",
      unidadEmbalado: "Granel",
      resultados: "Completado",
      observaciones: "Análisis completo realizado",
      kilosBrutos: "5000",
      humedad: "11.8",
      catSeed: "CS-003",
      estado: "Completado",
      hasAnalysis: true,
    },
  ]

  const handleInputChange = (field: keyof LoteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/registro")
    }, 2000)
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
