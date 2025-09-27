import { apiFetch } from "./api";
import { 
  MalezasYCultivosCatalogoDTO,
  MalezasYCultivosCatalogoRequestDTO,
  TipoMYCCatalogo 
} from "../models";

// ========================
// MALEZAS, CULTIVOS Y BRASSICAS - ALL IN ONE SERVICE
// ========================

// Obtener activos
export async function obtenerTodosActivosMalezasCultivos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos");
}

// Obtener inactivos
export async function obtenerInactivosMalezasCultivos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos/inactivos");
}

// Obtener por tipos
export async function obtenerMalezas(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos/malezas");
}

export async function obtenerCultivos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos/cultivos");
}

export async function obtenerBrassicas(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos/brassicas");
}

export async function obtenerPorTipo(tipo: 'MALEZA' | 'CULTIVO' | 'BRASSICA'): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch(`/api/malezas-cultivos/tipo/${tipo}`);
}

// Funciones de busqueda
export async function buscarPorNombreComun(nombre: string): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch(`/api/malezas-cultivos/buscar/comun?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarPorNombreCientifico(nombre: string): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch(`/api/malezas-cultivos/buscar/cientifico?nombre=${encodeURIComponent(nombre)}`);
}

// Obtener por ID
export async function obtenerPorId(id: number): Promise<MalezasYCultivosCatalogoDTO> {
  return apiFetch(`/api/malezas-cultivos/${id}`);
}

// CRUD (solo admin)
export async function crearMalezaCultivo(solicitud: MalezasYCultivosCatalogoRequestDTO): Promise<MalezasYCultivosCatalogoDTO> {
  return apiFetch("/api/malezas-cultivos", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarMalezaCultivo(id: number, solicitud: MalezasYCultivosCatalogoRequestDTO): Promise<MalezasYCultivosCatalogoDTO> {
  return apiFetch(`/api/malezas-cultivos/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarMalezaCultivo(id: number): Promise<void> {
  return apiFetch(`/api/malezas-cultivos/${id}`, {
    method: "DELETE",
  });
}

export async function reactivarMalezaCultivo(id: number): Promise<MalezasYCultivosCatalogoDTO> {
  return apiFetch(`/api/malezas-cultivos/${id}/reactivar`, {
    method: "PUT",
  });
}
