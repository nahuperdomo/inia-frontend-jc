import { EstadoAnalisis } from "@/app/models/types/enums"

/**
 * Convierte los estados de análisis a un formato legible
 */
export function formatearEstado(estado: EstadoAnalisis | string): string {
  switch (estado) {
    case "REGISTRADO":
      return "Registrado"
    case "EN_PROCESO":
      return "En Proceso"
    case "APROBADO":
      return "Aprobado"
    case "PENDIENTE_APROBACION":
      return "Pendiente de Aprobación"
    case "FINALIZADO":
      return "Finalizado"
    case "PENDIENTE":
      return "Pendiente"
    case "PARA_REPETIR":
      return "Para Repetir"
    default:
      // Si viene con guiones bajos, reemplazarlos por espacios y capitalizar
      return estado
        .split("_")
        .map(palabra => palabra.charAt(0) + palabra.slice(1).toLowerCase())
        .join(" ")
  }
}
