import { TipoContacto } from '../types/enums';

export interface ContactoDTO {
  contactoID: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoContacto: TipoContacto;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface ContactoRequestDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoContacto: TipoContacto;
}