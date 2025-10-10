import { apiFetch } from "./api";
import {
  LoginRequest,
  LoginResponse,
  AuthUsuarioDTO,
  RegistroUsuarioRequest,
  AprobarUsuarioRequest,
  GestionarUsuarioRequest,
  ActualizarPerfilRequest
} from "../models";

// Autenticación y validación de token
export async function login(usuario: string, password: string): Promise<LoginResponse> {
  // Usamos apiFetch para asegurar que use la URL base correcta con la IP
  return apiFetch(`/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ usuario, password }),
  });
}

export async function validateToken(): Promise<{ valido: boolean; usuario?: string; error?: string }> {
  return apiFetch("/api/v1/auth/validate");
}

// Registro y gestión de usuarios
export async function registrarUsuario(solicitud: RegistroUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function listarSolicitudesPendientes(): Promise<AuthUsuarioDTO[]> {
  return apiFetch("/api/v1/auth/pending");
}

export async function aprobarUsuario(id: number, solicitud: AprobarUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  return apiFetch(`/api/v1/auth/approve/${id}`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function rechazarSolicitud(id: number): Promise<{ mensaje: string }> {
  return apiFetch(`/api/v1/auth/reject/${id}`, {
    method: "DELETE",
  });
}

export async function listarUsuarios(): Promise<AuthUsuarioDTO[]> {
  return apiFetch("/api/v1/auth/users");
}

export async function listarUsuariosActivos(): Promise<AuthUsuarioDTO[]> {
  return apiFetch("/api/v1/auth/users/active");
}

export async function gestionarUsuario(id: number, solicitud: GestionarUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  return apiFetch(`/api/v1/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

// Administración del perfil
export async function obtenerPerfil(): Promise<AuthUsuarioDTO> {
  return apiFetch("/api/v1/auth/profile");
}

export async function actualizarPerfil(solicitud: ActualizarPerfilRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  return apiFetch("/api/v1/auth/profile", {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

// Inicializar usuario admin predeterminado
export async function crearAdminPredeterminado(): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  return apiFetch("/api/v1/auth/init-admin", {
    method: "POST",
  });
}
