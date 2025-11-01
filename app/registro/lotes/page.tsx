"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Loader2, AlertCircle } from "lucide-react"
import { validarFichaUnica, validarNombreLoteUnico } from "@/lib/validations/lotes-async-validation"
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
    origenID: "",
    estadoID: "",
    fechaCosecha: "",
    tiposAnalisisAsignados: [],
  };

  const [formData, setFormData] = useState<LoteFormData>(initialFormData);

  // Uso del hook de validación
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

  const handleInputChange = useCallback(async (field: keyof LoteFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validar ficha y nombre de lote cuando cambian
    if (field === 'ficha' && value) {
      const esValido = await validarFichaUnica(value);
      if (!esValido) {
        toast.error('Esta ficha ya está registrada', {
          description: 'Por favor, utiliza una ficha diferente',
          icon: <AlertCircle className="h-5 w-5" />,
        });
      }
    }

    if (field === 'nomLote' && value) {
      const esValido = await validarNombreLoteUnico(value);
      if (!esValido) {
        toast.error('Este nombre de lote ya está registrado', {
          description: 'Por favor, utiliza un nombre diferente',
          icon: <AlertCircle className="h-5 w-5" />,
        });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos únicos antes de enviar
    const [fichaValida, nombreValido] = await Promise.all([
      validarFichaUnica(formData.ficha),
      validarNombreLoteUnico(formData.nomLote)
    ]);

    if (!fichaValida) {
      toast.error('Esta ficha ya está registrada', {
        description: 'Por favor, utiliza una ficha diferente',
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

    if (!nombreValido) {
      toast.error('Este nombre de lote ya está registrado', {
        description: 'Por favor, utiliza un nombre diferente',
        icon: <AlertCircle className="h-5 w-5" />,
      });
      return;
    }

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
        ficha: formData.ficha,
        nomLote: formData.nomLote,
        cultivarID: Number(formData.cultivarID),
        tipo: formData.tipo,
        empresaID: Number(formData.empresaID),
        clienteID: Number(formData.clienteID),
        codigoCC: formData.codigoCC,
        codigoFF: formData.codigoFF,
        fechaEntrega: formData.fechaEntrega,
        fechaRecibo: formData.fechaRecibo,
        depositoID: Number(formData.depositoID),
        unidadEmbolsado: formData.unidadEmbolsado,
        remitente: formData.remitente,
        observaciones: formData.observaciones,
        kilosLimpios: Number(formData.kilosLimpios),
        numeroArticuloID: Number(formData.numeroArticuloID),
        origenID: Number(formData.origenID),
        estadoID: Number(formData.estadoID),
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

      // Reiniciar validación
      resetValidation();

      // Regresamos a la primera pestaña
      setActiveTab("datos");

      // Recargamos la lista de lotes
      await loadRecentLots();
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al registrar el lote';
      toast.error('Error al registrar el lote', {
        description: errorMessage,
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
            isLoading={isLoading}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="min-w-[200px]">
              {isLoading ? "Registrando..." : "Registrar Lote"}
            </Button>
          </div>
        </div>
      </form>

      <Toaster richColors />

      <div>
        <h2 className="text-xl font-semibold mb-4">Últimos lotes registrados</h2>
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
  )
}
