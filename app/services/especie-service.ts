import { apiFetch } from "./api";
import { EspecieDTO, EspecieRequestDTO } from "../models";

// Funciones de especies
export async function obtenerTodasEspecies(activo?: boolean | null): Promise<EspecieDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/especie?${queryString}` : '/especie';
  return apiFetch(url);
}

export async function obtenerEspeciesInactivas(): Promise<EspecieDTO[]> {
  return apiFetch("/especie/inactivas");
}

export async function buscarEspeciesPorNombreComun(nombre: string): Promise<EspecieDTO[]> {
  return apiFetch(`/especie/buscar/comun?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarEspeciesPorNombreCientifico(nombre: string): Promise<EspecieDTO[]> {
  return apiFetch(`/especie/buscar/cientifico?nombre=${encodeURIComponent(nombre)}`);
}

export async function obtenerEspeciePorId(id: number): Promise<EspecieDTO> {
  return apiFetch(`/especie/${id}`);
}

export async function crearEspecie(solicitud: EspecieRequestDTO): Promise<EspecieDTO> {
  return apiFetch("/especie", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarEspecie(id: number, solicitud: EspecieRequestDTO): Promise<EspecieDTO> {
  return apiFetch(`/especie/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarEspecie(id: number): Promise<void> {
  return apiFetch(`/especie/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarEspecie(id: number): Promise<EspecieDTO> {
  return apiFetch(`/especie/${id}/reactivar`, {
    method: "PUT",
  });
}

// Función de listado paginado
export async function obtenerEspeciesPaginadas(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean
): Promise<{ content: EspecieDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());

  const response = await apiFetch(`/api/especie/listado?${params.toString()}`);
  
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
