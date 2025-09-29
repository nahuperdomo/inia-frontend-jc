export interface LoteSimpleDTO {
  loteID: number;
  numeroFicha: number;
  ficha: string;
  activo: boolean;
}

export interface ResponseListadoLoteSimple {
  lotes: LoteSimpleDTO[];
}