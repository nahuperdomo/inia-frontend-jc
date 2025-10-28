import { apiFetch } from "./api";
import { ValoresGermDTO, ValoresGermRequestDTO } from "../models";

// Funciones de ValoresGerm
export async function obtenerValoresPorId(
  germinacionId: number,
  tablaId: number,
  valoresId: number
): Promise<ValoresGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/${valoresId}`);
}

export async function actualizarValores(
  germinacionId: number,
  tablaId: number,
  valoresId: number,
  solicitud: ValoresGermRequestDTO
): Promise<ValoresGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/${valoresId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerValoresPorTabla(
  germinacionId: number,
  tablaId: number
): Promise<ValoresGermDTO[]> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores`);
}

export async function obtenerValoresIniaPorTabla(
  germinacionId: number,
  tablaId: number
): Promise<ValoresGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/inia`);
}

export async function obtenerValoresInasePorTabla(
  germinacionId: number,
  tablaId: number
): Promise<ValoresGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/inase`);
}

export async function obtenerValoresPorTablaEInstituto(
  germinacionId: number,
  tablaId: number,
  instituto: 'INIA' | 'INASE'
): Promise<ValoresGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/instituto?instituto=${instituto}`);
}

export async function eliminarValores(
  germinacionId: number,
  tablaId: number,
  valoresId: number
): Promise<string> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/valores/${valoresId}`, {
    method: "DELETE",
  });
}
