import { Instituto } from '../types/enums';

export interface ValoresGermDTO {
  valoresGermID: number;
  instituto: Instituto;
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  germinacion: number; 
  tablaGermId?: number; 
}

export interface ValoresGermRequestDTO {
  
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  germinacion: number; 
}
