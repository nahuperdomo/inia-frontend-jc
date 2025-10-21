"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, AlertTriangle, Search } from "lucide-react"
import Link from "next/link"
import { obtenerPurezaPorId, actualizarPureza } from "@/app/services/pureza-service"
import type { PurezaDTO, PurezaRequestDTO } from "@/app/models"
import { toast } from "sonner"
import PurezaFields from "@/app/registro/analisis/pureza/form-pureza"

export default function EditarPurezaPage() {
  const params = useParams()
  const router = useRouter()
  const purezaId = params.id as string

  const [pureza, setPureza] = useState<PurezaDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [malezasList, setMalezasList] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    fecha: "",
    pesoInicial_g: "",
    semillaPura_g: "",
    materiaInerte_g: "",
    otrosCultivos_g: "",
    malezas_g: "",
    malezasToleradas_g: "",
    malezasTolCero_g: "",
    pesoTotal_g: "",
    
    redonSemillaPura: "",
    redonMateriaInerte: "",
    redonOtrosCultivos: "",
    redonMalezas: "",
    redonMalezasToleradas: "",
    redonMalezasTolCero: "",
    redonPesoTotal: "",
    
    inasePura: "",
    inaseMateriaInerte: "",
    inaseOtrosCultivos: "",
    inaseMalezas: "",
    inaseMalezasToleradas: "",
    inaseMalezasTolCero: "",
    inaseFecha: "",
    
    cumpleEstandar: "",
    observaciones: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const targetId = Number.parseInt(purezaId)
        console.log("Cargando Pureza con ID:", targetId)

        const purezaData = await obtenerPurezaPorId(targetId)
        console.log("Pureza cargada exitosamente:", purezaData)
        setPureza(purezaData)

        // Poblar formData con los datos existentes
        setFormData({
          fecha: purezaData.fecha || "",
          pesoInicial_g: purezaData.pesoInicial_g?.toString() || "",
          semillaPura_g: purezaData.semillaPura_g?.toString() || "",
          materiaInerte_g: purezaData.materiaInerte_g?.toString() || "",
          otrosCultivos_g: purezaData.otrosCultivos_g?.toString() || "",
          malezas_g: purezaData.malezas_g?.toString() || "",
          malezasToleradas_g: purezaData.malezasToleradas_g?.toString() || "",
          malezasTolCero_g: purezaData.malezasTolCero_g?.toString() || "",
          pesoTotal_g: purezaData.pesoTotal_g?.toString() || "",
          
          redonSemillaPura: purezaData.redonSemillaPura?.toString() || "",
          redonMateriaInerte: purezaData.redonMateriaInerte?.toString() || "",
          redonOtrosCultivos: purezaData.redonOtrosCultivos?.toString() || "",
          redonMalezas: purezaData.redonMalezas?.toString() || "",
          redonMalezasToleradas: purezaData.redonMalezasToleradas?.toString() || "",
          redonMalezasTolCero: purezaData.redonMalezasTolCero?.toString() || "",
          redonPesoTotal: purezaData.redonPesoTotal?.toString() || "",
          
          inasePura: purezaData.inasePura?.toString() || "",
          inaseMateriaInerte: purezaData.inaseMateriaInerte?.toString() || "",
          inaseOtrosCultivos: purezaData.inaseOtrosCultivos?.toString() || "",
          inaseMalezas: purezaData.inaseMalezas?.toString() || "",
          inaseMalezasToleradas: purezaData.inaseMalezasToleradas?.toString() || "",
          inaseMalezasTolCero: purezaData.inaseMalezasTolCero?.toString() || "",
          inaseFecha: purezaData.inaseFecha || "",
          
          // Convertir boolean a "si"/"no" para el Select
          cumpleEstandar: purezaData.cumpleEstandar === true ? "si" : purezaData.cumpleEstandar === false ? "no" : "",
          observaciones: purezaData.comentarios || "",
        })

        // Cargar listados existentes
        if (purezaData.otrasSemillas && purezaData.otrasSemillas.length > 0) {
          setMalezasList(purezaData.otrasSemillas)
        }

      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar los detalles del análisis de Pureza")
      } finally {
        setLoading(false)
      }
    }

    if (purezaId) {
      fetchData()
    }
  }, [purezaId])

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleMalezasChange = useCallback((list: any[]) => {
    console.log("Malezas actualizadas:", list)
    setMalezasList(list)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      // Construir el request DTO
      const requestData: PurezaRequestDTO = {
        idLote: pureza!.idLote!,
        comentarios: formData.observaciones || undefined,
        // Mapear "si"/"no" a boolean correctamente
        cumpleEstandar: formData.cumpleEstandar === "si" ? true : formData.cumpleEstandar === "no" ? false : undefined,
        
        fecha: formData.fecha,
        pesoInicial_g: parseFloat(formData.pesoInicial_g) || 0,
        semillaPura_g: parseFloat(formData.semillaPura_g) || 0,
        materiaInerte_g: parseFloat(formData.materiaInerte_g) || 0,
        otrosCultivos_g: parseFloat(formData.otrosCultivos_g) || 0,
        malezas_g: parseFloat(formData.malezas_g) || 0,
        malezasToleradas_g: parseFloat(formData.malezasToleradas_g) || 0,
        malezasTolCero_g: parseFloat(formData.malezasTolCero_g) || 0,
        pesoTotal_g: parseFloat(formData.pesoTotal_g) || 0,
        
        redonSemillaPura: formData.redonSemillaPura ? parseFloat(formData.redonSemillaPura) : undefined,
        redonMateriaInerte: formData.redonMateriaInerte ? parseFloat(formData.redonMateriaInerte) : undefined,
        redonOtrosCultivos: formData.redonOtrosCultivos ? parseFloat(formData.redonOtrosCultivos) : undefined,
        redonMalezas: formData.redonMalezas ? parseFloat(formData.redonMalezas) : undefined,
        redonMalezasToleradas: formData.redonMalezasToleradas ? parseFloat(formData.redonMalezasToleradas) : undefined,
        redonMalezasTolCero: formData.redonMalezasTolCero ? parseFloat(formData.redonMalezasTolCero) : undefined,
        redonPesoTotal: formData.redonPesoTotal ? parseFloat(formData.redonPesoTotal) : undefined,
        
        inasePura: formData.inasePura ? parseFloat(formData.inasePura) : undefined,
        inaseMateriaInerte: formData.inaseMateriaInerte ? parseFloat(formData.inaseMateriaInerte) : undefined,
        inaseOtrosCultivos: formData.inaseOtrosCultivos ? parseFloat(formData.inaseOtrosCultivos) : undefined,
        inaseMalezas: formData.inaseMalezas ? parseFloat(formData.inaseMalezas) : undefined,
        inaseMalezasToleradas: formData.inaseMalezasToleradas ? parseFloat(formData.inaseMalezasToleradas) : undefined,
        inaseMalezasTolCero: formData.inaseMalezasTolCero ? parseFloat(formData.inaseMalezasTolCero) : undefined,
        inaseFecha: formData.inaseFecha || undefined,
        
        otrasSemillas: malezasList.map(m => ({
          listadoTipo: m.listadoTipo,
          listadoInsti: m.listadoInsti,
          listadoNum: m.listadoNum,
          idCatalogo: m.idCatalogo || m.catalogo?.catalogoID
        }))
      }

      console.log("Enviando actualización:", requestData)

      await actualizarPureza(Number.parseInt(purezaId), requestData)

      toast.success("Análisis de Pureza actualizado exitosamente")
      router.push(`/listado/analisis/pureza/${purezaId}`)
      
    } catch (err: any) {
      console.error("Error al guardar:", err)
      toast.error(err?.message || "Error al actualizar el análisis")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando análisis</p>
            <p className="text-sm text-muted-foreground">Obteniendo datos para edición...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !pureza) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-balance">No se pudo cargar el análisis</h2>
            <p className="text-muted-foreground text-pretty">{error || "El análisis solicitado no existe"}</p>
          </div>
          <Link href="/listado/analisis/pureza">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-3">
            <Link href={`/listado/analisis/pureza/${purezaId}`}>
              <Button variant="ghost" size="sm" className="gap-1 -ml-2 h-8">
                <ArrowLeft className="h-3 w-3" />
                <span className="text-xs sm:text-sm">Cancelar</span>
              </Button>
            </Link>

            <div className="flex flex-col gap-2">
              <div className="space-y-1 text-center lg:text-left">
                <div className="flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-balance">
                    Editar Análisis de Pureza #{pureza.analisisID}
                  </h1>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {pureza.estado}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground text-pretty">
                  Lote {pureza.lote}
                </p>
              </div>

              <div className="flex justify-center lg:justify-end">
                <Button 
                  size="sm" 
                  className="gap-1.5 w-full sm:w-auto h-9"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs sm:text-sm">Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span className="text-xs sm:text-sm">Guardar cambios</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <Card className="border-0 shadow-sm">
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  Formulario de Edición
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PurezaFields
                  formData={formData}
                  handleInputChange={handleInputChange}
                  onChangeMalezas={handleMalezasChange}
                />
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
