import { TipoMYCCatalogo, EstadoLote } from '../types/enums';
import { DatosHumedadDTO } from './common';

/**
 * Interfaz completa para un Lote
 */
export interface LoteDTO {
  loteID: number;
  numeroFicha: number;
  ficha: string;
  fechaIngreso: string; // LocalDateTime as string
  fechaVencimiento?: string; // LocalDate as string

  // Información básica
  numeroReferencia?: string;
  lote?: string;
  tipo?: string;
  origen?: string;

  // Catalog references
  cultivarID: number;
  cultivarNombre?: string;

  empresaID: number;
  empresaNombre?: string;
  empresa?: string;

  especieID?: number;
  especieNombre?: string;

  clienteID?: number;
  clienteNombre?: string;
  cliente?: string;

  codigoCC?: string;
  codigoFF?: string;

  // Recepción y almacenamiento
  fechaEntrega?: string;
  fechaRecibo?: string;
  depositoAsignado?: string;
  depositoID?: number;
  unidadEmbalado?: string;
  unidadEmbolsado?: string;
  remitente?: string;
  resultados?: string;

  // Calidad y producción
  kilosBrutos?: number;
  kilosLimpios?: number;
  humedad?: string;
  catSeed?: string;

  // Nested data
  datosHumedad: DatosHumedadDTO[];

  // Metadata
  estado: EstadoLote;
  activo?: boolean;
  fechaCreacion: string; // LocalDateTime as string
  observaciones?: string;

  // Flags
  hasAnalysis?: boolean;
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