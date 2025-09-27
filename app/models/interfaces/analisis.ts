import { EstadoAnalisis } from '../types/enums';

export interface AnalisisHistorialDTO {
  id: number;
  fechaCambio: string; // LocalDateTime as string
  estadoAnterior: EstadoAnalisis;
  estadoNuevo: EstadoAnalisis;
  usuario: string;
}

// Base DTO for all analysis responses
export interface AnalisisDTO {
  analisisID: number;
  lote: string;
  estado: EstadoAnalisis;
  fechaInicio: string; // LocalDateTime as string
  fechaFin?: string; // LocalDateTime as string
  comentarios?: string;
  historial: AnalisisHistorialDTO[];
}

// Base DTO for all analysis requests
export interface AnalisisRequestDTO {
  idLote: number;
  comentarios?: string;
}