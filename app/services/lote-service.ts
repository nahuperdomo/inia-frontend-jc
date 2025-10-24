import { apiFetch } from "./api";
import { 
  LoteDTO, 
  LoteRequestDTO, 
  ResponseListadoLote,
  LoteSimpleDTO,
  ResponseListadoLoteSimple
} from "../models";
import { TipoAnalisis } from "../models/types/enums";

// Lote functions
export async function obtenerLotesActivos(): Promise<LoteSimpleDTO[]> {
  const res = await apiFetch("/api/lotes/activos") as ResponseListadoLoteSimple;
  return res.lotes || [];
}

export async function obtenerLotesInactivos(): Promise<LoteSimpleDTO[]> {
  const res = await apiFetch("/api/lotes/inactivos") as ResponseListadoLoteSimple;
  return res.lotes || [];
}

export async function obtenerLotePorId(id: number): Promise<LoteDTO> {
  return apiFetch(`/api/lotes/${id}`);
}

export async function crearLote(solicitud: LoteRequestDTO): Promise<LoteDTO> {
  return apiFetch("/api/lotes", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarLote(id: number, solicitud: LoteRequestDTO): Promise<LoteDTO> {
  return apiFetch(`/api/lotes/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarLote(id: number): Promise<void> {
  return apiFetch(`/api/lotes/${id}`, {
    method: "DELETE",
  });
}

export async function activarLote(id: number): Promise<LoteDTO> {
  return apiFetch(`/api/lotes/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function obtenerLotesElegiblesParaTipoAnalisis(tipoAnalisis: TipoAnalisis): Promise<LoteSimpleDTO[]> {
  const res = await apiFetch(`/api/lotes/elegibles/${tipoAnalisis}`) as ResponseListadoLoteSimple;
  return res.lotes || [];
}

/**
 * Verifica si un tipo de análisis puede ser removido de un lote
 * Un tipo puede removerse si:
 * - No tiene análisis de ese tipo
 * - Todos sus análisis están en estado "A_REPETIR"
 */
export async function puedeRemoverTipoAnalisis(loteID: number, tipoAnalisis: TipoAnalisis): Promise<{ puedeRemover: boolean; razon?: string }> {
  try {
    const response = await apiFetch(`/api/lotes/${loteID}/puede-remover-tipo/${tipoAnalisis}`);
    return response;
  } catch (error) {
    console.error('Error al verificar si puede remover tipo de análisis:', error);
    return { 
      puedeRemover: false, 
      razon: 'Error al verificar el estado del análisis' 
    };
  }
}

/**
 * Obtiene los lotes elegibles para un tipo específico de análisis
 * Solo incluye lotes que:
 * 1. Tienen el tipo de análisis asignado en su lista de tipos
 * 2. No tienen análisis existentes de ese tipo O tienen análisis en estado "A_REPETIR"
 */
export async function obtenerLotesElegibles(tipoAnalisis: TipoAnalisis): Promise<LoteSimpleDTO[]> {
  try {
    return await obtenerLotesElegiblesParaTipoAnalisis(tipoAnalisis);
  } catch (error) {
    console.error('Error al obtener lotes elegibles:', error);
    throw error;
  }
}

/**
 * Valida si un lote específico es elegible para un tipo de análisis
 */
export async function validarLoteElegible(loteID: number, tipoAnalisis: TipoAnalisis): Promise<boolean> {
  try {
    const lotesElegibles = await obtenerLotesElegibles(tipoAnalisis);
    return lotesElegibles.some(lote => lote.loteID === loteID);
  } catch (error) {
    console.error('Error al validar lote elegible:', error);
    return false;
  }
}
export async function obtenerLotesPaginadas(
  page: number = 0, 
  size: number = 10,
  searchTerm?: string,
  activo?: boolean | null,
  cultivar?: string
): Promise<{ 
  content: LoteSimpleDTO[]; 
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
  
  if (activo !== null && activo !== undefined) {
    params.append('activo', activo.toString());
  }
  
  if (cultivar && cultivar !== 'todos') {
    params.append('cultivar', cultivar);
  }
  
  return apiFetch(`/api/lotes/listado?${params.toString()}`);
}

export async function obtenerEstadisticasLotes(): Promise<{
  total: number;
  activos: number;
  inactivos: number;
}> {
  return apiFetch('/api/lotes/estadisticas');
}
