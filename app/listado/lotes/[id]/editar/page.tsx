"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Loader2, AlertCircle } from "lucide-react"
import { validarFichaUnica, validarNombreLoteUnico } from "@/lib/validations/lotes-async-validation"
import Link from "next/link"
import { Toaster, toast } from 'sonner'
import { LotFormTabs } from "@/components/lotes/lot-form-tabs"
import { obtenerLotePorId, actualizarLote, puedeRemoverTipoAnalisis } from "@/app/services/lote-service"
import { LoteFormData, loteValidationSchema } from "@/lib/validations/lotes-validation"
import { LoteRequestDTO } from "@/app/models/interfaces/lote"
import { TipoAnalisis } from "@/app/models/types/enums"
import useValidation from "@/lib/hooks/useValidation"
import { StickySaveButton } from "@/components/ui/sticky-save-button"

export default function EditarLotePage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loteInactivo, setLoteInactivo] = useState(false)
  const [activeTab, setActiveTab] = useState("datos")
  const [tiposOriginales, setTiposOriginales] = useState<TipoAnalisis[]>([])
  const [tiposNoRemovibles, setTiposNoRemovibles] = useState<Set<TipoAnalisis>>(new Set())
  const loteId = params?.id as string

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
    datosHumedad: [{
      tipoHumedadID: "",
      valor: "",
    }],
    numeroArticuloID: "",
    origenID: "",
    estadoID: "",
    fechaCosecha: "",
    tiposAnalisisAsignados: [],
  };

  const [formData, setFormData] = useState<LoteFormData>(initialFormData);

  const {
    isValid,
    touchAll,
  } = useValidation<LoteFormData>(formData, loteValidationSchema);

  useEffect(() => {
    const loadLote = async () => {
      if (!loteId) return

      try {
        setLoading(true)
        const data = await obtenerLotePorId(parseInt(loteId))
        
        // Verificar si el lote está inactivo
        if (!data.activo) {
          setLoteInactivo(true)
          toast.error("Lote inactivo", {
            description: "No se puede editar un lote inactivo",
            duration: 3000
          })
          // Esperar a que el usuario vea el mensaje antes de redirigir
          setTimeout(() => {
            router.push("/listado/lotes")
          }, 2500)
          setLoading(false)
          return
        }
        
        // Guardar tipos originales
        const tiposOriginalesLimpios = (data.tiposAnalisisAsignados || [])
          .filter(tipo => tipo != null)
          .filter((tipo, index, array) => array.indexOf(tipo) === index)
        
        setTiposOriginales(tiposOriginalesLimpios)
        
        // Verificar cuáles tipos NO se pueden remover
        const noRemovibles = new Set<TipoAnalisis>()
        if (tiposOriginalesLimpios.length > 0) {
          for (const tipo of tiposOriginalesLimpios) {
            try {
              const resultado = await puedeRemoverTipoAnalisis(data.loteID, tipo)
              if (!resultado.puedeRemover) {
                noRemovibles.add(tipo)
              }
            } catch (error) {
              console.error(`Error al verificar tipo ${tipo}:`, error)
              // Si hay error, asumir que no se puede remover por seguridad
              noRemovibles.add(tipo)
            }
          }
        }
        
        setTiposNoRemovibles(noRemovibles)
        
        setFormData({
          ficha: data.ficha,
          nomLote: data.nomLote || "",
          cultivarID: data.cultivarID || "",
          tipo: data.tipo || "INTERNO",
          empresaID: data.empresaID || "",
          clienteID: data.clienteID || "",
          codigoCC: data.codigoCC || "",
          codigoFF: data.codigoFF || "",
          fechaEntrega: data.fechaEntrega || "",
          fechaRecibo: data.fechaRecibo || "",
          depositoID: data.depositoID || "",
          unidadEmbolsado: data.unidadEmbolsado || "",
          remitente: data.remitente || "",
          observaciones: data.observaciones || "",
          kilosLimpios: data.kilosLimpios || "",
          datosHumedad: data.datosHumedad && data.datosHumedad.length > 0 
            ? data.datosHumedad.map(h => ({
                tipoHumedadID: h.humedadID || "",
                valor: h.porcentaje || "",
              }))
            : [{
                tipoHumedadID: "",
                valor: "",
              }],
          numeroArticuloID: data.numeroArticuloID || "",
          origenID: data.origenID || "",
          estadoID: data.estadoID || "",
          fechaCosecha: data.fechaCosecha || "",
          tiposAnalisisAsignados: data.tiposAnalisisAsignados || [],
        })
      } catch (error) {
        toast.error('Error al cargar lote', {
          description: 'No se pudo cargar la información del lote',
        });
        router.push('/listado/lotes');
      } finally {
        setLoading(false)
      }
    };

    loadLote();
  }, [loteId, router]);

  const handleInputChange = useCallback(async (field: keyof LoteFormData, value: any) => {
    // Validar ficha y nombre de lote cuando cambian
    if (field === 'ficha' && value) {
      const esValido = await validarFichaUnica(value, parseInt(loteId));
      if (!esValido) {
        toast.error('Esta ficha ya está registrada', {
          description: 'Por favor, utiliza una ficha diferente',
          icon: <AlertCircle className="h-5 w-5" />,
        });
      }
    }

    if (field === 'nomLote' && value) {
      const esValido = await validarNombreLoteUnico(value, parseInt(loteId));
      if (!esValido) {
        toast.error('Este nombre de lote ya está registrado', {
          description: 'Por favor, utiliza un nombre diferente',
          icon: <AlertCircle className="h-5 w-5" />,
        });
      }
    }

    // Si se están modificando los tipos de análisis, validar que no se remuevan tipos no removibles
    if (field === 'tiposAnalisisAsignados') {
      const nuevosTipos = value as TipoAnalisis[]
      
      // Verificar si se está intentando remover algún tipo no removible
      const tiposARemover = tiposOriginales.filter(tipo => !nuevosTipos.includes(tipo))
      
      for (const tipo of tiposARemover) {
        if (tiposNoRemovibles.has(tipo)) {
          const labels: Record<TipoAnalisis, string> = {
            PUREZA: "Pureza Física",
            GERMINACION: "Germinación",
            PMS: "Peso de Mil Semillas",
            TETRAZOLIO: "Tetrazolio",
            DOSN: "DOSN"
          }
          
          toast.error(`No se puede remover ${labels[tipo]}`, {
            description: 'Ya existen análisis creados de este tipo. No se puede remover.',
            duration: 5000,
          })
          
          // No actualizar el estado, mantener los tipos actuales
          return
        }
      }
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [loteId, tiposOriginales, tiposNoRemovibles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await guardarCambios();
  };

  const guardarCambios = async () => {
    touchAll(formData);

    if (!isValid(formData)) {
      toast.error('El formulario contiene errores', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    setIsLoading(true);
    try {
      const loteData: LoteRequestDTO = {
        ficha: formData.ficha,
        nomLote: formData.nomLote,
        cultivarID: Number(formData.cultivarID),
        tipo: formData.tipo,
        empresaID: Number(formData.empresaID),
        clienteID: Number(formData.clienteID),
        codigoCC: formData.codigoCC,
        codigoFF: formData.codigoFF,
        depositoID: Number(formData.depositoID),
        kilosLimpios: Number(formData.kilosLimpios),
        numeroArticuloID: Number(formData.numeroArticuloID),
        origenID: Number(formData.origenID),
        estadoID: Number(formData.estadoID),
        fechaEntrega: formData.fechaEntrega,
        fechaRecibo: formData.fechaRecibo,
        fechaCosecha: formData.fechaCosecha,
        unidadEmbolsado: formData.unidadEmbolsado,
        remitente: formData.remitente,
        observaciones: formData.observaciones,
        tiposAnalisisAsignados: formData.tiposAnalisisAsignados,
        datosHumedad: formData.datosHumedad.map(h => ({
          tipoHumedadID: Number(h.tipoHumedadID),
          valor: Number(h.valor)
        }))
      };

      await actualizarLote(parseInt(loteId), loteData);
      toast.success('Lote actualizado exitosamente', {
        description: `Se ha actualizado el lote ${formData.ficha}`,
      });

      router.push(`/listado/lotes/${loteId}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Error desconocido al actualizar el lote';
      toast.error('Error al actualizar el lote', {
        description: errorMessage,
      });
      console.error("Error al actualizar lote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando información del lote...</p>
          </div>
        </div>
      </div>
    )
  }

  // No renderizar el formulario si el lote está inactivo
  if (loteInactivo) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold">Lote inactivo</p>
            <p className="text-muted-foreground">No se puede editar un lote inactivo</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/listado/lotes/${loteId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Detalle
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-balance">
              <Package className="inline h-8 w-8 mr-2" />
              Editar Lote
            </h1>
            <p className="text-muted-foreground">
              Modifica los datos del lote {formData.ficha}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <LotFormTabs
          formData={formData}
          onInputChange={handleInputChange}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isLoading={isLoading}
          loteId={parseInt(loteId)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Link href={`/listado/lotes/${loteId}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Actualizando..." : "Actualizar Lote"}
          </Button>
        </div>
      </form>

      {/* Botón flotante que aparece al hacer scroll */}
      <StickySaveButton
        onSave={guardarCambios}
        isLoading={isLoading}
        disabled={isLoading}
        label="Actualizar Lote"
        loadingLabel="Actualizando..."
      />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}