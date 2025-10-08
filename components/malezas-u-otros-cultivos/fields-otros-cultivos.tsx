"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wheat, XCircle } from "lucide-react"
import { obtenerCultivos } from "@/app/services/malezas-service"
import { MalezasYCultivosCatalogoDTO } from "@/app/models"

type Cultivo = {
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

export default function OtrosCultivosFields({ registros, onChangeListados }: Props) {
  const [cultivos, setCultivos] = useState<Cultivo[]>(
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

  const [opcionesCultivos, setOpcionesCultivos] = useState<MalezasYCultivosCatalogoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // cargar catálogo de cultivos
  useEffect(() => {
    const fetchCultivos = async () => {
      try {
        const data = await obtenerCultivos()
        setOpcionesCultivos(data)
      } catch (err) {
        setError("Error al cargar cultivos")
      } finally {
        setLoading(false)
      }
    }
    fetchCultivos()
  }, [])

  // avisar cambios al padre
  useEffect(() => {
    if (onChangeListados) {
      const listados = cultivos
        .filter((c) => {
          const hasRequiredFields =
            c.contiene === "si" &&
            c.listado &&
            c.listado.trim() !== "" &&
            c.entidad &&
            c.entidad.trim() !== ""
          return hasRequiredFields
        })
        .map((c) => ({
          listadoTipo: "OTROS",
          listadoInsti: c.entidad.toUpperCase(),
          listadoNum: c.numero !== "" ? Number(c.numero) : null,
          idCatalogo: c.idCatalogo ?? null,
        }))

      onChangeListados(listados)
    }
  }, [cultivos, onChangeListados])

  const addCultivo = () =>
    setCultivos([...cultivos, { contiene: "", listado: "", entidad: "", numero: "", idCatalogo: null }])

  const removeCultivo = (i: number) => {
    if (cultivos.length > 1) {
      setCultivos(cultivos.filter((_, idx) => idx !== i))
    }
  }

  const updateCultivo = (i: number, field: keyof Cultivo, value: any) => {
    const updated = [...cultivos]
    if (field === "contiene" && value === "no") {
      updated[i] = { contiene: "no", listado: "", entidad: "", numero: "", idCatalogo: null }
    } else {
      updated[i] = { ...updated[i], [field]: value }
    }
    setCultivos(updated)
  }

  const handleEspecieSelect = (i: number, especie: string) => {
    const catalogo = opcionesCultivos.find((op) => op.nombreComun === especie)
    const idCatalogo = catalogo ? catalogo.catalogoID : null
    const updated = [...cultivos]
    updated[i] = { ...updated[i], listado: especie, idCatalogo }
    setCultivos(updated)
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Wheat className="h-5 w-5 text-primary" />
          Otros Cultivos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {cultivos.map((c, i) => {
          const isDisabled = c.contiene === "no"

          return (
            <Card key={i} className="bg-background border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Wheat className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {i + 1}</span>
                    {c.contiene && <Badge>{c.contiene === "si" ? "Contiene" : "No contiene"}</Badge>}
                  </div>
                  {cultivos.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCultivo(i)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Estado */}
                  <div className="space-y-2">
                    <Label>¿Contiene cultivo?</Label>
                    <Select
                      value={c.contiene}
                      onValueChange={(val) => updateCultivo(i, "contiene", val as "si" | "no")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Sí</SelectItem>
                        <SelectItem value="no">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-slate-500" />
                            No contiene
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Especie */}
                  <div className="space-y-2">
                    <Label className={isDisabled ? "text-muted-foreground" : "text-foreground"}>Especie</Label>
                    <Select
                      value={c.listado}
                      onValueChange={(val) => handleEspecieSelect(i, val)}
                      disabled={isDisabled || loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar especie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {error && <SelectItem value="error" disabled>{error}</SelectItem>}
                        {!loading &&
                          !error &&
                          opcionesCultivos.map((op) => (
                            <SelectItem key={op.catalogoID} value={op.nombreComun}>
                              {op.nombreComun}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Entidad */}
                  <div className="space-y-2">
                    <Label className={isDisabled ? "text-muted-foreground" : "text-foreground"}>Entidad</Label>
                    <Select
                      value={c.entidad}
                      onValueChange={(val) => updateCultivo(i, "entidad", val)}
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
                    <Label className={isDisabled ? "text-muted-foreground" : "text-foreground"}>Número</Label>
                    <Input
                      className="w-full"
                      value={c.numero}
                      onChange={(e) => updateCultivo(i, "numero", e.target.value)}
                      disabled={isDisabled}
                      placeholder="Ingrese número"
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <div className="flex justify-center sm:justify-end pt-2">
          <Button
            onClick={addCultivo}
            variant="outline"
            className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors bg-transparent text-sm px-2 py-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar registro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
