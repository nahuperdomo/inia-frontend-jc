"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Sprout, XCircle } from "lucide-react"
import { obtenerBrassicas } from "@/app/services/malezas-service"
import { MalezasYCultivosCatalogoDTO } from "@/app/models"

type Brassica = {
  contiene: "si" | "no" | ""
  listado: string
  entidad: string
  numero: string
  idCatalogo: number | null
}

type Props = {
  registros?: any[]
  onChangeListados?: (listados: any[]) => void
}

export default function BrassicaSection({ registros, onChangeListados }: Props) {
  const [brassicas, setBrassicas] = useState<Brassica[]>(
    registros && registros.length > 0
      ? registros.map((r) => ({
        contiene: "si",
        listado: r.catalogo?.nombreComun || "",
        entidad: r.listadoInsti?.toLowerCase() || "",
        numero: r.listadoNum?.toString() || "",
        idCatalogo: r.catalogo?.catalogoID ?? null,
      }))
      : [{ contiene: "", listado: "", entidad: "", numero: "", idCatalogo: null }]
  )

  const [opcionesBrassicas, setOpcionesBrassicas] = useState<MalezasYCultivosCatalogoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // cargar catálogo de brassicas
  useEffect(() => {
    const fetchBrassicas = async () => {
      try {
        const data = await obtenerBrassicas()
        setOpcionesBrassicas(data)
      } catch (err) {
        setError("Error al cargar brassicas")
      } finally {
        setLoading(false)
      }
    }
    fetchBrassicas()
  }, [])

  // notificar cambios al padre
  useEffect(() => {
    if (onChangeListados) {
      const listados = brassicas
        .filter((b) => {
          // Solo cuando contiene y tiene los campos requeridos
          const hasRequiredFields = b.contiene === "si" &&
            b.listado && b.listado.trim() !== "" &&
            b.entidad && b.entidad.trim() !== "";
          return hasRequiredFields;
        })
        .map((b) => ({
          listadoTipo: "BRASSICA",
          listadoInsti: b.entidad.toUpperCase(),
          listadoNum: b.numero !== "" ? Number(b.numero) : null,
          idCatalogo: b.idCatalogo,
        }))

      onChangeListados(listados)
    }
  }, [brassicas, onChangeListados])

  const addBrassica = () =>
    setBrassicas([...brassicas, { contiene: "", listado: "", entidad: "", numero: "", idCatalogo: null }])

  const removeBrassica = (index: number) => {
    if (brassicas.length > 1) {
      setBrassicas(brassicas.filter((_, i) => i !== index))
    }
  }

  const updateBrassica = (index: number, field: keyof Brassica, value: any) => {
    const updated = [...brassicas]
    if (field === "contiene" && value === "no") {
      updated[index] = { contiene: "no", listado: "", entidad: "", numero: "", idCatalogo: null }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setBrassicas(updated)
  }

  const handleEspecieSelect = (index: number, especie: string) => {
    const catalogo = opcionesBrassicas.find((e) => e.nombreComun === especie)
    const idCatalogo = catalogo ? catalogo.catalogoID : null
    const updated = [...brassicas]
    updated[index] = { ...updated[index], listado: especie, idCatalogo }
    setBrassicas(updated)
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          Determinación de Brassica spp.
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {brassicas.map((brassica, index) => {
          const isDisabled = brassica.contiene === "no"

          return (
            <Card key={index} className="bg-background border shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {brassica.contiene && <Badge>{brassica.contiene === "si" ? "Contiene" : "No contiene"}</Badge>}
                  </div>
                  {brassicas.length > 1 && (
                    <Button
                      onClick={() => removeBrassica(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">¿Contiene Brassica?</Label>
                    <Select value={brassica.contiene} onValueChange={(val) => updateBrassica(index, "contiene", val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí, contiene</SelectItem>
                        <SelectItem value="no">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-slate-500" />
                            No contiene
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Listado */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Especie
                    </Label>
                    <Select
                      value={brassica.listado}
                      onValueChange={(val) => handleEspecieSelect(index, val)}
                      disabled={isDisabled || loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar especie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {error && <SelectItem value="error" disabled>{error}</SelectItem>}
                        {!loading &&
                          !error &&
                          opcionesBrassicas.map((op) => (
                            <SelectItem key={op.catalogoID} value={op.nombreComun}>
                              {op.nombreComun}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* INIA / INASE */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Entidad
                    </Label>
                    <Select
                      value={brassica.entidad}
                      onValueChange={(val) => updateBrassica(index, "entidad", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar entidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inia">INIA</SelectItem>
                        <SelectItem value="inase">INASE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número */}
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}>
                      Número
                    </Label>
                    <Input
                      className="w-full"
                      placeholder="Ingrese número"
                      type="number"
                      value={brassica.numero}
                      onChange={(e) => updateBrassica(index, "numero", e.target.value)}
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            onClick={addBrassica}
            variant="outline"
            className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors bg-transparent 
               text-sm px-2 py-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
