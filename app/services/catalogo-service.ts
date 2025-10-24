import { apiFetch } from "./api";
import { CatalogoDTO, CatalogoRequestDTO } from "../models";

// Funciones de catálogo
export async function obtenerTodosCatalogos(): Promise<CatalogoDTO[]> {
  return apiFetch("/catalogo");
}

export async function obtenerCatalogoPorTipo(tipo: string): Promise<CatalogoDTO[]> {
  return apiFetch(`/catalogo/tipo/${tipo}`);
}

export async function obtenerCatalogoPorId(id: number): Promise<CatalogoDTO> {
  return apiFetch(`/catalogo/${id}`);
}

export async function crearCatalogo(solicitud: CatalogoRequestDTO): Promise<CatalogoDTO> {
  return apiFetch("/catalogo", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarCatalogo(id: number, solicitud: CatalogoRequestDTO): Promise<CatalogoDTO> {
  return apiFetch(`/catalogo/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarCatalogo(id: number): Promise<void> {
  return apiFetch(`/catalogo/${id}`, {
    method: "DELETE",
  });
}

export async function eliminarCatalogoFisicamente(id: number): Promise<void> {
  return apiFetch(`/catalogo/${id}/fisico`, {
    method: "DELETE",
  });
}

// Funciones específicas para tipos de catálogo
export async function obtenerTiposHumedad(): Promise<any[]> {
  return apiFetch("/catalogo/humedad");
}

export async function obtenerNumerosArticulo(): Promise<any[]> {
  return apiFetch("/catalogo/articulos");
}

export async function obtenerOrigenes(): Promise<any[]> {
  return apiFetch("/catalogo/origenes");
}

export async function obtenerEstados(): Promise<any[]> {
  return apiFetch("/catalogo/estados");
}

export async function obtenerDepositos(): Promise<any[]> {
  return apiFetch("/catalogo/depositos");
}