import { apiFetch } from "./api";
import { 
  GerminacionDTO, 
  GerminacionRequestDTO, 
  ResponseListadoGerminacion 
} from "../models";

// Germinacion functions
export async function crearGerminacion(solicitud: GerminacionRequestDTO): Promise<GerminacionDTO> {
  return apiFetch("/api/germinaciones", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasGerminaciones(): Promise<GerminacionDTO[]> {
  const res = await apiFetch("/api/germinaciones") as ResponseListadoGerminacion;
  return res.germinaciones || [];
}

export async function obtenerGerminacionPorId(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/api/germinaciones/${id}`);
}

export async function actualizarGerminacion(id: number, solicitud: GerminacionRequestDTO): Promise<GerminacionDTO> {
  return apiFetch(`/api/germinaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarGerminacion(id: number): Promise<void> {
  return apiFetch(`/api/germinaciones/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerGerminacionesPorIdLote(idLote: number): Promise<GerminacionDTO[]> {
  return apiFetch(`/api/germinaciones/lote/${idLote}`);
}

export async function finalizarAnalisis(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/api/germinaciones/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/api/germinaciones/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/api/germinaciones/${id}/repetir`, {
    method: "PUT",
  });
}