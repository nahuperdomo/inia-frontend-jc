import { apiFetch } from "./api";
import {
  DosnDTO,
  DosnRequestDTO,
  ResponseListadoDosn,
  MalezasYCultivosCatalogoDTO
} from "../models";

// DOSN functions
export async function crearDosn(solicitud: DosnRequestDTO): Promise<DosnDTO> {
  return apiFetch("/dosn", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasDosnActivas(): Promise<DosnDTO[]> {
  const res = await apiFetch("/dosn") as ResponseListadoDosn;
  return res.dosns || [];
}

export async function obtenerDosnPorId(id: number): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}`);
}

export async function actualizarDosn(id: number, solicitud: DosnRequestDTO): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarDosn(id: number): Promise<void> {
  return apiFetch(`/dosn/${id}`, {
    method: "DELETE",
  });
}

export async function desactivarDosn(id: number): Promise<void> {
  return apiFetch(`/dosn/${id}/desactivar`, {
    method: "PUT",
  });
}

export async function activarDosn(id: number): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function obtenerDosnPorIdLote(idLote: number): Promise<DosnDTO[]> {
  return apiFetch(`/dosn/lote/${idLote}`);
}

export async function obtenerDosnPaginadas(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean,
  estado?: string,
  loteId?: number
): Promise<{ content: DosnDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());
  if (estado) params.append("estado", estado);
  if (loteId !== undefined) params.append("loteId", loteId.toString());

  return apiFetch(`/dosn/listado?${params.toString()}`);
}

export async function obtenerTodosCatalogos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/dosn/catalogos");
}

export async function finalizarAnalisis(id: number): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<DosnDTO> {
  return apiFetch(`/dosn/${id}/repetir`, {
    method: "PUT",
  });
}