import { TipoContacto } from '../types/enums';

export interface ContactoDTO {
  contactoID: number;
  nombre: string;
  contacto: string;
  tipo: TipoContacto;
  activo: boolean;
}

export interface ContactoRequestDTO {
  nombre: string;
  contacto: string;
  tipo: TipoContacto;
}