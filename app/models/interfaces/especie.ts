export interface EspecieDTO {
  especieID: number;
  nombreComun: string;
  nombreCientifico: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface EspecieRequestDTO {
  nombreComun: string;
  nombreCientifico: string;
}