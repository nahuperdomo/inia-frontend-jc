import { apiFetch } from "./api";
import { 
  AnalisisPayload, 
  AnalisisGenerico, 
  ResumenAnalisis,
  AnalisisPorLoteResponse 
} from "../models";

// Funciones genéricas para análisis
export async function registrarAnalisis(payload: AnalisisPayload, tipo: string) {
  let endpoint = "";
  switch (tipo) {
    case "pureza":
      endpoint = "/api/purezas";
      break;
    case "dosn":
      endpoint = "/api/dosn";
      break;
    case "germinacion":
      endpoint = "/api/germinaciones";
      break;
    case "pms":
      endpoint = "/api/pms";
      break;
    case "tetrazolio":
      endpoint = "/api/tetrazolios";
      break;
    default:
      throw new Error("Tipo de análisis no soportado");
  }
  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Obtener todos los análisis de un lote
export async function obtenerAnalisisPorLote(loteID: number): Promise<AnalisisPorLoteResponse> {
  const [purezas, germinaciones, tetrazolios, pms, dosns] = await Promise.all([
    apiFetch(`/api/purezas/lote/${loteID}`).catch(() => []),
    apiFetch(`/api/germinaciones/lote/${loteID}`).catch(() => []),
    apiFetch(`/api/tetrazolios/lote/${loteID}`).catch(() => []),
    apiFetch(`/api/pms/lote/${loteID}`).catch(() => []),
    apiFetch(`/api/dosn/lote/${loteID}`).catch(() => []),
  ]);

  return {
    purezas,
    germinaciones,
    tetrazolios,
    pms,
    dosns,
  };
}

// Funciones específicas para DOSN
export async function obtenerDosnPorId(id: string) {
  return apiFetch(`/api/dosn/${id}`);
}

export async function obtenerDosnPorLote(loteID: string) {
  return apiFetch(`/api/dosn/lote/${loteID}`);
}

// Cambiar estado de un análisis
export async function cambiarEstadoAnalisis(
  tipo: string, 
  id: number, 
  accion: 'finalizar' | 'aprobar' | 'repetir'
): Promise<any> {
  let endpoint = "";
  switch (tipo) {
    case "pureza":
      endpoint = `/api/purezas/${id}/${accion}`;
      break;
    case "germinacion":
      endpoint = `/api/germinaciones/${id}/${accion}`;
      break;
    case "tetrazolio":
      endpoint = `/api/tetrazolios/${id}/${accion}`;
      break;
    case "pms":
      endpoint = `/api/pms/${id}/${accion}`;
      break;
    case "dosn":
      endpoint = `/api/dosn/${id}/${accion}`;
      break;
    default:
      throw new Error("Tipo de análisis no soportado");
  }
  
  return apiFetch(endpoint, {
    method: "PUT",
  });
}

// Obtener resumen de análisis por estado
export async function obtenerResumenAnalisis(loteID: number): Promise<ResumenAnalisis> {
  const analises = await obtenerAnalisisPorLote(loteID);
  
  const todosList = [
    ...analises.purezas,
    ...analises.germinaciones,
    ...analises.tetrazolios,
    ...analises.pms,
    ...analises.dosns,
  ];

  return {
    total: todosList.length,
    pendientes: todosList.filter(a => a.estado === 'PENDIENTE' || a.estado === 'EN_PROCESO').length,
    finalizados: todosList.filter(a => a.estado === 'FINALIZADO' || a.estado === 'PENDIENTE_APROBACION').length,
    aprobados: todosList.filter(a => a.estado === 'APROBADO').length,
    parRepetir: todosList.filter(a => a.estado === 'PARA_REPETIR').length,
  };
}
