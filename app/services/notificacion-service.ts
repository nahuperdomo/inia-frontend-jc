import { apiFetch } from "./api";
import type {
  NotificacionDTO,
  NotificacionRequestDTO,
  PaginatedNotificaciones
} from "@/app/models/interfaces/notificacion";

// Crear notificación manual (solo administradores)
export async function crearNotificacion(request: NotificacionRequestDTO): Promise<NotificacionDTO> {
  return apiFetch("/notificaciones", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// === ENDPOINTS SEGUROS PARA EL USUARIO ACTUAL ===

// Obtener MIS notificaciones con paginación
export async function obtenerMisNotificaciones(
  page: number = 0,
  size: number = 10
): Promise<PaginatedNotificaciones> {
  return apiFetch(`/notificaciones/mis-notificaciones?page=${page}&size=${size}`);
}

// Obtener MIS notificaciones no leídas
export async function obtenerMisNotificacionesNoLeidas(): Promise<NotificacionDTO[]> {
  return apiFetch("/notificaciones/mis-notificaciones/no-leidas");
}

// Contar MIS notificaciones no leídas
export async function contarMisNotificacionesNoLeidas(): Promise<number> {
  return apiFetch("/notificaciones/mis-notificaciones/contar-no-leidas");
}

// Marcar todas MIS notificaciones como leídas
export async function marcarTodasMisNotificacionesComoLeidas(): Promise<void> {
  return apiFetch("/notificaciones/mis-notificaciones/marcar-todas-leidas", {
    method: "PUT",
  });
}

// === ENDPOINTS ADMINISTRATIVOS (requieren validación de acceso) ===

// Obtener notificaciones de un usuario específico (solo admin o el mismo usuario)
export async function obtenerNotificacionesPorUsuario(
  usuarioId: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedNotificaciones> {
  return apiFetch(`/notificaciones/usuario/${usuarioId}?page=${page}&size=${size}`);
}

// Obtener notificaciones no leídas de un usuario específico (solo admin o el mismo usuario)
export async function obtenerNotificacionesNoLeidas(usuarioId: number): Promise<NotificacionDTO[]> {
  return apiFetch(`/notificaciones/usuario/${usuarioId}/no-leidas`);
}

// Contar notificaciones no leídas de un usuario específico (solo admin o el mismo usuario)
export async function contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
  return apiFetch(`/notificaciones/usuario/${usuarioId}/contar-no-leidas`);
}

// Marcar todas las notificaciones de un usuario específico como leídas (solo admin o el mismo usuario)
export async function marcarTodasComoLeidas(usuarioId: number): Promise<void> {
  return apiFetch(`/notificaciones/usuario/${usuarioId}/marcar-todas-leidas`, {
    method: "PUT",
  });
}

// === ENDPOINTS PARA NOTIFICACIONES INDIVIDUALES ===

// Marcar notificación como leída (solo el propietario o admin)
export async function marcarComoLeida(notificacionId: number): Promise<NotificacionDTO> {
  return apiFetch(`/notificaciones/${notificacionId}/marcar-leida`, {
    method: "PUT",
  });
}

// Eliminar notificación (solo el propietario o admin)
export async function eliminarNotificacion(notificacionId: number): Promise<void> {
  return apiFetch(`/notificaciones/${notificacionId}`, {
    method: "DELETE",
  });
}

// === FUNCIONES DEPRECADAS - USAR LOS ENDPOINTS SEGUROS ===
// Estas funciones se mantienen por compatibilidad pero se recomienda usar los nuevos endpoints

// DEPRECATED: Funciones para notificaciones automáticas (uso interno del sistema - REMOVER EN PRODUCCIÓN)
export async function notificarNuevoUsuario(usuarioId: number): Promise<void> {
  return apiFetch(`/notificaciones/interno/nuevo-usuario/${usuarioId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisFinalizado(analisisId: number): Promise<void> {
  return apiFetch(`/notificaciones/interno/analisis-finalizado/${analisisId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisAprobado(analisisId: number): Promise<void> {
  return apiFetch(`/notificaciones/interno/analisis-aprobado/${analisisId}`, {
    method: "POST",
  });
}

export async function notificarAnalisisRepetir(analisisId: number): Promise<void> {
  return apiFetch(`/notificaciones/interno/analisis-repetir/${analisisId}`, {
    method: "POST",
  });
}