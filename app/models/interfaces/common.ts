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
  catalogo?: MalezasCatalogoDTO;  
  especie?: EspecieDTO;  
}

export interface ListadoRequestDTO {
  listadoTipo: TipoListado;
  listadoInsti: Instituto;
  listadoNum: number;
  idCatalogo?: number;  
  idEspecie?: number;   
}

export interface DatosHumedadDTO {
  humedadID: number;
  humedadNombre?: string; 
  porcentaje: number;
  observaciones?: string;
}
