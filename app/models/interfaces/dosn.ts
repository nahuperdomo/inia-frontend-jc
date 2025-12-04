import { AnalisisDTO, AnalisisRequestDTO } from './analisis';
import { ListadoDTO, ListadoRequestDTO } from './common';
import { TipoDOSN, Instituto } from '../types/enums';

export interface CuscutaRegistroDTO {
  id?: number;
  instituto?: Instituto;
  cuscuta_g?: number; 
  cuscutaNum?: number;
  fechaCuscuta?: string; 
}

export interface CuscutaRegistroRequestDTO {
  instituto?: Instituto;
  cuscuta_g?: number; 
  cuscutaNum?: number;
  fechaCuscuta?: string; 
}

export interface DosnDTO extends AnalisisDTO {
  
  cumpleEstandar?: boolean;
  fechaINIA?: string; 
  gramosAnalizadosINIA?: number; 
  tipoINIA?: TipoDOSN[];
  
  fechaINASE?: string; 
  gramosAnalizadosINASE?: number; 
  tipoINASE?: TipoDOSN[];
  
  cuscutaRegistros?: CuscutaRegistroDTO[];
  
  listados?: ListadoDTO[];
}

export interface DosnRequestDTO extends AnalisisRequestDTO {
  
  cumpleEstandar?: boolean;
  fechaINIA?: string; 
  gramosAnalizadosINIA?: number; 
  tipoINIA?: TipoDOSN[];
  
  fechaINASE?: string; 
  gramosAnalizadosINASE?: number; 
  tipoINASE?: TipoDOSN[];
  
  cuscutaRegistros?: CuscutaRegistroRequestDTO[];
  
  listados?: ListadoRequestDTO[];
}

export interface ResponseListadoDosn {
  dosns: DosnDTO[];
}
