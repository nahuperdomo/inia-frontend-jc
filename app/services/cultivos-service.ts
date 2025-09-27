import { apiFetch } from "@/app/services/api"

// Types (using the correct enum-based structure)
export interface CultivoCatalogo {
  catalogoID: number;
  nombreComun: string;
  nombreCientifico: string;
  tipoMYCCatalogo: 'MALEZA' | 'CULTIVO' | 'BRASSICA';
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

// Get only cultivos (using the dedicated endpoint)
export async function obtenerCultivos(): Promise<CultivoCatalogo[]> {
  return apiFetch("/api/malezas-cultivos/cultivos");
}

// Get all active items (for backward compatibility)
export async function obtenerTodosActivosCultivos(): Promise<CultivoCatalogo[]> {
  const data = await apiFetch("/api/malezas-cultivos") as CultivoCatalogo[];
  return data.filter((item) => item.tipoMYCCatalogo === 'CULTIVO');
}
