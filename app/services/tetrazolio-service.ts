import { apiFetch } from "./api";
import {
  TetrazolioDTO,
  TetrazolioRequestDTO,
  ResponseListadoTetrazolio
} from "../models";

// Tetrazolio functions
export async function crearTetrazolio(solicitud: TetrazolioRequestDTO): Promise<TetrazolioDTO> {
  return apiFetch("/tetrazolios", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodosTetrazolio(): Promise<TetrazolioDTO[]> {
  const data = await apiFetch("/tetrazolios");
  return data.tetrazolios || [];
}

export async function obtenerTetrazolioPorId(id: number): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}`);
}

export async function actualizarTetrazolio(id: number, solicitud: TetrazolioRequestDTO): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarTetrazolio(id: number): Promise<void> {
  return apiFetch(`/tetrazolios/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerTetrazoliosPorIdLote(idLote: number): Promise<TetrazolioDTO[]> {
  return apiFetch(`/tetrazolios/lote/${idLote}`);
}

export async function finalizarAnalisis(id: number): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}/repetir`, {
    method: "PUT",
  });
}

export async function actualizarPorcentajesRedondeados(
  id: number,
  porcentajes: {
    porcViablesRedondeo: number;
    porcNoViablesRedondeo: number;
    porcDurasRedondeo: number;
  }
): Promise<TetrazolioDTO> {
  return apiFetch(`/tetrazolios/${id}/porcentajes`, {
    method: "PUT",
    body: JSON.stringify(porcentajes),
  });
}

export async function obtenerTetrazoliosPaginadas(page: number = 0, size: number = 10): Promise<{ content: TetrazolioDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  return apiFetch(`/tetrazolios/listado?page=${page}&size=${size}`);
}