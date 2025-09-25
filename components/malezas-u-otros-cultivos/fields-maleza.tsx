"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Leaf, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { obtenerMalezas, MalezaCatalogo } from "@/app/services/malezas-service"

type Maleza = {
  tipoMaleza: string
  listado: string
  entidad: string
  numero: string
  catalogoID: number | null
}

type Props = {
  titulo: string
  registros?: any[]
  onChangeListados?: (listados: any[]) => void
}

export default function MalezaFields({ titulo, registros, onChangeListados }: Props) {
  const [malezas, setMalezas] = useState<Maleza[]>(
    registros && registros.length > 0
      ? registros.map((r) => ({
        tipoMaleza: r.listadoTipo?.toLowerCase() || "",
        listado: r.catalogo?.nombreComun || "",
        entidad: r.listadoInsti?.toLowerCase() || "",
        numero: r.listadoNum?.toString() || "",
        catalogoID: r.catalogo?.catalogoID || null,
      }))
      : [{ tipoMaleza: "", listado: "", entidad: "", numero: "", catalogoID: null }]
  )

  const [opcionesMalezas, setOpcionesMalezas] = useState<MalezaCatalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // cargar malezas del catálogo
  useEffect(() => {
    const fetchMalezas = async () => {
      try {
        const data = await obtenerMalezas()
        console.log("Opciones malezas:", data)
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
        .filter((m) => m.listado && m.entidad) // ya no filtro por numero
        .map((m) => {
          let listadoTipo = "MAL_COMUNES" // fallback

          switch (m.tipoMaleza) {
            case "tolerancia-cero":
              listadoTipo = "MAL_TOLERANCIA_CERO"
              break
            case "con-tolerancia":
              listadoTipo = "MAL_TOLERANCIA"
              break
            case "comunes":
              listadoTipo = "MAL_COMUNES"
              break
            case "no-contiene":
              listadoTipo = "MAL_COMUNES"
              return {
                listadoTipo,
                listadoInsti: m.entidad.toUpperCase(),
                listadoNum: 0,
                catalogoID: m.catalogoID,
              }
          }

          return {
            listadoTipo,
            listadoInsti: m.entidad.toUpperCase(),
            listadoNum: Number(m.numero) || 0,
            catalogoID: m.catalogoID,
          }
        })

      onChangeListados(listados)
    }
  }, [malezas, onChangeListados])

  const addMaleza = () => {
    setMalezas([...malezas, { tipoMaleza: "", listado: "", entidad: "", numero: "", catalogoID: null }])
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
    const catalogoID = catalogo ? catalogo.catalogoid : null;
    const updated = [...malezas]
    updated[index] = {
      ...updated[index],
      listado: especie,
      catalogoID,
    }
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
                      onValueChange={(val) => updateMaleza(index, "tipoMaleza", val)}
                      disabled={isDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tolerancia-cero">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Tolerancia cero
                          </div>
                        </SelectItem>
                        <SelectItem value="comunes">
                          <div className="flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-amber-500" />
                            Comunes
                          </div>
                        </SelectItem>
                        <SelectItem value="con-tolerancia">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Con tolerancia
                          </div>
                        </SelectItem>
                        <SelectItem value="no-contiene">
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
                    <Label className="text-sm font-medium text-foreground">Especie</Label>
                    <Select
                      value={maleza.listado || ""} 
                      onValueChange={(val: string) => handleEspecieSelect(index, val)}
                      disabled={isDisabled || loading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar especie"} />
                      </SelectTrigger>
                      <SelectContent>
                        {error && <SelectItem value="error" disabled>{error}</SelectItem>}
                        {!loading &&
                          !error &&
                          opcionesMalezas.map((opcion, idx) => (
                            <SelectItem key={opcion.catalogoid + "-" + idx} value={opcion.nombreComun}>
                              <span className="italic">{opcion.nombreComun}</span>
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
                    <Label className="text-sm font-medium text-foreground">Número</Label>
                    <Input
                      value={maleza.numero}
                      onChange={(e) => updateMaleza(index, "numero", e.target.value)}
                      disabled={isDisabled}
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
