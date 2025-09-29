import { Instituto } from '../types/enums';

export interface ValoresGermDTO {
  valoresGermID: number;
  instituto: Instituto;
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number;
  tablaGerm?: {
    tablaGermID: number;
  };
}

export interface ValoresGermRequestDTO {
  instituto: Instituto;
  normales: number;
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number;
}