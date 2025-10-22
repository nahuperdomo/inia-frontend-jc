import { apiFetch } from "@/lib/api-client"
import { TipoAnalisis } from "@/app/models/types/enums"

export interface DashboardStats {
  lotesActivos: number
  analisisPendientes: number
  completadosHoy: number
  analisisPorAprobar: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface KeysetCursor {
  lastFecha: string
  lastId: number
}

export interface CursorPageResponse<T> {
  items: T[]
  nextCursor: KeysetCursor | null
  hasMore: boolean
  size: number
}

export interface AnalisisPendiente {
  loteID: number
  nomLote: string
  ficha: string
  especieNombre: string
  cultivarNombre: string
  tipoAnalisis: TipoAnalisis
}

export interface AnalisisPorAprobar {
  tipo: TipoAnalisis
  analisisID: number
  loteID: number
  nomLote: string
  ficha: string
  fechaInicio: string
  fechaFin: string
}

export async function obtenerEstadisticasDashboard(): Promise<DashboardStats> {
  return await apiFetch<DashboardStats>("/api/dashboard/stats")
}

export async function obtenerAnalisisPendientes(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<AnalisisPendiente>> {
  return await apiFetch<PaginatedResponse<AnalisisPendiente>>(
    `/api/dashboard/analisis-pendientes?page=${page}&size=${size}`
  )
}

export async function obtenerAnalisisPorAprobar(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<AnalisisPorAprobar>> {
  return await apiFetch<PaginatedResponse<AnalisisPorAprobar>>(
    `/api/dashboard/analisis-por-aprobar?page=${page}&size=${size}`
  )
}

/**
 * Keyset pagination para análisis pendientes.
 * Más eficiente para scroll infinito / "cargar más".
 */
export async function obtenerAnalisisPendientesKeyset(
  lastLoteId?: number,
  lastTipo?: string,
  size: number = 20
): Promise<CursorPageResponse<AnalisisPendiente>> {
  const params = new URLSearchParams({ size: size.toString() })
  if (lastLoteId !== undefined) params.append("lastLoteId", lastLoteId.toString())
  if (lastTipo !== undefined) params.append("lastTipo", lastTipo)
  
  return await apiFetch<CursorPageResponse<AnalisisPendiente>>(
    `/api/dashboard/analisis-pendientes/keyset?${params.toString()}`
  )
}

/**
 * Keyset pagination para análisis por aprobar.
 * Más eficiente para scroll infinito / "cargar más".
 */
export async function obtenerAnalisisPorAprobarKeyset(
  lastFecha?: string,
  lastId?: number,
  size: number = 20
): Promise<CursorPageResponse<AnalisisPorAprobar>> {
  const params = new URLSearchParams({ size: size.toString() })
  if (lastFecha !== undefined) params.append("lastFecha", lastFecha)
  if (lastId !== undefined) params.append("lastId", lastId.toString())
  
  return await apiFetch<CursorPageResponse<AnalisisPorAprobar>>(
    `/api/dashboard/analisis-por-aprobar/keyset?${params.toString()}`
  )
}
