"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RepGermDTO, RepGermRequestDTO, TablaGermDTO } from '@/app/models/interfaces/repeticiones'
import { RepeticionRow } from './repeticion-row'
import { 
  obtenerRepeticionesDeTabla, 
  crearRepeticion, 
  actualizarRepeticion 
} from '@/app/services/germinacion-service'
import { Users } from 'lucide-react'

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
      
      console.log(` Cargando repeticiones para tabla ${tabla.tablaGermID}...`)
      const data = await obtenerRepeticionesDeTabla(germinacionId, tabla.tablaGermID)
      console.log(` Repeticiones cargadas para tabla ${tabla.tablaGermID}:`, data.length, "repeticiones")
      console.log(" Detalles de repeticiones:", data.map(r => ({
        numRep: r.numRep,
        normales: r.normales,
        anormales: r.anormales,
        duras: r.duras,
        frescas: r.frescas,
        muertas: r.muertas
      })))
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
      console.log(` Intentando guardar repetición ${numeroRep} para tabla ${tabla.tablaGermID}`)
      console.log(" Datos a guardar:", datos)
      
      const repeticionExistente = repeticiones.find(r => r.numRep === numeroRep)
      let repeticionesActualizadas: RepGermDTO[]
      
      if (repeticionExistente) {
        // Actualizar existente
        console.log(` Actualizando repetición existente con ID ${repeticionExistente.repGermID}`)
        const repeticionActualizada = await actualizarRepeticion(
          germinacionId, 
          tabla.tablaGermID, 
          repeticionExistente.repGermID, 
          datos
        )
        console.log(" Repetición actualizada exitosamente:", repeticionActualizada)
        
        repeticionesActualizadas = repeticiones.map(r => 
          r.repGermID === repeticionExistente.repGermID ? repeticionActualizada : r
        )
        setRepeticiones(repeticionesActualizadas)
      } else {
        // Crear nueva
        console.log(`➕ Creando nueva repetición ${numeroRep}`)
        const nuevaRepeticion = await crearRepeticion(germinacionId, tabla.tablaGermID, datos)
        console.log(" Repetición creada exitosamente:", nuevaRepeticion)
        
        repeticionesActualizadas = [...repeticiones, nuevaRepeticion]
        setRepeticiones(repeticionesActualizadas)
      }
      
      console.log(` Total de repeticiones ahora: ${repeticionesActualizadas.length}`)
      
      // Actualizar callback con las repeticiones realmente actualizadas
      onRepeticionesUpdated(repeticionesActualizadas)
      
      console.log(" Repetición guardada y estado actualizado correctamente")
      
    } catch (error: any) {
      console.error(" Error guardando repetición:", error)
      console.error(" Mensaje de error:", error?.message || error)
      console.error(" Detalles completos:", error)
      alert(`Error al guardar la repetición: ${error?.message || 'Error desconocido'}`)
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
              key={repeticionExistente ? `rep-${repeticionExistente.repGermID}` : `nuevo-rep-${numeroRep}`}
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
               Todas las repeticiones están completas. Ya puede ingresar porcentajes para finalizar la tabla.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
