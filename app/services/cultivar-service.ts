import { apiFetch } from "./api";
import { CultivarDTO, CultivarRequestDTO } from "../models";

// Funciones de cultivares
export async function obtenerTodosCultivares(): Promise<CultivarDTO[]> {
  const response = await apiFetch("/cultivar");
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