import { apiFetch } from "./api";
import { CatalogoDTO, CatalogoRequestDTO } from "../models";

// Tipos para opciones de formularios
export type CatalogoOption = { id: number; nombre: string };
export type TipoOption = { id: string; nombre: string };

// Funciones de catálogo
export async function obtenerTodosCatalogos(): Promise<CatalogoDTO[]> {
  return apiFetch("/api/catalogo");
}

export async function obtenerCatalogoPorTipo(tipo: string, activo?: boolean | null): Promise<CatalogoDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/api/catalogo/tipo/${tipo}?${queryString}` : `/api/catalogo/tipo/${tipo}`;
  return apiFetch(url);
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

export async function reactivarCatalogo(id: number): Promise<CatalogoDTO> {
  return apiFetch(`/api/catalogo/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function eliminarCatalogoFisicamente(id: number): Promise<void> {
  return apiFetch(`/api/catalogo/${id}/fisico`, {
    method: "DELETE",
  });
}

// Funciones específicas para tipos de catálogo con formato para formularios
export async function obtenerTiposHumedad(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/humedad");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerNumerosArticulo(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/articulos");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerOrigenes(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/origenes");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerEstados(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/estados");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerDepositos(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/depositos");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}

export async function obtenerUnidadesEmbolsado(): Promise<Array<{id: number, nombre: string}>> {
  const response = await apiFetch("/api/catalogo/unidades-embolsado");
  return response.map((item: any) => ({ id: item.id, nombre: item.valor }));
}
