import { apiFetch } from "./api"
import type { LegadoSimpleDTO, LegadoDTO, LegadoListadoDTO } from "@/app/models/interfaces/legado"

const legadoService = {
  // Obtener todos los legados
  getAll: async (): Promise<LegadoSimpleDTO[]> => {
    return apiFetch("/api/legados")
  },

  // Obtener un legado por ID
  getById: async (id: number): Promise<LegadoDTO> => {
    return apiFetch(`/api/legados/${id}`)
  },

  // Obtener legados por archivo
  getByArchivo: async (nombreArchivo: string): Promise<LegadoSimpleDTO[]> => {
    return apiFetch(`/api/legados/archivo/${nombreArchivo}`)
  },

  // Obtener legados por ficha
  getByFicha: async (ficha: string): Promise<LegadoSimpleDTO[]> => {
    return apiFetch(`/api/legados/ficha/${ficha}`)
  },

  // Desactivar un legado
  delete: async (id: number): Promise<void> => {
    await apiFetch(`/api/legados/${id}`, {
      method: "DELETE"
    })
  },
}

/**
 * Obtener legados paginados con filtros
 */
export async function obtenerLegadosPaginadas(
  page: number = 0,
  size: number = 10,
  searchTerm?: string,
  especie?: string,
  fechaReciboInicio?: string,
  fechaReciboFin?: string
): Promise<{
  content: LegadoListadoDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
  first: boolean;
}> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());

  if (searchTerm && searchTerm.trim()) {
    params.append('search', searchTerm.trim());
  }

  if (especie && especie !== 'todos') {
    params.append('especie', especie);
  }

  if (fechaReciboInicio) {
    params.append('fechaReciboInicio', fechaReciboInicio);
  }

  if (fechaReciboFin) {
    params.append('fechaReciboFin', fechaReciboFin);
  }

  return apiFetch(`/api/legados/listado?${params.toString()}`);
}

/**
 * Obtener todas las especies únicas de legados
 */
export async function obtenerEspeciesUnicas(): Promise<string[]> {
  return apiFetch('/api/legados/especies');
}

export default legadoService