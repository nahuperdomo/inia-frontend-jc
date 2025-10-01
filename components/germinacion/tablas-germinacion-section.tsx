import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TablaGermDTO, PorcentajesRedondeoRequestDTO, TablaGermRequestDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { ValoresGermDTO, ValoresGermRequestDTO } from '@/app/models/interfaces/valores-germ'
import { Instituto } from '@/app/models/types/enums'
import { RepeticionesManager } from './repeticiones-manager-v2'
import { Table, Plus, Trash2, CheckCircle, Calculator, Building } from 'lucide-react'
import { 
  eliminarTablaGerminacion, 
  finalizarTabla, 
  actualizarPorcentajes,
  crearTablaGerminacion,
  actualizarTablaGerminacion
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
  germinacion?: any // Para acceder a numeroRepeticiones y numeroConteos
}

export function TablasGerminacionSection({
  tablas,
  germinacionId,
  isFinalized,
  onTablaUpdated,
  germinacion
}: TablasGerminacionSectionProps) {
  const [tablasLocales, setTablasLocales] = useState<TablaGermDTO[]>(tablas || [])
  const [tablaExpandida, setTablaExpandida] = useState<number | null>(null)
  const [eliminandoTabla, setEliminandoTabla] = useState<number | null>(null)
  const [finalizandoTabla, setFinalizandoTabla] = useState<number | null>(null)
  const [editandoPorcentajes, setEditandoPorcentajes] = useState<number | null>(null)
  const [editandoValores, setEditandoValores] = useState<number | null>(null)
  const [editandoTablaGeneral, setEditandoTablaGeneral] = useState<number | null>(null)
  const [mostrandoFormularioTabla, setMostrandoFormularioTabla] = useState<boolean>(false)
  const [mostrandoPorcentajes, setMostrandoPorcentajes] = useState<number | null>(null)
  const [mostrandoValores, setMostrandoValores] = useState<number | null>(null)
  const [cargandoValores, setCargandoValores] = useState<boolean>(false)
  const [porcentajesOriginales, setPorcentajesOriginales] = useState<PorcentajesRedondeoRequestDTO | null>(null)
  const [valoresOriginalesInia, setValoresOriginalesInia] = useState<ValoresGermRequestDTO | null>(null)
  const [valoresOriginalesInase, setValoresOriginalesInase] = useState<ValoresGermRequestDTO | null>(null)
  const [tablaEditada, setTablaEditada] = useState<TablaGermRequestDTO>({
    tratamiento: '',
    productoYDosis: '',
    numSemillasPRep: 100,
    metodo: 'Papel',
    temperatura: 20,
    prefrio: 'No',
    pretratamiento: 'Ninguno',
    total: 0
  })
  const [tablaOriginal, setTablaOriginal] = useState<TablaGermRequestDTO | null>(null)
  const [nuevaTabla, setNuevaTabla] = useState<TablaGermRequestDTO>({
    tratamiento: 'Control',
    productoYDosis: '',
    numSemillasPRep: 100,
    metodo: 'Papel',
    temperatura: 20,
    prefrio: 'No',
    pretratamiento: 'Ninguno',
    total: 0
  })
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
    setTablasLocales(tablas || [])
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

  const handleCrearTabla = async () => {
    try {
      console.log("🚀 Creando nueva tabla con datos:", nuevaTabla)
      
      const tablaCreada = await crearTablaGerminacion(germinacionId, nuevaTabla)
      console.log("✅ Tabla creada:", tablaCreada)
      
      // Actualizar estado local
      setTablasLocales(prev => [...prev, tablaCreada])
      
      // Resetear formulario
      setNuevaTabla({
        tratamiento: 'Control',
        productoYDosis: '',
        numSemillasPRep: 100,
        metodo: 'Papel',
        temperatura: 20,
        prefrio: 'No',
        pretratamiento: 'Ninguno',
        total: 0
      })
      
      setMostrandoFormularioTabla(false)
    } catch (error) {
      console.error("❌ Error creando tabla:", error)
      alert("Error al crear la tabla")
    }
  }

  const handleMostrarPorcentajes = (tablaId: number) => {
    const tabla = tablasLocales.find(t => t.tablaGermID === tablaId)
    
    if (tabla && tabla.porcentajeNormalesConRedondeo !== undefined) {
      // Cargar porcentajes existentes
      const porcentajesActuales = {
        porcentajeNormalesConRedondeo: tabla.porcentajeNormalesConRedondeo || 0,
        porcentajeAnormalesConRedondeo: tabla.porcentajeAnormalesConRedondeo || 0,
        porcentajeDurasConRedondeo: tabla.porcentajeDurasConRedondeo || 0,
        porcentajeFrescasConRedondeo: tabla.porcentajeFrescasConRedondeo || 0,
        porcentajeMuertasConRedondeo: tabla.porcentajeMuertasConRedondeo || 0
      }
      setPorcentajes(porcentajesActuales)
      setPorcentajesOriginales({ ...porcentajesActuales })
    } else {
      // Valores por defecto
      const porcentajesDefault = {
        porcentajeNormalesConRedondeo: 0,
        porcentajeAnormalesConRedondeo: 0,
        porcentajeDurasConRedondeo: 0,
        porcentajeFrescasConRedondeo: 0,
        porcentajeMuertasConRedondeo: 0
      }
      setPorcentajes(porcentajesDefault)
      setPorcentajesOriginales({ ...porcentajesDefault })
    }
    
    setMostrandoPorcentajes(tablaId)
    setEditandoPorcentajes(tablaId)
  }

  const handleCancelarPorcentajes = () => {
    if (porcentajesOriginales) {
      setPorcentajes({ ...porcentajesOriginales })
    }
    setEditandoPorcentajes(null)
    setPorcentajesOriginales(null)
  }

  const hanCambiadoPorcentajes = (): boolean => {
    if (!porcentajesOriginales) return true
    return JSON.stringify(porcentajes) !== JSON.stringify(porcentajesOriginales)
  }

  const handleGuardarPorcentajes = async (tablaId: number) => {
    if (!hanCambiadoPorcentajes()) {
      setEditandoPorcentajes(null)
      setPorcentajesOriginales(null)
      return
    }

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
      
      // Actualizar estado local
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
      
      setEditandoPorcentajes(null)
      setPorcentajesOriginales(null)
    } catch (error) {
      console.error("❌ Error guardando porcentajes:", error)
      alert("Error al guardar porcentajes")
    }
  }

  // Funciones para manejar la edición de datos generales de la tabla
  const handleEditarDatosGenerales = (tabla: TablaGermDTO) => {
    const datosTabla = {
      tratamiento: tabla.tratamiento || '',
      productoYDosis: tabla.productoYDosis || '',
      numSemillasPRep: tabla.numSemillasPRep || 100,
      metodo: tabla.metodo || 'Papel',
      temperatura: tabla.temperatura || 20,
      prefrio: tabla.prefrio || 'No',
      pretratamiento: tabla.pretratamiento || 'Ninguno',
      total: tabla.total || 0
    }
    setTablaEditada(datosTabla)
    setTablaOriginal({ ...datosTabla })
    setEditandoTablaGeneral(tabla.tablaGermID)
  }

  const handleCancelarEdicionTabla = () => {
    if (tablaOriginal) {
      setTablaEditada({ ...tablaOriginal })
    }
    setEditandoTablaGeneral(null)
    setTablaOriginal(null)
  }

  const hanCambiadoTabla = (): boolean => {
    if (!tablaOriginal) return true
    return JSON.stringify(tablaEditada) !== JSON.stringify(tablaOriginal)
  }

  const handleGuardarTablaGeneral = async (tablaId: number) => {
    if (!hanCambiadoTabla()) {
      setEditandoTablaGeneral(null)
      setTablaOriginal(null)
      return
    }

    try {
      console.log("💾 Guardando datos generales para tabla:", tablaId)
      
      await actualizarTablaGerminacion(germinacionId, tablaId, tablaEditada)
      console.log("✅ Datos generales guardados exitosamente")
      
      // Actualizar estado local
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { 
                ...tabla, 
                ...tablaEditada
              }
            : tabla
        )
      )
      
      setEditandoTablaGeneral(null)
      setTablaOriginal(null)
    } catch (error) {
      console.error("❌ Error guardando datos generales:", error)
      alert("Error al guardar los datos de la tabla")
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
      
      // Cargar valores existentes si los hay
      try {
        const valoresIniaData = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
        const valoresIniaActuales = {
          instituto: 'INIA' as Instituto,
          normales: valoresIniaData.normales,
          anormales: valoresIniaData.anormales,
          duras: valoresIniaData.duras,
          frescas: valoresIniaData.frescas,
          muertas: valoresIniaData.muertas,
          total: valoresIniaData.total
        }
        setValoresInia(valoresIniaActuales)
        setValoresOriginalesInia({ ...valoresIniaActuales })
      } catch (error) {
        console.log("No hay valores INIA existentes")
        const valoresIniaDefault = {
          instituto: 'INIA' as Instituto,
          normales: 0,
          anormales: 0,
          duras: 0,
          frescas: 0,
          muertas: 0,
          total: 0
        }
        setValoresInia(valoresIniaDefault)
        setValoresOriginalesInia({ ...valoresIniaDefault })
      }

      try {
        const valoresInaseData = await obtenerValoresInasePorTabla(germinacionId, tablaId)
        const valoresInaseActuales = {
          instituto: 'INASE' as Instituto,
          normales: valoresInaseData.normales,
          anormales: valoresInaseData.anormales,
          duras: valoresInaseData.duras,
          frescas: valoresInaseData.frescas,
          muertas: valoresInaseData.muertas,
          total: valoresInaseData.total
        }
        setValoresInase(valoresInaseActuales)
        setValoresOriginalesInase({ ...valoresInaseActuales })
      } catch (error) {
        console.log("No hay valores INASE existentes")
        const valoresInaseDefault = {
          instituto: 'INASE' as Instituto,
          normales: 0,
          anormales: 0,
          duras: 0,
          frescas: 0,
          muertas: 0,
          total: 0
        }
        setValoresInase(valoresInaseDefault)
        setValoresOriginalesInase({ ...valoresInaseDefault })
      }
      
      setMostrandoValores(tablaId)
      setEditandoValores(tablaId)
    } catch (error) {
      console.error("Error cargando valores:", error)
    } finally {
      setCargandoValores(false)
    }
  }

  const handleCancelarValores = () => {
    if (valoresOriginalesInia) {
      setValoresInia({ ...valoresOriginalesInia })
    }
    if (valoresOriginalesInase) {
      setValoresInase({ ...valoresOriginalesInase })
    }
    setEditandoValores(null)
    setValoresOriginalesInia(null)
    setValoresOriginalesInase(null)
  }

  const hanCambiadoValores = (): boolean => {
    return hanCambiadoValoresInia() || hanCambiadoValoresInase()
  }

  const hanCambiadoValoresInia = (): boolean => {
    if (!valoresOriginalesInia) return true
    return JSON.stringify(valoresInia) !== JSON.stringify(valoresOriginalesInia)
  }

  const hanCambiadoValoresInase = (): boolean => {
    if (!valoresOriginalesInase) return true
    return JSON.stringify(valoresInase) !== JSON.stringify(valoresOriginalesInase)
  }

  const handleGuardarValores = async (tablaId: number) => {
    if (!hanCambiadoValores()) {
      setEditandoValores(null)
      setValoresOriginalesInia(null)
      setValoresOriginalesInase(null)
      return
    }

    try {
      console.log("💾 Guardando valores para tabla:", tablaId)
      
      let guardadoExitoso = false
      let guardoInia = false
      let guardoInase = false
      
      // Guardar valores INIA solo si han cambiado
      if (hanCambiadoValoresInia()) {
        const tieneValoresInia = valoresInia.normales > 0 || valoresInia.anormales > 0 || 
                                valoresInia.duras > 0 || valoresInia.frescas > 0 || 
                                valoresInia.muertas > 0 || valoresInia.total > 0
        if (tieneValoresInia) {
          await actualizarValores(germinacionId, tablaId, 1, valoresInia)
          console.log("✅ Valores INIA guardados")
          guardadoExitoso = true
          guardoInia = true
        }
      }
      
      // Guardar valores INASE solo si han cambiado
      if (hanCambiadoValoresInase()) {
        const tieneValoresInase = valoresInase.normales > 0 || valoresInase.anormales > 0 || 
                                 valoresInase.duras > 0 || valoresInase.frescas > 0 || 
                                 valoresInase.muertas > 0 || valoresInase.total > 0
        if (tieneValoresInase) {
          await actualizarValores(germinacionId, tablaId, 2, valoresInase)
          console.log("✅ Valores INASE guardados")
          guardadoExitoso = true
          guardoInase = true
        }
      }
      
      if (guardadoExitoso) {
        // Recargar los valores actualizados desde la base de datos
        await recargarValores(tablaId, guardoInia, guardoInase)
        
        setEditandoValores(null)
        setValoresOriginalesInia(null)
        setValoresOriginalesInase(null)
      } else {
        alert("No hay valores para guardar")
      }
    } catch (error) {
      console.error("❌ Error guardando valores:", error)
      alert("Error al guardar valores")
    }
  }

  // Función para recargar valores actualizados después de guardar
  const recargarValores = async (tablaId: number, recargarInia: boolean = true, recargarInase: boolean = true) => {
    try {
      // Recargar valores INIA solo si se guardaron
      if (recargarInia) {
        try {
          const valoresIniaData = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
          const valoresIniaActualizados = {
            instituto: 'INIA' as Instituto,
            normales: valoresIniaData.normales,
            anormales: valoresIniaData.anormales,
            duras: valoresIniaData.duras,
            frescas: valoresIniaData.frescas,
            muertas: valoresIniaData.muertas,
            total: valoresIniaData.total
          }
          setValoresInia(valoresIniaActualizados)
          console.log("✅ Valores INIA recargados", valoresIniaActualizados)
        } catch (error) {
          console.log("No hay valores INIA para recargar")
        }
      }

      // Recargar valores INASE solo si se guardaron
      if (recargarInase) {
        try {
          const valoresInaseData = await obtenerValoresInasePorTabla(germinacionId, tablaId)
          const valoresInaseActualizados = {
            instituto: 'INASE' as Instituto,
            normales: valoresInaseData.normales,
            anormales: valoresInaseData.anormales,
            duras: valoresInaseData.duras,
            frescas: valoresInaseData.frescas,
            muertas: valoresInaseData.muertas,
            total: valoresInaseData.total
          }
          setValoresInase(valoresInaseActualizados)
          console.log("✅ Valores INASE recargados", valoresInaseActualizados)
        } catch (error) {
          console.log("No hay valores INASE para recargar")
        }
      }
    } catch (error) {
      console.error("❌ Error recargando valores:", error)
    }
  }

  const actualizarValorInia = (campo: keyof Omit<ValoresGermRequestDTO, 'instituto'>, valor: number) => {
    setValoresInia(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  const actualizarValorInase = (campo: keyof Omit<ValoresGermRequestDTO, 'instituto'>, valor: number) => {
    setValoresInase(prev => ({
      ...prev,
      [campo]: valor
    }))
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
    return tabla.repGerm !== undefined && Array.isArray(tabla.repGerm) && tabla.repGerm.length > 0 && tabla.finalizada !== true
  }

  const puedeIngresarPorcentajes = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && Array.isArray(tabla.repGerm) && tabla.repGerm.length > 0 && tabla.finalizada !== true
  }

  // Funciones para permitir edición independientemente del estado
  const puedeEditarPorcentajes = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0
  }

  const puedeEditarValores = (tabla: TablaGermDTO): boolean => {
    return tabla.repGerm !== undefined && tabla.repGerm.length > 0
  }

  // Función helper para verificar si todas las repeticiones requeridas están guardadas
  const tieneTodasLasRepeticionesGuardadas = (tabla: TablaGermDTO): boolean => {
    if (!tabla.repGerm || !germinacion?.numeroRepeticiones) return false
    
    // Verificar que tengamos el número correcto de repeticiones
    const tieneNumeroCorrect = tabla.repGerm.length === germinacion.numeroRepeticiones
    
    // Verificar que todas las repeticiones estén guardadas (tengan repGermID)
    const todasGuardadas = tabla.repGerm.every((rep: any) => rep.repGermID)
    
    return tieneNumeroCorrect && todasGuardadas
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Tablas de Germinación ({tablasLocales.length}/4)
          </CardTitle>
          
          {!isFinalized && tablasLocales.length < 4 && (
            <Button
              onClick={() => setMostrandoFormularioTabla(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nueva Tabla
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para crear nueva tabla */}
        {mostrandoFormularioTabla && (
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Plus className="h-5 w-5" />
                Crear Nueva Tabla de Germinación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Tratamiento</Label>
                  <Input
                    value={nuevaTabla.tratamiento}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, tratamiento: e.target.value }))}
                    placeholder="Control, Tratamiento A, etc."
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Producto y Dosis</Label>
                  <Input
                    value={nuevaTabla.productoYDosis}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, productoYDosis: e.target.value }))}
                    placeholder="Fungicida 2ml/L, etc."
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Número de Semillas por Repetición</Label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={nuevaTabla.numSemillasPRep}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, numSemillasPRep: parseInt(e.target.value) || 100 }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Método</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={nuevaTabla.metodo}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, metodo: e.target.value }))}
                  >
                    <option value="Papel">Papel</option>
                    <option value="Arena">Arena</option>
                    <option value="Suelo">Suelo</option>
                    <option value="Agar">Agar</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Temperatura (°C)</Label>
                  <Input
                    type="number"
                    min="-10"
                    max="50"
                    value={nuevaTabla.temperatura}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, temperatura: parseFloat(e.target.value) || 20 }))}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Prefrío</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={nuevaTabla.prefrio}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, prefrio: e.target.value }))}
                  >
                    <option value="No">No</option>
                    <option value="Sí - 5°C por 7 días">Sí - 5°C por 7 días</option>
                    <option value="Sí - 5°C por 14 días">Sí - 5°C por 14 días</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Pretratamiento</Label>
                  <Input
                    value={nuevaTabla.pretratamiento}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, pretratamiento: e.target.value }))}
                    placeholder="Ninguno, Escarificación, etc."
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setMostrandoFormularioTabla(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                
                <Button
                  onClick={handleCrearTabla}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  Crear Tabla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <h3 className="font-semibold text-sm sm:text-base">Tabla #{tabla.numeroTabla || tabla.tablaGermID}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={tabla.repGerm && tabla.repGerm.length > 0 ? "default" : "secondary"} className="text-xs">
                        {tabla.repGerm ? tabla.repGerm.length : 0} repeticiones
                      </Badge>
                      {tabla.finalizada && (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Finalizada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTablaExpansion(tabla.tablaGermID)}
                      className="w-full sm:w-auto min-w-fit text-xs sm:text-sm"
                    >
                      {tablaExpandida === tabla.tablaGermID ? "Contraer" : "Expandir"}
                    </Button>

                    {/* Botones de porcentajes y valores - siempre visibles pero deshabilitados si no están todas las repeticiones guardadas */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrandoPorcentajes(mostrandoPorcentajes === tabla.tablaGermID ? null : tabla.tablaGermID)}
                      disabled={!tieneTodasLasRepeticionesGuardadas(tabla)}
                      className="w-full sm:w-auto min-w-fit text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">
                        {mostrandoPorcentajes === tabla.tablaGermID ? 'Ocultar Porcentajes' : 'Mostrar Porcentajes'}
                      </span>
                      <span className="sm:hidden">Porcentajes</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrandoValores(mostrandoValores === tabla.tablaGermID ? null : tabla.tablaGermID)}
                      disabled={!tieneTodasLasRepeticionesGuardadas(tabla)}
                      className="w-full sm:w-auto min-w-fit text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Building className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">
                        {mostrandoValores === tabla.tablaGermID ? 'Ocultar Valores' : 'Mostrar Valores'}
                      </span>
                      <span className="sm:hidden">Valores</span>
                    </Button>

                    {/* Botones para tabla finalizada - permitir edición */}
                    {tabla.finalizada && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarTabla(tabla.tablaGermID)}
                          className="border-orange-600 text-orange-600 hover:bg-orange-50 w-full sm:w-auto min-w-fit text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Reabrir Tabla</span>
                          <span className="sm:hidden">Reabrir</span>
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
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-xs sm:text-sm"
                      >
                        {finalizandoTabla === tabla.tablaGermID ? (
                          "Finalizando..."
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Finalizar</span>
                            <span className="sm:hidden">✓</span>
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
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        {eliminandoTabla === tabla.tablaGermID ? (
                          "Eliminando..."
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                            <span className="sm:hidden">Eliminar</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {tablaExpandida === tabla.tablaGermID && (
                <CardContent className="pt-0">
                  {/* Card con información general de la tabla */}
                  <Card className="mb-4 border-gray-200 bg-gray-50">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Información General de la Tabla
                        </CardTitle>
                        {!tabla.finalizada && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditarDatosGenerales(tabla)}
                            className="w-full sm:w-auto min-w-fit text-xs sm:text-sm"
                          >
                            Editar Datos
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editandoTablaGeneral === tabla.tablaGermID ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Tratamiento</Label>
                              <Input
                                value={tablaEditada.tratamiento}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, tratamiento: e.target.value }))}
                                placeholder="Control, Tratamiento A, etc."
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Producto y Dosis</Label>
                              <Input
                                value={tablaEditada.productoYDosis}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, productoYDosis: e.target.value }))}
                                placeholder="Fungicida 2ml/L, etc."
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Número de Semillas por Repetición</Label>
                              <Input
                                type="number"
                                min="1"
                                max="500"
                                value={tablaEditada.numSemillasPRep}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, numSemillasPRep: parseInt(e.target.value) || 100 }))}
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Método</Label>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={tablaEditada.metodo}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, metodo: e.target.value }))}
                              >
                                <option value="Papel">Papel</option>
                                <option value="Arena">Arena</option>
                                <option value="Suelo">Suelo</option>
                                <option value="Agar">Agar</option>
                              </select>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Temperatura (°C)</Label>
                              <Input
                                type="number"
                                min="-10"
                                max="50"
                                value={tablaEditada.temperatura}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, temperatura: parseFloat(e.target.value) || 20 }))}
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Prefrío</Label>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={tablaEditada.prefrio}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, prefrio: e.target.value }))}
                              >
                                <option value="No">No</option>
                                <option value="Sí - 5°C por 7 días">Sí - 5°C por 7 días</option>
                                <option value="Sí - 5°C por 14 días">Sí - 5°C por 14 días</option>
                                <option value="Personalizado">Personalizado</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium">Pretratamiento</Label>
                              <Input
                                value={tablaEditada.pretratamiento}
                                onChange={(e) => setTablaEditada(prev => ({ ...prev, pretratamiento: e.target.value }))}
                                placeholder="Ninguno, Escarificación, etc."
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                            <Button
                              variant="outline"
                              onClick={handleCancelarEdicionTabla}
                              className="w-full sm:w-auto"
                            >
                              Cancelar
                            </Button>
                            
                            <Button
                              onClick={() => handleGuardarTablaGeneral(tabla.tablaGermID)}
                              className={`w-full sm:w-auto ${
                                hanCambiadoTabla() 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gray-400 hover:bg-gray-500'
                              }`}
                            >
                              {hanCambiadoTabla() ? 'Guardar Cambios' : 'Sin Cambios'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Tratamiento:</span>
                            <p className="text-gray-800">{tabla.tratamiento}</p>
                          </div>
                          {tabla.productoYDosis && (
                            <div>
                              <span className="font-medium text-gray-600">Producto y Dosis:</span>
                              <p className="text-gray-800">{tabla.productoYDosis}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-600">Semillas por Rep.:</span>
                            <p className="text-gray-800">{tabla.numSemillasPRep}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Método:</span>
                            <p className="text-gray-800">{tabla.metodo}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Temperatura:</span>
                            <p className="text-gray-800">{tabla.temperatura}°C</p>
                          </div>
                          {tabla.prefrio && tabla.prefrio !== 'No' && (
                            <div>
                              <span className="font-medium text-gray-600">Prefrío:</span>
                              <p className="text-gray-800">{tabla.prefrio}</p>
                            </div>
                          )}
                          {tabla.pretratamiento && tabla.pretratamiento !== 'Ninguno' && (
                            <div>
                              <span className="font-medium text-gray-600">Pretratamiento:</span>
                              <p className="text-gray-800">{tabla.pretratamiento}</p>
                            </div>
                          )}
                          {tabla.finalizada && tabla.fechaFinal && (
                            <div>
                              <span className="font-medium text-gray-600">Fecha Finalización:</span>
                              <p className="text-gray-800">
                                {new Date(tabla.fechaFinal).toLocaleDateString('es-UY')}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <RepeticionesManager
                    tabla={tabla}
                    germinacionId={germinacionId}
                    numeroRepeticiones={germinacion?.numeroRepeticiones || 4}
                    numeroConteos={germinacion?.numeroConteos || 3}
                    isFinalized={isFinalized}
                    fechasConteos={germinacion?.fechaConteos}
                    onRepeticionesUpdated={(repeticiones) => handleRepeticionesUpdated(tabla.tablaGermID, repeticiones)}
                  />

                  {/* Sección de Estadísticas Finales */}
                  {tabla.repGerm && tabla.repGerm.length > 0 && (
                    <Card className="mt-4 border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-800 text-lg">📊 Resumen de Análisis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Totales por Campo y Conteo */}
                          <div>
                            <h5 className="font-semibold text-green-700 mb-3">Totales por Campo</h5>
                            
                            {/* Totales de Normales por Conteo */}
                            <div className="mb-4">
                              <h6 className="font-medium text-gray-700 mb-2">Normales por Conteo</h6>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {Array.from({ length: germinacion?.numeroConteos || 3 }, (_, conteoIndex) => {
                                  const totalConteo = tabla.repGerm?.reduce((sum: number, rep: any) => {
                                    return sum + (rep.normales && rep.normales[conteoIndex] ? rep.normales[conteoIndex] : 0)
                                  }, 0) || 0
                                  
                                  return (
                                    <div key={conteoIndex} className="text-center p-2 bg-white rounded border">
                                      <div className="font-medium text-gray-600">Conteo {conteoIndex + 1}</div>
                                      <div className="text-lg font-semibold text-green-600">{totalConteo}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Totales de otros campos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Total Anormales</div>
                                <div className="text-lg font-semibold text-orange-600">
                                  {tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.anormales || 0), 0) || 0}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Total Duras</div>
                                <div className="text-lg font-semibold text-blue-600">
                                  {tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.duras || 0), 0) || 0}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Total Frescas</div>
                                <div className="text-lg font-semibold text-cyan-600">
                                  {tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.frescas || 0), 0) || 0}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Total Muertas</div>
                                <div className="text-lg font-semibold text-red-600">
                                  {tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.muertas || 0), 0) || 0}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Promedios Sin Redondeo */}
                          <div>
                            <h5 className="font-semibold text-green-700 mb-3">Promedios Sin Redondeo</h5>
                            
                            {/* Promedios de Normales por Conteo */}
                            <div className="mb-4">
                              <h6 className="font-medium text-gray-700 mb-2">Promedios Normales por Conteo</h6>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {Array.from({ length: germinacion?.numeroConteos || 3 }, (_, conteoIndex) => {
                                  const totalConteo = tabla.repGerm?.reduce((sum: number, rep: any) => {
                                    return sum + (rep.normales && rep.normales[conteoIndex] ? rep.normales[conteoIndex] : 0)
                                  }, 0) || 0
                                  const numRepeticiones = tabla.repGerm?.length || 1
                                  const promedio = totalConteo / numRepeticiones
                                  
                                  return (
                                    <div key={conteoIndex} className="text-center p-2 bg-white rounded border">
                                      <div className="font-medium text-gray-600">Conteo {conteoIndex + 1}</div>
                                      <div className="text-lg font-semibold text-green-600">{promedio.toFixed(4)}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Promedios de otros campos */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Promedio Anormales</div>
                                <div className="text-lg font-semibold text-orange-600">
                                  {((tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.anormales || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Promedio Duras</div>
                                <div className="text-lg font-semibold text-blue-600">
                                  {((tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.duras || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Promedio Frescas</div>
                                <div className="text-lg font-semibold text-cyan-600">
                                  {((tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.frescas || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                </div>
                              </div>
                              <div className="text-center p-2 bg-white rounded border">
                                <div className="font-medium text-gray-600">Promedio Muertas</div>
                                <div className="text-lg font-semibold text-red-600">
                                  {((tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.muertas || 0), 0) || 0) / (tabla.repGerm?.length || 1)).toFixed(4)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Porcentajes Calculados Sin Redondeo */}
                          <div>
                            <h5 className="font-semibold text-green-700 mb-3">Porcentajes Calculados (Sin Redondeo)</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                              {(() => {
                                // Calcular totales reales
                                const totalNormales = tabla.repGerm?.reduce((sum: number, rep: any) => {
                                  return sum + (rep.normales ? rep.normales.reduce((s: number, n: number) => s + n, 0) : 0)
                                }, 0) || 0
                                const totalAnormales = tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.anormales || 0), 0) || 0
                                const totalDuras = tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.duras || 0), 0) || 0
                                const totalFrescas = tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.frescas || 0), 0) || 0
                                const totalMuertas = tabla.repGerm?.reduce((sum: number, rep: any) => sum + (rep.muertas || 0), 0) || 0
                                const totalGeneral = totalNormales + totalAnormales + totalDuras + totalFrescas + totalMuertas
                                
                                return (
                                  <>
                                    <div className="text-center p-2 bg-white rounded">
                                      <div className="font-medium text-gray-600">% Normales</div>
                                      <div className="text-lg font-semibold text-green-600">
                                        {totalGeneral > 0 ? ((totalNormales / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                      <div className="font-medium text-gray-600">% Anormales</div>
                                      <div className="text-lg font-semibold text-orange-600">
                                        {totalGeneral > 0 ? ((totalAnormales / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                      <div className="font-medium text-gray-600">% Duras</div>
                                      <div className="text-lg font-semibold text-blue-600">
                                        {totalGeneral > 0 ? ((totalDuras / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                      <div className="font-medium text-gray-600">% Frescas</div>
                                      <div className="text-lg font-semibold text-cyan-600">
                                        {totalGeneral > 0 ? ((totalFrescas / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-white rounded">
                                      <div className="font-medium text-gray-600">% Muertas</div>
                                      <div className="text-lg font-semibold text-red-600">
                                        {totalGeneral > 0 ? ((totalMuertas / totalGeneral) * 100).toFixed(4) : '0.0000'}%
                                      </div>
                                    </div>
                                  </>
                                )
                              })()}
                            </div>
                          </div>

                          {/* Total de Semillas */}
                          <div className="text-center p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                            <div className="text-sm font-medium text-green-700 mb-1">Total de Semillas Analizadas</div>
                            <div className="text-2xl font-bold text-green-800">
                              {(() => {
                                const totalNormales = tabla.repGerm?.reduce((sum: number, rep: any) => {
                                  return sum + (rep.normales ? rep.normales.reduce((s: number, n: number) => s + n, 0) : 0)
                                }, 0) || 0
                                const totalOtras = tabla.repGerm?.reduce((sum: number, rep: any) => 
                                  sum + (rep.anormales || 0) + (rep.duras || 0) + (rep.frescas || 0) + (rep.muertas || 0), 0
                                ) || 0
                                return totalNormales + totalOtras
                              })()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sección de porcentajes con redondeo */}
                  {mostrandoPorcentajes === tabla.tablaGermID && (
                    <Card className="mt-4 border-blue-200 bg-blue-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Porcentajes con Redondeo
                          </CardTitle>
                          {editandoPorcentajes !== tabla.tablaGermID && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMostrarPorcentajes(tabla.tablaGermID)}
                            >
                              Editar
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editandoPorcentajes === tabla.tablaGermID ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              <div>
                                <Label className="text-sm">% Normales</Label>
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
                                <Label className="text-sm">% Anormales</Label>
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
                                <Label className="text-sm">% Duras</Label>
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
                                <Label className="text-sm">% Frescas</Label>
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
                                <Label className="text-sm">% Muertas</Label>
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

                            <div className="flex items-center justify-between">
                              <div className={`text-sm font-medium ${Math.abs(calcularTotalPorcentajes() - 100) <= 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                                Total: {calcularTotalPorcentajes().toFixed(1)}% 
                                {Math.abs(calcularTotalPorcentajes() - 100) <= 0.1 ? ' ✅' : ' ❌ (debe ser 100%)'}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  onClick={handleCancelarPorcentajes}
                                >
                                  Cancelar
                                </Button>
                                
                                <Button
                                  onClick={() => handleGuardarPorcentajes(tabla.tablaGermID)}
                                  disabled={Math.abs(calcularTotalPorcentajes() - 100) > 0.1}
                                  className={
                                    hanCambiadoPorcentajes() 
                                      ? 'bg-green-600 hover:bg-green-700' 
                                      : 'bg-gray-400 hover:bg-gray-500'
                                  }
                                >
                                  {hanCambiadoPorcentajes() ? 'Guardar Cambios' : 'Sin Cambios'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                            <div>
                              <div className="text-sm font-medium text-gray-600">Normales</div>
                              <div className="text-lg">{tabla.porcentajeNormalesConRedondeo || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Anormales</div>
                              <div className="text-lg">{tabla.porcentajeAnormalesConRedondeo || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Duras</div>
                              <div className="text-lg">{tabla.porcentajeDurasConRedondeo || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Frescas</div>
                              <div className="text-lg">{tabla.porcentajeFrescasConRedondeo || 0}%</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600">Muertas</div>
                              <div className="text-lg">{tabla.porcentajeMuertasConRedondeo || 0}%</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Sección de valores INIA e INASE */}
                  {mostrandoValores === tabla.tablaGermID && (
                    <Card className="mt-4 border-purple-200 bg-purple-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Valores INIA/INASE
                          </CardTitle>
                          {editandoValores !== tabla.tablaGermID && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMostrarValores(tabla.tablaGermID)}
                              disabled={cargandoValores}
                            >
                              {cargandoValores ? 'Cargando...' : 'Editar'}
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editandoValores === tabla.tablaGermID ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* INIA */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-purple-700">INIA</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Normales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.normales}
                                      onChange={(e) => actualizarValorInia('normales', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Anormales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.anormales}
                                      onChange={(e) => actualizarValorInia('anormales', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Duras</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.duras}
                                      onChange={(e) => actualizarValorInia('duras', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Frescas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.frescas}
                                      onChange={(e) => actualizarValorInia('frescas', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Muertas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.muertas}
                                      onChange={(e) => actualizarValorInia('muertas', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Germinación</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.total}
                                      onChange={(e) => actualizarValorInia('total', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* INASE */}
                              <div className="space-y-3">
                                <h5 className="font-medium text-purple-700">INASE</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Normales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.normales}
                                      onChange={(e) => actualizarValorInase('normales', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Anormales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.anormales}
                                      onChange={(e) => actualizarValorInase('anormales', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Duras</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.duras}
                                      onChange={(e) => actualizarValorInase('duras', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Frescas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.frescas}
                                      onChange={(e) => actualizarValorInase('frescas', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Muertas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.muertas}
                                      onChange={(e) => actualizarValorInase('muertas', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Germinación</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.total}
                                      onChange={(e) => actualizarValorInase('total', parseFloat(e.target.value) || 0)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={handleCancelarValores}
                              >
                                Cancelar
                              </Button>
                              
                              <Button
                                onClick={() => handleGuardarValores(tabla.tablaGermID)}
                                className={
                                  hanCambiadoValores() 
                                    ? 'bg-purple-600 hover:bg-purple-700' 
                                    : 'bg-gray-400 hover:bg-gray-500'
                                }
                              >
                                {hanCambiadoValores() ? 'Guardar Cambios' : 'Sin Cambios'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h5 className="font-medium text-purple-700">INIA</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Normales</div>
                                  <div>{tabla.porcentajeNormalesConRedondeo || 0}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Anormales</div>
                                  <div>{tabla.porcentajeAnormalesConRedondeo || 0}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Duras</div>
                                  <div>{tabla.porcentajeDurasConRedondeo || 0}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Frescas</div>
                                  <div>{tabla.porcentajeFrescasConRedondeo || 0}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Muertas</div>
                                  <div>{tabla.porcentajeMuertasConRedondeo || 0}%</div>
                                </div>
                                <div className="text-center font-semibold">
                                  <div className="font-medium text-gray-600">Germinación</div>
                                  <div>{tabla.porcentajeNormalesConRedondeo || 0}%</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="font-medium text-purple-700">INASE</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Normales</div>
                                  <div>{valoresInase.normales || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Anormales</div>
                                  <div>{valoresInase.anormales || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Duras</div>
                                  <div>{valoresInase.duras || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Frescas</div>
                                  <div>{valoresInase.frescas || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Muertas</div>
                                  <div>{valoresInase.muertas || 0}</div>
                                </div>
                                <div className="text-center font-semibold">
                                  <div className="font-medium text-gray-600">Germinación</div>
                                  <div>-</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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