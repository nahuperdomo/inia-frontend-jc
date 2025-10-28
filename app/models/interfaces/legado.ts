import { LoteDTO } from './lote'

/**
 * Interfaz simple para listado de legados
 */
export interface LegadoSimpleDTO {
  legadoID: number
  nomLote: string | null
  ficha: string | null
  codDoc: string | null
  nomDoc: string | null
  familia: string | null
  activo: boolean
}

/**
 * Interfaz para listado paginado de legados
 */
export interface LegadoListadoDTO {
  legadoID: number
  ficha: string | null
  especie: string | null
  fechaRecibo: string | null
  germC: number | null
  germSC: number | null
  peso1000: number | null
  pura: number | null
  puraI: number | null
}

/**
 * Interfaz completa para un registro Legado - coincide con LegadoDTO del backend
 */
export interface LegadoDTO {
  legadoID: number
  lote: LoteDTO
  codDoc: string | null
  nomDoc: string | null
  nroDoc: string | null
  fechaDoc: string | null
  familia: string | null
  tipoSemilla: string | null
  tipoTratGerm: string | null
  germC: number | null
  germSC: number | null
  peso1000: number | null
  pura: number | null
  oc: number | null
  porcOC: number | null
  maleza: number | null
  malezaTol: number | null
  matInerte: number | null
  puraI: number | null
  ocI: number | null
  malezaI: number | null
  malezaTolI: number | null
  matInerteI: number | null
  pesoHEC: number | null
  nroTrans: string | null
  ctaMov: string | null
  stk: number | null
  fechaSC_I: string | null
  fechaC_I: string | null
  germTotalSC_I: number | null
  germTotalC_I: number | null
  otrasSemillasObser: string | null
  semillaPura: string | null
  semillaOtrosCultivos: string | null
  semillaMalezas: string | null
  semillaMalezasToleradas: string | null
  materiaInerte: string | null
  fechaImportacion: string | null
  archivoOrigen: string | null
  filaExcel: number | null
  activo: boolean
}
