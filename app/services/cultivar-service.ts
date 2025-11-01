import { apiFetch } from "./api";
import { CultivarDTO, CultivarRequestDTO } from "../models";

// Funciones de cultivares
export async function obtenerTodosCultivares(activo?: boolean | null): Promise<CultivarDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/cultivar?${queryString}` : '/cultivar';
  const response = await apiFetch(url);

  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.cultivares && Array.isArray(response.cultivares)) {
    return response.cultivares;
  }
  console.warn("Formato de respuesta inesperado en obtenerTodosCultivares:", response);
  return [];
}

export async function obtenerCultivaresInactivos(): Promise<CultivarDTO[]> {
  return apiFetch("/cultivar/inactivos");
}

export async function obtenerCultivaresPorEspecie(especieID: number): Promise<CultivarDTO[]> {
  return apiFetch(`/cultivar/especie/${especieID}`);
}

export async function buscarCultivaresPorNombre(nombre: string): Promise<CultivarDTO[]> {
  return apiFetch(`/cultivar/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function obtenerCultivarPorId(id: number): Promise<CultivarDTO> {
  return apiFetch(`/cultivar/${id}`);
}

export async function crearCultivar(solicitud: CultivarRequestDTO): Promise<CultivarDTO> {
  return apiFetch("/cultivar", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarCultivar(id: number, solicitud: CultivarRequestDTO): Promise<CultivarDTO> {
  return apiFetch(`/cultivar/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarCultivar(id: number): Promise<void> {
  return apiFetch(`/cultivar/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarCultivar(id: number): Promise<CultivarDTO> {
  return apiFetch(`/cultivar/${id}/reactivar`, {
    method: "PUT",
  });
}

// Función de listado paginado
export async function obtenerCultivaresPaginados(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean
): Promise<{ content: CultivarDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());

  const data = await apiFetch(`/cultivar/listado?${params.toString()}`);

  // Manejar ambos formatos de respuesta
  const pageMeta = (data as any).page ? (data as any).page : (data as any);

  return {
    content: data.content || [],
    totalElements: pageMeta.totalElements || 0,
    totalPages: pageMeta.totalPages || 0,
    last: pageMeta.last !== undefined ? pageMeta.last : true,
    first: pageMeta.first !== undefined ? pageMeta.first : true
  };
}
