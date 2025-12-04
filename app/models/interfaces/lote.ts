import { TipoAnalisis } from '../types/enums';
import { DatosHumedadDTO } from './common';


export interface LoteDTO {
  loteID: number;
  ficha: string;
  nomLote?: string;
  cultivarID: number;
  cultivarNombre?: string;
  especieNombre?: string; 
  tipo?: string;
  empresaID: number;
  empresaNombre?: string;
  clienteID?: number;
  clienteNombre?: string;
  codigoCC?: string;
  codigoFF?: string;
  fechaEntrega?: string; 
  fechaRecibo?: string; 
  depositoID?: number;
  depositoValor?: string;
  unidadEmbolsado?: string;
  remitente?: string;
  observaciones?: string;
  kilosLimpios?: number; 
  
  
  datosHumedad?: DatosHumedadDTO[];
  
  
  numeroArticuloID?: number;
  numeroArticuloValor?: string;
  
  origenID?: number;
  origenValor?: string;
  estadoID?: number;
  estadoValor?: string;
  fechaCosecha?: string; 
  
  
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
  origenID: number;
  estadoID: number;
  fechaCosecha: string;
  tiposAnalisisAsignados: TipoAnalisis[];
}

export interface ResponseListadoLote {
  lotes: LoteDTO[];
}


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
