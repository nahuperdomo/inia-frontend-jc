export interface AnalisisPayload {
  loteID: string;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  cumpleEstandar?: boolean;
  comentarios?: string;
}

export interface AnalisisGenerico {
  id: number;
  loteID: number;
  tipo: string;
  estado: string;
  fechaCreacion: string;
  fechaFinalizacion?: string;
  activo: boolean;
}

export interface ResumenAnalisis {
  total: number;
  pendientes: number;
  finalizados: number;
  aprobados: number;
  parRepetir: number;
}

export interface AnalisisPorLoteResponse {
  purezas: any[];
  germinaciones: any[];
  tetrazolios: any[];
  pms: any[];
  dosns: any[];
}
