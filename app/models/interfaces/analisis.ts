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
  idLote?: number; // ID del lote
  lote: string; // Nombre del lote
  estado: EstadoAnalisis;
  fechaInicio: string; // LocalDateTime as string
  fechaFin?: string; // LocalDateTime as string
  comentarios?: string;
  historial: AnalisisHistorialDTO[];
  activo?: boolean; // Campo para soft delete
}

// Base DTO for all analysis requests
export interface AnalisisRequestDTO {
  idLote: number;
  comentarios?: string;
}
