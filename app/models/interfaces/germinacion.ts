import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface GerminacionDTO extends AnalisisDTO {
  
  
}

export interface GerminacionRequestDTO extends AnalisisRequestDTO {
  
  
}

export interface GerminacionEditRequestDTO {
  
  idLote?: number;
  comentarios?: string;
}

export interface ResponseListadoGerminacion {
  germinaciones: GerminacionDTO[];
}


export interface GerminacionListadoDTO {
  analisisID: number;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  lote?: string;
  idLote?: number;
  especie?: string;
  usuarioCreador?: string;
  usuarioModificador?: string;
  cumpleNorma: boolean; 
  activo?: boolean; 
  
  
  valorGerminacionINIA?: number;
  valorGerminacionINASE?: number;
  fechaInicioGerm?: string;
  fechaFinal?: string;
  tienePrefrio?: boolean;
  tienePretratamiento?: boolean;
}