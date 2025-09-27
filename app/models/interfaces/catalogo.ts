export interface CatalogoDTO {
  catalogoID: number;
  tipo: string;
  codigo: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface CatalogoRequestDTO {
  tipo: string;
  codigo: string;
  descripcion: string;
}