import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface PmsDTO extends AnalisisDTO {
  
  numRepeticionesEsperadas?: number;
  numTandas?: number;
  esSemillaBrozosa?: boolean;
  
  
  promedio100g?: number; 
  desvioStd?: number; 
  coefVariacion?: number; 
  pmssinRedon?: number; 
  pmsconRedon?: number; 
}

export interface PmsRequestDTO extends AnalisisRequestDTO {
  
  numRepeticionesEsperadas?: number;
  esSemillaBrozosa?: boolean;
}

export interface ResponseListadoPms {
  pmss: PmsDTO[];
}
