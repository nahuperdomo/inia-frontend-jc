"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useConfirm } from '@/lib/hooks/useConfirm'
import { TablaGermDTO, RepGermDTO, RepGermRequestDTO } from '@/app/models/interfaces/repeticiones'
import {
  obtenerRepeticionesDeTabla,
  crearRepeticion,
  actualizarRepeticion,
  eliminarRepeticion
} from '@/app/services/germinacion-service'
import { Plus, Save, Trash2, Calculator } from 'lucide-react'

interface RepeticionesGerminacionManagerProps {
  tabla: TablaGermDTO
  germinacionId: number
  isFinalized: boolean
  onRepeticionesUpdated: (repeticiones: RepGermDTO[]) => void
}

export function RepeticionesGerminacionManager({
  tabla,
  germinacionId,
  isFinalized,
  onRepeticionesUpdated
}: RepeticionesGerminacionManagerProps) {
  const { confirm } = useConfirm()
  const [repeticiones, setRepeticiones] = useState<RepGermDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState<number | null>(null)
  const [eliminando, setEliminando] = useState<number | null>(null)
  const [error, setError] = useState<string>("")

  const cargarRepeticiones = async () => {
    try {
      setLoading(true)
      setError("")      const data = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)      setRepeticiones(data)
    } catch (err: any) {
      console.error(" Error cargando repeticiones:", err)
      setError(err?.message || "Error al cargar repeticiones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRepeticiones()
  }, [tabla.tablaGermID, germinacionId])

  const handleCrearRepeticion = async () => {
    try {
      setError("")      const numeroRepeticion = repeticiones.length + 1
      const nuevaRepeticion: RepGermRequestDTO = {
        numRep: numeroRepeticion,
        // Valores iniciales
        normales: [],
        anormales: 0,
        muertas: 0,
        duras: 0,
        frescas: 0,
        total: 0
      }

      await crearRepeticion(germinacionId, tabla.tablaGermID, nuevaRepeticion)      // Recargar repeticiones y notificar actualización
      const repeticionesActualizadas = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)
      setRepeticiones(repeticionesActualizadas)
      onRepeticionesUpdated(repeticionesActualizadas)
    } catch (err: any) {
      console.error(" Error creando repetición:", err)
      setError(err?.message || "Error al crear repetición")
    }
  }

  const handleGuardarRepeticion = async (repeticion: RepGermDTO) => {
    try {
      setGuardando(repeticion.repGermID)
      setError("")      const solicitud: RepGermRequestDTO = {
        numRep: repeticion.numRep,
        normales: repeticion.normales,
        anormales: repeticion.anormales,
        muertas: repeticion.muertas,
        duras: repeticion.duras,
        frescas: repeticion.frescas,
        total: repeticion.total
      }

      await actualizarRepeticion(germinacionId, tabla.tablaGermID, repeticion.repGermID, solicitud)      // Recargar datos y notificar
      const repeticionesActualizadas = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)
      setRepeticiones(repeticionesActualizadas)
      onRepeticionesUpdated(repeticionesActualizadas)
    } catch (err: any) {
      console.error(" Error guardando repetición:", err)
      setError(err?.message || "Error al guardar repetición")
    } finally {
      setGuardando(null)
    }
  }

  const handleEliminarRepeticion = async (repId: number) => {
    const confirmed = await confirm({
      title: "Eliminar repetición",
      message: "¿Está seguro que desea eliminar esta repetición?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger"
    })

    if (!confirmed) {
      return
    }

    try {
      setEliminando(repId)
      setError("")      await eliminarRepeticion(germinacionId, tabla.tablaGermID, repId)      // Recargar datos y notificar
      const repeticionesActualizadas = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)
      setRepeticiones(repeticionesActualizadas)
      onRepeticionesUpdated(repeticionesActualizadas)
    } catch (err: any) {
      console.error(" Error eliminando repetición:", err)
      setError(err?.message || "Error al eliminar repetición")
    } finally {
      setEliminando(null)
    }
  }

  const actualizarValorRepeticion = (repId: number, campo: string, valor: number) => {
    setRepeticiones(prev =>
      prev.map(rep => {
        if (rep.repGermID === repId) {
          if (campo === 'normales') {
            // Para el campo normales que es un array, actualizamos el primer elemento
            const nuevosNormales = [...(rep.normales || [])]
            nuevosNormales[0] = valor
            return { ...rep, normales: nuevosNormales }
          } else {
            return { ...rep, [campo]: valor }
          }
        }
        return rep
      })
    )
  }

  const calcularTotalRepeticion = (rep: RepGermDTO): number => {
    const normalesSum = Array.isArray(rep.normales) ? rep.normales.reduce((sum: number, val: number) => sum + (val || 0), 0) : 0
    return normalesSum +
           (rep.anormales || 0) +
           (rep.muertas || 0) +
           (rep.duras || 0) +
           (rep.frescas || 0)
  }

  const calcularPorcentajeGerminacion = (rep: RepGermDTO): number => {
    const total = calcularTotalRepeticion(rep)
    const normalesSum = Array.isArray(rep.normales) ? rep.normales.reduce((sum: number, val: number) => sum + (val || 0), 0) : 0
    if (total === 0) return 0
    return Math.round((normalesSum / total) * 100)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg">
          Repeticiones ({repeticiones.length})
        </h4>

        <Button onClick={handleCrearRepeticion} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Repetición
        </Button>
      </div>

      {/* Lista de Repeticiones */}
      <div className="space-y-3">
        {repeticiones.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay repeticiones registradas en esta tabla.</p>
              <p className="text-sm">Agregue repeticiones para comenzar el registro de datos.</p>
            </CardContent>
          </Card>
        ) : (
          repeticiones.map((rep) => (
            <Card key={rep.repGermID} className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Repetición #{rep.numRep}
                    </CardTitle>
                    <Badge variant="outline">
                      Total: {calcularTotalRepeticion(rep)} semillas
                    </Badge>
                    <Badge>
                      Germinación: {calcularPorcentajeGerminacion(rep)}%
                    </Badge>
                  </div>

                  {!isFinalized && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleGuardarRepeticion(rep)}
                        disabled={guardando === rep.repGermID}
                        size="sm"
                      >
                        {guardando === rep.repGermID ? (
                          "Guardando..."
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Guardar
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleEliminarRepeticion(rep.repGermID)}
                        disabled={eliminando === rep.repGermID}
                        size="sm"
                      >
                        {eliminando === rep.repGermID ? (
                          "..."
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor={`normales-${rep.repGermID}`} className="text-sm font-medium">Normales</label>
                    <Input
                      id={`normales-${rep.repGermID}`}
                      type="number"
                      min="0"
                      value={(rep.normales && rep.normales[0]) || 0}
                      onChange={(e) => actualizarValorRepeticion(
                        rep.repGermID,
                        'normales',
                        parseInt(e.target.value) || 0
                      )}
                      className="text-center font-semibold"
                    />
                  </div>

                  <div>
                    <label htmlFor={`anormales-${rep.repGermID}`} className="text-sm font-medium">Anormales</label>
                    <Input
                      id={`anormales-${rep.repGermID}`}
                      type="number"
                      min="0"
                      value={rep.anormales || 0}
                      onChange={(e) => actualizarValorRepeticion(
                        rep.repGermID,
                        'anormales',
                        parseInt(e.target.value) || 0
                      )}
                      className="text-center"
                    />
                  </div>

                  <div>
                    <label htmlFor={`muertas-${rep.repGermID}`} className="text-sm font-medium">Muertas</label>
                    <Input
                      id={`muertas-${rep.repGermID}`}
                      type="number"
                      min="0"
                      value={rep.muertas || 0}
                      onChange={(e) => actualizarValorRepeticion(
                        rep.repGermID,
                        'muertas',
                        parseInt(e.target.value) || 0
                      )}
                      className="text-center"
                    />
                  </div>

                  <div>
                    <label htmlFor={`duras-${rep.repGermID}`} className="text-sm font-medium">Duras</label>
                    <Input
                      id={`duras-${rep.repGermID}`}
                      type="number"
                      min="0"
                      value={rep.duras || 0}
                      onChange={(e) => actualizarValorRepeticion(
                        rep.repGermID,
                        'duras',
                        parseInt(e.target.value) || 0
                      )}
                      className="text-center"
                    />
                  </div>

                  <div>
                    <label htmlFor={`frescas-${rep.repGermID}`} className="text-sm font-medium">Frescas</label>
                    <Input
                      id={`frescas-${rep.repGermID}`}
                      type="number"
                      min="0"
                      value={rep.frescas || 0}
                      onChange={(e) => actualizarValorRepeticion(
                        rep.repGermID,
                        'frescas',
                        parseInt(e.target.value) || 0
                      )}
                      className="text-center"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
