"use client"

import { handleApiError } from "@/lib/error-handling/error-handler"

// Para desarrollo local usar localhost, para Docker usar backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * Obtiene el token de autenticación de localStorage o cookies
 */
function getToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    // 1. Primero intentar obtener de localStorage (método principal usado en login)
    const localStorageToken = localStorage.getItem('token');
    if (localStorageToken) {
        return localStorageToken;
    }

    // 2. Fallback: leer token de cookies (para compatibilidad)
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'token') {
                return decodeURIComponent(value) // Decodificar por si tiene caracteres especiales
            }
        }
    }

    return null
}

interface ApiOptions extends RequestInit {
    skipErrorHandling?: boolean
}

/**
 * Cliente API para realizar peticiones al backend
 * 
 * @param endpoint Ruta del endpoint API (debe comenzar con /)
 * @param options Opciones de fetch
 * @returns Respuesta procesada (JSON o texto)
 */
export async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipErrorHandling, ...fetchOptions } = options
    const token = getToken()

    // Debug info
    if (process.env.NODE_ENV !== 'production') {
        console.debug(`🔍 API Call: ${endpoint}`)
        console.debug(`🔑 Token: ${token ? '✅ Presente (' + token.substring(0, 20) + '...)' : '❌ No encontrado'}`)
    }

    // Configurar headers
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers || {}),
    }

    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            credentials: "include", // Importante para enviar cookies
            ...fetchOptions,
        })

        // Debug info en desarrollo
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`📥 Response status: ${res.status}`)
        }

        // Si la respuesta no es exitosa
        if (!res.ok) {
            let errorData: any
            const contentType = res.headers.get("content-type") || ""

            try {
                // Intentar parsear como JSON
                if (contentType.includes("application/json")) {
                    errorData = await res.json()
                } else {
                    // Fallback a texto
                    const text = await res.text()
                    errorData = { message: text }
                }
            } catch (e) {
                errorData = { message: `Error ${res.status}` }
            }

            // Debug adicional para errores de autenticación
            if (process.env.NODE_ENV !== 'production') {
                if (res.status === 403) {
                    console.error('❌ Error 403 (Forbidden): Problema de autenticación/autorización')
                    console.error('🔍 Token enviado:', token ? 'Sí' : 'No')
                    console.error('📍 Endpoint:', endpoint)
                } else if (res.status === 401) {
                    console.error('❌ Error 401 (Unauthorized): Token inválido o expirado')
                }
                console.error(`❌ Error response body:`, errorData)
                console.error(`❌ URL solicitada: ${API_BASE_URL}${endpoint}`)
                console.error(`❌ Status: ${res.status}`)
            }

            // Crear error con detalles
            const apiError = {
                status: res.status,
                message: errorData.message || `Error ${res.status}`,
                errors: errorData.errors,
            }

            // Manejar el error automáticamente a menos que se indique lo contrario
            if (!skipErrorHandling) {
                handleApiError(apiError)
            }

            throw apiError
        }

        // Procesamiento de respuesta exitosa
        const contentType = res.headers.get("content-type") || ""
        if (contentType.includes("application/json")) {
            return await res.json() as T
        }
        return await res.text() as unknown as T
    } catch (error) {
        // Capturar errores de red o de parsing
        if (!skipErrorHandling && error instanceof Error && error.name !== 'AbortError') {
            handleApiError({ message: error.message })
        }
        throw error
    }
}