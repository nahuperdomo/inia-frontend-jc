import { TipoMYCCatalogo, TipoListado, Instituto } from '../types/enums';

export interface MalezasYCultivosCatalogoDTO {
  catalogoID: number;
  nombreComun: string;
  nombreCientifico: string;
  tipoMYCCatalogo: TipoMYCCatalogo;
  activo: boolean;
}

export interface ListadoDTO {
  listadoID: number;
  listadoTipo: TipoListado;
  listadoInsti: Instituto;
  listadoNum: number;
  catalogo: MalezasYCultivosCatalogoDTO;
}

export interface ListadoRequestDTO {
  listadoTipo: TipoListado;
  listadoInsti: Instituto;
  listadoNum: number;
  idCatalogo: number;
}

export interface DatosHumedadDTO {
  humedadID: number;
  porcentaje: number;
  observaciones?: string;
}