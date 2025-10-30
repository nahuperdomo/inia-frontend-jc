import { Instituto } from '../types/enums';

export interface ValoresGermDTO {
  valoresGermID: number;
  instituto: Instituto;
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  germinacion: number; // Cambiado de 'total' a 'germinacion'
  tablaGermId?: number; // Cambiado de tablaGerm.tablaGermID a tablaGermId
}

export interface ValoresGermRequestDTO {
  // NO incluir instituto - el backend lo determina por el ID
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  germinacion: number; // Cambiado de 'total' a 'germinacion'
}
