export type { MalezasCatalogoDTO } from './common';

// Request DTO para crear o actualizar una maleza
export interface MalezasCatalogoRequestDTO {
  nombreComun: string;
  nombreCientifico: string;
}
