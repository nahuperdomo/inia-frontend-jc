import { apiFetch } from "@/lib/api-client";
import {
  ReporteGeneralDTO,
  ReporteGerminacionDTO,
  ReportePMSDTO,
  ReportePurezaDTO,
  ReporteTetrazolioDTO,
  FiltrosReporte
} from "@/app/models/interfaces/reportes";

export async function obtenerReporteGeneral(filtros?: FiltrosReporte): Promise<ReporteGeneralDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReporteGeneralDTO>(`/api/reportes/general?${params.toString()}`);
}

export async function obtenerReporteGerminacion(filtros?: FiltrosReporte): Promise<ReporteGerminacionDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReporteGerminacionDTO>(`/api/reportes/germinacion?${params.toString()}`);
}

export async function obtenerReportePms(filtros?: FiltrosReporte): Promise<ReportePMSDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReportePMSDTO>(`/api/reportes/pms?${params.toString()}`);
}

export async function obtenerReportePureza(filtros?: FiltrosReporte): Promise<ReportePurezaDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReportePurezaDTO>(`/api/reportes/pureza?${params.toString()}`);
}

export async function obtenerReporteDosn(filtros?: FiltrosReporte): Promise<ReportePurezaDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReportePurezaDTO>(`/api/reportes/dosn?${params.toString()}`);
}

export async function obtenerContaminantesPureza(especie: string, filtros?: FiltrosReporte): Promise<Record<string, number>> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<Record<string, number>>(`/api/reportes/pureza/contaminantes/${encodeURIComponent(especie)}?${params.toString()}`);
}

export async function obtenerContaminantesDosn(especie: string, filtros?: FiltrosReporte): Promise<Record<string, number>> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<Record<string, number>>(`/api/reportes/dosn/contaminantes/${encodeURIComponent(especie)}?${params.toString()}`);
}

export async function obtenerReporteTetrazolio(filtros?: FiltrosReporte): Promise<ReporteTetrazolioDTO> {
  const params = new URLSearchParams();
  if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
  if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);

  return await apiFetch<ReporteTetrazolioDTO>(`/api/reportes/tetrazolio?${params.toString()}`);
}
