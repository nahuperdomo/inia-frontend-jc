import { apiFetch } from "./api";
import { CatalogoDTO, CatalogoRequestDTO } from "../models";

// Funciones de catálogo
export async function obtenerTodosCatalogos(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo");
}

export async function obtenerCatalogoPorTipo(tipo: string): Promise<CatalogoDTO[]> {
  return apiFetch(`/api/catalogo/tipo/${tipo}`);
}

export async function obtenerCatalogoPorId(id: number): Promise<CatalogoDTO> {
  return apiFetch(`/api/catalogo/${id}`);
}

export async function crearCatalogo(solicitud: CatalogoRequestDTO): Promise<CatalogoDTO> {
  return apiFetch("/api/catalogo", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarCatalogo(id: number, solicitud: CatalogoRequestDTO): Promise<CatalogoDTO> {
  return apiFetch(`/api/catalogo/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarCatalogo(id: number): Promise<void> {
  return apiFetch(`/api/catalogo/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarCatalogoFisicamente(id: number): Promise<void> {
  return apiFetch(`/api/catalogo/${id}/fisico`, {
    method: "DELETE",
  });
}

// Funciones específicas para tipos de catálogo
export async function obtenerTiposHumedad(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo/humedad");
}

export async function obtenerNumerosArticulo(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo/articulos");
}

export async function obtenerOrigenes(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo/origenes");
}

export async function obtenerEstados(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo/estados");
}

export async function obtenerDepositos(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo/depositos");
}