import { apiFetch } from "./api";
import type { 
  NotificacionDTO, 
  NotificacionRequestDTO, 
  PaginatedNotificaciones 
} from "@/app/models/interfaces/notificacion";

// Crear notificación manual
export async function crearNotificacion(request: NotificacionRequestDTO): Promise<NotificacionDTO> {
  return apiFetch("/api/notificaciones", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// Obtener notificaciones de un usuario con paginación
export async function obtenerNotificacionesPorUsuario(
  usuarioId: number, 
  page: number = 0, 
  size: number = 10
): Promise<PaginatedNotificaciones> {
  return apiFetch(`/api/notificaciones/usuario/${usuarioId}?page=${page}&size=${size}`);
}

// Obtener notificaciones no leídas de un usuario
export async function obtenerNotificacionesNoLeidas(usuarioId: number): Promise<NotificacionDTO[]> {
  return apiFetch(`/api/notificaciones/usuario/${usuarioId}/no-leidas`);
}

// Contar notificaciones no leídas
export async function contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
  return apiFetch(`/api/notificaciones/usuario/${usuarioId}/contar-no-leidas`);
}

// Marcar notificación como leída
export async function marcarComoLeida(notificacionId: number): Promise<NotificacionDTO> {
  return apiFetch(`/api/notificaciones/${notificacionId}/marcar-leida`, {
    method: "PUT",
  });
}

// Marcar todas las notificaciones de un usuario como leídas
export async function marcarTodasComoLeidas(usuarioId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/usuario/${usuarioId}/marcar-todas-leidas`, {
    method: "PUT",
  });
}

// Eliminar notificación (marcar como inactiva)
export async function eliminarNotificacion(notificacionId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/${notificacionId}`, {
    method: "DELETE",
  });
}

// Funciones para notificaciones automáticas (uso interno del sistema)
export async function notificarNuevoUsuario(usuarioId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/interno/nuevo-usuario/${usuarioId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisFinalizado(analisisId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/interno/analisis-finalizado/${analisisId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisAprobado(analisisId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/interno/analisis-aprobado/${analisisId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisRepetir(analisisId: number): Promise<void> {
  return apiFetch(`/api/notificaciones/interno/analisis-repetir/${analisisId}`, {
    method: "POST",
  });
}