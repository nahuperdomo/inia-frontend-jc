import { apiFetch } from "./api";
import { 
  PurezaDTO, 
  PurezaRequestDTO, 
  ResponseListadoPureza,
  MalezasYCultivosCatalogoDTO 
} from "../models";

// Pureza specific interfaces extending base classes
// Pureza functions
export async function crearPureza(solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch("/api/purezas", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function obtenerTodasPurezasActivas(): Promise<PurezaDTO[]> {
  const res = await apiFetch("/api/purezas") as ResponseListadoPureza;
  return res.purezas || [];
}

export async function obtenerPurezaPorId(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}`);
}

export async function actualizarPureza(id: number, solicitud: PurezaRequestDTO): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarPureza(id: number): Promise<void> {
  return apiFetch(`/api/purezas/${id}`, {
    method: "DELETE",
  });
}

export async function obtenerPurezasPorIdLote(idLote: number): Promise<PurezaDTO[]> {
  return apiFetch(`/api/purezas/lote/${idLote}`);
}

export async function obtenerTodosCatalogos(): Promise<MalezasYCultivosCatalogoDTO[]> {
  return apiFetch("/api/purezas/catalogos");
}

export async function finalizarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/finalizar`, {
    method: "PUT",
  });
}

export async function aprobarAnalisis(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/aprobar`, {
    method: "PUT",
  });
}

export async function marcarParaRepetir(id: number): Promise<PurezaDTO> {
  return apiFetch(`/api/purezas/${id}/repetir`, {
    method: "PUT",
  });
}