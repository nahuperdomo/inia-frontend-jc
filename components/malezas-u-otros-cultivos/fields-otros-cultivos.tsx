"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Wheat, XCircle } from "lucide-react"
import { obtenerTodasEspecies } from "@/app/services/especie-service"
import { EspecieDTO } from "@/app/models"
import { usePersistentArray } from "@/lib/hooks/use-form-persistence"

type Cultivo = {
  contiene: "si" | "no" | ""
  listado: string
  entidad: string
  numero: string
  idEspecie: number | null
}

type Props = {
  registros?: any[]
  onChangeListados?: (listados: any[]) => void
  contexto?: string // 'pureza' | 'dosn' para diferenciar persistencia
}

export default function OtrosCultivosFields({ registros, onChangeListados, contexto = 'dosn' }: Props) {
  const initialCultivos = registros && registros.length > 0
    ? registros.map((r) => ({
        contiene: "si" as const,
        listado: r.especie?.nombreComun || "",
        entidad: r.listadoInsti?.toLowerCase() || "",
        numero: r.listadoNum?.toString() || "",
        idEspecie: r.especie?.especieID ?? null,
      }))
    : [{ contiene: "" as const, listado: "", entidad: "", numero: "", idEspecie: null }]

  // ✅ Usar persistencia solo si no hay registros precargados
  const persistence = usePersistentArray<Cultivo>(
    `${contexto}-otros-cultivos`,
    initialCultivos
  )

  const [cultivos, setCultivos] = useState<Cultivo[]>(
    registros && registros.length > 0 ? initialCultivos : persistence.array
  )

  // Sincronizar con persistencia cuando cambie cultivos (solo en modo creación)
  useEffect(() => {
    if (!registros || registros.length === 0) {
      persistence.setArray(cultivos)
    }
  }, [cultivos])

  const [opcionesEspecies, setOpcionesEspecies] = useState<EspecieDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // cargar especies
  useEffect(() => {
    const fetchEspecies = async () => {
      try {
        const data = await obtenerTodasEspecies(true)  // Solo especies activas
        setOpcionesEspecies(data)
      } catch (err) {
        setError("Error al cargar especies")
      } finally {
        setLoading(false)
      }
    }
    fetchEspecies()
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
          idEspecie: c.idEspecie ?? null,
        }))

      onChangeListados(listados)
    }
  }, [cultivos, onChangeListados])

  const addCultivo = () =>
    setCultivos([...cultivos, { contiene: "", listado: "", entidad: "", numero: "", idEspecie: null }])

  const removeCultivo = (i: number) => {
    if (cultivos.length > 1) {
      setCultivos(cultivos.filter((_, idx) => idx !== i))
    }
  }

  const updateCultivo = (i: number, field: keyof Cultivo, value: any) => {
    const updated = [...cultivos]
    if (field === "contiene" && value === "no") {
      updated[i] = { contiene: "no", listado: "", entidad: "", numero: "", idEspecie: null }
    } else {
      updated[i] = { ...updated[i], [field]: value }
    }
    setCultivos(updated)
  }

  const handleEspecieSelect = (i: number, especieNombre: string) => {
    const especie = opcionesEspecies.find((op) => op.nombreComun === especieNombre)
    const idEspecie = especie ? especie.especieID : null
    const updated = [...cultivos]
    updated[i] = { ...updated[i], listado: especieNombre, idEspecie }
    setCultivos(updated)
  }

  // ✅ Verificar si algún cultivo tiene "no" (No contiene) seleccionado
  const tieneNoContiene = cultivos.some((c) => c.contiene === "no")

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
                          opcionesEspecies.map((op) => (
                            <SelectItem key={op.especieID} value={op.nombreComun}>
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
            disabled={tieneNoContiene}
            className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 transition-colors bg-transparent text-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar registro
          </Button>
          {tieneNoContiene && (
            <p className="text-xs text-muted-foreground ml-3 flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              No se pueden agregar más registros cuando hay "No contiene" seleccionado
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
