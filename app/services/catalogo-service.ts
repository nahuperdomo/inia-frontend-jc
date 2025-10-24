import { apiFetch } from "./api";
import { CatalogoDTO, CatalogoRequestDTO } from "../models";

// Tipos para opciones de formularios
export type CatalogoOption = { id: number; nombre: string };
export type TipoOption = { id: string; nombre: string };

// Funciones de catálogo
export async function obtenerTodosCatalogos(): Promise<CatalogoDTO[]> {
  return apiFetch("/catalogo");
}

export async function obtenerCatalogoPorTipo(tipo: string, activo?: boolean | null): Promise<CatalogoDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/catalogo/tipo/${tipo}?${queryString}` : `/catalogo/tipo/${tipo}`;
  return apiFetch(url);
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

export async function reactivarCatalogo(id: number): Promise<CatalogoDTO> {
  return apiFetch(`/catalogo/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function eliminarCatalogoFisicamente(id: number): Promise<void> {
  return apiFetch(`/catalogo/${id}/fisico`, {
    method: "DELETE",
  });
}

// Funciones específicas para tipos de catálogo con formato para formularios
export async function obtenerTiposHumedad(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/humedad");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerNumerosArticulo(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/articulos");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerOrigenes(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/origenes");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerEstados(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/estados");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerDepositos(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/depositos");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerUnidadesEmbolsado(): Promise<Array<{ id: number, nombre: string }>> {
  const response = await apiFetch("/catalogo/unidades-embolsado");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}