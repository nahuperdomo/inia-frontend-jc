export interface CatalogoDTO {
  id: number;
  tipo: string;
  valor: string;
  activo: boolean;
}

export interface CatalogoRequestDTO {
  tipo: string;
  valor: string;
}
