import { EstadoAnalisis } from '../types/enums';

export interface AnalisisHistorialDTO {
  id: number;
  fechaHora: string; // LocalDateTime as string (el backend lo envía así, no fechaCambio)
  accion: string; // Tipo de acción realizada
  usuario: string;
  estadoAnterior?: EstadoAnalisis; // Opcional por si algunos registros no lo tienen
  estadoNuevo?: EstadoAnalisis; // Opcional por si algunos registros no lo tienen
}

// Base DTO for all analysis responses
export interface AnalisisDTO {
  analisisID: number;
  idLote?: number; // ID del lote
  lote: string; // Nombre del lote (nomLote)
  ficha?: string; // Ficha del lote
  cultivarNombre?: string; // Nombre del cultivar
  especieNombre?: string; // Nombre de la especie
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
