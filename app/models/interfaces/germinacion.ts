import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface GerminacionDTO extends AnalisisDTO {
  // Germinacion specific fields
  fechaInicioGerm: string; // LocalDate as string
  fechaConteos: string[]; // List<LocalDate> as string array
  fechaUltConteo: string; // LocalDate as string
  numDias?: string;
  numeroRepeticiones?: number;
  numeroConteos?: number;
}

export interface GerminacionRequestDTO extends AnalisisRequestDTO {
  // Germinacion specific fields
  fechaInicioGerm: string; // LocalDate as string
  fechaConteos: string[]; // List<LocalDate> as string array
  fechaUltConteo: string; // LocalDate as string
  numDias?: string; // Calculated and sent from frontend
  numeroRepeticiones?: number;
  numeroConteos?: number;
}

export interface ResponseListadoGerminacion {
  germinaciones: GerminacionDTO[];
}