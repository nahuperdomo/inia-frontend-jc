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
  fechasConteos?: string[] // Agregar fechas de conteos para validación
  onGuardar: (datos: RepGermRequestDTO) => Promise<void>
  onEliminar?: () => Promise<void>
}

export function RepeticionRow({
  repeticion,
  numeroRepeticion,
  numeroConteos,
  numSemillasPRep,
  isFinalized,
  fechasConteos,
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

  // Función para manejar el comportamiento de reemplazo del 0 inicial
  const manejarCambioNumerico = (valorString: string, valorActual: number, callback: (nuevoValor: number) => void) => {
    // Si el campo está vacío, usar 0
    if (valorString === '') {
      callback(0)
      return
    }
    
    // Si el valor actual es 0 y se está escribiendo algo diferente de '0', reemplazar completamente
    if (valorActual === 0 && valorString !== '0') {
      const numeroIngresado = parseInt(valorString) || 0
      callback(numeroIngresado)
    } else {
      // Comportamiento normal
      const numeroIngresado = parseInt(valorString) || 0
      callback(numeroIngresado)
    }
  }

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
      // Restaurar valores originales si existe repetición y salir del modo edición
      setDatos({
        numRep: repeticion.numRep,
        normales: repeticion.normales || new Array(numeroConteos).fill(0),
        anormales: repeticion.anormales,
        duras: repeticion.duras,
        frescas: repeticion.frescas,
        muertas: repeticion.muertas,
        total: repeticion.total
      })
      setModoEdicion(false)
    } else {
      // Si no hay repetición, resetear a valores por defecto
      // Los botones se mantienen visibles porque !repeticion siempre será true
      setDatos({
        numRep: numeroRepeticion,
        normales: new Array(numeroConteos).fill(0),
        anormales: 0,
        duras: 0,
        frescas: 0,
        muertas: 0,
        total: 0
      })
    }
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

  // Función para validar si se puede ingresar datos en un conteo específico
  const puedeIngresarConteo = (indiceConteo: number): boolean => {
    if (!fechasConteos || !fechasConteos[indiceConteo]) return true
    
    const fechaConteo = new Date(fechasConteos[indiceConteo])
    const fechaActual = new Date()
    fechaActual.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
    fechaConteo.setHours(0, 0, 0, 0)
    
    return fechaConteo <= fechaActual
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
          
          <div className="flex gap-2">
            {/* Si hay repetición guardada y no está en modo edición, mostrar botón Editar */}
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
            
            {/* Si está en modo edición O no hay repetición creada, mostrar botones de acción */}
            {(modoEdicion || !repeticion) && (
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
        </div>

        <div className="space-y-4">
          {/* Campos Normales por Conteo */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Normales por Conteo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {datos.normales.map((valor, indice) => {
                const puedeIngresar = puedeIngresarConteo(indice)
                return (
                  <div key={indice}>
                    <label className="text-xs text-gray-500">
                      Conteo {indice + 1}
                      {!puedeIngresar && (
                        <span className="text-red-500 ml-1" title="Fecha futura - no disponible">⚠️</span>
                      )}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={numSemillasPRep}
                      value={valor === 0 ? '' : valor}
                      onChange={(e) => manejarCambioNumerico(e.target.value, valor, (nuevoValor) => 
                        actualizarNormal(indice, nuevoValor)
                      )}
                      disabled={!modoEdicion || !puedeIngresar}
                      className={`text-center ${!puedeIngresar ? 'bg-gray-100 text-gray-400' : ''}`}
                      title={!puedeIngresar ? "No se puede ingresar datos para fechas futuras" : ""}
                    />
                    {fechasConteos && fechasConteos[indice] && (
                      <div className="text-xs text-gray-400 text-center mt-1">
                        {new Date(fechasConteos[indice]).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
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
                value={datos.anormales === 0 ? '' : datos.anormales}
                onChange={(e) => manejarCambioNumerico(e.target.value, datos.anormales, (nuevoValor) => 
                  actualizarCampo('anormales', nuevoValor)
                )}
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
                value={datos.duras === 0 ? '' : datos.duras}
                onChange={(e) => manejarCambioNumerico(e.target.value, datos.duras, (nuevoValor) => 
                  actualizarCampo('duras', nuevoValor)
                )}
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
                value={datos.frescas === 0 ? '' : datos.frescas}
                onChange={(e) => manejarCambioNumerico(e.target.value, datos.frescas, (nuevoValor) => 
                  actualizarCampo('frescas', nuevoValor)
                )}
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
                value={datos.muertas === 0 ? '' : datos.muertas}
                onChange={(e) => manejarCambioNumerico(e.target.value, datos.muertas, (nuevoValor) => 
                  actualizarCampo('muertas', nuevoValor)
                )}
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