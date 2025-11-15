import { AnalisisDTO, AnalisisRequestDTO } from './analisis';

export interface GerminacionDTO extends AnalisisDTO {
  // No hay campos específicos aquí, se movieron a TablaGerm
  // La germinación es solo un contenedor para las tablas
}

export interface GerminacionRequestDTO extends AnalisisRequestDTO {
  // No hay campos específicos aquí, se movieron a TablaGerm
  // La germinación es solo un contenedor para las tablas
}

export interface GerminacionEditRequestDTO {
  // Solo campos editables después de la creación (sin fechas ni numDias)
  idLote?: number;
  comentarios?: string;
}

export interface ResponseListadoGerminacion {
  germinaciones: GerminacionDTO[];
}

// DTO simple para listado paginado
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
  cumpleNorma: boolean; // true si NO está "A REPETIR"
  activo?: boolean; // Campo para soft delete

  // Nuevos campos de TablaGerm
  valorGerminacionINIA?: number;
  valorGerminacionINASE?: number;
  fechaInicioGerm?: string;
  fechaFinal?: string;
  tienePrefrio?: boolean;
  tienePretratamiento?: boolean;
}