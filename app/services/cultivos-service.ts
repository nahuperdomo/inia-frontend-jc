import { apiFetch } from "@/app/services/api";
import { MalezasYCultivosCatalogoDTO } from "../models";

// Get only cultivos (using the dedicated endpoint)
export async function obtenerCultivos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/malezas-cultivos/cultivos");
}

// Get all active items (for backward compatibility)
export async function obtenerTodosActivosCultivos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  const data = await apiFetch("/api/malezas-cultivos") as MalezasYCultivosCatalogoDTO[];
  return data.filter((item) => item.tipoMYCCatalogo === 'CULTIVO');
}
