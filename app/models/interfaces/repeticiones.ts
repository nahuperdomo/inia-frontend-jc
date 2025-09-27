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
  prefrio: string;
  pretratamiento: string;
  total: number;
  promedioSinRedondeo: number[];
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
  tratamiento: string;
  productoYDosis: string;
  numSemillasPRep: number;
  metodo: string;
  temperatura: number;
  prefrio: string;
  pretratamiento: string;
  total: number;
}

export interface PorcentajesRedondeoRequestDTO {
  porcentajeNormalesConRedondeo: number;
  porcentajeAnormalesConRedondeo: number;
  porcentajeDurasConRedondeo: number;
  porcentajeFrescasConRedondeo: number;
  porcentajeMuertasConRedondeo: number;
}