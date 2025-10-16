"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { Toaster, toast } from 'sonner'

import { LotFormTabs } from "@/components/lotes/lot-form-tabs"
import { LotList } from "@/components/lotes/lot-list"
import { LotDetailsModal } from "@/components/lotes/lot-details-modal"
import { AnalysisModal } from "@/components/lotes/analysis-modal"

import { crearLote, obtenerLotesActivos } from "@/app/services/lote-service"
import { LoteFormData, loteValidationSchema } from "@/lib/validations/lotes-validation"
import { LoteRequestDTO } from "@/app/models/interfaces/lote"
import useValidation from "@/lib/hooks/useValidation"

export default function RegistroLotesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  const [selectedLot, setSelectedLot] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)

  // Estado inicial del formulario
  const initialFormData: LoteFormData = {
    ficha: "",
    nomLote: "",
    cultivarID: "",
    tipo: "INTERNO",
    empresaID: "",
    clienteID: "",
    codigoCC: "",
    codigoFF: "",
    fechaEntrega: "",
    fechaRecibo: "",
    depositoID: "",
    unidadEmbolsado: "",
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
    origenID: "",
    estadoID: "",
    fechaCosecha: "",
    tiposAnalisisAsignados: [],
  };

  const [formData, setFormData] = useState<LoteFormData>(initialFormData);

  // Uso del hook de validacin
  const {
    validateForm,
    isValid,
    handleBlur,
    hasError,
    getErrorMessage,
    touchAll,
    resetValidation
  } = useValidation<LoteFormData>(formData, loteValidationSchema);

  const [recentLots, setRecentLots] = useState<any[]>([]);

  useEffect(() => {
    loadRecentLots();
  }, []);

  const loadRecentLots = async () => {
    try {
      const response = await obtenerLotesActivos();
      setRecentLots(response);
      console.log("Lotes recientes cargados:", response);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    }
  };

  const handleInputChange = (field: keyof LoteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos y marcarlos como tocados
    touchAll(formData);

    // Si no es válido, no continuamos
    if (!isValid(formData)) {
      toast.error('El formulario contiene errores', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Transformar los datos del formulario al formato esperado por el backend
      const loteData: LoteRequestDTO = {
        ...formData,
        cultivarID: Number(formData.cultivarID),
        empresaID: Number(formData.empresaID),
        clienteID: Number(formData.clienteID),
        depositoID: Number(formData.depositoID),
        kilosLimpios: Number(formData.kilosLimpios),
        numeroArticuloID: Number(formData.numeroArticuloID),
        cantidad: Number(formData.cantidad),
        origenID: Number(formData.origenID),
        estadoID: Number(formData.estadoID),
        fechaEntrega: formData.fechaEntrega,
        fechaRecibo: formData.fechaRecibo,
        fechaCosecha: formData.fechaCosecha,
        tiposAnalisisAsignados: formData.tiposAnalisisAsignados,
        datosHumedad: formData.datosHumedad.map(h => ({
          tipoHumedadID: Number(h.tipoHumedadID),
          valor: Number(h.valor)
        }))
      };

      const response = await crearLote(loteData);
      toast.success('Lote registrado exitosamente', {
        description: `Se ha creado el lote con ficha ${formData.ficha}`,
      });

      // Limpiamos el formulario
      setFormData(initialFormData);

      // Reiniciar validacin
      resetValidation();

      // Regresamos a la primera pestaña
      setActiveTab("datos");

      // Recargamos la lista de lotes
      await loadRecentLots();
    } catch (error) {
      toast.error('Error al registrar el lote', {
        description: 'Por favor, verifica los datos e intenta nuevamente',
      });
      console.error("Error al registrar lote:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="min-h-screen bg-background">
      {/* Header - Responsive */}
      <div className="sticky top-0 z-10 bg-card border-b mb-4 sm:mb-6">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/registro" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Volver al Registro</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">Registro de Lotes</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Registra un nuevo lote de semillas en el sistema</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - Responsive Padding */}
      <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <LotFormTabs
              formData={formData}
              onInputChange={handleInputChange}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              handleBlur={(field) => handleBlur(field, formData[field as keyof LoteFormData], formData)}
              hasError={hasError}
              getErrorMessage={getErrorMessage}
              // Loading state
              isLoading={isLoading}
            />

            {/* Submit Button - Responsive */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Registrar Lote"
                )}
              </Button>
            </div>
          </div>
        </form>

        <Toaster richColors />

        {/* Recent Lots Section - Responsive */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Últimos lotes registrados</h2>
          <LotList lots={recentLots} onViewDetails={handleViewDetails} />
        </div>

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
    </div>
  )
}
