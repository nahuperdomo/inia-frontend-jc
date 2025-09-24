import { apiFetch } from "./api";

export interface AnalisisPayload {
  loteID: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  cumpleEstandar?: boolean;
  comentarios?: string;
}

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
