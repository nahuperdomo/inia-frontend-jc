import { apiFetch } from "@/lib/api-client"
import { TipoAnalisis } from "@/app/models/types/enums"

export interface DashboardStats {
  lotesActivos: number
  analisisPendientes: number
  completadosHoy: number
  analisisPorAprobar: number
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

export async function obtenerAnalisisPendientes(): Promise<AnalisisPendiente[]> {
  return await apiFetch<AnalisisPendiente[]>("/api/dashboard/analisis-pendientes")
}

export async function obtenerAnalisisPorAprobar(): Promise<AnalisisPorAprobar[]> {
  return await apiFetch<AnalisisPorAprobar[]>("/api/dashboard/analisis-por-aprobar")
}
