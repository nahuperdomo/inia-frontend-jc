import { EstadoAnalisis } from "@/app/models/types/enums"

/**
 * Formatea una fecha en formato local español (dd/MM/yyyy)
 */
export const formatearFechaLocal = (fechaString: string | undefined): string => {
    if (!fechaString) return '-'

    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            const [year, month, day] = fechaString.split('-').map(Number)
            const fecha = new Date(year, month - 1, day)
            return fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            })
        }

        const fecha = new Date(fechaString)
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    } catch (error) {
        return fechaString
    }
}

/**
 * Formatea una fecha con hora en formato local español
 */
export const formatearFechaHora = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            const [year, month, day] = fechaString.split('-').map(Number)
            const fecha = new Date(year, month - 1, day)
            return fecha.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        }

        const fecha = new Date(fechaString)
        return fecha.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return fechaString
    }
}

/**
 * Convierte una fecha para usar en inputs de tipo date (formato YYYY-MM-DD)
 */
export const convertirFechaParaInput = (fechaString: string): string => {
    if (!fechaString) return ''

    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) {
            return fechaString
        }

        const fecha = new Date(fechaString)
        if (isNaN(fecha.getTime())) return ''

        const year = fecha.getFullYear()
        const month = String(fecha.getMonth() + 1).padStart(2, '0')
        const day = String(fecha.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    } catch (error) {
        return ''
    }
}

/**
 * Formatea fecha para historial
 */
export const formatearFechaHistorial = (fecha: any): string => {
    if (!fecha) return '-'

    try {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha

        if (isNaN(fechaObj.getTime())) return '-'

        return fechaObj.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    } catch (error) {
        return '-'
    }
}

/**
 * Obtiene la variante del Badge según el estado del análisis
 */
export const getEstadoBadgeVariant = (estado: EstadoAnalisis | string): "default" | "secondary" | "destructive" | "outline" => {
    switch (estado) {
        case "APROBADO":
            return "default"
        case "EN_PROCESO":
            return "secondary"
        case "REGISTRADO":
            return "outline"
        case "PENDIENTE_APROBACION":
            return "destructive"
        case "A_REPETIR":
            return "destructive"
        case "FINALIZADO":
            return "default"
        case "PENDIENTE":
            return "outline"
        default:
            return "outline"
    }
}

/**
 * Formatea el estado del análisis para mostrar
 */
export const formatEstado = (estado: EstadoAnalisis | string): string => {
    switch (estado) {
        case "REGISTRADO":
            return "Registrado"
        case "EN_PROCESO":
            return "En Proceso"
        case "APROBADO":
            return "Aprobado"
        case "PENDIENTE_APROBACION":
            return "Pend. Aprobación"
        case "A_REPETIR":
            return "A Repetir"
        case "FINALIZADO":
            return "Finalizado"
        case "PENDIENTE":
            return "Pendiente"
        default:
            return estado
    }
}

// Función helper para mostrar nombres legibles de tipos de listado
export const getTipoListadoDisplay = (tipo: string): string => {
    switch (tipo) {
        case "MAL_TOLERANCIA_CERO":
            return "Maleza Tolerancia Cero"
        case "MAL_TOLERANCIA":
            return "Maleza Tolerancia"
        case "MAL_COMUNES":
            return "Malezas Comunes"
        case "BRASSICA":
            return "Brassica"
        case "OTROS":
            return "Otros Cultivos"
        default:
            return tipo
    }
}

// Función helper para obtener el color del badge según el tipo de listado
export const getTipoListadoBadgeColor = (tipo: string): string => {
    switch (tipo) {
        case "MAL_TOLERANCIA_CERO":
            return "bg-red-100 text-red-700 border-red-200"
        case "MAL_TOLERANCIA":
            return "bg-orange-100 text-orange-700 border-orange-200"
        case "MAL_COMUNES":
            return "bg-yellow-100 text-yellow-700 border-yellow-200"
        case "BRASSICA":
            return "bg-blue-100 text-blue-700 border-blue-200"
        case "OTROS":
            return "bg-purple-100 text-purple-700 border-purple-200"
        default:
            return "bg-gray-100 text-gray-700 border-gray-200"
    }
}
