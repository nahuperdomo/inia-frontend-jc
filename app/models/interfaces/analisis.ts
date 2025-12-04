import { EstadoAnalisis } from '../types/enums';

export interface AnalisisHistorialDTO {
  id: number;
  fechaHora: string; 
  accion: string; 
  usuario: string;
  estadoAnterior?: EstadoAnalisis; 
  estadoNuevo?: EstadoAnalisis; 
}


export interface AnalisisDTO {
  analisisID: number;
  idLote?: number; 
  lote: string; 
  ficha?: string; 
  cultivarNombre?: string; 
  especieNombre?: string; 
  estado: EstadoAnalisis;
  fechaInicio: string; 
  fechaFin?: string; 
  comentarios?: string;
  historial: AnalisisHistorialDTO[];
  activo?: boolean; 
}


export interface AnalisisRequestDTO {
  idLote: number;
  comentarios?: string;
}
