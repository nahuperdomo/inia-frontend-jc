import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface TetrazolioDTO extends AnalisisDTO {
  
  numSemillasPorRep?: number;
  pretratamiento?: string;
  concentracion?: string;
  tincionHs?: number;
  tincionTemp?: number;
  fecha?: string; 
  numRepeticionesEsperadas?: number;
  porcViablesRedondeo?: number; 
  porcNoViablesRedondeo?: number; 
  porcDurasRedondeo?: number; 
  viabilidadInase?: number; 
}

export interface TetrazolioRequestDTO extends AnalisisRequestDTO {
  
  numSemillasPorRep?: number;
  pretratamiento?: string;
  concentracion?: string;
  tincionHs?: number;
  tincionTemp?: number;
  fecha?: string; 
  numRepeticionesEsperadas?: number;
  viabilidadInase?: number; 
}

export interface ResponseListadoTetrazolio {
  tetrazolios: TetrazolioDTO[];
}
