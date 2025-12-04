import { RolUsuario } from '../types/enums';

export interface UsuarioDTO {
  usuarioID: number;
  nombreUsuario: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion: string; 
}

export interface UsuarioRequestDTO {
  nombreUsuario: string;
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  rol: RolUsuario;
}

export interface LoginRequestDTO {
  nombreUsuario: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  usuario: UsuarioDTO;
  expiresIn: number;
}


export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: {
    id: number;
    nombre: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
  };
}

export interface AuthUsuarioDTO {
  usuarioID: number;
  nombre: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: boolean;
  
  rol: string | null;
  estado: string;
  fechaCreacion: string;
  fechaUltimaConexion: string | null;
  nombreCompleto: string;
  
  estadoSolicitud?: string;
  fechaRegistro?: string;
  roles?: string[];
}

export interface RegistroUsuarioRequest {
  nombre: string;
  nombres: string;
  apellidos: string;
  email: string;
  contrasenia: string;
}

export interface AprobarUsuarioRequest {
  rol: string; 
}

export interface GestionarUsuarioRequest {
  rol?: string; 
  activo?: boolean;
}

export interface ActualizarPerfilRequest {
  nombre?: string; 
  nombres?: string;
  apellidos?: string;
  email?: string;
  contraseniaActual?: string;
  contraseniaNueva?: string;
}

export type { RolUsuario };
