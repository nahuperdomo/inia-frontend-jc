import { TipoMYCCatalogo, TipoAnalisis } from '../types/enums';
import { DatosHumedadDTO } from './common';

/**
 * Interfaz completa para un Lote - coincide con LoteDTO del backend
 */
export interface LoteDTO {
  loteID: number;
  ficha: string;
  nomLote?: string;
  cultivarID: number;
  cultivarNombre?: string;
  tipo?: string;
  empresaID: number;
  empresaNombre?: string;
  clienteID?: number;
  clienteNombre?: string;
  codigoCC?: string;
  codigoFF?: string;
  fechaEntrega?: string; // LocalDate as string
  fechaRecibo?: string; // LocalDate as string
  depositoID?: number;
  depositoValor?: string;
  unidadEmbolsado?: string;
  remitente?: string;
  observaciones?: string;
  kilosLimpios?: number; // BigDecimal as number
  
  // Datos de humedad con información completa
  datosHumedad?: DatosHumedadDTO[];
  
  // Número de artículo con información completa
  numeroArticuloID?: number;
  numeroArticuloValor?: string;
  
  cantidad?: number;
  origenID?: number;
  origenValor?: string;
  estadoID?: number;
  estadoValor?: string;
  fechaCosecha?: string; // LocalDate as string
  
  // Lista de tipos de análisis asignados
  tiposAnalisisAsignados?: TipoAnalisis[];
  
  activo?: boolean;
}

export interface LoteRequestDTO {
  ficha: string;
  nomLote: string;
  cultivarID: number;
  tipo: string;
  empresaID: number;
  clienteID: number;
  codigoCC?: string;
  codigoFF?: string;
  fechaEntrega: string;
  fechaRecibo: string;
  depositoID: number;
  unidadEmbolsado: string;
  remitente: string;
  observaciones?: string;
  kilosLimpios: number;
  datosHumedad: Array<{
    tipoHumedadID: number;
    valor: number;
  }>;
  numeroArticuloID: number;
  cantidad: number;
  origenID: number;
  estadoID: number;
  fechaCosecha: string;
  tiposAnalisisAsignados: TipoAnalisis[];
}

export interface ResponseListadoLote {
  lotes: LoteDTO[];
}

// Interfaces para los catálogos del formulario
export interface CultivarOption {
  id: number;
  nombre: string;
}

export interface EmpresaOption {
  id: number;
  nombre: string;
}

export interface ClienteOption {
  id: number;
  nombre: string;
}

export interface DepositoOption {
  id: number;
  nombre: string;
}

export interface UnidadEmbolsadoOption {
  id: number;
  nombre: string;
}

export interface TipoHumedadOption {
  id: number;
  nombre: string;
}

export interface OrigenOption {
  id: number;
  nombre: string;
}

export interface EstadoOption {
  id: number;
  nombre: string;
}

export interface EspecieOption {
  id: number;
  nombre: string;
}

export interface ArticuloOption {
  id: number;
  nombre: string;
}
