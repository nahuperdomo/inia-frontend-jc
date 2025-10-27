import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface TetrazolioDTO extends AnalisisDTO {
  // Tetrazolio specific fields
  numSemillasPorRep?: number;
  pretratamiento?: string;
  concentracion?: string;
  tincionHs?: number;
  tincionTemp?: number;
  fecha?: string; // LocalDate as string
  numRepeticionesEsperadas?: number;
  porcViablesRedondeo?: number; // BigDecimal as number
  porcNoViablesRedondeo?: number; // BigDecimal as number
  porcDurasRedondeo?: number; // BigDecimal as number
  viabilidadInase?: number; // BigDecimal as number
}

export interface TetrazolioRequestDTO extends AnalisisRequestDTO {
  // Tetrazolio specific fields
  numSemillasPorRep?: number;
  pretratamiento?: string;
  concentracion?: string;
  tincionHs?: number;
  tincionTemp?: number;
  fecha?: string; // LocalDate as string
  numRepeticionesEsperadas?: number;
  viabilidadInase?: number; // BigDecimal as number
}

export interface ResponseListadoTetrazolio {
  tetrazolios: TetrazolioDTO[];
}