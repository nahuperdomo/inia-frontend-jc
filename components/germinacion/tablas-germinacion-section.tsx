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
  actualizarTablaGerminacion,
  finalizarGerminacion
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
  onAnalysisFinalized?: () => void // Callback opcional para cuando se finaliza el análisis
}

export function TablasGerminacionSection({
  tablas,
  germinacionId,
  isFinalized,
  onTablaUpdated,
  germinacion,
  onAnalysisFinalized
}: TablasGerminacionSectionProps) {
  const [tablasLocales, setTablasLocales] = useState<TablaGermDTO[]>(tablas || [])
  const [tablaExpandida, setTablaExpandida] = useState<number | null>(null)
  const [eliminandoTabla, setEliminandoTabla] = useState<number | null>(null)
  const [finalizandoTabla, setFinalizandoTabla] = useState<number | null>(null)
  const [finalizandoGerminacion, setFinalizandoGerminacion] = useState<boolean>(false)
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
  const [erroresValidacion, setErroresValidacion] = useState<{[key: string]: string}>({})
  const [erroresValidacionNuevaTabla, setErroresValidacionNuevaTabla] = useState<{[key: string]: string}>({})
  const [tablaEditada, setTablaEditada] = useState<TablaGermRequestDTO>({
    fechaFinal: '',
    tratamiento: '',
    productoYDosis: '',
    numSemillasPRep: 0,
    metodo: '',
    temperatura: 0,
    prefrio: '',
    pretratamiento: ''
  })
  const [tablaOriginal, setTablaOriginal] = useState<TablaGermRequestDTO | null>(null)
  const [nuevaTabla, setNuevaTabla] = useState<TablaGermRequestDTO>({
    fechaFinal: '',
    tratamiento: '',
    productoYDosis: '',
    numSemillasPRep: 0,
    metodo: '',
    temperatura: 0,
    prefrio: '',
    pretratamiento: ''
  })
  const [porcentajes, setPorcentajes] = useState<PorcentajesRedondeoRequestDTO>({
    porcentajeNormalesConRedondeo: 0,
    porcentajeAnormalesConRedondeo: 0,
    porcentajeDurasConRedondeo: 0,
    porcentajeFrescasConRedondeo: 0,
    porcentajeMuertasConRedondeo: 0
  })
  const [valoresInia, setValoresInia] = useState<ValoresGermRequestDTO>({
    normales: 0,
    anormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    germinacion: 0
  })
  const [valoresInase, setValoresInase] = useState<ValoresGermRequestDTO>({
    normales: 0,
    anormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    germinacion: 0
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
      console.log("Eliminando tabla:", tablaId)
      
      await eliminarTablaGerminacion(germinacionId, tablaId)
      console.log("Tabla eliminada exitosamente")
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => prev.filter(tabla => tabla.tablaGermID !== tablaId))
      
      // Cerrar expansión si era la tabla eliminada
      if (tablaExpandida === tablaId) {
        setTablaExpandida(null)
      }
    } catch (error) {
      console.error("Error eliminando tabla:", error)
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
      console.log("Finalizando tabla:", tablaId)
      
      await finalizarTabla(germinacionId, tablaId)
      console.log("Tabla finalizada exitosamente")
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: true, fechaFinal: new Date().toISOString() }
            : tabla
        )
      )
    } catch (error) {
      console.error("Error finalizando tabla:", error)
      alert("Error al finalizar la tabla")
    } finally {
      setFinalizandoTabla(null)
    }
  }

  const handleFinalizarGerminacion = async () => {
    if (!window.confirm("¿Está seguro que desea finalizar toda la germinación? Esto cambiará el estado del análisis.")) {
      return
    }

    setFinalizandoGerminacion(true)
    try {
      await finalizarGerminacion(germinacionId)
      alert("Germinación finalizada exitosamente")
      
      // Usar el callback si está disponible, sino recargar
      if (onAnalysisFinalized) {
        onAnalysisFinalized()
      } else {
        window.location.reload() 
      }
    } catch (error) {
      console.error("Error finalizando germinación:", error)
      alert("Error al finalizar la germinación")
    } finally {
      setFinalizandoGerminacion(false)
    }
  }


  const handleEditarTabla = async (tablaId: number) => {
    if (!window.confirm("¿Está seguro que desea editar esta tabla? Podrá volver a modificarla.")) {
      return
    }

    try {
      console.log("Editando tabla:", tablaId)
      
      // Actualizar estado local para marcar como no finalizada
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: false, fechaFinal: undefined }
            : tabla
        )
      )
      
      console.log("Tabla habilitada para edición")
    } catch (error) {
      console.error("Error reabriendo tabla:", error)
      alert("Error al reabrir la tabla")
    }
  }

  const validarDatosTabla = (tabla: any) => {
    const camposRequeridos = [
      { campo: 'fechaFinal', nombre: 'Fecha final' },
      { campo: 'tratamiento', nombre: 'Tratamiento' },
      { campo: 'metodo', nombre: 'Método' },
      { campo: 'numSemillasPRep', nombre: 'Número de semillas por repetición' },
      { campo: 'temperatura', nombre: 'Temperatura' }
    ]
    
    const errores = []
    
    for (const { campo, nombre } of camposRequeridos) {
      if (!tabla[campo] || tabla[campo] === '' || tabla[campo] === 0) {
        errores.push(nombre)
      }
    }
    
    // Validación adicional para fechaFinal
    if (tabla.fechaFinal) {
      const fechaFinal = new Date(tabla.fechaFinal)
      const fechaInicio = germinacion?.fechaInicioGerm ? new Date(germinacion.fechaInicioGerm) : null
      const fechaUltConteo = germinacion?.fechaUltConteo ? new Date(germinacion.fechaUltConteo) : null
      
      if (fechaInicio && fechaFinal < fechaInicio) {
        errores.push('Fecha final debe ser posterior a la fecha de inicio de germinación')
      } else if (fechaUltConteo && fechaFinal > fechaUltConteo) {
        errores.push('Fecha final debe ser anterior o igual a la fecha de último conteo')
      }
    }
    
    return errores
  }

  const validarCampoEnTiempoReal = (campo: string, valor: any, esNuevaTabla: boolean = false) => {
    const setErrores = esNuevaTabla ? setErroresValidacionNuevaTabla : setErroresValidacion
    
    setErrores(prev => {
      const nuevosErrores = { ...prev }
      
      if (campo === 'fechaFinal') {
        if (!valor || valor === '') {
          nuevosErrores[campo] = 'Fecha final es requerida'
        } else {
          // Validar que esté en el rango correcto
          const fechaFinal = new Date(valor)
          const fechaInicio = germinacion?.fechaInicioGerm ? new Date(germinacion.fechaInicioGerm) : null
          const fechaUltConteo = germinacion?.fechaUltConteo ? new Date(germinacion.fechaUltConteo) : null
          
          if (fechaInicio && fechaFinal < fechaInicio) {
            nuevosErrores[campo] = 'La fecha final debe ser posterior a la fecha de inicio de germinación'
          } else if (fechaUltConteo && fechaFinal > fechaUltConteo) {
            nuevosErrores[campo] = 'La fecha final debe ser anterior o igual a la fecha de último conteo'
          } else {
            delete nuevosErrores[campo]
          }
        }
      } else if (!valor || valor === '' || valor === 0) {
        const nombresCampos = {
          'tratamiento': 'Tratamiento',
          'metodo': 'Método',
          'numSemillasPRep': 'Número de semillas por repetición',
          'temperatura': 'Temperatura'
        }
        nuevosErrores[campo] = `${nombresCampos[campo as keyof typeof nombresCampos]} es requerido`
      } else {
        delete nuevosErrores[campo]
      }
      
      return nuevosErrores
    })
  }

  const tablaConRepeticionesGuardadas = (tablaId: number) => {
    const tabla = tablasLocales.find(t => t.tablaGermID === tablaId)
    return tabla && tabla.repGerm && tabla.repGerm.length > 0
  }

  const manejarCambioNumerico = (valor: string, valorActual: number, callback: (nuevoValor: number) => void, esDecimal: boolean = false) => {
    // Si el campo está vacío, mantener vacío
    if (valor === '') {
      callback(0)
      return
    }
    
    // Si el valor actual es 0 y se está escribiendo algo, reemplazar completamente
    if (valorActual === 0 && valor !== '0') {
      const numeroIngresado = esDecimal ? (parseFloat(valor) || 0) : (parseInt(valor) || 0)
      callback(numeroIngresado)
    } else {
      // Comportamiento normal
      const numeroIngresado = esDecimal ? (parseFloat(valor) || 0) : (parseInt(valor) || 0)
      callback(numeroIngresado)
    }
  }

  const handleCrearTabla = async () => {
    try {
      // Validar datos antes de crear
      const errores = validarDatosTabla(nuevaTabla)
      if (errores.length > 0) {
        // Marcar errores en los campos
        const nuevosErrores: {[key: string]: string} = {}
        errores.forEach(error => {
          const campo = error === 'Fecha final' ? 'fechaFinal' :
                       error === 'Tratamiento' ? 'tratamiento' : 
                       error === 'Método' ? 'metodo' :
                       error === 'Número de semillas por repetición' ? 'numSemillasPRep' :
                       error === 'Temperatura' ? 'temperatura' : error
          nuevosErrores[campo] = `${error} es requerido`
        })
        setErroresValidacionNuevaTabla(nuevosErrores)
        return
      }
      
      // Limpiar errores si todo está bien
      setErroresValidacionNuevaTabla({})
      
      console.log("Creando nueva tabla con datos:", nuevaTabla)
      
      const tablaCreada = await crearTablaGerminacion(germinacionId, nuevaTabla)
      console.log("✅ Tabla creada:", tablaCreada)
      
      // Actualizar estado local
      setTablasLocales(prev => [...prev, tablaCreada])
      
      // Resetear formulario con valores vacíos
      setNuevaTabla({
        fechaFinal: '',
        tratamiento: '',
        productoYDosis: '',
        numSemillasPRep: 0,
        metodo: '',
        temperatura: 0,
        prefrio: '',
        pretratamiento: ''
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
      console.log("Guardando porcentajes para tabla:", tablaId)
      
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
      fechaFinal: tabla.fechaFinal || '',
      tratamiento: tabla.tratamiento || '',
      productoYDosis: tabla.productoYDosis || '',
      numSemillasPRep: tabla.numSemillasPRep || 0,
      metodo: tabla.metodo || '',
      temperatura: tabla.temperatura || 0,
      prefrio: tabla.prefrio || '',
      pretratamiento: tabla.pretratamiento || ''
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
    setErroresValidacion({}) // Limpiar errores al cancelar
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

    // Validar datos antes de guardar
    const errores = validarDatosTabla(tablaEditada)
    if (errores.length > 0) {
      // Marcar errores en los campos
      const nuevosErrores: {[key: string]: string} = {}
      errores.forEach(error => {
        const campo = error === 'Tratamiento' ? 'tratamiento' : 
                     error === 'Método' ? 'metodo' :
                     error === 'Número de semillas por repetición' ? 'numSemillasPRep' :
                     error === 'Temperatura' ? 'temperatura' : error
        nuevosErrores[campo] = `${error} es requerido`
      })
      setErroresValidacion(nuevosErrores)
      return
    }

    // Limpiar errores si todo está bien
    setErroresValidacion({})

    try {
      console.log("Guardando datos generales para tabla:", tablaId)
      
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

  const actualizarPorcentaje = (campo: keyof PorcentajesRedondeoRequestDTO, valorString: string) => {
    const valorActual = porcentajes[campo] || 0
    manejarCambioNumerico(valorString, valorActual, (nuevoValor) => {
      // Validar rango 0-100 para porcentajes
      if (nuevoValor < 0) {
        nuevoValor = 0
      } else if (nuevoValor > 100) {
        nuevoValor = 100
      }
      
      setPorcentajes(prev => ({
        ...prev,
        [campo]: nuevoValor
      }))
    }, true)
  }

  // Funciones para manejar valores INIA e INASE (siguiendo el patrón de porcentajes)
  const handleMostrarValores = async (tablaId: number) => {
    try {
      setCargandoValores(true)
      
      // Cargar valores INIA existentes
      let valoresIniaActuales = {
        normales: 0,
        anormales: 0,
        duras: 0,
        frescas: 0,
        muertas: 0,
        germinacion: 0
      }
      
      try {
        const valoresIniaData = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
        valoresIniaActuales = {
          normales: valoresIniaData.normales || 0,
          anormales: valoresIniaData.anormales || 0,
          duras: valoresIniaData.duras || 0,
          frescas: valoresIniaData.frescas || 0,
          muertas: valoresIniaData.muertas || 0,
          germinacion: valoresIniaData.germinacion || 0
        }
      } catch (error) {
        console.log("No hay valores INIA existentes, usando valores por defecto")
      }
      
      // Cargar valores INASE existentes
      let valoresInaseActuales = {
        normales: 0,
        anormales: 0,
        duras: 0,
        frescas: 0,
        muertas: 0,
        germinacion: 0
      }
      
      try {
        const valoresInaseData = await obtenerValoresInasePorTabla(germinacionId, tablaId)
        valoresInaseActuales = {
          normales: valoresInaseData.normales || 0,
          anormales: valoresInaseData.anormales || 0,
          duras: valoresInaseData.duras || 0,
          frescas: valoresInaseData.frescas || 0,
          muertas: valoresInaseData.muertas || 0,
          germinacion: valoresInaseData.germinacion || 0
        }
      } catch (error) {
        console.log("No hay valores INASE existentes, usando valores por defecto")
      }
      
      // Establecer estados (como hace porcentajes)
      setValoresInia(valoresIniaActuales)
      setValoresOriginalesInia({ ...valoresIniaActuales })
      setValoresInase(valoresInaseActuales)
      setValoresOriginalesInase({ ...valoresInaseActuales })
      
      setMostrandoValores(tablaId)
      // NO activar edición automáticamente - solo mostrar valores
      
    } catch (error) {
      console.error("Error cargando valores:", error)
      alert("Error al cargar los valores")
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
    // NO limpiar los valores originales - se mantienen para futuras ediciones
    // setValoresOriginalesInia(null)
    // setValoresOriginalesInase(null)
  }

  const handleEditarValores = (tablaId: number) => {
    // Activar modo edición para la tabla especificada
    setEditandoValores(tablaId)
  }

  const hanCambiadoValores = (): boolean => {
    return hanCambiadoValoresInia() || hanCambiadoValoresInase()
  }

  const hanCambiadoValoresInia = (): boolean => {
    if (!valoresOriginalesInia) return false // Si no hay originales, no hay cambios
    return JSON.stringify(valoresInia) !== JSON.stringify(valoresOriginalesInia)
  }

  const hanCambiadoValoresInase = (): boolean => {
    if (!valoresOriginalesInase) return false // Si no hay originales, no hay cambios
    return JSON.stringify(valoresInase) !== JSON.stringify(valoresOriginalesInase)
  }

  const handleGuardarValores = async (tablaId: number) => {
    if (!hanCambiadoValores()) {
      setEditandoValores(null)
      setValoresOriginalesInia(null)
      setValoresOriginalesInase(null)
      return
    }

    // Validar suma de valores INIA antes de guardar
    const sumaInia = calcularSumaValores(valoresInia)
    if (sumaInia > 100) {
      alert(`La suma de valores INIA (${sumaInia}) no puede superar 100. Por favor, ajuste los valores.`)
      return
    }

    // Validar suma de valores INASE antes de guardar
    const sumaInase = calcularSumaValores(valoresInase)
    if (sumaInase > 100) {
      alert(`La suma de valores INASE (${sumaInase}) no puede superar 100. Por favor, ajuste los valores.`)
      return
    }

    try {
      console.log("Guardando valores para tabla:", tablaId)
      
      // Guardar valores INIA solo si han cambiado
      if (hanCambiadoValoresInia()) {
        console.log("📤 Enviando valores INIA:", valoresInia)
        
        // Primero obtener el registro de INIA para conseguir su ID real
        const valoresIniaExistentes = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
        const valoresIniaId = valoresIniaExistentes.valoresGermID
        console.log("ID real de valores INIA:", valoresIniaId)
        
        await actualizarValores(germinacionId, tablaId, valoresIniaId, valoresInia)
        console.log("✅ Valores INIA guardados")
      }
      
      // Guardar valores INASE solo si han cambiado
      if (hanCambiadoValoresInase()) {
        console.log("📤 Enviando valores INASE:", valoresInase)
        
        // Primero obtener el registro de INASE para conseguir su ID real
        const valoresInaseExistentes = await obtenerValoresInasePorTabla(germinacionId, tablaId)
        const valoresInaseId = valoresInaseExistentes.valoresGermID
        console.log("ID real de valores INASE:", valoresInaseId)
        
        await actualizarValores(germinacionId, tablaId, valoresInaseId, valoresInase)
        console.log("✅ Valores INASE guardados")
      }
      
      // Actualizar valores originales para reflejar el estado guardado
      setValoresOriginalesInia({ ...valoresInia })
      setValoresOriginalesInase({ ...valoresInase })
      
      setEditandoValores(null)
      console.log("✅ Valores guardados exitosamente")
      
    } catch (error) {
      console.error("❌ Error guardando valores:", error)
      alert("Error al guardar valores")
    }
  }

  // Función para calcular la suma de valores (excluyendo germinación)
  const calcularSumaValores = (valores: ValoresGermRequestDTO): number => {
    return (valores.normales || 0) + (valores.anormales || 0) + (valores.duras || 0) + 
           (valores.frescas || 0) + (valores.muertas || 0)
  }

  const actualizarValorInia = (campo: keyof ValoresGermRequestDTO, valorString: string) => {
    const valorActual = valoresInia[campo] || 0
    manejarCambioNumerico(valorString, valorActual, (nuevoValor) => {
      // Si el campo es 'germinacion', no aplicar validación de suma
      if (campo === 'germinacion') {
        setValoresInia(prev => ({
          ...prev,
          [campo]: nuevoValor
        }))
        return
      }

      // Calcular la nueva suma sin incluir el campo actual y luego agregar el nuevo valor
      const valoresSinCampoActual = { ...valoresInia, [campo]: 0 }
      const sumaSinCampoActual = calcularSumaValores(valoresSinCampoActual)
      const nuevaSuma = sumaSinCampoActual + nuevoValor

      // Validar que la suma no supere 100
      if (nuevaSuma > 100) {
        alert(`La suma de valores INIA (normales + anormales + duras + frescas + muertas) no puede superar 100. Suma actual sería: ${nuevaSuma}`)
        return
      }

      setValoresInia(prev => ({
        ...prev,
        [campo]: nuevoValor
      }))
    }, true)
  }

  const actualizarValorInase = (campo: keyof ValoresGermRequestDTO, valorString: string) => {
    const valorActual = valoresInase[campo] || 0
    manejarCambioNumerico(valorString, valorActual, (nuevoValor) => {
      // Si el campo es 'germinacion', no aplicar validación de suma
      if (campo === 'germinacion') {
        setValoresInase(prev => ({
          ...prev,
          [campo]: nuevoValor
        }))
        return
      }

      // Calcular la nueva suma sin incluir el campo actual y luego agregar el nuevo valor
      const valoresSinCampoActual = { ...valoresInase, [campo]: 0 }
      const sumaSinCampoActual = calcularSumaValores(valoresSinCampoActual)
      const nuevaSuma = sumaSinCampoActual + nuevoValor

      // Validar que la suma no supere 100
      if (nuevaSuma > 100) {
        alert(`La suma de valores INASE (normales + anormales + duras + frescas + muertas) no puede superar 100. Suma actual sería: ${nuevaSuma}`)
        return
      }

      setValoresInase(prev => ({
        ...prev,
        [campo]: nuevoValor
      }))
    }, true)
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

  // Efecto para cargar valores automáticamente cuando se muestra una tabla completada
  useEffect(() => {
    tablasLocales.forEach(async (tabla) => {
      if (tieneTodasLasRepeticionesGuardadas(tabla)) {
        // Cargar valores INIA automáticamente
        try {
          const valoresIniaData = await obtenerValoresIniaPorTabla(germinacionId, tabla.tablaGermID)
          const valoresIniaActuales = {
            normales: valoresIniaData.normales || 0,
            anormales: valoresIniaData.anormales || 0,
            duras: valoresIniaData.duras || 0,
            frescas: valoresIniaData.frescas || 0,
            muertas: valoresIniaData.muertas || 0,
            germinacion: valoresIniaData.germinacion || 0
          }
          setValoresInia(valoresIniaActuales)
          setValoresOriginalesInia({ ...valoresIniaActuales })
        } catch (error) {
          console.log("No hay valores INIA para cargar automáticamente")
        }

        // Cargar valores INASE automáticamente
        try {
          const valoresInaseData = await obtenerValoresInasePorTabla(germinacionId, tabla.tablaGermID)
          const valoresInaseActuales = {
            normales: valoresInaseData.normales || 0,
            anormales: valoresInaseData.anormales || 0,
            duras: valoresInaseData.duras || 0,
            frescas: valoresInaseData.frescas || 0,
            muertas: valoresInaseData.muertas || 0,
            germinacion: valoresInaseData.germinacion || 0
          }
          setValoresInase(valoresInaseActuales)
          setValoresOriginalesInase({ ...valoresInaseActuales })
        } catch (error) {
          console.log("No hay valores INASE para cargar automáticamente")
        }

        // Cargar porcentajes automáticamente
        if (tabla.porcentajeNormalesConRedondeo !== undefined) {
          const porcentajesActuales = {
            porcentajeNormalesConRedondeo: tabla.porcentajeNormalesConRedondeo || 0,
            porcentajeAnormalesConRedondeo: tabla.porcentajeAnormalesConRedondeo || 0,
            porcentajeDurasConRedondeo: tabla.porcentajeDurasConRedondeo || 0,
            porcentajeFrescasConRedondeo: tabla.porcentajeFrescasConRedondeo || 0,
            porcentajeMuertasConRedondeo: tabla.porcentajeMuertasConRedondeo || 0
          }
          setPorcentajes(porcentajesActuales)
          setPorcentajesOriginales({ ...porcentajesActuales })
        }
      }
    })
  }, [tablasLocales, germinacionId, germinacion?.numeroRepeticiones])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Tablas de Germinación
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para crear nueva tabla */}
        {mostrandoFormularioTabla && (
          <Card className="border-blue-200 border-2 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Plus className="h-5 w-5" />
                Crear Nueva Tabla de Germinación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Fecha Final *</Label>
                  <Input
                    type="date"
                    value={nuevaTabla.fechaFinal}
                    onChange={(e) => {
                      setNuevaTabla(prev => ({ ...prev, fechaFinal: e.target.value }))
                      validarCampoEnTiempoReal('fechaFinal', e.target.value, true)
                    }}
                    min={germinacion?.fechaInicioGerm || undefined}
                    max={germinacion?.fechaUltConteo || undefined}
                    className={erroresValidacionNuevaTabla.fechaFinal ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {erroresValidacionNuevaTabla.fechaFinal && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.fechaFinal}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Debe estar entre {germinacion?.fechaInicioGerm} y {germinacion?.fechaUltConteo}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tratamiento</Label>
                  <Input
                    value={nuevaTabla.tratamiento}
                    onChange={(e) => {
                      setNuevaTabla(prev => ({ ...prev, tratamiento: e.target.value }))
                      validarCampoEnTiempoReal('tratamiento', e.target.value, true)
                    }}
                    placeholder="Control, Tratamiento A, etc."
                    className={erroresValidacionNuevaTabla.tratamiento ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {erroresValidacionNuevaTabla.tratamiento && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.tratamiento}</p>
                  )}
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
                      value={nuevaTabla.numSemillasPRep === 0 ? '' : nuevaTabla.numSemillasPRep}
                      onChange={(e) => {
                        manejarCambioNumerico(e.target.value, nuevaTabla.numSemillasPRep, (valor) => 
                          setNuevaTabla(prev => ({ ...prev, numSemillasPRep: valor }))
                        )
                        validarCampoEnTiempoReal('numSemillasPRep', parseInt(e.target.value) || 0, true)
                      }}
                      placeholder="Ej: 100"
                      className={erroresValidacionNuevaTabla.numSemillasPRep ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {erroresValidacionNuevaTabla.numSemillasPRep && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.numSemillasPRep}</p>
                    )}
                  </div>                <div>
                  <Label className="text-sm font-medium">Método</Label>
                  <Input
                    value={nuevaTabla.metodo}
                    onChange={(e) => {
                      setNuevaTabla(prev => ({ ...prev, metodo: e.target.value }))
                      validarCampoEnTiempoReal('metodo', e.target.value, true)
                    }}
                    placeholder="Papel, Arena, Suelo, etc."
                    className={erroresValidacionNuevaTabla.metodo ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {erroresValidacionNuevaTabla.metodo && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.metodo}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Temperatura (°C)</Label>
                  <Input
                    type="number"
                    min="-10"
                    max="50"
                    value={nuevaTabla.temperatura === 0 ? '' : nuevaTabla.temperatura}
                    onChange={(e) => {
                      manejarCambioNumerico(e.target.value, nuevaTabla.temperatura, (valor) => 
                        setNuevaTabla(prev => ({ ...prev, temperatura: valor })), true
                      )
                      validarCampoEnTiempoReal('temperatura', parseFloat(e.target.value) || 0, true)
                    }}
                    placeholder="Ej: 20"
                    className={erroresValidacionNuevaTabla.temperatura ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {erroresValidacionNuevaTabla.temperatura && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.temperatura}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">Prefrío</Label>
                  <Input
                    value={nuevaTabla.prefrio}
                    onChange={(e) => setNuevaTabla(prev => ({ ...prev, prefrio: e.target.value }))}
                    placeholder="No, Sí - 5°C por 7 días, etc."
                  />
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
            <Card key={tabla.tablaGermID} className="border-l-4 border-l-blue-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    <h3 className="font-semibold text-sm sm:text-base">{tabla.tratamiento || 'Tratamiento'}</h3>
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

                    {/* Botón para finalizar tabla */}
                    {!tabla.finalizada && puedeFinalizarTabla(tabla) && (
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
                    
                    {!isFinalized && (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditarDatosGenerales(tabla)}
                          className="w-full sm:w-auto min-w-fit text-xs sm:text-sm"
                        >
                          Editar Datos
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editandoTablaGeneral === tabla.tablaGermID ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Fecha Final *</Label>
                              <Input
                                type="date"
                                value={tablaEditada.fechaFinal}
                                onChange={(e) => {
                                  setTablaEditada(prev => ({ ...prev, fechaFinal: e.target.value }))
                                  validarCampoEnTiempoReal('fechaFinal', e.target.value, false)
                                }}
                                min={germinacion?.fechaInicioGerm || undefined}
                                max={germinacion?.fechaUltConteo || undefined}
                                className={erroresValidacion.fechaFinal ? "border-red-500 focus:border-red-500" : ""}
                              />
                              {erroresValidacion.fechaFinal && (
                                <p className="text-red-500 text-xs mt-1">{erroresValidacion.fechaFinal}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Entre {germinacion?.fechaInicioGerm} y {germinacion?.fechaUltConteo}
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Tratamiento</Label>
                              <Input
                                value={tablaEditada.tratamiento}
                                onChange={(e) => {
                                  setTablaEditada(prev => ({ ...prev, tratamiento: e.target.value }))
                                  validarCampoEnTiempoReal('tratamiento', e.target.value, false)
                                }}
                                placeholder="Control, Tratamiento A, etc."
                                className={erroresValidacion.tratamiento ? "border-red-500 focus:border-red-500" : ""}
                              />
                              {erroresValidacion.tratamiento && (
                                <p className="text-red-500 text-xs mt-1">{erroresValidacion.tratamiento}</p>
                              )}
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
                                value={tablaEditada.numSemillasPRep === 0 ? '' : tablaEditada.numSemillasPRep}
                                onChange={(e) => manejarCambioNumerico(e.target.value, tablaEditada.numSemillasPRep, (valor) => 
                                  setTablaEditada(prev => ({ ...prev, numSemillasPRep: valor }))
                                )}
                                placeholder="Ej: 100"
                                disabled={tablaConRepeticionesGuardadas(editandoTablaGeneral!)}
                                className={tablaConRepeticionesGuardadas(editandoTablaGeneral!) ? "bg-gray-100 text-gray-500" : ""}
                              />
                              {tablaConRepeticionesGuardadas(editandoTablaGeneral!) && (
                                <p className="text-xs text-orange-600 mt-1">
                                  No se puede modificar el número de semillas porque ya hay repeticiones guardadas
                                </p>
                              )}
                            </div>

                            <div>
                  <Label className="text-sm font-medium">Método</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={tablaEditada.metodo}
                    onChange={(e) => setTablaEditada(prev => ({ ...prev, metodo: e.target.value }))}
                  >
                    <option value="">Seleccionar método</option>
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
                    value={tablaEditada.temperatura === 0 ? '' : tablaEditada.temperatura}
                    onChange={(e) => manejarCambioNumerico(e.target.value, tablaEditada.temperatura, (valor) => 
                      setTablaEditada(prev => ({ ...prev, temperatura: valor })), true
                    )}
                    placeholder="Ej: 20"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Prefrío</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={tablaEditada.prefrio}
                    onChange={(e) => setTablaEditada(prev => ({ ...prev, prefrio: e.target.value }))}
                  >
                    <option value="">Seleccionar prefrío</option>
                    <option value="No">No</option>
                    <option value="Sí - 5°C por 7 días">Sí - 5°C por 7 días</option>
                    <option value="Sí - 5°C por 14 días">Sí - 5°C por 14 días</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                </div>                            <div className="md:col-span-2">
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
                            <p className="text-gray-800">{tabla.tratamiento || 'No especificado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Producto y Dosis:</span>
                            <p className="text-gray-800">{tabla.productoYDosis || 'No especificado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Semillas por Rep.:</span>
                            <p className="text-gray-800">{tabla.numSemillasPRep}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Método:</span>
                            <p className="text-gray-800">{tabla.metodo || 'No especificado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Temperatura:</span>
                            <p className="text-gray-800">{tabla.temperatura}°C</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Prefrío:</span>
                            <p className="text-gray-800">{tabla.prefrio || 'No especificado'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Pretratamiento:</span>
                            <p className="text-gray-800">{tabla.pretratamiento || 'No especificado'}</p>
                          </div>
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
                    <Card className="border-green-200 border-2 mt-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-800 text-lg">Resumen de Análisis</CardTitle>
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
                          <div className="text-center p-4 border-green-200 border-2 bg-white rounded-lg">
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

                  {/* Sección de porcentajes con redondeo - se muestra automáticamente */}
                  {tieneTodasLasRepeticionesGuardadas(tabla) && (
                    <Card className="border-blue-200 border-2 mt-4">
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
                                  value={porcentajes.porcentajeNormalesConRedondeo === 0 ? '' : porcentajes.porcentajeNormalesConRedondeo}
                                  onChange={(e) => actualizarPorcentaje('porcentajeNormalesConRedondeo', e.target.value)}
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
                                  value={porcentajes.porcentajeAnormalesConRedondeo === 0 ? '' : porcentajes.porcentajeAnormalesConRedondeo}
                                  onChange={(e) => actualizarPorcentaje('porcentajeAnormalesConRedondeo', e.target.value)}
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
                                  value={porcentajes.porcentajeDurasConRedondeo === 0 ? '' : porcentajes.porcentajeDurasConRedondeo}
                                  onChange={(e) => actualizarPorcentaje('porcentajeDurasConRedondeo', e.target.value)}
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
                                  value={porcentajes.porcentajeFrescasConRedondeo === 0 ? '' : porcentajes.porcentajeFrescasConRedondeo}
                                  onChange={(e) => actualizarPorcentaje('porcentajeFrescasConRedondeo', e.target.value)}
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
                                  value={porcentajes.porcentajeMuertasConRedondeo === 0 ? '' : porcentajes.porcentajeMuertasConRedondeo}
                                  onChange={(e) => actualizarPorcentaje('porcentajeMuertasConRedondeo', e.target.value)}
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

                  {/* Sección de valores INIA e INASE - se muestra automáticamente */}
                  {tieneTodasLasRepeticionesGuardadas(tabla) && (
                    <Card className="border-purple-200 border-2 mt-4">
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
                              onClick={() => setEditandoValores(tabla.tablaGermID)}
                            >
                              Editar
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
                                      value={valoresInia.normales === 0 ? '' : valoresInia.normales}
                                      onChange={(e) => actualizarValorInia('normales', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Anormales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.anormales === 0 ? '' : valoresInia.anormales}
                                      onChange={(e) => actualizarValorInia('anormales', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Duras</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.duras === 0 ? '' : valoresInia.duras}
                                      onChange={(e) => actualizarValorInia('duras', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Frescas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.frescas === 0 ? '' : valoresInia.frescas}
                                      onChange={(e) => actualizarValorInia('frescas', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Muertas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.muertas === 0 ? '' : valoresInia.muertas}
                                      onChange={(e) => actualizarValorInia('muertas', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Germinación</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInia.germinacion === 0 ? '' : valoresInia.germinacion}
                                      onChange={(e) => actualizarValorInia('germinacion', e.target.value)}
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
                                      value={valoresInase.normales === 0 ? '' : valoresInase.normales}
                                      onChange={(e) => actualizarValorInase('normales', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Anormales</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.anormales === 0 ? '' : valoresInase.anormales}
                                      onChange={(e) => actualizarValorInase('anormales', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Duras</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.duras === 0 ? '' : valoresInase.duras}
                                      onChange={(e) => actualizarValorInase('duras', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Frescas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.frescas === 0 ? '' : valoresInase.frescas}
                                      onChange={(e) => actualizarValorInase('frescas', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Muertas</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.muertas === 0 ? '' : valoresInase.muertas}
                                      onChange={(e) => actualizarValorInase('muertas', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Germinación</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={valoresInase.germinacion === 0 ? '' : valoresInase.germinacion}
                                      onChange={(e) => actualizarValorInase('germinacion', e.target.value)}
                                      className="text-center text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Indicadores de suma */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="text-center">
                                <div className={`p-3 rounded-lg border-2 ${
                                  calcularSumaValores(valoresInia) > 100 
                                    ? 'bg-red-50 border-red-300 text-red-700' 
                                    : calcularSumaValores(valoresInia) === 100 
                                      ? 'bg-green-50 border-green-300 text-green-700'
                                      : 'bg-gray-50 border-gray-300 text-gray-700'
                                }`}>
                                  <p className="text-sm font-medium">
                                    Suma INIA: {calcularSumaValores(valoresInia)}/100
                                    {calcularSumaValores(valoresInia) > 100 && ' ❌ Excede el límite'}
                                    {calcularSumaValores(valoresInia) === 100 && ' ✅ Completo'}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    (Excluye germinación)
                                  </p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`p-3 rounded-lg border-2 ${
                                  calcularSumaValores(valoresInase) > 100 
                                    ? 'bg-red-50 border-red-300 text-red-700' 
                                    : calcularSumaValores(valoresInase) === 100 
                                      ? 'bg-green-50 border-green-300 text-green-700'
                                      : 'bg-gray-50 border-gray-300 text-gray-700'
                                }`}>
                                  <p className="text-sm font-medium">
                                    Suma INASE: {calcularSumaValores(valoresInase)}/100
                                    {calcularSumaValores(valoresInase) > 100 && ' ❌ Excede el límite'}
                                    {calcularSumaValores(valoresInase) === 100 && ' ✅ Completo'}
                                  </p>
                                  <p className="text-xs opacity-75">
                                    (Excluye germinación)
                                  </p>
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
                                disabled={!hanCambiadoValores()}
                                className={
                                  hanCambiadoValores() 
                                    ? 'bg-purple-600 hover:bg-purple-700' 
                                    : 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
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
                                  <div>{valoresInia.normales || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Anormales</div>
                                  <div>{valoresInia.anormales || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Duras</div>
                                  <div>{valoresInia.duras || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Frescas</div>
                                  <div>{valoresInia.frescas || 0}</div>
                                </div>
                                <div className="text-center">
                                  <div className="font-medium text-gray-600">Muertas</div>
                                  <div>{valoresInia.muertas || 0}</div>
                                </div>
                                <div className="text-center font-semibold">
                                  <div className="font-medium text-gray-600">Germinación</div>
                                  <div>{valoresInia.germinacion || 0}</div>
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
                                  <div>{valoresInase.germinacion || 0}</div>
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
      
      {/* Sección de Acciones */}
      <div className="border-t p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Acciones</h3>
            <p className="text-sm text-gray-600">Gestionar el estado del análisis de germinación</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrandoFormularioTabla(true)}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Tabla
            </Button>
            
            {!isFinalized && (
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleFinalizarGerminacion}
                disabled={finalizandoGerminacion}
              >
                {finalizandoGerminacion ? (
                  "Finalizando..."
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar Análisis
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}