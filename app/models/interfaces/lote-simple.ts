export interface LoteSimpleDTO {
  loteID: number;
  ficha: string;
  activo: boolean;
  cultivarNombre?: string;
  especieNombre?: string;
}

export interface ResponseListadoLoteSimple {
  lotes: LoteSimpleDTO[];
}