import { apiFetch } from "./api";
import {
  PmsDTO,
  PmsRequestDTO,
  ResponseListadoPms
} from "../models";

// PMS functions
export async function crearPms(solicitud: PmsRequestDTO): Promise<PmsDTO> {
  return apiFetch("/pms", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodosPms(): Promise<PmsDTO[]> {
  return apiFetch("/pms") || [];
}

export async function obtenerPmsPorId(id: number): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}`);
}

export async function actualizarPms(id: number, solicitud: PmsRequestDTO): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarPms(id: number): Promise<void> {
  return apiFetch(`/pms/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerPmsPorIdLote(idLote: number): Promise<PmsDTO[]> {
  return apiFetch(`/pms/lote/${idLote}`);
}

export async function obtenerPmsPaginadas(page: number = 0, size: number = 10): Promise<{ content: PmsDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  return apiFetch(`/pms/listado?page=${page}&size=${size}`);
}

export async function finalizarAnalisis(id: number): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}/repetir`, {
    method: "PUT",
  });
}

export async function actualizarPmsConRedondeo(id: number, pmsconRedon: number): Promise<PmsDTO> {
  return apiFetch(`/pms/${id}/redondeo`, {
    method: "PUT",
    body: JSON.stringify({ pmsconRedon }),
  });
}