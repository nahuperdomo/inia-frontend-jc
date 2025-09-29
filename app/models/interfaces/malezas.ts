import { TipoMYCCatalogo } from '../types/enums';

export type { MalezasYCultivosCatalogoDTO } from './common';

// Request DTO para crear o actualizar una maleza o cultivo
export interface MalezasYCultivosCatalogoRequestDTO {
  nombreComun: string;
  nombreCientifico: string;
  tipoMYCCatalogo: TipoMYCCatalogo;
}