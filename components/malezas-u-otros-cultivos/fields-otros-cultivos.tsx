"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wheat } from "lucide-react"
import { obtenerCultivos, CultivoCatalogo } from "@/app/services/cultivos-service"

type Cultivo = {
  contiene: "si" | "no" | ""
  listado: string
  entidad: string
  numero: string
  catalogoID: number | null
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
          catalogoID: r.catalogo?.catalogoID ?? null, 
        }))
      : [{ contiene: "", listado: "", entidad: "", numero: "", catalogoID: null }]
  )

  const [opcionesCultivos, setOpcionesCultivos] = useState<CultivoCatalogo[]>([])
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
        .filter((c) => c.contiene !== "")
        .map((c) => {
          if (c.contiene === "no") {
            return {
              listadoTipo: "CULTIVO",
              listadoInsti: c.entidad ? c.entidad.toUpperCase() : "INIA",
              listadoNum: 0, // 👈 consistente con "no contiene"
              catalogoID: null,
            }
          }
          return {
            listadoTipo: "CULTIVO",
            listadoInsti: c.entidad.toUpperCase(),
            listadoNum: Number(c.numero) || 0,
            catalogoID: c.catalogoID ?? null,
          }
        })
      onChangeListados(listados)
    }
  }, [cultivos, onChangeListados])

  const addCultivo = () =>
    setCultivos([...cultivos, { contiene: "", listado: "", entidad: "", numero: "", catalogoID: null }])

  const removeCultivo = (i: number) => setCultivos(cultivos.filter((_, idx) => idx !== i))

  const updateCultivo = (i: number, field: keyof Cultivo, value: any) => {
    const updated = [...cultivos]
    updated[i] = { ...updated[i], [field]: value }
    setCultivos(updated)
  }

  const handleEspecieSelect = (i: number, especie: string) => {
    const catalogo = opcionesCultivos.find((op) => op.nombreComun === especie)
    const catalogoID = catalogo ? catalogo.catalogoID : null
    const updated = [...cultivos]
    updated[i] = { ...updated[i], listado: especie, catalogoID }
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
          const isDisabled = registros && registros.length > 0
          return (
            <Card key={i} className="bg-background border shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Registro {i + 1}</span>
                  {c.contiene && <Badge>{c.contiene === "si" ? "Contiene" : "No contiene"}</Badge>}
                  {cultivos.length > 1 && !isDisabled && (
                    <Button variant="ghost" size="sm" onClick={() => removeCultivo(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>¿Contiene cultivo?</Label>
                  <Select
                    value={c.contiene}
                    onValueChange={(val) => updateCultivo(i, "contiene", val as "si" | "no")}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {c.contiene === "si" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Especie</Label>
                      <Select
                        value={c.listado || ""}
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

                    <div className="space-y-2">
                      <Label>Entidad</Label>
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

                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        className="w-full"
                        value={c.numero}
                        onChange={(e) => updateCultivo(i, "numero", e.target.value)}
                        disabled={isDisabled}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {!registros || registros.length === 0 ? (
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
        ) : null}
      </CardContent>
    </Card>
  )
}
