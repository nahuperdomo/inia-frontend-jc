import { apiFetch } from "./api";
import { EspecieDTO, EspecieRequestDTO } from "../models";

// Funciones de especies
export async function obtenerTodasEspecies(activo?: boolean | null): Promise<EspecieDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/api/especie?${queryString}` : '/api/especie';
  return apiFetch(url);
}

export async function obtenerEspeciesInactivas(): Promise<EspecieDTO[]> {
  return apiFetch("/api/especie/inactivas");
}

export async function buscarEspeciesPorNombreComun(nombre: string): Promise<EspecieDTO[]> {
  return apiFetch(`/api/especie/buscar/comun?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarEspeciesPorNombreCientifico(nombre: string): Promise<EspecieDTO[]> {
  return apiFetch(`/api/especie/buscar/cientifico?nombre=${encodeURIComponent(nombre)}`);
}

export async function obtenerEspeciePorId(id: number): Promise<EspecieDTO> {
  return apiFetch(`/api/especie/${id}`);
}

export async function crearEspecie(solicitud: EspecieRequestDTO): Promise<EspecieDTO> {
  return apiFetch("/api/especie", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarEspecie(id: number, solicitud: EspecieRequestDTO): Promise<EspecieDTO> {
  return apiFetch(`/api/especie/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarEspecie(id: number): Promise<void> {
  return apiFetch(`/api/especie/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarEspecie(id: number): Promise<EspecieDTO> {
  return apiFetch(`/api/especie/${id}/reactivar`, {
    method: "PUT",
  });
}