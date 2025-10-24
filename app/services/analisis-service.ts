const API_URL = process.env.NEXT_PUBLIC_API_URL;
import {
  AnalisisGenerico,
  ResumenAnalisis,
  AnalisisPorLoteResponse
} from "../models";

// Funciones genéricas para análisis
export async function registrarAnalisis(payload: any, tipo: string) {
  let endpoint = "";
  switch (tipo) {
    case "pureza":
      endpoint = "/purezas";
      break;
    case "dosn":
      endpoint = "/dosn";
      break;
    case "germinacion":
      endpoint = "/germinaciones";
      break;
    case "pms":
      endpoint = "/pms";
      break;
    case "tetrazolio":
      endpoint = "/tetrazolios";
      break;
    default:
      throw new Error("Tipo de análisis no soportado");
  }

  // Debug log para verificar datos antes de enviar al backend
  console.log("🚀 DEBUG - Enviando al backend:");
  console.log("  - Endpoint:", endpoint);
  if (tipo === "dosn" && payload.listados) {
    console.log(`  - Cantidad de listados: ${payload.listados.length}`);
  } else {
    console.log("  - Tipo de análisis:", tipo);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

// Obtener todos los análisis de un lote
export async function obtenerAnalisisPorLote(loteID: number): Promise<AnalisisPorLoteResponse> {
  const [purezas, germinaciones, tetrazolios, pms, dosns] = await Promise.all([
    fetch(`${API_URL}/purezas/lote/${loteID}`, { credentials: "include", headers: { "Content-Type": "application/json" } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/germinaciones/lote/${loteID}`, { credentials: "include", headers: { "Content-Type": "application/json" } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/tetrazolios/lote/${loteID}`, { credentials: "include", headers: { "Content-Type": "application/json" } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/pms/lote/${loteID}`, { credentials: "include", headers: { "Content-Type": "application/json" } }).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/dosn/lote/${loteID}`, { credentials: "include", headers: { "Content-Type": "application/json" } }).then(r => r.json()).catch(() => []),
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
  const res = await fetch(`${API_URL}/dosn/${id}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function obtenerDosnPorLote(loteID: string) {
  const res = await fetch(`${API_URL}/dosn/lote/${loteID}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
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
      endpoint = `/purezas/${id}/${accion}`;
      break;
    case "germinacion":
      endpoint = `/germinaciones/${id}/${accion}`;
      break;
    case "tetrazolio":
      endpoint = `/tetrazolios/${id}/${accion}`;
      break;
    case "pms":
      endpoint = `/pms/${id}/${accion}`;
      break;
    case "dosn":
      endpoint = `/dosn/${id}/${accion}`;
      break;
    default:
      throw new Error("Tipo de análisis no soportado");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
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
