export interface LoteSimpleDTO {
  loteID: number;
  ficha: string;
  nomLote: string | null;
  activo: boolean;
  cultivarNombre?: string;
  especieNombre?: string;
}

export interface ResponseListadoLoteSimple {
  lotes: LoteSimpleDTO[];
}