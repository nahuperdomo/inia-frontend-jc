import { apiFetch } from "./api";
import {
  RepGermDTO,
  RepGermRequestDTO,
  RepPmsDTO,
  RepPmsRequestDTO,
  RepTetrazolioViabilidadDTO,
  RepTetrazolioViabilidadRequestDTO,
  TablaGermDTO,
  TablaGermRequestDTO,
  PorcentajesRedondeoRequestDTO
} from "../models";

// ========================
// REPETICIONES DE GERMINACION (RepGerm)
// ========================

// funciones de RepGerm
export async function crearRepGerm(
  germinacionId: number,
  tablaId: number,
  solicitud: RepGermRequestDTO
): Promise<RepGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerRepGermPorId(
  germinacionId: number,
  tablaId: number,
  repeticionId: number
): Promise<RepGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/${repeticionId}`);
}

export async function actualizarRepGerm(
  germinacionId: number,
  tablaId: number,
  repeticionId: number,
  solicitud: RepGermRequestDTO
): Promise<RepGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/${repeticionId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarRepGerm(
  germinacionId: number,
  tablaId: number,
  repeticionId: number
): Promise<string> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/${repeticionId}`, {
    method: "DELETE",
  });
}

export async function obtenerRepeticionesPorTabla(
  germinacionId: number,
  tablaId: number
): Promise<RepGermDTO[]> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion`);
}

export async function contarRepeticionesPorTabla(
  germinacionId: number,
  tablaId: number
): Promise<number> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/contar`);
}

// ========================
// REPETICIONES DE PMS (RepPms)
// ========================

// Funciones de RepPms
export async function crearRepPms(
  pmsId: number,
  solicitud: RepPmsRequestDTO
): Promise<RepPmsDTO> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerRepeticionesPorPms(pmsId: number): Promise<RepPmsDTO[]> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones`);
}

export async function contarRepeticionesPorPms(pmsId: number): Promise<number> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones/count`);
}

export async function obtenerRepPmsPorId(
  pmsId: number,
  repeticionId: number
): Promise<RepPmsDTO> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones/${repeticionId}`);
}

export async function actualizarRepPms(
  pmsId: number,
  repeticionId: number,
  solicitud: RepPmsRequestDTO
): Promise<RepPmsDTO> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones/${repeticionId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarRepPms(
  pmsId: number,
  repeticionId: number
): Promise<void> {
  return apiFetch(`/api/pms/${pmsId}/repeticiones/${repeticionId}`, {
    method: "DELETE",
  });
}

// ========================
// REPETICIONES DE TETRAZOLIO (RepTetrazolioViabilidad)
// ========================

// Funciones de RepTetrazolioViabilidad
export async function crearRepTetrazolioViabilidad(
  tetrazolioId: number,
  solicitud: RepTetrazolioViabilidadRequestDTO
): Promise<RepTetrazolioViabilidadDTO> {
  return apiFetch(`/api/tetrazolios/${tetrazolioId}/repeticiones`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerRepeticionesPorTetrazolio(tetrazolioId: number): Promise<RepTetrazolioViabilidadDTO[]> {
  return apiFetch(`/api/tetrazolios/${tetrazolioId}/repeticiones`);
}

export async function obtenerRepTetrazolioViabilidadPorId(
  tetrazolioId: number,
  repeticionId: number
): Promise<RepTetrazolioViabilidadDTO> {
  return apiFetch(`/api/tetrazolios/${tetrazolioId}/repeticiones/${repeticionId}`);
}

export async function actualizarRepTetrazolioViabilidad(
  tetrazolioId: number,
  repeticionId: number,
  solicitud: RepTetrazolioViabilidadRequestDTO
): Promise<RepTetrazolioViabilidadDTO> {
  return apiFetch(`/api/tetrazolios/${tetrazolioId}/repeticiones/${repeticionId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarRepTetrazolioViabilidad(
  tetrazolioId: number,
  repeticionId: number
): Promise<void> {
  return apiFetch(`/api/tetrazolios/${tetrazolioId}/repeticiones/${repeticionId}`, {
    method: "DELETE",
  });
}

// ========================
// TABLA DE GERMINACION (TablaGerm)
// ========================

// Funciones de TablaGerm
export async function crearTablaGerm(
  germinacionId: number,
  solicitud: TablaGermRequestDTO
): Promise<TablaGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTablasPorGerminacion(germinacionId: number): Promise<TablaGermDTO[]> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla`);
}

export async function contarTablasPorGerminacion(germinacionId: number): Promise<number> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/contar`);
}

export async function obtenerTablaGermPorId(
  germinacionId: number,
  tablaId: number
): Promise<TablaGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}`);
}

export async function actualizarTablaGerm(
  germinacionId: number,
  tablaId: number,
  solicitud: TablaGermRequestDTO
): Promise<TablaGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarTablaGerm(
  germinacionId: number,
  tablaId: number
): Promise<void> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}`, {
    method: "DELETE",
  });
}

export async function finalizarTabla(
  germinacionId: number,
  tablaId: number
): Promise<TablaGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/finalizar`, {
    method: "PUT",
  });
}

export async function puedeIngresarPorcentajes(
  germinacionId: number,
  tablaId: number
): Promise<boolean> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/puede-ingresar-porcentajes`);
}

export async function actualizarPorcentajes(
  germinacionId: number,
  tablaId: number,
  solicitud: PorcentajesRedondeoRequestDTO
): Promise<TablaGermDTO> {
  return apiFetch(`/api/germinacion/${germinacionId}/tabla/${tablaId}/porcentajes`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}
