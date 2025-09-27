import { AnalisisDTO, AnalisisRequestDTO } from './analisis';
import { ListadoDTO, ListadoRequestDTO } from './common';
import { TipoDOSN } from '../types/enums';

export interface DosnDTO extends AnalisisDTO {
  // DOSN specific fields
  cumpleEstandar?: boolean;
  fechaINIA?: string; // LocalDate as string
  gramosAnalizadosINIA?: number; // BigDecimal as number
  tipoINIA?: TipoDOSN[];
  
  fechaINASE?: string; // LocalDate as string
  gramosAnalizadosINASE?: number; // BigDecimal as number
  tipoINASE?: TipoDOSN[];
  
  cuscuta_g?: number; // BigDecimal as number
  cuscutaNum?: number;
  fechaCuscuta?: string; // LocalDate as string
  
  listados?: ListadoDTO[];
}

export interface DosnRequestDTO extends AnalisisRequestDTO {
  // DOSN specific fields
  cumpleEstandar?: boolean;
  fechaINIA?: string; // LocalDate as string
  gramosAnalizadosINIA?: number; // BigDecimal as number
  tipoINIA?: TipoDOSN[];
  
  fechaINASE?: string; // LocalDate as string
  gramosAnalizadosINASE?: number; // BigDecimal as number
  tipoINASE?: TipoDOSN[];
  
  cuscuta_g?: number; // BigDecimal as number
  cuscutaNum?: number;
  fechaCuscuta?: string; // LocalDate as string
  
  listados?: ListadoRequestDTO[];
}

export interface ResponseListadoDosn {
  dosns: DosnDTO[];
}