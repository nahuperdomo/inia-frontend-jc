const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ usuario, password }),
    credentials: "include"
  });
  return await res.json();
}

export async function validateToken(): Promise<{ valido: boolean; usuario?: string; error?: string }> {
  const res = await fetch(`${API_URL}/v1/auth/validate`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

// Registro y gestión de usuarios
export async function registrarUsuario(solicitud: RegistroUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    body: JSON.stringify(solicitud),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function listarSolicitudesPendientes(): Promise<AuthUsuarioDTO[]> {
  const res = await fetch(`${API_URL}/v1/auth/pending`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function aprobarUsuario(id: number, solicitud: AprobarUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  const res = await fetch(`${API_URL}/v1/auth/approve/${id}`, {
    method: "POST",
    body: JSON.stringify(solicitud),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function rechazarSolicitud(id: number): Promise<{ mensaje: string }> {
  const res = await fetch(`${API_URL}/v1/auth/reject/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function listarUsuarios(): Promise<AuthUsuarioDTO[]> {
  const res = await fetch(`${API_URL}/v1/auth/users`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function listarUsuariosActivos(): Promise<AuthUsuarioDTO[]> {
  const res = await fetch(`${API_URL}/v1/auth/users/active`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function gestionarUsuario(id: number, solicitud: GestionarUsuarioRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  const res = await fetch(`${API_URL}/v1/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

// Administración del perfil
export async function obtenerPerfil(): Promise<AuthUsuarioDTO> {
  const res = await fetch(`${API_URL}/v1/auth/profile`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

export async function actualizarPerfil(solicitud: ActualizarPerfilRequest): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  const res = await fetch(`${API_URL}/v1/auth/profile`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}

// Inicializar usuario admin predeterminado
export async function crearAdminPredeterminado(): Promise<{ mensaje: string; usuario: AuthUsuarioDTO }> {
  const res = await fetch(`${API_URL}/v1/auth/init-admin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" }
  });
  return await res.json();
}
