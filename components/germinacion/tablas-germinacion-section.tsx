import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablaGermDTO, PorcentajesRedondeoRequestDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { ValoresGermDTO, ValoresGermRequestDTO } from '@/app/models/interfaces/valores-germ'
import { Instituto } from '@/app/models/types/enums'
import { RepeticionesGerminacionManager } from './repeticiones-germinacion-manager'
import { Table, Plus, Trash2, CheckCircle, Calculator, Building } from 'lucide-react'
import { 
  eliminarTablaGerminacion, 
  finalizarTabla, 
  actualizarPorcentajes 
} from '@/app/services/germinacion-service'
import {
  obtenerValoresPorTabla,
  actualizarValores,
  obtenerValoresIniaPorTabla,
  obtenerValoresInasePorTabla
} from '@/app/services/valores-germ-service';

interface TablasGerminacionSectionProps {
  tablas: TablaGermDTO[]
  germinacionId: number
  isFinalized: boolean
  onTablaUpdated: () => void
}

export function TablasGerminacionSection({
  tablas,
  germinacionId,
  isFinalized,
  onTablaUpdated
}: TablasGerminacionSectionProps) {
  const [tablasLocales, setTablasLocales] = useState<TablaGermDTO[]>(tablas)
  const [tablaExpandida, setTablaExpandida] = useState<number | null>(null)
  const [eliminandoTabla, setEliminandoTabla] = useState<number | null>(null)
  const [finalizandoTabla, setFinalizandoTabla] = useState<number | null>(null)
  const [mostrandoPorcentajes, setMostrandoPorcentajes] = useState<number | null>(null)
  const [mostrandoValores, setMostrandoValores] = useState<number | null>(null)
  const [cargandoValores, setCargandoValores] = useState<boolean>(false)
  const [porcentajes, setPorcentajes] = useState<PorcentajesRedondeoRequestDTO>({
    porcentajeNormalesConRedondeo: 0,
    porcentajeAnormalesConRedondeo: 0,
    porcentajeDurasConRedondeo: 0,
    porcentajeFrescasConRedondeo: 0,
    porcentajeMuertasConRedondeo: 0
  })
  const [valoresInia, setValoresInia] = useState<ValoresGermRequestDTO>({
    instituto: 'INIA',
    normales: 0,
    anormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    total: 0
  })
  const [valoresInase, setValoresInase] = useState<ValoresGermRequestDTO>({
    instituto: 'INASE',
    normales: 0,
    anormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    total: 0
  })

  // Actualizar tablas locales cuando cambien las props
  useEffect(() => {
    setTablasLocales(tablas)
  }, [tablas])

  const handleEliminarTabla = async (tablaId: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta tabla? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setEliminandoTabla(tablaId)
      console.log("🗑️ Eliminando tabla:", tablaId)
      
      await eliminarTablaGerminacion(germinacionId, tablaId)
      console.log("✅ Tabla eliminada exitosamente")
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => prev.filter(tabla => tabla.tablaGermID !== tablaId))
      
      // Cerrar expansión si era la tabla eliminada
      if (tablaExpandida === tablaId) {
        setTablaExpandida(null)
      }
    } catch (error) {
      console.error("❌ Error eliminando tabla:", error)
      alert("Error al eliminar la tabla")
    } finally {
      setEliminandoTabla(null)
    }
  }

  const toggleTablaExpansion = (tablaId: number) => {
    setTablaExpandida(tablaExpandida === tablaId ? null : tablaId)
  }

  const handleFinalizarTabla = async (tablaId: number) => {
    if (!window.confirm("¿Está seguro que desea finalizar esta tabla? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setFinalizandoTabla(tablaId)
      console.log("🏁 Finalizando tabla:", tablaId)
      
      await finalizarTabla(germinacionId, tablaId)
      console.log("✅ Tabla finalizada exitosamente")
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: true, fechaFinal: new Date().toISOString() }
            : tabla
        )
      )
    } catch (error) {
      console.error("❌ Error finalizando tabla:", error)
      alert("Error al finalizar la tabla")
    } finally {
      setFinalizandoTabla(null)
    }
  }


  const handleEditarTabla = async (tablaId: number) => {
    if (!window.confirm("¿Está seguro que desea editar esta tabla? Podrá volver a modificarla.")) {
      return
    }

    try {
      console.log("✏️ Editando tabla:", tablaId)
      
      // Actualizar estado local para marcar como no finalizada
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: false, fechaFinal: undefined }
            : tabla
        )
      )
      
      console.log("✅ Tabla habilitada para edición")
    } catch (error) {
      console.error("❌ Error reabriendo tabla:", error)
      alert("Error al reabrir la tabla")
    }
  }

  const handleMostrarPorcentajes = (tablaId: number) => {
    setMostrandoPorcentajes(tablaId)
    
    // Buscar la tabla para cargar sus porcentajes existentes
    const tabla = tablasLocales.find(t => t.tablaGermID === tablaId)
    
    if (tabla && tabla.porcentajeNormalesConRedondeo !== undefined) {
      // Cargar porcentajes existentes si los hay
      setPorcentajes({
        porcentajeNormalesConRedondeo: tabla.porcentajeNormalesConRedondeo || 0,
        porcentajeAnormalesConRedondeo: tabla.porcentajeAnormalesConRedondeo || 0,
        porcentajeDurasConRedondeo: tabla.porcentajeDurasConRedondeo || 0,
        porcentajeFrescasConRedondeo: tabla.porcentajeFrescasConRedondeo || 0,
        porcentajeMuertasConRedondeo: tabla.porcentajeMuertasConRedondeo || 0
      })
    } else {
      // Resetear porcentajes si no hay valores previos
      setPorcentajes({
        porcentajeNormalesConRedondeo: 0,
        porcentajeAnormalesConRedondeo: 0,
        porcentajeDurasConRedondeo: 0,
        porcentajeFrescasConRedondeo: 0,
        porcentajeMuertasConRedondeo: 0
      })
    }
  }

  const handleGuardarPorcentajes = async (tablaId: number) => {
    const totalPorcentajes = porcentajes.porcentajeNormalesConRedondeo + 
                           porcentajes.porcentajeAnormalesConRedondeo + 
                           porcentajes.porcentajeDurasConRedondeo + 
                           porcentajes.porcentajeFrescasConRedondeo + 
                           porcentajes.porcentajeMuertasConRedondeo

    if (Math.abs(totalPorcentajes - 100) > 0.1) {
      alert("Los porcentajes deben sumar exactamente 100%")
      return
    }

    try {
      console.log("💾 Guardando porcentajes para tabla:", tablaId)
      
      await actualizarPorcentajes(germinacionId, tablaId, porcentajes)
      console.log("✅ Porcentajes guardados exitosamente")
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { 
                ...tabla, 
                porcentajeNormalesConRedondeo: porcentajes.porcentajeNormalesConRedondeo,
                porcentajeAnormalesConRedondeo: porcentajes.porcentajeAnormalesConRedondeo,
                porcentajeDurasConRedondeo: porcentajes.porcentajeDurasConRedondeo,
                porcentajeFrescasConRedondeo: porcentajes.porcentajeFrescasConRedondeo,
                porcentajeMuertasConRedondeo: porcentajes.porcentajeMuertasConRedondeo
              }
            : tabla
        )
      )
      
      setMostrandoPorcentajes(null)
    } catch (error) {
      console.error("❌ Error guardando porcentajes:", error)
      alert("Error al guardar porcentajes")
    }
  }

  const actualizarPorcentaje = (campo: keyof PorcentajesRedondeoRequestDTO, valor: number) => {
    setPorcentajes(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Funciones para manejar valores INIA e INASE
  const handleMostrarValores = async (tablaId: number) => {
    try {
      setCargandoValores(true)
      setMostrandoValores(tablaId)
      
      // Cargar valores existentes si los hay
      try {
        const valoresIniaData = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
        setValoresInia({
          instituto: 'INIA',
          normales: valoresIniaData.normales,
          anormales: valoresIniaData.anormales,
          duras: valoresIniaData.duras,
          frescas: valoresIniaData.frescas,
          muertas: valoresIniaData.muertas,
          total: valoresIniaData.total
        })
      } catch (error) {
        console.log("No hay valores INIA existentes")
      }

      try {
        const valoresInaseData = await obtenerValoresInasePorTabla(germinacionId, tablaId)
        setValoresInase({
          instituto: 'INASE',
          normales: valoresInaseData.normales,
          anormales: valoresInaseData.anormales,
          duras: valoresInaseData.duras,
          frescas: valoresInaseData.frescas,
          muertas: valoresInaseData.muertas,
          total: valoresInaseData.total
        })
      } catch (error) {
        console.log("No hay valores INASE existentes")
      }
    } catch (error) {
      console.error("Error cargando valores:", error)
    } finally {
      setCargandoValores(false)
    }
  }

  const handleGuardarValores = async (tablaId: number) => {
    try {
      console.log("💾 Guardando valores INIA e INASE para tabla:", tablaId)
      
      let guardadoExitoso = false
      
      // Guardar valores INIA
      if (valoresInia.total > 0) {
        await actualizarValores(germinacionId, tablaId, 1, valoresInia) // Asumiendo ID 1 para INIA
        console.log("✅ Valores INIA guardados")
        guardadoExitoso = true
      }
      
      // Guardar valores INASE
      if (valoresInase.total > 0) {
        await actualizarValores(germinacionId, tablaId, 2, valoresInase) // Asumiendo ID 2 para INASE
        console.log("✅ Valores INASE guardados")
        guardadoExitoso = true
      }
      
      if (guardadoExitoso) {
        alert("Valores guardados exitosamente")
        // No cerrar el modal para que el usuario vea los valores guardados
        // setMostrandoValores(null)
      } else {
        alert("No hay valores para guardar")
      }
    } catch (error) {
      console.error("❌ Error guardando valores:", error)
      alert("Error al guardar valores")
    }
  }

  const actualizarValorInia = (campo: keyof Omit<ValoresGermRequestDTO, 'instituto'>, valor: number) => {
    setValoresInia(prev => {
      const updated = { ...prev, [campo]: valor }
      // Actualizar total automáticamente
      if (campo !== 'total') {
        updated.total = updated.normales + updated.anormales + updated.duras + updated.frescas + updated.muertas
      }
      return updated
    })
  }

  const actualizarValorInase = (campo: keyof Omit<ValoresGermRequestDTO, 'instituto'>, valor: number) => {
    setValoresInase(prev => {
      const updated = { ...prev, [campo]: valor }
      // Actualizar total automáticamente
      if (campo !== 'total') {
        updated.total = updated.normales + updated.anormales + updated.duras + updated.frescas + updated.muertas
      }
      return updated
    })
  }

  // Función para actualizar repeticiones localmente
  const handleRepeticionesUpdated = (tablaId: number, nuevasRepeticiones: RepGermDTO[]) => {
    setTablasLocales(prev => 
      prev.map(tabla => 
        tabla.tablaGermID === tablaId 
          ? { ...tabla, repGerm: nuevasRepeticiones }
          : tabla
      )
    )
  }

  const calcularTotalPorcentajes = (): number => {
    return porcentajes.porcentajeNormalesConRedondeo + 
           porcentajes.porcentajeAnormalesConRedondeo + 
           porcentajes.porcentajeDurasConRedondeo + 
           porcentajes.porcentajeFrescasConRedondeo + 
           porcentajes.porcentajeMuertasConRedondeo
  }

  const puedeFinalizarTabla = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0 && tabla.finalizada !== true
  }

  const puedeIngresarPorcentajes = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0 && tabla.finalizada !== true
  }

  // Funciones para permitir edición independientemente del estado
  const puedeEditarPorcentajes = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0
  }

  const puedeEditarValores = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table className="h-5 w-5" />
          Tablas de Germinación ({tablasLocales.length}/4)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tablasLocales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay tablas de germinación registradas.</p>
            <p className="text-sm">Cree la primera tabla para comenzar a registrar las repeticiones.</p>
          </div>
        ) : (
          tablasLocales.map((tabla) => (
            <Card key={tabla.tablaGermID} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Tabla #{tabla.numeroTabla || tabla.tablaGermID}</h3>
                    <Badge variant={tabla.repGerm && tabla.repGerm.length > 0 ? "default" : "secondary"}>
                      {tabla.repGerm ? tabla.repGerm.length : 0} repeticiones
                    </Badge>
                    {tabla.finalizada && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizada
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTablaExpansion(tabla.tablaGermID)}
                      className="min-w-fit"
                    >
                      {tablaExpandida === tabla.tablaGermID ? "Contraer" : "Expandir"}
                    </Button>

                    {/* Botón para ingresar porcentajes */}
                    {!isFinalized && puedeIngresarPorcentajes(tabla) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMostrarPorcentajes(tabla.tablaGermID)}
                        className="bg-blue-600 hover:bg-blue-700 min-w-fit text-xs sm:text-sm"
                      >
                        <Calculator className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Porcentajes</span>
                        <span className="sm:hidden">%</span>
                      </Button>
                    )}

                    {/* Botón para ingresar valores INIA e INASE */}
                    {!isFinalized && puedeIngresarPorcentajes(tabla) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleMostrarValores(tabla.tablaGermID)}
                        className="bg-purple-600 hover:bg-purple-700 min-w-fit text-xs sm:text-sm"
                        disabled={cargandoValores}
                      >
                        <Building className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">
                          {cargandoValores && mostrandoValores === tabla.tablaGermID ? "Cargando..." : "Valores INIA/INASE"}
                        </span>
                        <span className="sm:hidden">Valores</span>
                      </Button>
                    )}

                    {/* Botones para tabla finalizada - permitir edición */}
                    {tabla.finalizada && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarTabla(tabla.tablaGermID)}
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 min-w-fit text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Editar Tabla</span>
                          <span className="sm:hidden">Editar</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMostrarPorcentajes(tabla.tablaGermID)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 min-w-fit text-xs sm:text-sm"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Editar Porcentajes</span>
                          <span className="sm:hidden">%</span>
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMostrarValores(tabla.tablaGermID)}
                          className="border-purple-600 text-purple-600 hover:bg-purple-50 min-w-fit text-xs sm:text-sm"
                          disabled={cargandoValores}
                        >
                          <Building className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Editar Valores</span>
                          <span className="sm:hidden">Valores</span>
                        </Button>
                      </>
                    )}

                    {/* Botón para finalizar tabla */}
                    {!isFinalized && puedeFinalizarTabla(tabla) && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleFinalizarTabla(tabla.tablaGermID)}
                        disabled={finalizandoTabla === tabla.tablaGermID}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {finalizandoTabla === tabla.tablaGermID ? (
                          "Finalizando..."
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar
                          </>
                        )}
                      </Button>
                    )}
                    
                    {!isFinalized && !tabla.finalizada && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEliminarTabla(tabla.tablaGermID)}
                        disabled={eliminandoTabla === tabla.tablaGermID}
                      >
                        {eliminandoTabla === tabla.tablaGermID ? (
                          "Eliminando..."
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {tablaExpandida === tabla.tablaGermID && (
                <CardContent className="pt-0">
                  <RepeticionesGerminacionManager
                    tabla={tabla}
                    germinacionId={germinacionId}
                    isFinalized={isFinalized}
                    onRepeticionesUpdated={(repeticiones) => handleRepeticionesUpdated(tabla.tablaGermID, repeticiones)}
                  />

                  {/* Modal para ingresar porcentajes */}
                  {mostrandoPorcentajes === tabla.tablaGermID && (
                    <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Ingresar Porcentajes con Redondeo
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium">% Normales</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={porcentajes.porcentajeNormalesConRedondeo}
                            onChange={(e) => actualizarPorcentaje('porcentajeNormalesConRedondeo', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">% Anormales</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={porcentajes.porcentajeAnormalesConRedondeo}
                            onChange={(e) => actualizarPorcentaje('porcentajeAnormalesConRedondeo', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">% Duras</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={porcentajes.porcentajeDurasConRedondeo}
                            onChange={(e) => actualizarPorcentaje('porcentajeDurasConRedondeo', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">% Frescas</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={porcentajes.porcentajeFrescasConRedondeo}
                            onChange={(e) => actualizarPorcentaje('porcentajeFrescasConRedondeo', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">% Muertas</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={porcentajes.porcentajeMuertasConRedondeo}
                            onChange={(e) => actualizarPorcentaje('porcentajeMuertasConRedondeo', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className={`text-sm font-medium ${Math.abs(calcularTotalPorcentajes() - 100) <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                          Total: {calcularTotalPorcentajes().toFixed(1)}% 
                          {Math.abs(calcularTotalPorcentajes() - 100) <= 0.1 ? ' ✅' : ' ❌ (debe ser 100%)'}
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            onClick={() => setMostrandoPorcentajes(null)}
                            className="flex-1 sm:flex-initial"
                          >
                            Cancelar
                          </Button>
                          
                          <Button
                            onClick={() => handleGuardarPorcentajes(tabla.tablaGermID)}
                            disabled={Math.abs(calcularTotalPorcentajes() - 100) > 0.1}
                            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial"
                          >
                            Guardar Porcentajes
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulario para ingresar valores INIA e INASE */}
                  {mostrandoValores === tabla.tablaGermID && (
                    <div className="mt-4 p-4 border rounded-lg bg-purple-50">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Valores INIA e INASE - Tabla {tabla.numeroTabla}
                      </h4>
                      
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* INIA */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-purple-700">INIA</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Normales</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInia.normales}
                                onChange={(e) => actualizarValorInia('normales', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Anormales</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInia.anormales}
                                onChange={(e) => actualizarValorInia('anormales', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Duras</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInia.duras}
                                onChange={(e) => actualizarValorInia('duras', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Frescas</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInia.frescas}
                                onChange={(e) => actualizarValorInia('frescas', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Muertas</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInia.muertas}
                                onChange={(e) => actualizarValorInia('muertas', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Total</Label>
                              <Input
                                type="number"
                                value={valoresInia.total}
                                readOnly
                                className="text-center bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>

                        {/* INASE */}
                        <div className="space-y-3">
                          <h5 className="font-medium text-purple-700">INASE</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Normales</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInase.normales}
                                onChange={(e) => actualizarValorInase('normales', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Anormales</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInase.anormales}
                                onChange={(e) => actualizarValorInase('anormales', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Duras</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInase.duras}
                                onChange={(e) => actualizarValorInase('duras', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Frescas</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInase.frescas}
                                onChange={(e) => actualizarValorInase('frescas', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Muertas</Label>
                              <Input
                                type="number"
                                min="0"
                                value={valoresInase.muertas}
                                onChange={(e) => actualizarValorInase('muertas', parseFloat(e.target.value) || 0)}
                                className="text-center"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Total</Label>
                              <Input
                                type="number"
                                value={valoresInase.total}
                                readOnly
                                className="text-center bg-gray-100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setMostrandoValores(null)}
                          className="w-full sm:w-auto"
                        >
                          Cancelar
                        </Button>
                        
                        <Button
                          onClick={() => handleGuardarValores(tabla.tablaGermID)}
                          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                        >
                          Guardar Valores
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  )
}