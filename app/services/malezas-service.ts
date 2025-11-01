import { apiFetch } from "./api";
import { 
  MalezasCatalogoDTO,
  MalezasCatalogoRequestDTO
} from "../models";

// ========================
// MALEZAS SERVICE
// ========================

// Obtener todas las malezas activas
export async function obtenerTodasMalezas(): Promise<MalezasCatalogoDTO[]> {
  return apiFetch("/api/malezas");
}

// Obtener malezas inactivas
export async function obtenerMalezasInactivas(): Promise<MalezasCatalogoDTO[]> {
  return apiFetch("/api/malezas/inactivos");
}

// Alias para compatibilidad con código existente
export async function obtenerMalezas(): Promise<MalezasCatalogoDTO[]> {
  return apiFetch("/api/malezas");
}

// Funciones de busqueda
export async function buscarPorNombreComun(nombre: string): Promise<MalezasCatalogoDTO[]> {
  return apiFetch(`/api/malezas/buscar/comun?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarPorNombreCientifico(nombre: string): Promise<MalezasCatalogoDTO[]> {
  return apiFetch(`/api/malezas/buscar/cientifico?nombre=${encodeURIComponent(nombre)}`);
}

// Obtener por ID
export async function obtenerPorId(id: number): Promise<MalezasCatalogoDTO> {
  return apiFetch(`/api/malezas/${id}`);
}

// CRUD (solo admin)
export async function crearMaleza(solicitud: MalezasCatalogoRequestDTO): Promise<MalezasCatalogoDTO> {
  return apiFetch("/api/malezas", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarMaleza(id: number, solicitud: MalezasCatalogoRequestDTO): Promise<MalezasCatalogoDTO> {
  return apiFetch(`/api/malezas/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarMaleza(id: number): Promise<void> {
  return apiFetch(`/api/malezas/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarMaleza(id: number): Promise<MalezasCatalogoDTO> {
  return apiFetch(`/api/malezas/${id}/reactivar`, {
    method: "PUT",
  });
}

// Función de listado paginado
export async function obtenerMalezasPaginadas(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean
): Promise<{ content: MalezasCatalogoDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());

  const response = await apiFetch(`/api/malezas/listado?${params.toString()}`);
  
  // Manejar ambos formatos de respuesta (con y sin objeto 'page')
  const content = response.content || [];
  const pageMeta = response.page ? response.page : response;
  
  return {
    content,
    totalElements: pageMeta.totalElements || 0,
    totalPages: pageMeta.totalPages || 0,
    last: pageMeta.last || false,
    first: pageMeta.first || true
  };
}
