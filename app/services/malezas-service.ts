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
