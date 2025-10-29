export interface ReporteGeneralDTO {
  totalAnalisis: number;
  analisisPorPeriodo: Record<string, number>;
  analisisPorEstado: Record<string, number>;
  porcentajeCompletitud: Record<string, number>;
  tiempoMedioFinalizacion: number;
  topAnalisisProblemas: Record<string, number>;
}

export interface ReporteGerminacionDTO {
  mediaGerminacionPorEspecie: Record<string, number>;
  tiempoPromedioPrimerConteo: Record<string, number>;
  tiempoPromedioUltimoConteo: Record<string, number>;
  totalGerminaciones: number;
}

export interface ReportePMSDTO {
  totalPms: number;
  muestrasConCVSuperado: number;
  porcentajeMuestrasConCVSuperado: number;
  muestrasConRepeticionesMaximas: number;
}

export interface ReportePurezaDTO {
  contaminantesPorEspecie: Record<string, number>;
  porcentajeMalezas: Record<string, number>;
  porcentajeOtrasSemillas: Record<string, number>;
  porcentajeCumpleEstandar: Record<string, number>;
  totalPurezas: number;
}

export interface ReporteTetrazolioDTO {
  viabilidadPorEspecie: Record<string, number>;
  totalTetrazolios: number;
}

export interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
}
