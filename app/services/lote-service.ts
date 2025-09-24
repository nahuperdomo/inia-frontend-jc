import { apiFetch } from "./api";

export interface LoteSimple {
  loteID: number;
  numeroFicha: number;
  ficha: string;
  activo: boolean;
}

export async function obtenerLotesActivos(): Promise<LoteSimple[]> {
  const res = await apiFetch("/api/lotes/activos");
  // El backend responde { lotes: [...] }
  return res.lotes || [];
}

