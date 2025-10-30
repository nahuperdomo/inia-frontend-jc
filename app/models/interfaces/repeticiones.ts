// ========================
// REPETICIONES DE GERMINACION (RepGerm)
// ========================

export interface RepGermDTO {
  repGermID: number;
  numRep: number;
  normales: number[];
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number;
  tablaGerm?: {
    tablaGermID: number;
    numeroTabla: number;
  };
}

export interface RepGermRequestDTO {
  numRep: number;
  normales: number[];
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number;
}

// ========================
// REPETICIONES DE PMS (RepPms)
// ========================

export interface RepPmsDTO {
  repPMSID: number;
  numRep: number;
  numTanda: number;
  peso: number;
  valido: boolean;
  pms?: {
    pmsID: number;
  };
}

export interface RepPmsRequestDTO {
  numRep: number;
  numTanda: number;
  peso: number;
  valido: boolean;
}

// ========================
// REPETICIONES DE TETRAZOLIO (RepTetrazolioViabilidad)
// ========================

export interface RepTetrazolioViabilidadDTO {
  repTetrazolioViabID: number;
  fecha: string;
  viablesNum: number;
  noViablesNum: number;
  duras: number;
  tetrazolio?: {
    tetrazolioID: number;
  };
}

export interface RepTetrazolioViabilidadRequestDTO {
  fecha: string;
  viablesNum: number;
  noViablesNum: number;
  duras: number;
}

// ========================
// TABLA DE GERMINACION (TablaGerm)
// ========================

export interface TablaGermDTO {
  tablaGermID: number;
  numeroTabla: number;
  finalizada: boolean;
  fechaFinal?: string;
  tratamiento: string;
  productoYDosis: string;
  numSemillasPRep: number;
  metodo: string;
  temperatura: number;
  tienePrefrio: boolean;
  descripcionPrefrio?: string;
  tienePretratamiento: boolean;
  descripcionPretratamiento?: string;
  diasPrefrio: number;
  diasPretratamiento: number;
  fechaInicioGerm: string;
  fechaConteos: string[];
  fechaUltConteo: string;
  numDias: number;
  numeroRepeticiones: number;
  numeroConteos: number;
  total: number;
  promedioSinRedondeo: number[];
  promediosSinRedPorConteo?: number[]; // Nueva lista con promedios por conteo
  porcentajeNormalesConRedondeo?: number;
  porcentajeAnormalesConRedondeo?: number;
  porcentajeDurasConRedondeo?: number;
  porcentajeFrescasConRedondeo?: number;
  porcentajeMuertasConRedondeo?: number;
  germinacion?: {
    germinacionID: number;
  };
  repGerm?: RepGermDTO[];
  valoresGerm?: any[];
}

export interface TablaGermRequestDTO {
  fechaFinal: string;
  tratamiento: string;
  productoYDosis: string;
  numSemillasPRep: number;
  metodo: string;
  temperatura: number;
  tienePrefrio: boolean;
  descripcionPrefrio?: string;
  tienePretratamiento: boolean;
  descripcionPretratamiento?: string;
  diasPrefrio: number;
  diasPretratamiento: number;
  fechaInicioGerm: string;
  fechaConteos: string[];
  fechaUltConteo: string;
  numDias: number;
  numeroRepeticiones: number;
  numeroConteos: number;
}

export interface PorcentajesRedondeoRequestDTO {
  porcentajeNormalesConRedondeo: number;
  porcentajeAnormalesConRedondeo: number;
  porcentajeDurasConRedondeo: number;
  porcentajeFrescasConRedondeo: number;
  porcentajeMuertasConRedondeo: number;
}
