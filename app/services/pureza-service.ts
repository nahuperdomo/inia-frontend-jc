import { apiFetch } from "./api";
import {
  PurezaDTO,
  PurezaRequestDTO,
  ResponseListadoPureza,
  MalezasYCultivosCatalogoDTO
} from "../models";

// Pureza functions
export async function crearPureza(solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch("/purezas", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasPurezasActivas(): Promise<PurezaDTO[]> {
  try {
    const data = await apiFetch("/purezas");

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
  return apiFetch(`/purezas/${id}`);
}

export async function actualizarPureza(id: number, solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch(`/purezas/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarPureza(id: number): Promise<void> {
  return apiFetch(`/purezas/${id}`, {
    method: "DELETE",
  });
}

export async function desactivarPureza(id: number): Promise<void> {
  return apiFetch(`/purezas/${id}/desactivar`, {
    method: "PUT",
  });
}

export async function activarPureza(id: number): Promise<PurezaDTO> {
  return apiFetch(`/purezas/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function obtenerPurezasPorIdLote(idLote: number): Promise<PurezaDTO[]> {
  return apiFetch(`/purezas/lote/${idLote}`);
}

export async function obtenerTodosCatalogos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/purezas/catalogos");
}

export async function obtenerPurezasPaginadas(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean,
  estado?: string,
  loteId?: number
): Promise<{ content: PurezaDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());
  if (estado) params.append("estado", estado);
  if (loteId !== undefined) params.append("loteId", loteId.toString());

  return apiFetch(`/purezas/listado?${params.toString()}`);
}

export async function finalizarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/purezas/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/purezas/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<PurezaDTO> {
  return apiFetch(`/purezas/${id}/repetir`, {
    method: "PUT",
  });
}