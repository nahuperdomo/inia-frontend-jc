// URL para desarrollo local (frontend local y backend en Docker)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getToken() {
  // Método profesional: leer token de HttpOnly cookies
  // Las cookies se envían automáticamente, pero también podemos leerlas si no son HttpOnly
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

  console.log(`🔍 API Call: ${endpoint}`);
  console.log(`🔑 Token encontrado: ${token ? '✅ Sí' : '❌ No'}`);
  console.log(`🌐 URL completa: ${API_BASE_URL}${endpoint}`);

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  console.log(`📤 Headers enviados:`, headers);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      credentials: "include", // Esto es importante para enviar cookies
      ...options,
    });

    console.log(`📥 Response status: ${res.status}`);
    console.log(`📥 Response headers:`, Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error response body:`, errorText);
      console.error(`❌ URL solicitada: ${API_BASE_URL}${endpoint}`);
      console.error(`❌ Status: ${res.status} ${res.statusText}`);

      // Intenta parsear como JSON si es posible para obtener más detalles
      let errorDetail;
      try {
        if (errorText && errorText.trim().startsWith('{')) {
          errorDetail = JSON.parse(errorText);
          console.error('❌ Error JSON detallado:', errorDetail);
        }
      } catch (jsonError) {
        // Si no se puede parsear como JSON, usar el texto como está
      }

      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json") ? res.json() : res.text();
  } catch (error) {
    console.error(`🚨 Error de red en ${endpoint}:`, error);
    throw error;
  }
}
