import { apiFetch } from "./api";
import {
  GerminacionDTO,
  GerminacionRequestDTO,
  GerminacionEditRequestDTO,
  ResponseListadoGerminacion,
  GerminacionListadoDTO
} from "../models/interfaces/germinacion";
import {
  TablaGermDTO,
  TablaGermRequestDTO,
  RepGermDTO,
  RepGermRequestDTO,
  PorcentajesRedondeoRequestDTO
} from "../models/interfaces/repeticiones";

// Germinacion functions
export async function crearGerminacion(solicitud: GerminacionRequestDTO): Promise<GerminacionDTO> {
  return apiFetch("/germinaciones", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasGerminaciones(): Promise<GerminacionDTO[]> {
  const res = await apiFetch("/germinaciones") as ResponseListadoGerminacion;
  return res.germinaciones || [];
}

export async function obtenerGerminacionesPaginadas(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean,
  estado?: string,
  loteId?: number
): Promise<{ content: GerminacionListadoDTO[], totalElements: number, totalPages: number, last: boolean, first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());
  if (estado) params.append("estado", estado);
  if (loteId !== undefined) params.append("loteId", loteId.toString());

  return apiFetch(`/germinaciones/listado?${params.toString()}`);
}

export async function obtenerGerminacionPorId(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}`);
}

export async function actualizarGerminacion(id: number, solicitud: GerminacionEditRequestDTO): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarGerminacion(id: number): Promise<void> {
  return apiFetch(`/germinaciones/${id}`, {
    method: "DELETE",
  });
}

export async function desactivarGerminacion(id: number): Promise<void> {
  return apiFetch(`/germinaciones/${id}/desactivar`, {
    method: "PUT",
  });
}

export async function activarGerminacion(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}/reactivar`, {
    method: "PUT",
  });
}

export async function obtenerGerminacionesPorIdLote(idLote: number): Promise<GerminacionDTO[]> {
  return apiFetch(`/germinaciones/lote/${idLote}`);
}

export async function finalizarAnalisis(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${id}/repetir`, {
    method: "PUT",
  });
}

// ============================================
// FUNCIONES PARA TABLAS DE GERMINACION
// ============================================

export async function obtenerTablasGerminacion(germinacionId: number): Promise<TablaGermDTO[]> {
  return apiFetch(`/germinacion/${germinacionId}/tabla`);
}

export async function obtenerTablaPorId(germinacionId: number, tablaId: number): Promise<TablaGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}`);
}

export async function crearTablaGerminacion(germinacionId: number, solicitud?: Partial<TablaGermRequestDTO>): Promise<TablaGermDTO> {
  const defaultSolicitud: TablaGermRequestDTO = {
    fechaFinal: "",
    tratamiento: "",
    productoYDosis: "",
    numSemillasPRep: 100,
    metodo: "Papel",
    temperatura: 20,
    prefrio: "No",
    pretratamiento: "Ninguno",
  };

  return apiFetch(`/germinacion/${germinacionId}/tabla`, {
    method: "POST",
    body: JSON.stringify({ ...defaultSolicitud, ...solicitud })
  });
}

export async function actualizarTablaGerminacion(
  germinacionId: number,
  tablaId: number,
  solicitud: TablaGermRequestDTO
): Promise<TablaGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarTablaGerminacion(germinacionId: number, tablaId: number): Promise<void> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}`, {
    method: "DELETE",
  });
}

export async function finalizarTabla(germinacionId: number, tablaId: number): Promise<TablaGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/finalizar`, {
    method: "PUT",
  });
}

export async function actualizarPorcentajes(
  germinacionId: number,
  tablaId: number,
  porcentajes: PorcentajesRedondeoRequestDTO
): Promise<TablaGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/porcentajes`, {
    method: "PUT",
    body: JSON.stringify(porcentajes),
  });
}

export async function puedeIngresarPorcentajes(germinacionId: number, tablaId: number): Promise<boolean> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/puede-ingresar-porcentajes`);
}

export async function contarTablasPorGerminacion(germinacionId: number): Promise<number> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/contar`);
}

// ============================================
// FUNCIONES PARA REPETICIONES
// ============================================

export async function obtenerRepeticionesDeTabla(
  germinacionId: number,
  tablaId: number
): Promise<RepGermDTO[]> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/repeticion`);
}

export async function crearRepeticion(
  germinacionId: number,
  tablaId: number,
  solicitud: RepGermRequestDTO
): Promise<RepGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/repeticion`, {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarRepeticion(
  germinacionId: number,
  tablaId: number,
  repId: number,
  solicitud: RepGermRequestDTO
): Promise<RepGermDTO> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/${repId}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarRepeticion(
  germinacionId: number,
  tablaId: number,
  repId: number
): Promise<void> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/${repId}`, {
    method: "DELETE",
  });
}

export async function contarRepeticionesPorTabla(
  germinacionId: number,
  tablaId: number
): Promise<number> {
  return apiFetch(`/germinacion/${germinacionId}/tabla/${tablaId}/repeticion/contar`);
}

// ============================================
// FUNCIONES DE FINALIZACIÓN
// ============================================

export async function finalizarGerminacion(germinacionId: number): Promise<GerminacionDTO> {
  return apiFetch(`/germinaciones/${germinacionId}/finalizar`, {
    method: "PUT",
  });
}
