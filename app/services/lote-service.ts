import { apiFetch } from "./api";
import { 
  LoteDTO, 
  LoteRequestDTO, 
  ResponseListadoLote,
  LoteSimpleDTO,
  ResponseListadoLoteSimple
} from "../models";

// Lote functions
export async function obtenerLotesActivos(): Promise<LoteSimpleDTO[]> {
  const res = await apiFetch("/api/lotes/activos") as ResponseListadoLoteSimple;
  return res.lotes || [];
}

export async function obtenerLotesInactivos(): Promise<LoteSimpleDTO[]> {
  const res = await apiFetch("/api/lotes/inactivos") as ResponseListadoLoteSimple;
  return res.lotes || [];
}

export async function obtenerLotePorId(id: number): Promise<LoteDTO> {
  return apiFetch(`/api/lotes/${id}`);
}

export async function crearLote(solicitud: LoteRequestDTO): Promise<LoteDTO> {
  return apiFetch("/api/lotes", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarLote(id: number, solicitud: LoteRequestDTO): Promise<LoteDTO> {
  return apiFetch(`/api/lotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarLote(id: number): Promise<void> {
  return apiFetch(`/api/lotes/${id}`, {
    method: "DELETE",
  });
}
