import { AnalisisDTO, AnalisisRequestDTO } from './analisis';
import { ListadoDTO, ListadoRequestDTO } from './common';

export interface PurezaDTO extends AnalisisDTO {
  // Pureza specific fields
  fecha: string; // LocalDate as string
  cumpleEstandar?: boolean;
  pesoInicial_g: number;
  semillaPura_g: number;
  materiaInerte_g: number;
  otrosCultivos_g: number;
  malezas_g: number;
  malezasToleradas_g: number;
  malezasTolCero_g: number;
  pesoTotal_g: number;

  redonSemillaPura?: number;
  redonMateriaInerte?: number;
  redonOtrosCultivos?: number;
  redonMalezas?: number;
  redonMalezasToleradas?: number;
  redonMalezasTolCero?: number;
  redonPesoTotal?: number;

  inasePura?: number;
  inaseMateriaInerte?: number;
  inaseOtrosCultivos?: number;
  inaseMalezas?: number;
  inaseMalezasToleradas?: number;
  inaseMalezasTolCero?: number;
  inaseFecha?: string; // LocalDate as string

  otrasSemillas: ListadoDTO[];
}

export interface PurezaRequestDTO extends AnalisisRequestDTO {
  // Pureza specific fields
  fecha: string; // LocalDate as string
  cumpleEstandar?: boolean;
  pesoInicial_g: number;
  semillaPura_g: number;
  materiaInerte_g: number;
  otrosCultivos_g: number;
  malezas_g: number;
  malezasToleradas_g: number;
  malezasTolCero_g: number;
  pesoTotal_g: number;

  redonSemillaPura?: number;
  redonMateriaInerte?: number;
  redonOtrosCultivos?: number;
  redonMalezas?: number;
  redonMalezasToleradas?: number;
  redonMalezasTolCero?: number;
  redonPesoTotal?: number;

  inasePura?: number;
  inaseMateriaInerte?: number;
  inaseOtrosCultivos?: number;
  inaseMalezas?: number;
  inaseMalezasToleradas?: number;
  inaseMalezasTolCero?: number;
  inaseFecha?: string; // LocalDate as string

  otrasSemillas: ListadoRequestDTO[];
}

export interface ResponseListadoPureza {
  purezas: PurezaDTO[];
}
