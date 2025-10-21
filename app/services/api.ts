// URL para desarrollo local (frontend local y backend en Docker)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        return decodeURIComponent(value); // Decodificar por si tiene caracteres especiales
      }
    }
  }

  return null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  // Debug info
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 API Call: ${endpoint}`);
    console.log(`🔑 Token encontrado: ${token ? '✅ Sí (' + token.substring(0, 20) + '...)' : '❌ No'}`);
    console.log(`🌐 URL completa: ${API_BASE_URL}${endpoint}`);
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log(`📤 Headers enviados:`, headers);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      credentials: "include", // Esto es importante para enviar cookies
      ...options,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📥 Response status: ${res.status}`);
    }

    if (!res.ok) {
      const errorText = await res.text();

      // Debug adicional para errores de autenticación
      if (process.env.NODE_ENV !== 'production') {
        if (res.status === 403) {
          console.error('❌ Error 403 (Forbidden): Problema de autenticación/autorización');
          console.error('🔍 Token enviado:', token ? 'Sí' : 'No');
          console.error('📍 Endpoint:', endpoint);
        } else if (res.status === 401) {
          console.error('❌ Error 401 (Unauthorized): Token inválido o expirado');
        }
        console.error(`❌ Error response body:`, errorText);
        console.error(`❌ URL solicitada: ${API_BASE_URL}${endpoint}`);
        console.error(`❌ Status: ${res.status} ${res.statusText}`);
      }

      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") ? res.json() : res.text();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`🚨 Error de red en ${endpoint}:`, error);
    }
    throw error;
  }
}
