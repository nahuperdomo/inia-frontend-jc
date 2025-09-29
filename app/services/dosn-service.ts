import { apiFetch } from "./api";
import { 
  DosnDTO, 
  DosnRequestDTO, 
  ResponseListadoDosn,
  MalezasYCultivosCatalogoDTO 
} from "../models";

// DOSN functions
export async function crearDosn(solicitud: DosnRequestDTO): Promise<DosnDTO> {
  return apiFetch("/api/dosn", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasDosnActivas(): Promise<DosnDTO[]> {
  const res = await apiFetch("/api/dosn") as ResponseListadoDosn;
  return res.dosns || [];
}

export async function obtenerDosnPorId(id: number): Promise<DosnDTO> {
  return apiFetch(`/api/dosn/${id}`);
}

export async function actualizarDosn(id: number, solicitud: DosnRequestDTO): Promise<DosnDTO> {
  return apiFetch(`/api/dosn/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarDosn(id: number): Promise<void> {
  return apiFetch(`/api/dosn/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerDosnPorIdLote(idLote: number): Promise<DosnDTO[]> {
  return apiFetch(`/api/dosn/lote/${idLote}`);
}

export async function obtenerTodosCatalogos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/dosn/catalogos");
}

export async function finalizarAnalisis(id: number): Promise<DosnDTO> {
  return apiFetch(`/api/dosn/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<DosnDTO> {
  return apiFetch(`/api/dosn/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<DosnDTO> {
  return apiFetch(`/api/dosn/${id}/repetir`, {
    method: "PUT",
  });
}