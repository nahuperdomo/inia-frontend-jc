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

export interface CursorPageResponse<T> {
  items: T[]
  nextCursor: string | null  // Base64-encoded cursor
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
  return await apiFetch<DashboardStats>("/dashboard/stats")
}

export async function obtenerAnalisisPendientes(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<AnalisisPendiente>> {
  return await apiFetch<PaginatedResponse<AnalisisPendiente>>(
    `/dashboard/analisis-pendientes?page=${page}&size=${size}`
  )
}

export async function obtenerAnalisisPorAprobar(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<AnalisisPorAprobar>> {
  return await apiFetch<PaginatedResponse<AnalisisPorAprobar>>(
    `/dashboard/analisis-por-aprobar?page=${page}&size=${size}`
  )
}

/**
 * Keyset pagination para análisis pendientes.
 * Más eficiente para scroll infinito / "cargar más".
 * 
 * @param cursor Base64-encoded cursor (null para primera página)
 * @param size Número de items por página
 */
export async function obtenerAnalisisPendientesKeyset(
  cursor?: string | null,
  size: number = 20
): Promise<CursorPageResponse<AnalisisPendiente>> {
  const params = new URLSearchParams({ size: size.toString() })
  if (cursor) params.append("cursor", cursor)
  
  return await apiFetch<CursorPageResponse<AnalisisPendiente>>(
    `/dashboard/analisis-pendientes/keyset?${params.toString()}`
  )
}

/**
 * Keyset pagination para análisis por aprobar.
 * Más eficiente para scroll infinito / "cargar más".
 * 
 * @param cursor Base64-encoded cursor (null para primera página)
 * @param size Número de items por página
 */
export async function obtenerAnalisisPorAprobarKeyset(
  cursor?: string | null,
  size: number = 20
): Promise<CursorPageResponse<AnalisisPorAprobar>> {
  const params = new URLSearchParams({ size: size.toString() })
  if (cursor) params.append("cursor", cursor)
  
  return await apiFetch<CursorPageResponse<AnalisisPorAprobar>>(
    `/dashboard/analisis-por-aprobar/keyset?${params.toString()}`
  )
}
