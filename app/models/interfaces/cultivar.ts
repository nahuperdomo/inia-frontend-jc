export interface CultivarDTO {
  cultivarID: number;
  nombre: string;
  descripcion?: string;
  especieID: number;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
  especie?: {
    especieID: number;
    nombreComun: string;
    nombreCientifico: string;
  };
}

export interface CultivarRequestDTO {
  nombre: string;
  descripcion?: string;
  especieID: number;
}