// URL para desarrollo local (frontend local y backend en Docker)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Cliente API que usa cookies HttpOnly para autenticación.
 * El backend envía tokens en cookies HttpOnly (no accesibles desde JavaScript).
 * fetch() con credentials: 'include' envía automáticamente estas cookies.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // NO se lee ni se envía token manualmente — las cookies HttpOnly se envían automáticamente  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      credentials: "include", // CRÍTICO: envía cookies automáticamente (incluyendo accessToken HttpOnly)
      ...options,
    });));

    if (!res.ok) {
      const errorText = await res.text();
      console.error(` Error response body:`, errorText);
      console.error(` URL solicitada: ${API_BASE_URL}${endpoint}`);
      console.error(` Status: ${res.status} ${res.statusText}`);

      // Intenta parsear como JSON si es posible para obtener más detalles
      let errorDetail;
      try {
        if (errorText && errorText.trim().startsWith('{')) {
          errorDetail = JSON.parse(errorText);
          console.error(' Error JSON detallado:', errorDetail);
        }
      } catch (jsonError) {
        // Si no se puede parsear como JSON, usar el texto como está
      }

      // Extraer el mensaje de error del JSON (puede venir como 'message' o 'error')
      const errorMessage = errorDetail?.message || errorDetail?.error || errorDetail?.mensaje;

      throw new Error(
        errorMessage || `Ocurrió un error inesperado (${res.status}). Por favor, inténtelo nuevamente.`
      );
    }

    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") ? res.json() : res.text();
  } catch (error) {
    console.error(` Error de red en ${endpoint}:`, error);
    throw error;
  }
}
