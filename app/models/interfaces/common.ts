import { TipoListado, Instituto } from '../types/enums';
import { EspecieDTO } from './especie';

export interface MalezasCatalogoDTO {
  catalogoID: number;
  nombreComun: string;
  nombreCientifico: string;
  activo: boolean;
}

export interface ListadoDTO {
  listadoID: number;
  listadoTipo: TipoListado;
  listadoInsti: Instituto;
  listadoNum: number;
  catalogo?: MalezasCatalogoDTO;  // Para malezas
  especie?: EspecieDTO;  // Para otros cultivos
}

export interface ListadoRequestDTO {
  listadoTipo: TipoListado;
  listadoInsti: Instituto;
  listadoNum: number;
  idCatalogo?: number;  // Para malezas
  idEspecie?: number;   // Para otros cultivos
}

export interface DatosHumedadDTO {
  humedadID: number;
  porcentaje: number;
  observaciones?: string;
}
