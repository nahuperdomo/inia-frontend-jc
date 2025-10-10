"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RepGermDTO, RepGermRequestDTO, TablaGermDTO } from '@/app/models/interfaces/repeticiones'
import { RepeticionRow } from './repeticion-row'
import { 
  obtenerRepeticionesDeTabla, 
  crearRepeticion, 
  actualizarRepeticion 
} from '@/app/services/germinacion-service'
import { Plus, Users } from 'lucide-react'

interface RepeticionesManagerProps {
  tabla: TablaGermDTO
  germinacionId: number
  numeroRepeticiones: number
  numeroConteos: number
  isFinalized: boolean
  fechasConteos?: string[] // Agregar fechas de conteos
  onRepeticionesUpdated: (repeticiones: RepGermDTO[]) => void
}

export function RepeticionesManager({
  tabla,
  germinacionId,
  numeroRepeticiones,
  numeroConteos,
  isFinalized,
  fechasConteos,
  onRepeticionesUpdated
}: RepeticionesManagerProps) {
  const [repeticiones, setRepeticiones] = useState<RepGermDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const cargarRepeticiones = async () => {
    try {
      setLoading(true)
      setError("")
      
      const data = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)
      setRepeticiones(data)
      onRepeticionesUpdated(data)
    } catch (err: any) {
      console.error("Error cargando repeticiones:", err)
      setError(err?.message || "Error al cargar repeticiones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarRepeticiones()
  }, [tabla.tablaGermID])

  const handleGuardarRepeticion = async (numeroRep: number, datos: RepGermRequestDTO) => {
    try {
      const repeticionExistente = repeticiones.find(r => r.numRep === numeroRep)
      let repeticionesActualizadas: RepGermDTO[]
      
      if (repeticionExistente) {
        // Actualizar existente
        const repeticionActualizada = await actualizarRepeticion(
          germinacionId, 
          tabla.tablaGermID, 
          repeticionExistente.repGermID, 
          datos
        )
        
        repeticionesActualizadas = repeticiones.map(r => 
          r.repGermID === repeticionExistente.repGermID ? repeticionActualizada : r
        )
        setRepeticiones(repeticionesActualizadas)
      } else {
        // Crear nueva
        const nuevaRepeticion = await crearRepeticion(germinacionId, tabla.tablaGermID, datos)
        repeticionesActualizadas = [...repeticiones, nuevaRepeticion]
        setRepeticiones(repeticionesActualizadas)
      }
      
      // Actualizar callback con las repeticiones realmente actualizadas
      onRepeticionesUpdated(repeticionesActualizadas)
      
    } catch (error) {
      console.error("Error guardando repetición:", error)
      throw error
    }
  }

  const repeticionesCompletas = repeticiones.length
  const puedeAgregarMas = repeticionesCompletas < numeroRepeticiones
  const todasCompletas = repeticionesCompletas === numeroRepeticiones

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Cargando repeticiones...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Repeticiones de Tabla {tabla.numeroTabla}
          <Badge variant={todasCompletas ? "default" : "secondary"} className="ml-2">
            {repeticionesCompletas}/{numeroRepeticiones}
          </Badge>
        </CardTitle>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mostrar todas las repeticiones posibles */}
        {Array.from({ length: numeroRepeticiones }, (_, index) => {
          const numeroRep = index + 1
          const repeticionExistente = repeticiones.find(r => r.numRep === numeroRep)
          
          return (
            <RepeticionRow
              key={numeroRep}
              repeticion={repeticionExistente}
              numeroRepeticion={numeroRep}
              numeroConteos={numeroConteos}
              numSemillasPRep={tabla.numSemillasPRep}
              isFinalized={false}
              fechasConteos={fechasConteos}
              onGuardar={(datos) => handleGuardarRepeticion(numeroRep, datos)}
            />
          )
        })}

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Cada repetición puede tener máximo <strong>{tabla.numSemillasPRep} semillas</strong></div>
            <div>• Se requieren <strong>{numeroConteos} conteos</strong> en el campo "Normales"</div>
            <div>• Total de repeticiones requeridas: <strong>{numeroRepeticiones}</strong></div>
          </div>
          
          {todasCompletas && (
            <div className="mt-2 text-green-600 font-medium">
              ✅ Todas las repeticiones están completas. Ya puede ingresar porcentajes para finalizar la tabla.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}