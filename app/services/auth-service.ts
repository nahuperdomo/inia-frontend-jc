import { apiFetch } from "./api";
import {
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

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}


export async function listarUsuariosPaginados(
  page: number = 0,
  size: number = 10,
  searchTerm?: string,
  rol?: string,
  activo?: string
): Promise<PaginatedResponse<AuthUsuarioDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })
  if (searchTerm && searchTerm.trim()) {
    params.append("search", searchTerm.trim())
  }
  if (rol && rol !== "all") {
    params.append("rol", rol)
  }
  if (activo && activo !== "all") {
    params.append("activo", activo)
  }
  return apiFetch(`/api/v1/auth/users/paginated?${params.toString()}`);
}


export async function listarSolicitudesPendientesPaginadas(
  page: number = 0,
  size: number = 10,
  searchTerm?: string
): Promise<PaginatedResponse<AuthUsuarioDTO>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })
  if (searchTerm && searchTerm.trim()) {
    params.append("search", searchTerm.trim())
  }
  return apiFetch(`/api/v1/auth/pending/paginated?${params.toString()}`);
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

// Validaciones de unicidad
export async function validarNombreUsuarioUnico(nombre: string): Promise<boolean> {
  try {
    const response = await apiFetch(`/api/v1/auth/check-username?nombre=${encodeURIComponent(nombre)}`);
    
    // Si la respuesta no tiene la propiedad 'disponible', el endpoint no existe
    if (response.disponible === undefined) {
      console.warn('El backend no devuelve la propiedad "disponible". El endpoint puede no estar implementado.');
      return true; // Asumimos disponible si el endpoint no existe
    }
    
    return response.disponible;
  } catch (error) {
    console.error('Error al validar nombre de usuario:', error);
    // Si hay error en la petición, asumimos que está disponible para no bloquear el registro
    return true;
  }
}

export async function validarEmailUnico(email: string): Promise<boolean> {
  try {
    const response = await apiFetch(`/api/v1/auth/check-email?email=${encodeURIComponent(email)}`);
    
    // Si la respuesta no tiene la propiedad 'disponible', el endpoint no existe
    if (response.disponible === undefined) {
      console.warn('El backend no devuelve la propiedad "disponible". El endpoint puede no estar implementado.');
      return true; // Asumimos disponible si el endpoint no existe
    }
    
    return response.disponible;
  } catch (error) {
    console.error('Error al validar email:', error);
    // Si hay error en la petición, asumimos que está disponible para no bloquear el registro
    return true;
  }
}
