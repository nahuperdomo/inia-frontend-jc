import type { TipoNotificacion } from "../types/enums";

export interface NotificacionDTO {
  id: number;
  nombre: string;
  mensaje: string;
  leido: boolean;
  activo: boolean;
  fechaCreacion: string;
  usuarioId: number;
  usuarioNombre: string;
  analisisId?: number;
  tipo: TipoNotificacion;
}

export interface NotificacionRequestDTO {
  nombre: string;
  mensaje: string;
  usuarioId: number;
  analisisId?: number;
  tipo: TipoNotificacion;
}

export interface PaginatedNotificaciones {
  content: NotificacionDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
