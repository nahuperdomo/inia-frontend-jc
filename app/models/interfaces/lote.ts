import { TipoMYCCatalogo, EstadoLote } from '../types/enums';
import { DatosHumedadDTO } from './common';

export interface LoteDTO {
  loteID: number;
  numeroFicha: number;
  ficha: string;
  fechaIngreso: string; // LocalDateTime as string
  fechaVencimiento?: string; // LocalDate as string
  
  // Catalog references
  cultivarID: number;
  empresaID: number;
  
  // Nested data
  datosHumedad: DatosHumedadDTO[];
  
  // Metadata
  estado: EstadoLote;
  fechaCreacion: string; // LocalDateTime as string
  observaciones?: string;
}

export interface LoteRequestDTO {
  numeroFicha: number;
  ficha: string;
  fechaIngreso: string; // LocalDateTime as string
  fechaVencimiento?: string; // LocalDate as string
  
  // Catalog references
  cultivarID: number;
  empresaID: number;
  
  // Nested data
  datosHumedad: DatosHumedadDTO[];
  
  observaciones?: string;
}

export interface ResponseListadoLote {
  lotes: LoteDTO[];
}