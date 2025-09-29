"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { RepGermDTO, RepGermRequestDTO } from '@/app/models/interfaces/repeticiones'
import { Save, Edit, Check, X } from 'lucide-react'

interface RepeticionRowProps {
  repeticion?: RepGermDTO
  numeroRepeticion: number
  numeroConteos: number
  numSemillasPRep: number
  isFinalized: boolean
  onGuardar: (datos: RepGermRequestDTO) => Promise<void>
  onEliminar?: () => Promise<void>
}

export function RepeticionRow({
  repeticion,
  numeroRepeticion,
  numeroConteos,
  numSemillasPRep,
  isFinalized,
  onGuardar,
  onEliminar
}: RepeticionRowProps) {
  const [modoEdicion, setModoEdicion] = useState(!repeticion) // Si no hay repetición, empezar en modo edición
  const [guardando, setGuardando] = useState(false)
  const [datos, setDatos] = useState<RepGermRequestDTO>({
    numRep: numeroRepeticion,
    normales: new Array(numeroConteos).fill(0),
    anormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    total: 0
  })

  // Cargar datos existentes si hay repetición
  useEffect(() => {
    if (repeticion) {
      setDatos({
        numRep: repeticion.numRep,
        normales: repeticion.normales || new Array(numeroConteos).fill(0),
        anormales: repeticion.anormales,
        duras: repeticion.duras,
        frescas: repeticion.frescas,
        muertas: repeticion.muertas,
        total: repeticion.total
      })
    }
  }, [repeticion, numeroConteos])

  // Calcular total automáticamente
  useEffect(() => {
    const totalNormales = datos.normales.reduce((sum, val) => sum + val, 0)
    const nuevoTotal = totalNormales + datos.anormales + datos.duras + datos.frescas + datos.muertas
    
    if (nuevoTotal !== datos.total) {
      setDatos(prev => ({ ...prev, total: nuevoTotal }))
    }
  }, [datos.normales, datos.anormales, datos.duras, datos.frescas, datos.muertas])

  const handleGuardar = async () => {
    if (datos.total > numSemillasPRep) {
      alert(`El total no puede exceder ${numSemillasPRep} semillas`)
      return
    }

    if (datos.total === 0) {
      alert("Debe ingresar al menos un valor")
      return
    }

    try {
      setGuardando(true)
      await onGuardar(datos)
      setModoEdicion(false)
    } catch (error) {
      console.error("Error guardando repetición:", error)
    } finally {
      setGuardando(false)
    }
  }

  const handleCancelar = () => {
    if (repeticion) {
      // Restaurar valores originales
      setDatos({
        numRep: repeticion.numRep,
        normales: repeticion.normales || new Array(numeroConteos).fill(0),
        anormales: repeticion.anormales,
        duras: repeticion.duras,
        frescas: repeticion.frescas,
        muertas: repeticion.muertas,
        total: repeticion.total
      })
    }
    setModoEdicion(false)
  }

  const actualizarNormal = (indice: number, valor: number) => {
    setDatos(prev => ({
      ...prev,
      normales: prev.normales.map((val, i) => i === indice ? valor : val)
    }))
  }

  const actualizarCampo = (campo: keyof Omit<RepGermRequestDTO, 'numRep' | 'normales' | 'total'>, valor: number) => {
    setDatos(prev => ({ ...prev, [campo]: valor }))
  }

  const totalExcedido = datos.total > numSemillasPRep
  const puedeGuardar = datos.total > 0 && !totalExcedido

  return (
    <Card className={`mb-4 ${totalExcedido ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">
              {repeticion?.tablaGerm ? `${repeticion.tablaGerm.numeroTabla} - ` : ''}Repetición {numeroRepeticion}
            </h4>
            {repeticion && !modoEdicion && (
              <Badge variant="default" className="bg-green-600">
                <Check className="h-3 w-3 mr-1" />
                Completada
              </Badge>
            )}
          </div>
          
          {!isFinalized && (
            <div className="flex gap-2">
              {repeticion && !modoEdicion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModoEdicion(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              
              {modoEdicion && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelar}
                    disabled={guardando}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGuardar}
                    disabled={!puedeGuardar || guardando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    {guardando ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Campos Normales por Conteo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Normales por Conteo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {datos.normales.map((valor, indice) => (
                <div key={indice}>
                  <label className="text-xs text-gray-500">Conteo {indice + 1}</label>
                  <Input
                    type="number"
                    min="0"
                    max={numSemillasPRep}
                    value={valor}
                    onChange={(e) => actualizarNormal(indice, parseInt(e.target.value) || 0)}
                    disabled={!modoEdicion}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Otros campos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Anormales</label>
              <Input
                type="number"
                min="0"
                max={numSemillasPRep}
                value={datos.anormales}
                onChange={(e) => actualizarCampo('anormales', parseInt(e.target.value) || 0)}
                disabled={!modoEdicion}
                className="text-center"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Duras</label>
              <Input
                type="number"
                min="0"
                max={numSemillasPRep}
                value={datos.duras}
                onChange={(e) => actualizarCampo('duras', parseInt(e.target.value) || 0)}
                disabled={!modoEdicion}
                className="text-center"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Frescas</label>
              <Input
                type="number"
                min="0"
                max={numSemillasPRep}
                value={datos.frescas}
                onChange={(e) => actualizarCampo('frescas', parseInt(e.target.value) || 0)}
                disabled={!modoEdicion}
                className="text-center"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Muertas</label>
              <Input
                type="number"
                min="0"
                max={numSemillasPRep}
                value={datos.muertas}
                onChange={(e) => actualizarCampo('muertas', parseInt(e.target.value) || 0)}
                disabled={!modoEdicion}
                className="text-center"
              />
            </div>
          </div>

          {/* Total con validación */}
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${totalExcedido ? 'text-red-600' : 'text-green-600'}`}>
              Total: {datos.total}/{numSemillasPRep} semillas
              {totalExcedido && ' ❌ Excede el límite'}
              {puedeGuardar && datos.total === numSemillasPRep && ' ✅ Completo'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}