import { apiFetch } from "./api";
import { 
  PmsDTO, 
  PmsRequestDTO, 
  ResponseListadoPms 
} from "../models";

// PMS functions
export async function crearPms(solicitud: PmsRequestDTO): Promise<PmsDTO> {
  return apiFetch("/api/pms", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodosPms(): Promise<PmsDTO[]> {
  const res = await apiFetch("/api/pms") as ResponseListadoPms;
  return res.pmss || [];
}

export async function obtenerPmsPorId(id: number): Promise<PmsDTO> {
  return apiFetch(`/api/pms/${id}`);
}

export async function actualizarPms(id: number, solicitud: PmsRequestDTO): Promise<PmsDTO> {
  return apiFetch(`/api/pms/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarPms(id: number): Promise<void> {
  return apiFetch(`/api/pms/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerPmsPorIdLote(idLote: number): Promise<PmsDTO[]> {
  return apiFetch(`/api/pms/lote/${idLote}`);
}

export async function finalizarAnalisis(id: number): Promise<PmsDTO> {
  return apiFetch(`/api/pms/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<PmsDTO> {
  return apiFetch(`/api/pms/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<PmsDTO> {
  return apiFetch(`/api/pms/${id}/repetir`, {
    method: "PUT",
  });
}