export interface CultivarDTO {
  cultivarID: number;
  nombre: string;
  especieID: number;
  especieNombre?: string;
  activo: boolean;
}

export interface CultivarRequestDTO {
  nombre: string;
  especieID: number;
}
