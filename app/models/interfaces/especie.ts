export interface EspecieDTO {
  especieID: number;
  nombreComun: string;
  nombreCientifico: string;
  activo: boolean;
  cultivares?: string[];
}

export interface EspecieRequestDTO {
  nombreComun: string;
  nombreCientifico: string;
}