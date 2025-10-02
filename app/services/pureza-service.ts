import { apiFetch } from "./api";
import {
  PurezaDTO,
  PurezaRequestDTO,
  ResponseListadoPureza,
  MalezasYCultivosCatalogoDTO
} from "../models";

// Pureza specific interfaces extending base classes
// Pureza functions
export async function crearPureza(solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch("/api/purezas", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasPurezasActivas(): Promise<PurezaDTO[]> {
  console.log("🔍 Iniciando petición para obtener purezas...")
  try {
    // Intentamos directamente con el endpoint exacto que vemos en Swagger
    console.log("🔄 Realizando petición a: /api/purezas");

    // Llamada directa a fetch para tener más control sobre los detalles
    const token = localStorage.getItem("token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    console.log(`🔑 Token disponible: ${token ? "Sí" : "No"}`);
    console.log(`🌐 URL completa: ${API_BASE_URL}/api/purezas`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("📤 Headers:", headers);

    const res = await fetch(`${API_BASE_URL}/api/purezas`, {
      method: "GET",
      headers,
      credentials: "include"
    });

    console.log(`📥 Status: ${res.status} ${res.statusText}`);
    console.log(`📥 Headers:`, Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error response:`, errorText);

      // Intentar parsear como JSON si es posible
      try {
        if (errorText && errorText.trim().startsWith('{')) {
          const errorJson = JSON.parse(errorText);
          console.error('❌ Error JSON:', errorJson);
        }
      } catch (e) {
        // Si no se puede parsear, usar el texto como está
      }

      throw new Error(`Error ${res.status}: ${errorText}`);
    }

    const contentType = res.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await res.json() : await res.text();

    console.log("✅ Datos recibidos:", data);

    // Si data es un objeto ResponseListadoPureza, devolver purezas
    if (data && typeof data === 'object' && 'purezas' in data) {
      return data.purezas || [];
    }

    // Si data es un array directamente, devolverlo
    if (Array.isArray(data)) {
      return data;
    }

    // Si no sabemos qué formato es, devolver array vacío
    console.warn("⚠️ Formato de respuesta desconocido:", data);
    return [];
  } catch (error) {
    console.error("❌ Error al obtener purezas:", error);
    throw error;
  }
}

export async function obtenerPurezaPorId(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}`);
}

export async function actualizarPureza(id: number, solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarPureza(id: number): Promise<void> {
  return apiFetch(`/api/purezas/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerPurezasPorIdLote(idLote: number): Promise<PurezaDTO[]> {
  return apiFetch(`/api/purezas/lote/${idLote}`);
}

export async function obtenerTodosCatalogos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/purezas/catalogos");
}

export async function finalizarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/repetir`, {
    method: "PUT",
  });
}