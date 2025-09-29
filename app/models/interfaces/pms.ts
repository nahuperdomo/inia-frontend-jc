import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface PmsDTO extends AnalisisDTO {
  // PMS specific fields
  numRepeticionesEsperadas?: number;
  numTandas?: number;
  esSemillaBrozosa?: boolean;
  
  // Calculated fields
  promedio100g?: number; // BigDecimal as number
  desvioStd?: number; // BigDecimal as number
  coefVariacion?: number; // BigDecimal as number
  pmssinRedon?: number; // BigDecimal as number
  pmsconRedon?: number; // BigDecimal as number
}

export interface PmsRequestDTO extends AnalisisRequestDTO {
  // PMS specific fields
  numRepeticionesEsperadas?: number;
  esSemillaBrozosa?: boolean;
}

export interface ResponseListadoPms {
  pmss: PmsDTO[];
}