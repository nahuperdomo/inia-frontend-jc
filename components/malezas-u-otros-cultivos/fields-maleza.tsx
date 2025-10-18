"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Leaf, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { obtenerMalezas } from "@/app/services/malezas-service"
import { MalezasYCultivosCatalogoDTO } from "@/app/models"
import { usePersistentArray } from "@/lib/hooks/use-form-persistence"

type Maleza = {
  tipoMaleza: "MAL_TOLERANCIA" | "MAL_TOLERANCIA_CERO" | "MAL_COMUNES" | "NO_CONTIENE" | ""
  listado: string
  entidad: string
  numero: string
  idCatalogo: number | null
}

type Props = {
  titulo: string
  registros?: any[]
  onChangeListados?: (listados: any[]) => void
}

export default function MalezaFields({ titulo, registros, onChangeListados }: Props) {
  const initialMalezas = registros && registros.length > 0
    ? registros.map((r) => ({
      tipoMaleza: r.listadoTipo || "",
      listado: r.catalogo?.nombreComun || "",
      entidad: r.listadoInsti?.toLowerCase() || "",
      numero: r.listadoNum?.toString() || "",
      idCatalogo: r.catalogo?.catalogoID || null,
    }))
    : [{ tipoMaleza: "" as const, listado: "", entidad: "", numero: "", idCatalogo: null }]

  // ✅ Usar persistencia solo si no hay registros precargados
  const persistence = usePersistentArray<Maleza>(
    `dosn-malezas-${titulo}`, // Clave única por título
    initialMalezas
  )

  const [malezas, setMalezas] = useState<Maleza[]>(
    registros && registros.length > 0 ? initialMalezas : persistence.array
  )

  // Sincronizar con persistencia cuando cambie malezas (solo en modo creación)
  useEffect(() => {
    if (!registros || registros.length === 0) {
      persistence.setArray(malezas)
    }
  }, [malezas])


  const [opcionesMalezas, setOpcionesMalezas] = useState<MalezasYCultivosCatalogoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // cargar malezas del catálogo
  useEffect(() => {
    const fetchMalezas = async () => {
      try {
        const data = await obtenerMalezas()
        setOpcionesMalezas(data)
      } catch (err) {
        setError("Error al cargar malezas")
      } finally {
        setLoading(false)
      }
    }
    fetchMalezas()
  }, [])

  // notificar cambios al padre
  useEffect(() => {
    if (onChangeListados) {
      const listados = malezas
        .filter((m) => {
          // Verificar que tenga los campos requeridos y no sea "NO_CONTIENE"
          const hasRequiredFields = m.listado && m.listado.trim() !== "" &&
            m.entidad && m.entidad.trim() !== "" &&
            m.tipoMaleza && m.tipoMaleza !== "NO_CONTIENE" && m.tipoMaleza !== "" as any;
          return hasRequiredFields;
        })
        .map((m) => ({
          listadoTipo: m.tipoMaleza,
          listadoInsti: m.entidad.toUpperCase(),
          listadoNum: m.numero !== "" ? Number(m.numero) : null,
          idCatalogo: m.idCatalogo,
        }))

      onChangeListados(listados)
    }
  }, [malezas, onChangeListados])

  const addMaleza = () => {
    setMalezas([...malezas, { tipoMaleza: "", listado: "", entidad: "", numero: "", idCatalogo: null }])
  }

  const removeMaleza = (index: number) => {
    if (malezas.length > 1) {
      setMalezas(malezas.filter((_, i) => i !== index))
    }
  }

  const updateMaleza = (index: number, field: keyof Maleza, value: any) => {
    const updated = [...malezas]
    updated[index] = {
      ...updated[index],
      [field]: value,
    }
    setMalezas(updated)
  }

  const handleEspecieSelect = (index: number, especie: string) => {
    const catalogo = opcionesMalezas.find((e) => e.nombreComun === especie)
    const idCatalogo = catalogo ? catalogo.catalogoID : null
    const updated = [...malezas]
    updated[index] = { ...updated[index], listado: especie, idCatalogo }
    setMalezas(updated)
  }

  return (
    <Card className="border-border/50 bg-background shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          {titulo}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {malezas.map((maleza, index) => {
          const isDisabled = registros && registros.length > 0
          return (
            <Card key={index} className="bg-background border shadow-sm transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Registro {index + 1}</span>
                    {maleza.tipoMaleza && <Badge>{maleza.tipoMaleza}</Badge>}
                  </div>
                  {malezas.length > 1 && !isDisabled && (
                    <Button
                      onClick={() => removeMaleza(index)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo de maleza */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Tipo de Maleza</Label>
                    <Select
                      value={maleza.tipoMaleza || ""}
                      onValueChange={(val) => updateMaleza(index, "tipoMaleza", val as Maleza["tipoMaleza"])}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAL_TOLERANCIA_CERO">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Tolerancia cero
                          </div>
                        </SelectItem>
                        <SelectItem value="MAL_COMUNES">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-amber-500" />
                            Comunes
                          </div>
                        </SelectItem>
                        <SelectItem value="MAL_TOLERANCIA">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Con tolerancia
                          </div>
                        </SelectItem>
                        <SelectItem value="NO_CONTIENE">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-slate-500" />
                            No contiene
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Especie de Maleza */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Especie</Label>
                    <Select
                      value={maleza.listado || ""}
                      onValueChange={(val: string) => handleEspecieSelect(index, val)}
                      disabled={isDisabled || loading || maleza.tipoMaleza === "NO_CONTIENE"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar especie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {error && <SelectItem value="error" disabled>{error}</SelectItem>}
                        {!loading &&
                          !error &&
                          opcionesMalezas.map((opcion) => (
                            <SelectItem key={opcion.catalogoID} value={opcion.nombreComun}>
                              {opcion.nombreComun} {opcion.nombreCientifico && `(${opcion.nombreCientifico})`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* INIA / INASE */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Entidad</Label>
                    <Select
                      value={maleza.entidad || ""}
                      onValueChange={(val) => updateMaleza(index, "entidad", val)}
                      disabled={isDisabled || maleza.tipoMaleza === "NO_CONTIENE"}
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
                    <Label className="text-sm font-medium text-foreground">Número</Label>
                    <Input
                      value={maleza.numero}
                      onChange={(e) => updateMaleza(index, "numero", e.target.value)}
                      disabled={isDisabled || maleza.tipoMaleza === "NO_CONTIENE"}
                      type="number"
                      placeholder="Ingrese número"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {!registros || registros.length === 0 ? (
          <div className="flex justify-center sm:justify-end pt-2">
            <Button
              onClick={addMaleza}
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
