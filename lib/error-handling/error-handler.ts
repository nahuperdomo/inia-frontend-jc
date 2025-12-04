"use client"

import { toast } from 'sonner'


export enum ErrorType {
    VALIDATION = 'validation',
    API = 'api',
    AUTHENTICATION = 'auth',
    UNKNOWN = 'unknown'
}


export interface ErrorMessage {
    title: string
    description: string
}


const errorMessages: Record<ErrorType, ErrorMessage> = {
    [ErrorType.VALIDATION]: {
        title: 'Error de validación',
        description: 'Por favor verifica los datos ingresados'
    },
    [ErrorType.API]: {
        title: 'Error de servidor',
        description: 'No se pudo completar la operación. Intente nuevamente más tarde'
    },
    [ErrorType.AUTHENTICATION]: {
        title: 'Error de autenticación',
        description: 'Su sesión ha caducado o no tiene permisos suficientes'
    },
    [ErrorType.UNKNOWN]: {
        title: 'Error inesperado',
        description: 'Ha ocurrido un error. Por favor intente nuevamente'
    }
}


export interface ApiError {
    status?: number
    message?: string
    errors?: Record<string, string[]>
}


export function handleError(error: unknown, type = ErrorType.UNKNOWN): void {
    console.error('Error:', error)

    const errorMessage = errorMessages[type]
    let description = errorMessage.description

    // Intentar extraer mensaje del error
    if (error) {
        if (typeof error === 'string') {
            description = error
        } else if (error instanceof Error) {
            description = error.message
        } else if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
            description = error.message
        }
    }

    // Mostrar toast con el error
    toast.error(errorMessage.title, {
        description
    })
}


export function handleApiError(error: ApiError): void {
    console.error('API Error:', error)

    // Determinar el tipo de mensaje basado en el código de estado
    let type = ErrorType.API
    if (error.status === 401 || error.status === 403) {
        type = ErrorType.AUTHENTICATION
    }

    const errorMessage = errorMessages[type]
    const description = error.message || errorMessage.description

    toast.error(errorMessage.title, {
        description
    })

    // Si hay errores de validación, mostrarlos también
    if (error.errors) {
        Object.entries(error.errors).forEach(([field, messages]) => {
            messages.forEach(message => {
                toast.error(`Error en ${field}`, { description: message })
            })
        })
    }
}