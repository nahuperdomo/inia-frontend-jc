import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TablaGermDTO, PorcentajesRedondeoRequestDTO, TablaGermRequestDTO, RepGermDTO } from '@/app/models/interfaces/repeticiones'
import { ValoresGermDTO, ValoresGermRequestDTO } from '@/app/models/interfaces/valores-germ'
import { Instituto } from '@/app/models/types/enums'
import { RepeticionesManager } from './repeticiones-manager-v2'
import { Table, Plus, Trash2, CheckCircle, Calculator, Building } from 'lucide-react'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import { 
  eliminarTablaGerminacion, 
  finalizarTabla, 
  actualizarPorcentajes,
  crearTablaGerminacion,
  actualizarTablaGerminacion,
  finalizarGerminacion,
  obtenerTablaPorId
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
  
  // Hook de notificaciones
  const toast = useToast()
  const { confirm } = useConfirm()
  
  // Estados para controlar la opción "Otro" en selects
  const [mostrarOtroTratamiento, setMostrarOtroTratamiento] = useState(false)
  const [mostrarOtroMetodo, setMostrarOtroMetodo] = useState(false)
  const [mostrarOtraTemperatura, setMostrarOtraTemperatura] = useState(false)
  const [mostrarOtroPretratamiento, setMostrarOtroPretratamiento] = useState(false)
  const [mostrarOtroNumSemillas, setMostrarOtroNumSemillas] = useState(false)
  const [mostrarOtroNumSemillasEdit, setMostrarOtroNumSemillasEdit] = useState(false)
  
  const [tablaEditada, setTablaEditada] = useState<TablaGermRequestDTO>({
    fechaFinal: '',
    tratamiento: '',
    productoYDosis: '',
    numSemillasPRep: 0,
    metodo: '',
    temperatura: 0,
    tienePrefrio: false,
    descripcionPrefrio: '',
    tienePretratamiento: false,
    descripcionPretratamiento: '',
    diasPrefrio: 0,
    diasPretratamiento: 0,
    fechaInicioGerm: '',
    fechaConteos: [],
    fechaUltConteo: '',
    numDias: 0,
    numeroRepeticiones: 0,
    numeroConteos: 0
  })
  const [tablaOriginal, setTablaOriginal] = useState<TablaGermRequestDTO | null>(null)
  const [nuevaTabla, setNuevaTabla] = useState<TablaGermRequestDTO>({
    fechaFinal: '',
    tratamiento: '',
    productoYDosis: '',
    numSemillasPRep: 0,
    metodo: '',
    temperatura: 0,
    tienePrefrio: false,
    descripcionPrefrio: '',
    tienePretratamiento: false,
    descripcionPretratamiento: '',
    diasPrefrio: 0,
    diasPretratamiento: 0,
    fechaInicioGerm: '',
    fechaConteos: [],
    fechaUltConteo: '',
    numDias: 0,
    numeroRepeticiones: 8, // Por defecto 8 repeticiones
    numeroConteos: 0
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
    const confirmed = await confirm({
      title: '¿Eliminar tabla?',
      message: 'Esta acción no se puede deshacer.\n¿Está seguro que desea eliminar esta tabla?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    })

    if (!confirmed) return

    try {
      setEliminandoTabla(tablaId)
      await eliminarTablaGerminacion(germinacionId, tablaId)
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => prev.filter(tabla => tabla.tablaGermID !== tablaId))
      
      // Cerrar expansión si era la tabla eliminada
      if (tablaExpandida === tablaId) {
        setTablaExpandida(null)
      }

      toast.success('Tabla eliminada', 'La tabla se eliminó correctamente')
    } catch (error) {
      console.error("Error eliminando tabla:", error)
      toast.error('Error al eliminar', 'No se pudo eliminar la tabla')
    } finally {
      setEliminandoTabla(null)
    }
  }

  const toggleTablaExpansion = (tablaId: number) => {
    setTablaExpandida(tablaExpandida === tablaId ? null : tablaId)
  }

  const handleFinalizarTabla = async (tablaId: number) => {
    const confirmed = await confirm({
      title: '¿Finalizar tabla?',
      message: 'Esta acción no se puede deshacer.\n¿Está seguro que desea finalizar esta tabla?',
      confirmText: 'Finalizar',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) return

    try {
      setFinalizandoTabla(tablaId)
      await finalizarTabla(germinacionId, tablaId)
      
      // Actualizar estado local en lugar de recargar
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: true, fechaFinal: new Date().toISOString() }
            : tabla
        )
      )

      toast.success('Tabla finalizada', 'La tabla se finalizó correctamente')
    } catch (error) {
      console.error("Error finalizando tabla:", error)
      toast.error('Error al finalizar', 'No se pudo finalizar la tabla')
    } finally {
      setFinalizandoTabla(null)
    }
  }

  const handleFinalizarGerminacion = async () => {
    const confirmed = await confirm({
      title: '¿Finalizar germinación?',
      message: 'Esto cambiará el estado del análisis.\n¿Está seguro que desea finalizar toda la germinación?',
      confirmText: 'Finalizar',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) return

    setFinalizandoGerminacion(true)
    try {
      await finalizarGerminacion(germinacionId)
      toast.success('Germinación finalizada', 'El análisis de germinación se finalizó correctamente')
      
      // Usar el callback si está disponible, sino recargar
      if (onAnalysisFinalized) {
        onAnalysisFinalized()
      } else {
        window.location.reload() 
      }
    } catch (error) {
      console.error("Error finalizando germinación:", error)
      toast.error('Error al finalizar', 'No se pudo finalizar la germinación')
    } finally {
      setFinalizandoGerminacion(false)
    }
  }


  const handleEditarTabla = async (tablaId: number) => {
    const confirmed = await confirm({
      title: '¿Editar tabla?',
      message: 'Podrá volver a modificar esta tabla.\n¿Desea continuar?',
      confirmText: 'Editar',
      cancelText: 'Cancelar',
      variant: 'info'
    })

    if (!confirmed) return

    try {
      // Actualizar estado local para marcar como no finalizada
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? { ...tabla, finalizada: false, fechaFinal: undefined }
            : tabla
        )
      )

      toast.success('Tabla habilitada', 'La tabla está disponible para edición')
    } catch (error) {
      console.error("Error reabriendo tabla:", error)
      toast.error('Error al reabrir', 'No se pudo habilitar la tabla para edición')
    }
  }

  // Función para calcular la fecha mínima del primer conteo
  const calcularFechaMinimaConteo = (tabla: any) => {
    if (!tabla.fechaInicioGerm) return null
    
    const diasTotales = (tabla.diasPrefrio || 0) + (tabla.diasPretratamiento || 0)
    if (diasTotales === 0) return tabla.fechaInicioGerm
    
    const fechaInicio = new Date(tabla.fechaInicioGerm + 'T00:00:00')
    fechaInicio.setDate(fechaInicio.getDate() + diasTotales)
    return fechaInicio.toISOString().split('T')[0]
  }

  const validarDatosTabla = (tabla: any) => {
    const camposRequeridos = [
      { campo: 'fechaFinal', nombre: 'Fecha final' },
      { campo: 'tratamiento', nombre: 'Tratamiento' },
      { campo: 'metodo', nombre: 'Método' },
      { campo: 'numSemillasPRep', nombre: 'Número de semillas por repetición' },
      { campo: 'temperatura', nombre: 'Temperatura' },
      { campo: 'fechaInicioGerm', nombre: 'Fecha de inicio de germinación' },
      { campo: 'fechaUltConteo', nombre: 'Fecha de último conteo' },
      { campo: 'numeroRepeticiones', nombre: 'Número de repeticiones' },
      { campo: 'numeroConteos', nombre: 'Número de conteos' }
    ]
    
    const errores = []
    
    for (const { campo, nombre } of camposRequeridos) {
      if (!tabla[campo] || tabla[campo] === '' || tabla[campo] === 0) {
        errores.push(nombre)
      }
    }
    
    // Validación de fechas de la tabla misma
    if (tabla.fechaInicioGerm && tabla.fechaUltConteo) {
      const fechaInicio = new Date(tabla.fechaInicioGerm)
      const fechaUltConteo = new Date(tabla.fechaUltConteo)
      
      if (fechaInicio >= fechaUltConteo) {
        errores.push('Fecha de inicio debe ser anterior a la fecha de último conteo')
      }
    }
    
    // Validación adicional para fechaFinal (debe estar entre fechaInicioGerm y fechaUltConteo de la tabla)
    if (tabla.fechaFinal && tabla.fechaInicioGerm && tabla.fechaUltConteo) {
      const fechaFinal = new Date(tabla.fechaFinal + 'T00:00:00')
      const fechaInicio = new Date(tabla.fechaInicioGerm + 'T00:00:00')
      const fechaUltConteo = new Date(tabla.fechaUltConteo + 'T00:00:00')
      
      if (fechaFinal < fechaInicio) {
        errores.push('Fecha final debe ser posterior o igual a la fecha de inicio de germinación')
      } else if (fechaFinal < fechaUltConteo) {
        errores.push('Fecha final debe ser igual o posterior a la fecha de último conteo')
      }
    }
    
    // Validar número de repeticiones
    if (tabla.numeroRepeticiones && (tabla.numeroRepeticiones < 1 || tabla.numeroRepeticiones > 20)) {
      errores.push('Número de repeticiones debe estar entre 1 y 20')
    }
    
    // Validar número de conteos
    if (tabla.numeroConteos && (tabla.numeroConteos < 1 || tabla.numeroConteos > 15)) {
      errores.push('Número de conteos debe estar entre 1 y 15')
    }
    
    // Validar fechas de conteos individuales
    if (tabla.fechaConteos && tabla.fechaConteos.length > 0) {
      const fechasValidas = tabla.fechaConteos.filter((f: string) => f && f.trim() !== '')
      if (fechasValidas.length !== tabla.numeroConteos) {
        errores.push(`Debe especificar todas las ${tabla.numeroConteos} fechas de conteos`)
      }
      
      // Validar que cada fecha esté en el rango correcto
      if (tabla.fechaInicioGerm && tabla.fechaUltConteo) {
        const fechaInicio = new Date(tabla.fechaInicioGerm)
        const fechaUltConteo = new Date(tabla.fechaUltConteo)
        const fechaMinimaConteo = calcularFechaMinimaConteo(tabla)
        
        fechasValidas.forEach((fecha: string, index: number) => {
          const fechaConteo = new Date(fecha)
          
          // Validar primer conteo (debe ser al menos diasPrefrio + diasPretratamiento después del inicio)
          if (index === 0 && fechaMinimaConteo) {
            const fechaMinima = new Date(fechaMinimaConteo)
            if (fechaConteo < fechaMinima) {
              const diasRequeridos = (tabla.diasPrefrio || 0) + (tabla.diasPretratamiento || 0)
              errores.push(`Primer conteo debe ser al menos ${diasRequeridos} días después del inicio (prefrío + pretratamiento)`)
            }
          }
          
          // Validar secuencia de fechas (cada conteo debe ser >= al anterior)
          if (index > 0) {
            const fechaAnterior = new Date(fechasValidas[index - 1])
            if (fechaConteo < fechaAnterior) {
              errores.push(`Fecha de conteo ${index + 1} debe ser igual o posterior a la fecha del conteo ${index}`)
            }
          }
          
          if (fechaConteo < fechaInicio || fechaConteo > fechaUltConteo) {
            errores.push(`Fecha de conteo ${index + 1} debe estar entre la fecha de inicio y último conteo`)
          }
        })
      }
    }
    
    return errores
  }

  const validarCampoEnTiempoReal = (campo: string, valor: any, esNuevaTabla: boolean = false) => {
    const setErrores = esNuevaTabla ? setErroresValidacionNuevaTabla : setErroresValidacion
    const datosTabla = esNuevaTabla ? nuevaTabla : tablaEditada
    
    setErrores(prev => {
      const nuevosErrores = { ...prev }
      
      if (campo === 'fechaFinal') {
        if (!valor || valor === '') {
          nuevosErrores[campo] = 'Fecha final es requerida'
        } else {
          // Validar que esté en el rango correcto (usando fechas de la tabla)
          const fechaFinal = new Date(valor + 'T00:00:00')
          const fechaInicio = datosTabla.fechaInicioGerm ? new Date(datosTabla.fechaInicioGerm + 'T00:00:00') : null
          const fechaUltConteo = datosTabla.fechaUltConteo ? new Date(datosTabla.fechaUltConteo + 'T00:00:00') : null
          
          if (fechaInicio && fechaFinal < fechaInicio) {
            nuevosErrores[campo] = 'La fecha final debe ser posterior o igual a la fecha de inicio de germinación de esta tabla'
          } else if (fechaUltConteo && fechaFinal < fechaUltConteo) {
            nuevosErrores[campo] = 'La fecha final debe ser igual o posterior a la fecha de último conteo de esta tabla'
          } else {
            delete nuevosErrores[campo]
          }
        }
      } else if (campo === 'fechaInicioGerm') {
        if (!valor || valor === '') {
          nuevosErrores[campo] = 'Fecha de inicio de germinación es requerida'
        } else {
          delete nuevosErrores[campo]
        }
      } else if (campo === 'fechaUltConteo') {
        if (!valor || valor === '') {
          nuevosErrores[campo] = 'Fecha de último conteo es requerida'
        } else {
          const fechaUltConteo = new Date(valor)
          const fechaInicio = datosTabla.fechaInicioGerm ? new Date(datosTabla.fechaInicioGerm) : null
          
          if (fechaInicio && fechaUltConteo <= fechaInicio) {
            nuevosErrores[campo] = 'La fecha de último conteo debe ser posterior a la fecha de inicio'
          } else {
            delete nuevosErrores[campo]
            // Calcular automáticamente los días
            if (fechaInicio) {
              const dias = Math.ceil((fechaUltConteo.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
              if (esNuevaTabla) {
                setNuevaTabla(prev => ({ ...prev, numDias: dias }))
              } else {
                setTablaEditada(prev => ({ ...prev, numDias: dias }))
              }
            }
          }
        }
      } else if (campo === 'numeroRepeticiones') {
        if (!valor || valor === 0) {
          nuevosErrores[campo] = 'Número de repeticiones es requerido'
        } else if (valor < 1 || valor > 20) {
          nuevosErrores[campo] = 'Debe estar entre 1 y 20'
        } else {
          delete nuevosErrores[campo]
        }
      } else if (campo === 'numeroConteos') {
        if (!valor || valor === 0) {
          nuevosErrores[campo] = 'Número de conteos es requerido'
        } else if (valor < 1 || valor > 15) {
          nuevosErrores[campo] = 'Debe estar entre 1 y 15'
        } else {
          delete nuevosErrores[campo]
        }
      } else if (!valor || valor === '' || valor === 0) {
        const nombresCampos: { [key: string]: string } = {
          'tratamiento': 'Tratamiento',
          'metodo': 'Método',
          'numSemillasPRep': 'Número de semillas por repetición',
          'temperatura': 'Temperatura'
        }
        nuevosErrores[campo] = `${nombresCampos[campo]} es requerido`
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
      
      const tablaCreada = await crearTablaGerminacion(germinacionId, nuevaTabla)
      
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
        tienePrefrio: false,
        descripcionPrefrio: '',
        tienePretratamiento: false,
        descripcionPretratamiento: '',
        diasPrefrio: 0,
        diasPretratamiento: 0,
        fechaInicioGerm: '',
        fechaConteos: [],
        fechaUltConteo: '',
        numDias: 0,
        numeroRepeticiones: 0,
        numeroConteos: 0
      })
      
      setMostrandoFormularioTabla(false)
      toast.success('Tabla creada', 'La tabla de germinación se creó correctamente')
    } catch (error) {
      console.error("Error creando tabla:", error)
      toast.error('Error al crear tabla', 'No se pudo crear la tabla de germinación')
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
      toast.warning('Porcentajes inválidos', 'Los porcentajes deben sumar exactamente 100%')
      return
    }

    try {
      await actualizarPorcentajes(germinacionId, tablaId, porcentajes)
      
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
      toast.success('Porcentajes guardados', 'Los porcentajes se actualizaron correctamente')
    } catch (error) {
      console.error("Error guardando porcentajes:", error)
      toast.error('Error al guardar', 'No se pudieron guardar los porcentajes')
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
      tienePrefrio: tabla.tienePrefrio || false,
      descripcionPrefrio: tabla.descripcionPrefrio || '',
      tienePretratamiento: tabla.tienePretratamiento || false,
      descripcionPretratamiento: tabla.descripcionPretratamiento || '',
      diasPrefrio: tabla.diasPrefrio || 0,
      diasPretratamiento: tabla.diasPretratamiento || 0,
      fechaInicioGerm: tabla.fechaInicioGerm || '',
      fechaConteos: tabla.fechaConteos || [],
      fechaUltConteo: tabla.fechaUltConteo || '',
      numDias: tabla.numDias || 0,
      numeroRepeticiones: tabla.numeroRepeticiones || 0,
      numeroConteos: tabla.numeroConteos || 0
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
      // VALIDACIONES ANTES DE GUARDAR
      const tablaActual = tablasLocales.find(t => t.tablaGermID === tablaId)
      
      // 1. Validar cambios en fechas de conteos
      if (tablaActual && tablaActual.fechaConteos && tablaEditada.fechaConteos) {
        const fechaActualDate = new Date()
        fechaActualDate.setHours(0, 0, 0, 0)
        
        // Verificar si alguna fecha cambió a futura
        let hayFechasCambiadas = false
        let hayFechaUltimoConteoCambiadaAFutura = false
        let hayOtrasFechasCambiadasAFutura = false
        
        tablaEditada.fechaConteos.forEach((fecha, index) => {
          const fechaAnterior = tablaActual.fechaConteos?.[index]
          if (!fechaAnterior || !fecha) return
          
          const fechaAnteriorDate = new Date(fechaAnterior + 'T00:00:00')
          const fechaNuevaDate = new Date(fecha + 'T00:00:00')
          
          // Detectar si alguna fecha cambió
          if (fechaAnterior !== fecha) {
            hayFechasCambiadas = true
            
            // Si la fecha cambió de pasada/presente a futura
            if (fechaAnteriorDate <= fechaActualDate && fechaNuevaDate > fechaActualDate) {
              // Si es la última fecha de conteo
              if (index === tablaEditada.fechaConteos.length - 1) {
                hayFechaUltimoConteoCambiadaAFutura = true
              } else {
                hayOtrasFechasCambiadasAFutura = true
              }
            }
          }
        })
        
        if (hayFechasCambiadas && tablaActual.repGerm && tablaActual.repGerm.length > 0) {
          let mensaje = ''
          let tituloMensaje = 'Cambios en fechas de conteos'
          
          if (hayFechaUltimoConteoCambiadaAFutura && hayOtrasFechasCambiadasAFutura) {
            mensaje = 'Se detectaron los siguientes cambios:\n\n' +
                      '• Fecha del último conteo cambió a futura: Se eliminarán anormales, duras, frescas y muertas de todas las repeticiones.\n\n' +
                      '• Otras fechas de conteos cambiaron a futuras: Se eliminarán los datos de normales de esos conteos específicos.'
          } else if (hayFechaUltimoConteoCambiadaAFutura) {
            mensaje = 'La fecha del último conteo cambió a una fecha futura.\n\n' +
                      'Esto eliminará los campos anormales, duras, frescas y muertas de todas las repeticiones.\n\n' +
                      'Los datos de normales en los conteos con fechas presentes o pasadas se mantendrán.'
          } else if (hayOtrasFechasCambiadasAFutura) {
            mensaje = 'Algunas fechas de conteos cambiaron a futuras.\n\n' +
                      'Esto eliminará los datos de normales ingresados en los conteos cuyas fechas sean futuras.'
          } else {
            // Fechas cambiaron pero no a futuras
            tituloMensaje = 'Cambios en fechas de conteos'
            mensaje = 'Has modificado las fechas de conteos.\n\n¿Deseas continuar con estos cambios?'
          }
          
          const confirmar = await confirm({
            title: tituloMensaje,
            message: mensaje,
            confirmText: 'Continuar',
            cancelText: 'Cancelar',
            variant: (hayFechaUltimoConteoCambiadaAFutura || hayOtrasFechasCambiadasAFutura) ? 'warning' : 'info'
          })
          
          if (!confirmar) return
        }
      }
      
      // 2. Validar cambio en número de conteos
      if (tablaActual && tablaActual.numeroConteos !== tablaEditada.numeroConteos) {
        if (tablaActual.repGerm && tablaActual.repGerm.length > 0) {
          const confirmar = await confirm({
            title: '⚠️ Cambio en número de conteos',
            message: 'Esto eliminará TODOS los datos de normales ingresados en TODAS las repeticiones.\n\n¿Deseas continuar?',
            confirmText: 'Continuar',
            cancelText: 'Cancelar',
            variant: 'warning'
          })
          if (!confirmar) return
        }
      }
      
      // 3. Validar cambio en número de repeticiones
      if (tablaActual && tablaActual.numeroRepeticiones !== tablaEditada.numeroRepeticiones) {
        if (tablaActual.repGerm && tablaActual.repGerm.length > 0) {
          const diferencia = tablaEditada.numeroRepeticiones - tablaActual.numeroRepeticiones
          if (diferencia < 0) {
            const confirmar = await confirm({
              title: '⚠️ Reducción de repeticiones',
              message: `Has reducido el número de repeticiones de ${tablaActual.numeroRepeticiones} a ${tablaEditada.numeroRepeticiones}.\n\nEsto eliminará las últimas ${Math.abs(diferencia)} repeticiones guardadas (desde la última hasta la primera).\n\n¿Deseas continuar?`,
              confirmText: 'Continuar',
              cancelText: 'Cancelar',
              variant: 'warning'
            })
            if (!confirmar) return
          } else {
            toast.info(
              'Repeticiones aumentadas',
              `Se agregarán ${diferencia} repeticiones nuevas al final.`
            )
          }
        }
      }
      
      await actualizarTablaGerminacion(germinacionId, tablaId, tablaEditada)
      
      // Pequeño delay para asegurar que el backend procese completamente
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recargar las repeticiones actualizadas desde el servidor
      const tablaActualizada = await obtenerTablaPorId(germinacionId, tablaId)
      
      // Actualizar estado local con los datos completos del servidor
      setTablasLocales(prev => 
        prev.map(tabla => 
          tabla.tablaGermID === tablaId 
            ? tablaActualizada
            : tabla
        )
      )
      
      setEditandoTablaGeneral(null)
      setTablaOriginal(null)
      
      toast.success('Datos guardados', 'Los datos de la tabla se guardaron correctamente')
    } catch (error) {
      console.error("Error guardando datos generales:", error)
      toast.error('Error al guardar', 'No se pudieron guardar los datos de la tabla')
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
        // No hay valores INIA existentes, usando valores por defecto
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
        // No hay valores INASE existentes, usando valores por defecto
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
      toast.error('Error al cargar valores', 'No se pudieron cargar los valores de la tabla')
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
      toast.warning('Suma de valores INIA excedida', `La suma no puede superar 100 (actual: ${sumaInia})`)
      return
    }

    // Validar suma de valores INASE antes de guardar
    const sumaInase = calcularSumaValores(valoresInase)
    if (sumaInase > 100) {
      toast.warning('Suma de valores INASE excedida', `La suma no puede superar 100 (actual: ${sumaInase})`)
      return
    }

    try {
      // Guardar valores INIA solo si han cambiado
      if (hanCambiadoValoresInia()) {
        const valoresIniaExistentes = await obtenerValoresIniaPorTabla(germinacionId, tablaId)
        const valoresIniaId = valoresIniaExistentes.valoresGermID
        await actualizarValores(germinacionId, tablaId, valoresIniaId, valoresInia)
      }
      
      // Guardar valores INASE solo si han cambiado
      if (hanCambiadoValoresInase()) {
        const valoresInaseExistentes = await obtenerValoresInasePorTabla(germinacionId, tablaId)
        const valoresInaseId = valoresInaseExistentes.valoresGermID
        await actualizarValores(germinacionId, tablaId, valoresInaseId, valoresInase)
      }
      
      // Actualizar valores originales para reflejar el estado guardado
      setValoresOriginalesInia({ ...valoresInia })
      setValoresOriginalesInase({ ...valoresInase })
      
      setEditandoValores(null)
      toast.success('Valores guardados', 'Los valores se guardaron correctamente')
      
    } catch (error) {
      console.error("Error guardando valores:", error)
      toast.error('Error al guardar valores', 'No se pudieron guardar los valores')
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
        toast.warning('Suma excedida', `La suma de valores INIA no puede superar 100 (sería: ${nuevaSuma})`)
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
        toast.warning('Suma excedida', `La suma de valores INASE no puede superar 100 (sería: ${nuevaSuma})`)
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
    if (!tabla.repGerm || !tabla.numeroRepeticiones) return false
    
    // Verificar que tengamos el número correcto de repeticiones (usar el de la tabla, no el de germinacion)
    const tieneNumeroCorrect = tabla.repGerm.length === tabla.numeroRepeticiones
    
    // Verificar que todas las repeticiones estén guardadas (tengan repGermID)
    const todasGuardadas = tabla.repGerm.every((rep: any) => rep.repGermID)
    
    const resultado = tieneNumeroCorrect && todasGuardadas
    
    return resultado
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
          // No hay valores INIA para cargar automáticamente
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
          // No hay valores INASE para cargar automáticamente
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
  }, [tablasLocales, germinacionId])

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
                {/* Tratamiento - Select */}
                <div>
                  <Label className="text-sm font-medium">Tratamiento *</Label>
                  <Select
                    value={nuevaTabla.tratamiento}
                    onValueChange={(value) => {
                      if (value === 'Otro') {
                        setMostrarOtroTratamiento(true)
                        setNuevaTabla(prev => ({ ...prev, tratamiento: '' }))
                      } else {
                        setMostrarOtroTratamiento(false)
                        setNuevaTabla(prev => ({ ...prev, tratamiento: value }))
                        validarCampoEnTiempoReal('tratamiento', value, true)
                      }
                    }}
                  >
                    <SelectTrigger className={erroresValidacionNuevaTabla.tratamiento ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar tratamiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sin curar">Sin curar</SelectItem>
                      <SelectItem value="Curada en Planta">Curada en Planta</SelectItem>
                      <SelectItem value="Curada en Laboratorio">Curada en Laboratorio</SelectItem>
                      <SelectItem value="Otro">Otro (especifique)</SelectItem>
                    </SelectContent>
                  </Select>
                  {mostrarOtroTratamiento && (
                    <Input
                      value={nuevaTabla.tratamiento}
                      onChange={(e) => {
                        setNuevaTabla(prev => ({ ...prev, tratamiento: e.target.value }))
                        validarCampoEnTiempoReal('tratamiento', e.target.value, true)
                      }}
                      placeholder="Especifique el tratamiento"
                      className="mt-2"
                    />
                  )}
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

                {/* Número de Semillas por Repetición - Select */}
                <div>
                  <Label className="text-sm font-medium">Número de Semillas por Repetición *</Label>
                  <Select
                    value={mostrarOtroNumSemillas ? 'otro' : (nuevaTabla.numSemillasPRep === 0 ? '' : nuevaTabla.numSemillasPRep.toString())}
                    onValueChange={(value) => {
                      if (value === 'otro') {
                        setMostrarOtroNumSemillas(true)
                        setNuevaTabla(prev => ({ ...prev, numSemillasPRep: 0 }))
                      } else {
                        setMostrarOtroNumSemillas(false)
                        const numValue = parseInt(value)
                        setNuevaTabla(prev => ({ ...prev, numSemillasPRep: numValue }))
                        validarCampoEnTiempoReal('numSemillasPRep', numValue, true)
                      }
                    }}
                  >
                    <SelectTrigger className={erroresValidacionNuevaTabla.numSemillasPRep ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="otro">Otro (especifique)</SelectItem>
                    </SelectContent>
                  </Select>
                  {mostrarOtroNumSemillas && (
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={nuevaTabla.numSemillasPRep === 0 ? '' : nuevaTabla.numSemillasPRep}
                      onChange={(e) => {
                        const valor = parseInt(e.target.value) || 0
                        setNuevaTabla(prev => ({ ...prev, numSemillasPRep: valor }))
                        validarCampoEnTiempoReal('numSemillasPRep', valor, true)
                      }}
                      placeholder="Especifique la cantidad"
                      className="mt-2"
                    />
                  )}
                  {erroresValidacionNuevaTabla.numSemillasPRep && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.numSemillasPRep}</p>
                  )}
                </div>

                {/* Método - Select */}
                <div>
                  <Label className="text-sm font-medium">Método *</Label>
                  <Select
                    value={nuevaTabla.metodo}
                    onValueChange={(value) => {
                      if (value === 'Otro') {
                        setMostrarOtroMetodo(true)
                        setNuevaTabla(prev => ({ ...prev, metodo: '' }))
                      } else {
                        setMostrarOtroMetodo(false)
                        setNuevaTabla(prev => ({ ...prev, metodo: value }))
                        validarCampoEnTiempoReal('metodo', value, true)
                      }
                    }}
                  >
                    <SelectTrigger className={erroresValidacionNuevaTabla.metodo ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="EP">EP</SelectItem>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="RPT">RPT</SelectItem>
                      <SelectItem value="Tierra">Tierra</SelectItem>
                      <SelectItem value="Otro">Otro (especifique)</SelectItem>
                    </SelectContent>
                  </Select>
                  {mostrarOtroMetodo && (
                    <Input
                      value={nuevaTabla.metodo}
                      onChange={(e) => {
                        setNuevaTabla(prev => ({ ...prev, metodo: e.target.value }))
                        validarCampoEnTiempoReal('metodo', e.target.value, true)
                      }}
                      placeholder="Especifique el método"
                      className="mt-2"
                    />
                  )}
                  {erroresValidacionNuevaTabla.metodo && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.metodo}</p>
                  )}
                </div>

                {/* Temperatura - Select */}
                <div>
                  <Label className="text-sm font-medium">Temperatura *</Label>
                  <Select
                    value={mostrarOtraTemperatura ? 'otro' : (nuevaTabla.temperatura === 0 ? '' : nuevaTabla.temperatura.toString())}
                    onValueChange={(value) => {
                      if (value === 'otro') {
                        setMostrarOtraTemperatura(true)
                        setNuevaTabla(prev => ({ ...prev, temperatura: 0 }))
                      } else {
                        setMostrarOtraTemperatura(false)
                        // Guardar el texto completo como está (el backend lo procesará)
                        setNuevaTabla(prev => ({ ...prev, temperatura: value as any }))
                        validarCampoEnTiempoReal('temperatura', value, true)
                      }
                    }}
                  >
                    <SelectTrigger className={erroresValidacionNuevaTabla.temperatura ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar temperatura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15°C</SelectItem>
                      <SelectItem value="20">20°C</SelectItem>
                      <SelectItem value="25">25°C</SelectItem>
                      <SelectItem value="20-30">20↔30°C</SelectItem>
                      <SelectItem value="15-35">15↔35°C</SelectItem>
                      <SelectItem value="otro">Otro (especifique)</SelectItem>
                    </SelectContent>
                  </Select>
                  {mostrarOtraTemperatura && (
                    <Input
                      type="number"
                      min="-10"
                      max="50"
                      value=""
                      onChange={(e) => {
                        const valor = parseFloat(e.target.value) || 0
                        setNuevaTabla(prev => ({ ...prev, temperatura: valor }))
                        validarCampoEnTiempoReal('temperatura', valor, true)
                      }}
                      placeholder="Especifique la temperatura (°C)"
                      className="mt-2"
                    />
                  )}
                  {erroresValidacionNuevaTabla.temperatura && (
                    <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.temperatura}</p>
                  )}
                </div>

                {/* Prefrío */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="tienePrefrio"
                      checked={nuevaTabla.tienePrefrio}
                      onChange={(e) => setNuevaTabla(prev => ({
                        ...prev,
                        tienePrefrio: e.target.checked,
                        descripcionPrefrio: e.target.checked ? prev.descripcionPrefrio : '',
                        diasPrefrio: e.target.checked ? prev.diasPrefrio : 0
                      }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="tienePrefrio" className="text-sm font-medium cursor-pointer">
                      ¿Tiene Prefrío?
                    </Label>
                  </div>
                  {nuevaTabla.tienePrefrio && (
                    <div className="space-y-2 mt-2 pl-6">
                      <div>
                        <Label className="text-sm">Descripción de Prefrío</Label>
                        <Input
                          value={nuevaTabla.descripcionPrefrio}
                          onChange={(e) => setNuevaTabla(prev => ({ ...prev, descripcionPrefrio: e.target.value }))}
                          placeholder="Ej: 5°C por 7 días"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Días de Prefrío *</Label>
                        <Select
                          value={nuevaTabla.diasPrefrio === 0 ? '' : nuevaTabla.diasPrefrio.toString()}
                          onValueChange={(value) => setNuevaTabla(prev => ({ ...prev, diasPrefrio: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar días" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>{day} días</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pretratamiento */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="tienePretratamiento"
                      checked={nuevaTabla.tienePretratamiento}
                      onChange={(e) => setNuevaTabla(prev => ({
                        ...prev,
                        tienePretratamiento: e.target.checked,
                        descripcionPretratamiento: e.target.checked ? prev.descripcionPretratamiento : '',
                        diasPretratamiento: e.target.checked ? prev.diasPretratamiento : 0
                      }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="tienePretratamiento" className="text-sm font-medium cursor-pointer">
                      ¿Tiene Pretratamiento?
                    </Label>
                  </div>
                  {nuevaTabla.tienePretratamiento && (
                    <div className="space-y-2 mt-2 pl-6">
                      <div>
                        <Label className="text-sm">Tipo de Pretratamiento *</Label>
                        <Select
                          value={nuevaTabla.descripcionPretratamiento}
                          onValueChange={(value) => {
                            if (value === 'Otro') {
                              setMostrarOtroPretratamiento(true)
                              setNuevaTabla(prev => ({ ...prev, descripcionPretratamiento: '' }))
                            } else {
                              setMostrarOtroPretratamiento(false)
                              setNuevaTabla(prev => ({ ...prev, descripcionPretratamiento: value }))
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar pretratamiento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KNO3">KNO3</SelectItem>
                            <SelectItem value="Pre-lavado">Pre-lavado</SelectItem>
                            <SelectItem value="Pre-secado">Pre-secado</SelectItem>
                            <SelectItem value="GA3">GA3</SelectItem>
                            <SelectItem value="Otro">Otro (especifique)</SelectItem>
                          </SelectContent>
                        </Select>
                        {mostrarOtroPretratamiento && (
                          <Input
                            value={nuevaTabla.descripcionPretratamiento}
                            onChange={(e) => setNuevaTabla(prev => ({ ...prev, descripcionPretratamiento: e.target.value }))}
                            placeholder="Especifique el pretratamiento"
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div>
                        <Label className="text-sm">Días de Pretratamiento *</Label>
                        <Select
                          value={nuevaTabla.diasPretratamiento === 0 ? '' : nuevaTabla.diasPretratamiento.toString()}
                          onValueChange={(value) => setNuevaTabla(prev => ({ ...prev, diasPretratamiento: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar días" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>{day} días</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador visual */}
              <div className="border-t my-6"></div>
              
              {/* Sección de Fechas y Conteos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  📅 Fechas y Conteos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fecha Inicio Germinación */}
                  <div>
                    <Label className="text-sm font-medium">📆 Fecha Inicio Germinación *</Label>
                    <Input
                      type="date"
                      value={nuevaTabla.fechaInicioGerm}
                      onChange={(e) => setNuevaTabla(prev => ({ 
                        ...prev, 
                        fechaInicioGerm: e.target.value 
                      }))}
                      className={erroresValidacionNuevaTabla.fechaInicioGerm ? "border-red-500 focus:border-red-500" : ""}
                      lang="es-ES"
                    />
                    {erroresValidacionNuevaTabla.fechaInicioGerm && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.fechaInicioGerm}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Fecha en que se inicia el ensayo de germinación
                      {nuevaTabla.fechaInicioGerm && (
                        <span className="block text-blue-600 font-medium mt-0.5">
                          ✓ {new Date(nuevaTabla.fechaInicioGerm + 'T00:00:00').toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Fecha Último Conteo */}
                  <div>
                    <Label className="text-sm font-medium">📆 Fecha Último Conteo *</Label>
                    <Input
                      type="date"
                      value={nuevaTabla.fechaUltConteo}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                      lang="es-ES"
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Se actualiza automáticamente con el último conteo
                      {nuevaTabla.fechaUltConteo && (
                        <span className="block text-blue-600 font-medium mt-0.5">
                          ✓ {new Date(nuevaTabla.fechaUltConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Número de Días (calculado) */}
                  <div>
                    <Label className="text-sm font-medium">Número de Días</Label>
                    <Input
                      type="number"
                      value={nuevaTabla.fechaInicioGerm && nuevaTabla.fechaUltConteo ? 
                        Math.ceil((new Date(nuevaTabla.fechaUltConteo).getTime() - new Date(nuevaTabla.fechaInicioGerm).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      disabled
                      className="bg-gray-50 cursor-not-allowed text-center font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">Calculado automáticamente</p>
                  </div>

                  {/* Número de Repeticiones */}
                  <div>
                    <Label className="text-sm font-medium">Número de Repeticiones *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={nuevaTabla.numeroRepeticiones === 0 ? '' : nuevaTabla.numeroRepeticiones}
                      onChange={(e) => setNuevaTabla(prev => ({ 
                        ...prev, 
                        numeroRepeticiones: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="Por defecto: 8"
                      className={`text-center ${erroresValidacionNuevaTabla.numeroRepeticiones ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {erroresValidacionNuevaTabla.numeroRepeticiones && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.numeroRepeticiones}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cuántas repeticiones se crearán (1-20)
                    </p>
                  </div>

                  {/* Número de Conteos */}
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Número de Conteos *</Label>
                    <Select
                      value={nuevaTabla.numeroConteos === 0 ? '' : nuevaTabla.numeroConteos.toString()}
                      onValueChange={(value) => {
                        const numConteos = value === 'otro' ? 0 : parseInt(value)
                        setNuevaTabla(prev => ({ 
                          ...prev, 
                          numeroConteos: numConteos,
                          fechaConteos: Array(numConteos).fill('')
                        }))
                      }}
                    >
                      <SelectTrigger className={erroresValidacionNuevaTabla.numeroConteos ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar número de conteos" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} conteos</SelectItem>
                        ))}
                        <SelectItem value="otro">Otro (especifique)</SelectItem>
                      </SelectContent>
                    </Select>
                    {nuevaTabla.numeroConteos === 0 && (
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        placeholder="Especifique el número de conteos (1-15)"
                        onChange={(e) => {
                          const numConteos = parseInt(e.target.value) || 0
                          setNuevaTabla(prev => ({ 
                            ...prev, 
                            numeroConteos: numConteos,
                            fechaConteos: Array(numConteos).fill('')
                          }))
                        }}
                        className="mt-2"
                      />
                    )}
                    {erroresValidacionNuevaTabla.numeroConteos && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.numeroConteos}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cantidad de veces que se harán conteos (1-15)
                    </p>
                  </div>
                </div>

                {/* Fechas de Conteos Individuales */}
                {nuevaTabla.numeroConteos > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Fechas de Conteos Individuales *</Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Especifica la fecha de cada conteo. La fecha del último conteo se guardará como Fecha de Último Conteo.
                      {(nuevaTabla.diasPrefrio > 0 || nuevaTabla.diasPretratamiento > 0) && nuevaTabla.fechaConteos[0] && (() => {
                        const fechaMinimaConteo = calcularFechaMinimaConteo(nuevaTabla)
                        if (fechaMinimaConteo) {
                          const fechaMinima = new Date(fechaMinimaConteo + 'T00:00:00')
                          const fechaPrimerConteo = new Date(nuevaTabla.fechaConteos[0] + 'T00:00:00')
                          if (fechaPrimerConteo < fechaMinima) {
                            return (
                              <span className="text-orange-600 font-semibold block mt-1">
                                ⚠️ El primer conteo debe ser al menos {(nuevaTabla.diasPrefrio || 0) + (nuevaTabla.diasPretratamiento || 0)} días después del inicio (prefrío + pretratamiento)
                              </span>
                            )
                          }
                        }
                        return null
                      })()}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Array.from({ length: nuevaTabla.numeroConteos }, (_, index) => {
                        // Calcular fecha mínima: primer conteo usa calcularFechaMinimaConteo, los demás usan el conteo anterior
                        let fechaMinimaConteo: string | undefined
                        if (index === 0) {
                          fechaMinimaConteo = calcularFechaMinimaConteo(nuevaTabla) || nuevaTabla.fechaInicioGerm
                        } else if (nuevaTabla.fechaConteos[index - 1]) {
                          fechaMinimaConteo = nuevaTabla.fechaConteos[index - 1]
                        } else {
                          fechaMinimaConteo = nuevaTabla.fechaInicioGerm
                        }
                        
                        const esUltimoConteo = index === nuevaTabla.numeroConteos - 1
                        
                        // Validar si la fecha actual es menor que la mínima permitida
                        const fechaActual = nuevaTabla.fechaConteos[index]
                        const tieneFechaInvalida = fechaActual && fechaMinimaConteo && 
                          new Date(fechaActual + 'T00:00:00') < new Date(fechaMinimaConteo + 'T00:00:00')
                        
                        return (
                          <div key={index}>
                            <Label className="text-xs font-medium">
                              Conteo {index + 1} {esUltimoConteo ? '(Último)' : index === 0 ? '(Primero)' : ''}
                            </Label>
                            <Input
                              type="date"
                              min={fechaMinimaConteo || undefined}
                              value={nuevaTabla.fechaConteos[index] || ''}
                              onChange={(e) => {
                                const newFechas = [...nuevaTabla.fechaConteos]
                                newFechas[index] = e.target.value
                                
                                // Si es el último conteo, actualizar también fechaUltConteo
                                if (esUltimoConteo) {
                                  setNuevaTabla(prev => ({ 
                                    ...prev, 
                                    fechaConteos: newFechas,
                                    fechaUltConteo: e.target.value
                                  }))
                                  
                                  // Validar fechaFinal si ya está definida
                                  if (nuevaTabla.fechaFinal) {
                                    validarCampoEnTiempoReal('fechaFinal', nuevaTabla.fechaFinal, true)
                                  }
                                } else {
                                  setNuevaTabla(prev => ({ ...prev, fechaConteos: newFechas }))
                                }
                              }}
                              lang="es-ES"
                              className={`${esUltimoConteo ? 'border-blue-300 bg-blue-50' : ''} ${tieneFechaInvalida ? 'border-red-500' : ''}`}
                            />
                            {index === 0 && fechaMinimaConteo && !tieneFechaInvalida && nuevaTabla.fechaConteos[index] && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Cumple mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {index === 0 && fechaMinimaConteo && (!nuevaTabla.fechaConteos[index] || tieneFechaInvalida) && (
                              <p className="text-xs text-orange-600 mt-1">
                                Mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {index > 0 && fechaMinimaConteo && !tieneFechaInvalida && (
                              <p className="text-xs text-gray-500 mt-1">
                                Mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {tieneFechaInvalida && (
                              <p className="text-xs text-red-500 mt-1">
                                ⚠️ Debe ser igual o posterior a la fecha del Conteo {index}
                              </p>
                            )}
                            {nuevaTabla.fechaConteos[index] && !tieneFechaInvalida && index !== 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                ✓ {new Date(nuevaTabla.fechaConteos[index] + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {nuevaTabla.numeroConteos > 1 && (
                      <p className="text-xs text-blue-600 mt-2">
                        💡 Nota: La fecha del último conteo se guardará automáticamente como Fecha de Último Conteo
                      </p>
                    )}
                  </div>
                )}

                {/* Fecha Final - AL FINAL DEL FORMULARIO */}
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">🏁 Fecha Final *</Label>
                      <Input
                        type="date"
                        value={nuevaTabla.fechaFinal}
                        onChange={(e) => {
                          setNuevaTabla(prev => ({ ...prev, fechaFinal: e.target.value }))
                          validarCampoEnTiempoReal('fechaFinal', e.target.value, true)
                        }}
                        min={
                          nuevaTabla.fechaConteos && nuevaTabla.fechaConteos.length > 0 
                            ? nuevaTabla.fechaConteos[nuevaTabla.fechaConteos.length - 1] 
                            : nuevaTabla.fechaUltConteo || nuevaTabla.fechaInicioGerm || undefined
                        }
                        className={erroresValidacionNuevaTabla.fechaFinal ? "border-red-500 focus:border-red-500" : ""}
                        lang="es-ES"
                      />
                      {erroresValidacionNuevaTabla.fechaFinal && (
                        <p className="text-red-500 text-xs mt-1">{erroresValidacionNuevaTabla.fechaFinal}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Debe ser igual o posterior a la fecha de último conteo
                        {nuevaTabla.fechaFinal && (
                          <span className="block text-blue-600 font-medium mt-0.5">
                            ✓ {new Date(nuevaTabla.fechaFinal + 'T00:00:00').toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
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
                            {/* Tratamiento - Select */}
                            <div>
                              <Label className="text-sm font-medium">Tratamiento *</Label>
                              <Select
                                value={tablaEditada.tratamiento}
                                onValueChange={(value) => {
                                  if (value === 'Otro') {
                                    setMostrarOtroTratamiento(true)
                                    setTablaEditada(prev => ({ ...prev, tratamiento: '' }))
                                  } else {
                                    setMostrarOtroTratamiento(false)
                                    setTablaEditada(prev => ({ ...prev, tratamiento: value }))
                                    validarCampoEnTiempoReal('tratamiento', value, false)
                                  }
                                }}
                              >
                                <SelectTrigger className={erroresValidacion.tratamiento ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Seleccionar tratamiento" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Sin curar">Sin curar</SelectItem>
                                  <SelectItem value="Curada en Planta">Curada en Planta</SelectItem>
                                  <SelectItem value="Curada en Laboratorio">Curada en Laboratorio</SelectItem>
                                  <SelectItem value="Otro">Otro (especifique)</SelectItem>
                                </SelectContent>
                              </Select>
                              {mostrarOtroTratamiento && (
                                <Input
                                  value={tablaEditada.tratamiento}
                                  onChange={(e) => {
                                    setTablaEditada(prev => ({ ...prev, tratamiento: e.target.value }))
                                    validarCampoEnTiempoReal('tratamiento', e.target.value, false)
                                  }}
                                  placeholder="Especifique el tratamiento"
                                  className="mt-2"
                                />
                              )}
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

                            {/* Número de Semillas por Repetición - Select */}
                            <div>
                              <Label className="text-sm font-medium">Número de Semillas por Repetición *</Label>
                              <Select
                                value={mostrarOtroNumSemillasEdit ? 'otro' : (tablaEditada.numSemillasPRep === 0 ? '' : tablaEditada.numSemillasPRep.toString())}
                                onValueChange={(value) => {
                                  if (value === 'otro') {
                                    setMostrarOtroNumSemillasEdit(true)
                                    setTablaEditada(prev => ({ ...prev, numSemillasPRep: 0 }))
                                  } else {
                                    setMostrarOtroNumSemillasEdit(false)
                                    const numValue = parseInt(value)
                                    setTablaEditada(prev => ({ ...prev, numSemillasPRep: numValue }))
                                    validarCampoEnTiempoReal('numSemillasPRep', numValue, false)
                                  }
                                }}
                                disabled={tablaConRepeticionesGuardadas(editandoTablaGeneral!)}
                              >
                                <SelectTrigger className={tablaConRepeticionesGuardadas(editandoTablaGeneral!) ? "bg-gray-100 text-gray-500" : ""}>
                                  <SelectValue placeholder="Seleccionar cantidad" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                  <SelectItem value="otro">Otro (especifique)</SelectItem>
                                </SelectContent>
                              </Select>
                              {mostrarOtroNumSemillasEdit && !tablaConRepeticionesGuardadas(editandoTablaGeneral!) && (
                                <Input
                                  type="number"
                                  min="1"
                                  max="500"
                                  value={tablaEditada.numSemillasPRep === 0 ? '' : tablaEditada.numSemillasPRep}
                                  onChange={(e) => {
                                    const valor = parseInt(e.target.value) || 0
                                    setTablaEditada(prev => ({ ...prev, numSemillasPRep: valor }))
                                    validarCampoEnTiempoReal('numSemillasPRep', valor, false)
                                  }}
                                  placeholder="Especifique la cantidad"
                                  className="mt-2"
                                />
                              )}
                              {tablaConRepeticionesGuardadas(editandoTablaGeneral!) && (
                                <p className="text-xs text-orange-600 mt-1">
                                  No se puede modificar el número de semillas porque ya hay repeticiones guardadas
                                </p>
                              )}
                            </div>

                            {/* Método - Select */}
                            <div>
                              <Label className="text-sm font-medium">Método *</Label>
                              <Select
                                value={tablaEditada.metodo}
                                onValueChange={(value) => {
                                  if (value === 'Otro') {
                                    setMostrarOtroMetodo(true)
                                    setTablaEditada(prev => ({ ...prev, metodo: '' }))
                                  } else {
                                    setMostrarOtroMetodo(false)
                                    setTablaEditada(prev => ({ ...prev, metodo: value }))
                                    validarCampoEnTiempoReal('metodo', value, false)
                                  }
                                }}
                              >
                                <SelectTrigger className={erroresValidacion.metodo ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="SP">SP</SelectItem>
                                  <SelectItem value="EP">EP</SelectItem>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="RPT">RPT</SelectItem>
                                  <SelectItem value="Tierra">Tierra</SelectItem>
                                  <SelectItem value="Otro">Otro (especifique)</SelectItem>
                                </SelectContent>
                              </Select>
                              {mostrarOtroMetodo && (
                                <Input
                                  value={tablaEditada.metodo}
                                  onChange={(e) => {
                                    setTablaEditada(prev => ({ ...prev, metodo: e.target.value }))
                                    validarCampoEnTiempoReal('metodo', e.target.value, false)
                                  }}
                                  placeholder="Especifique el método"
                                  className="mt-2"
                                />
                              )}
                              {erroresValidacion.metodo && (
                                <p className="text-red-500 text-xs mt-1">{erroresValidacion.metodo}</p>
                              )}
                            </div>

                            {/* Temperatura - Select */}
                            <div>
                              <Label className="text-sm font-medium">Temperatura *</Label>
                              <Select
                                value={mostrarOtraTemperatura ? 'otro' : (tablaEditada.temperatura === 0 ? '' : tablaEditada.temperatura.toString())}
                                onValueChange={(value) => {
                                  if (value === 'otro') {
                                    setMostrarOtraTemperatura(true)
                                    setTablaEditada(prev => ({ ...prev, temperatura: 0 }))
                                  } else {
                                    setMostrarOtraTemperatura(false)
                                    // Guardar el texto completo como está (el backend lo procesará)
                                    setTablaEditada(prev => ({ ...prev, temperatura: value as any }))
                                    validarCampoEnTiempoReal('temperatura', value, false)
                                  }
                                }}
                              >
                                <SelectTrigger className={erroresValidacion.temperatura ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Seleccionar temperatura" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15°C</SelectItem>
                                  <SelectItem value="20">20°C</SelectItem>
                                  <SelectItem value="25">25°C</SelectItem>
                                  <SelectItem value="20-30">20↔30°C</SelectItem>
                                  <SelectItem value="15-35">15↔35°C</SelectItem>
                                  <SelectItem value="otro">Otro (especifique)</SelectItem>
                                </SelectContent>
                              </Select>
                              {mostrarOtraTemperatura && (
                                <Input
                                  type="number"
                                  min="-10"
                                  max="50"
                                  value=""
                                  onChange={(e) => {
                                    const valor = parseFloat(e.target.value) || 0
                                    setTablaEditada(prev => ({ ...prev, temperatura: valor }))
                                    validarCampoEnTiempoReal('temperatura', valor, false)
                                  }}
                                  placeholder="Especifique la temperatura (°C)"
                                  className="mt-2"
                                />
                              )}
                              {erroresValidacion.temperatura && (
                                <p className="text-red-500 text-xs mt-1">{erroresValidacion.temperatura}</p>
                              )}
                            </div>

                {/* Prefrío */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="tienePrefrio-edit"
                      checked={tablaEditada.tienePrefrio}
                      onChange={(e) => setTablaEditada(prev => ({
                        ...prev,
                        tienePrefrio: e.target.checked,
                        descripcionPrefrio: e.target.checked ? prev.descripcionPrefrio : '',
                        diasPrefrio: e.target.checked ? prev.diasPrefrio : 0
                      }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="tienePrefrio-edit" className="text-sm font-medium cursor-pointer">
                      ¿Tiene Prefrío?
                    </Label>
                  </div>
                  {tablaEditada.tienePrefrio && (
                    <div className="space-y-2 mt-2 pl-6">
                      <div>
                        <Label className="text-sm">Descripción de Prefrío</Label>
                        <Input
                          value={tablaEditada.descripcionPrefrio}
                          onChange={(e) => setTablaEditada(prev => ({ ...prev, descripcionPrefrio: e.target.value }))}
                          placeholder="Ej: 5°C por 7 días"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Días de Prefrío *</Label>
                        <Select
                          value={tablaEditada.diasPrefrio === 0 ? '' : tablaEditada.diasPrefrio.toString()}
                          onValueChange={(value) => setTablaEditada(prev => ({ ...prev, diasPrefrio: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar días" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>{day} días</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pretratamiento */}
                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="tienePretratamiento-edit"
                      checked={tablaEditada.tienePretratamiento}
                      onChange={(e) => setTablaEditada(prev => ({
                        ...prev,
                        tienePretratamiento: e.target.checked,
                        descripcionPretratamiento: e.target.checked ? prev.descripcionPretratamiento : '',
                        diasPretratamiento: e.target.checked ? prev.diasPretratamiento : 0
                      }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="tienePretratamiento-edit" className="text-sm font-medium cursor-pointer">
                      ¿Tiene Pretratamiento?
                    </Label>
                  </div>
                  {tablaEditada.tienePretratamiento && (
                    <div className="space-y-2 mt-2 pl-6">
                      <div>
                        <Label className="text-sm">Tipo de Pretratamiento *</Label>
                        <Select
                          value={tablaEditada.descripcionPretratamiento}
                          onValueChange={(value) => {
                            if (value === 'Otro') {
                              setMostrarOtroPretratamiento(true)
                              setTablaEditada(prev => ({ ...prev, descripcionPretratamiento: '' }))
                            } else {
                              setMostrarOtroPretratamiento(false)
                              setTablaEditada(prev => ({ ...prev, descripcionPretratamiento: value }))
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar pretratamiento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KNO3">KNO3</SelectItem>
                            <SelectItem value="Pre-lavado">Pre-lavado</SelectItem>
                            <SelectItem value="Pre-secado">Pre-secado</SelectItem>
                            <SelectItem value="GA3">GA3</SelectItem>
                            <SelectItem value="Otro">Otro (especifique)</SelectItem>
                          </SelectContent>
                        </Select>
                        {mostrarOtroPretratamiento && (
                          <Input
                            value={tablaEditada.descripcionPretratamiento}
                            onChange={(e) => setTablaEditada(prev => ({ ...prev, descripcionPretratamiento: e.target.value }))}
                            placeholder="Especifique el pretratamiento"
                            className="mt-2"
                          />
                        )}
                      </div>
                      <div>
                        <Label className="text-sm">Días de Pretratamiento *</Label>
                        <Select
                          value={tablaEditada.diasPretratamiento === 0 ? '' : tablaEditada.diasPretratamiento.toString()}
                          onValueChange={(value) => setTablaEditada(prev => ({ ...prev, diasPretratamiento: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar días" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>{day} días</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Separador visual */}
              <div className="border-t my-6"></div>
              
              {/* Sección de Fechas y Conteos para Edición */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  📅 Fechas y Conteos
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Fecha Inicio Germinación */}
                  <div>
                    <Label className="text-sm font-medium">📆 Fecha Inicio Germinación *</Label>
                    <Input
                      type="date"
                      value={tablaEditada.fechaInicioGerm}
                      onChange={(e) => {
                        setTablaEditada(prev => ({ ...prev, fechaInicioGerm: e.target.value }))
                        validarCampoEnTiempoReal('fechaInicioGerm', e.target.value, false)
                      }}
                      className={erroresValidacion.fechaInicioGerm ? "border-red-500 focus:border-red-500" : ""}
                      lang="es-ES"
                    />
                    {erroresValidacion.fechaInicioGerm && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacion.fechaInicioGerm}</p>
                    )}
                    {tablaEditada.fechaInicioGerm && (
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        ✓ {new Date(tablaEditada.fechaInicioGerm + 'T00:00:00').toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>

                  {/* Fecha Último Conteo */}
                  <div>
                    <Label className="text-sm font-medium">📆 Fecha Último Conteo *</Label>
                    <Input
                      type="date"
                      value={tablaEditada.fechaUltConteo}
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                      lang="es-ES"
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Se actualiza automáticamente con el último conteo
                      {tablaEditada.fechaUltConteo && (
                        <span className="block text-blue-600 font-medium mt-0.5">
                          ✓ {new Date(tablaEditada.fechaUltConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Número de Días */}
                  <div>
                    <Label className="text-sm font-medium">Número de Días</Label>
                    <Input
                      type="number"
                      value={tablaEditada.fechaInicioGerm && tablaEditada.fechaUltConteo ? 
                        Math.ceil((new Date(tablaEditada.fechaUltConteo).getTime() - new Date(tablaEditada.fechaInicioGerm).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      disabled
                      className="bg-gray-50 cursor-not-allowed text-center font-semibold"
                    />
                    <p className="text-xs text-gray-500 mt-1 italic">Calculado automáticamente</p>
                  </div>

                  {/* Número de Repeticiones */}
                  <div>
                    <Label className="text-sm font-medium">Número de Repeticiones *</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={tablaEditada.numeroRepeticiones === 0 ? '' : tablaEditada.numeroRepeticiones}
                      onChange={(e) => {
                        setTablaEditada(prev => ({ ...prev, numeroRepeticiones: parseInt(e.target.value) || 0 }))
                        validarCampoEnTiempoReal('numeroRepeticiones', parseInt(e.target.value) || 0, false)
                      }}
                      className={`text-center ${erroresValidacion.numeroRepeticiones ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {erroresValidacion.numeroRepeticiones && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacion.numeroRepeticiones}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cuántas repeticiones (1-20)
                    </p>
                  </div>

                  {/* Número de Conteos */}
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium">Número de Conteos *</Label>
                    <Select
                      value={tablaEditada.numeroConteos === 0 ? '' : tablaEditada.numeroConteos.toString()}
                      onValueChange={(value) => {
                        const numConteos = value === 'otro' ? 0 : parseInt(value)
                        setTablaEditada(prev => ({ 
                          ...prev, 
                          numeroConteos: numConteos,
                          fechaConteos: Array(numConteos).fill('').map((_, i) => 
                            prev.fechaConteos && prev.fechaConteos[i] ? prev.fechaConteos[i] : ''
                          )
                        }))
                        validarCampoEnTiempoReal('numeroConteos', numConteos, false)
                      }}
                    >
                      <SelectTrigger className={erroresValidacion.numeroConteos ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar número de conteos" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num} conteos</SelectItem>
                        ))}
                        <SelectItem value="otro">Otro (especifique)</SelectItem>
                      </SelectContent>
                    </Select>
                    {tablaEditada.numeroConteos === 0 && (
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        placeholder="Especifique el número de conteos (1-15)"
                        onChange={(e) => {
                          const numConteos = parseInt(e.target.value) || 0
                          setTablaEditada(prev => ({ 
                            ...prev, 
                            numeroConteos: numConteos,
                            fechaConteos: Array(numConteos).fill('').map((_, i) => 
                              prev.fechaConteos && prev.fechaConteos[i] ? prev.fechaConteos[i] : ''
                            )
                          }))
                          validarCampoEnTiempoReal('numeroConteos', numConteos, false)
                        }}
                        className="mt-2"
                      />
                    )}
                    {erroresValidacion.numeroConteos && (
                      <p className="text-red-500 text-xs mt-1">{erroresValidacion.numeroConteos}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Cantidad de veces que se harán conteos (1-15)
                    </p>
                  </div>
                </div>

                {/* Fechas de Conteos Individuales */}
                {tablaEditada.numeroConteos > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Fechas de Conteos Individuales *</Label>
                    <p className="text-xs text-gray-500 mb-3">
                      Especifica la fecha de cada conteo. La fecha del último conteo se guardará como Fecha de Último Conteo.
                      {(tablaEditada.diasPrefrio > 0 || tablaEditada.diasPretratamiento > 0) && tablaEditada.fechaConteos[0] && (() => {
                        const fechaMinimaConteo = calcularFechaMinimaConteo(tablaEditada)
                        if (fechaMinimaConteo) {
                          const fechaMinima = new Date(fechaMinimaConteo + 'T00:00:00')
                          const fechaPrimerConteo = new Date(tablaEditada.fechaConteos[0] + 'T00:00:00')
                          if (fechaPrimerConteo < fechaMinima) {
                            return (
                              <span className="text-orange-600 font-semibold block mt-1">
                                ⚠️ El primer conteo debe ser al menos {(tablaEditada.diasPrefrio || 0) + (tablaEditada.diasPretratamiento || 0)} días después del inicio (prefrío + pretratamiento)
                              </span>
                            )
                          }
                        }
                        return null
                      })()}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Array.from({ length: tablaEditada.numeroConteos }, (_, index) => {
                        // Calcular fecha mínima: primer conteo usa calcularFechaMinimaConteo, los demás usan el conteo anterior
                        let fechaMinimaConteo: string | undefined
                        if (index === 0) {
                          fechaMinimaConteo = calcularFechaMinimaConteo(tablaEditada) || tablaEditada.fechaInicioGerm
                        } else if (tablaEditada.fechaConteos[index - 1]) {
                          fechaMinimaConteo = tablaEditada.fechaConteos[index - 1]
                        } else {
                          fechaMinimaConteo = tablaEditada.fechaInicioGerm
                        }
                        
                        const esUltimoConteo = index === tablaEditada.numeroConteos - 1
                        
                        // Validar si la fecha actual es menor que la mínima permitida
                        const fechaActual = tablaEditada.fechaConteos[index]
                        const tieneFechaInvalida = fechaActual && fechaMinimaConteo && 
                          new Date(fechaActual + 'T00:00:00') < new Date(fechaMinimaConteo + 'T00:00:00')
                        
                        return (
                          <div key={index}>
                            <Label className="text-xs font-medium">
                              Conteo {index + 1} {esUltimoConteo ? '(Último)' : index === 0 ? '(Primero)' : ''}
                            </Label>
                            <Input
                              type="date"
                              min={fechaMinimaConteo || undefined}
                              value={tablaEditada.fechaConteos[index] || ''}
                              onChange={(e) => {
                                const newFechas = [...(tablaEditada.fechaConteos || [])]
                                newFechas[index] = e.target.value
                                
                                // Si es el último conteo, actualizar también fechaUltConteo
                                if (esUltimoConteo) {
                                  setTablaEditada(prev => ({ 
                                    ...prev, 
                                    fechaConteos: newFechas,
                                    fechaUltConteo: e.target.value
                                  }))
                                  
                                  // Validar fechaFinal si ya está definida
                                  if (tablaEditada.fechaFinal) {
                                    validarCampoEnTiempoReal('fechaFinal', tablaEditada.fechaFinal, false)
                                  }
                                } else {
                                  setTablaEditada(prev => ({ ...prev, fechaConteos: newFechas }))
                                }
                              }}
                              lang="es-ES"
                              className={`${esUltimoConteo ? 'border-blue-300 bg-blue-50' : ''} ${tieneFechaInvalida ? 'border-red-500' : ''}`}
                            />
                            {index === 0 && fechaMinimaConteo && !tieneFechaInvalida && tablaEditada.fechaConteos[index] && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Cumple mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {index === 0 && fechaMinimaConteo && (!tablaEditada.fechaConteos[index] || tieneFechaInvalida) && (
                              <p className="text-xs text-orange-600 mt-1">
                                Mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {index > 0 && fechaMinimaConteo && !tieneFechaInvalida && (
                              <p className="text-xs text-gray-500 mt-1">
                                Mínimo: {new Date(fechaMinimaConteo + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {tieneFechaInvalida && (
                              <p className="text-xs text-red-500 mt-1">
                                ⚠️ Debe ser igual o posterior a conteo {index}
                              </p>
                            )}
                            {tablaEditada.fechaConteos[index] && !tieneFechaInvalida && index !== 0 && (
                              <p className="text-xs text-blue-600 mt-1">
                                ✓ {new Date(tablaEditada.fechaConteos[index] + 'T00:00:00').toLocaleDateString('es-ES')}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {tablaEditada.numeroConteos > 1 && (
                      <p className="text-xs text-blue-600 mt-2">
                        💡 La fecha del último conteo se guardará automáticamente como Fecha de Último Conteo
                      </p>
                    )}
                  </div>
                )}

                {/* Fecha Final - AL FINAL DEL FORMULARIO DE EDICIÓN */}
                <div className="mt-6 border-t pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">🏁 Fecha Final *</Label>
                      <Input
                        type="date"
                        value={tablaEditada.fechaFinal}
                        onChange={(e) => {
                          setTablaEditada(prev => ({ ...prev, fechaFinal: e.target.value }))
                          validarCampoEnTiempoReal('fechaFinal', e.target.value, false)
                        }}
                        min={
                          tablaEditada.fechaConteos && tablaEditada.fechaConteos.length > 0 
                            ? tablaEditada.fechaConteos[tablaEditada.fechaConteos.length - 1] 
                            : tablaEditada.fechaUltConteo || tablaEditada.fechaInicioGerm || undefined
                        }
                        className={erroresValidacion.fechaFinal ? "border-red-500 focus:border-red-500" : ""}
                        lang="es-ES"
                      />
                      {erroresValidacion.fechaFinal && (
                        <p className="text-red-500 text-xs mt-1">{erroresValidacion.fechaFinal}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Debe ser igual o posterior a la fecha de último conteo
                        {tablaEditada.fechaFinal && (
                          <span className="block text-blue-600 font-medium mt-0.5">
                            ✓ {new Date(tablaEditada.fechaFinal + 'T00:00:00').toLocaleDateString('es-ES')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
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
                            <p className="text-gray-800">
                              {tabla.tienePrefrio ? (
                                <>
                                  <span className="text-green-600 font-semibold">Sí</span>
                                  {tabla.descripcionPrefrio && ` - ${tabla.descripcionPrefrio}`}
                                  {tabla.diasPrefrio > 0 && ` (${tabla.diasPrefrio} días)`}
                                </>
                              ) : (
                                <span className="text-gray-500">No</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Pretratamiento:</span>
                            <p className="text-gray-800">
                              {tabla.tienePretratamiento ? (
                                <>
                                  <span className="text-green-600 font-semibold">Sí</span>
                                  {tabla.descripcionPretratamiento && ` - ${tabla.descripcionPretratamiento}`}
                                  {tabla.diasPretratamiento > 0 && ` (${tabla.diasPretratamiento} días)`}
                                </>
                              ) : (
                                <span className="text-gray-500">No</span>
                              )}
                            </p>
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
                    key={`rep-manager-${tabla.tablaGermID}-${tabla.numeroConteos}-${tabla.numeroRepeticiones}-${tabla.fechaConteos?.join(',')}`}
                    tabla={tabla}
                    germinacionId={germinacionId}
                    numeroRepeticiones={tabla.numeroRepeticiones || 8}
                    numeroConteos={tabla.numeroConteos || 3}
                    isFinalized={isFinalized}
                    fechasConteos={tabla.fechaConteos}
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
          </div>
        </div>
      </div>
    </Card>
  )
}
