import { apiFetch } from "./api";
import { EspecieDTO, EspecieRequestDTO } from "../models";

// Funciones de especies
export async function obtenerTodasEspecies(): Promise<EspecieDTO[]> {
  return apiFetch("/especie");
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