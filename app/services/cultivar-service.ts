import { apiFetch } from "./api";
import { CultivarDTO, CultivarRequestDTO } from "../models";

// Funciones de cultivares
export async function obtenerTodosCultivares(): Promise<CultivarDTO[]> {
  return apiFetch("/api/cultivar");
}

export async function obtenerCultivaresInactivos(): Promise<CultivarDTO[]> {
  return apiFetch("/api/cultivar/inactivos");
}

export async function obtenerCultivaresPorEspecie(especieID: number): Promise<CultivarDTO[]> {
  return apiFetch(`/api/cultivar/especie/${especieID}`);
}

export async function buscarCultivaresPorNombre(nombre: string): Promise<CultivarDTO[]> {
  return apiFetch(`/api/cultivar/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function obtenerCultivarPorId(id: number): Promise<CultivarDTO> {
  return apiFetch(`/api/cultivar/${id}`);
}

export async function crearCultivar(solicitud: CultivarRequestDTO): Promise<CultivarDTO> {
  return apiFetch("/api/cultivar", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarCultivar(id: number, solicitud: CultivarRequestDTO): Promise<CultivarDTO> {
  return apiFetch(`/api/cultivar/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarCultivar(id: number): Promise<void> {
  return apiFetch(`/api/cultivar/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarCultivar(id: number): Promise<CultivarDTO> {
  return apiFetch(`/api/cultivar/${id}/reactivar`, {
    method: "PUT",
  });
}