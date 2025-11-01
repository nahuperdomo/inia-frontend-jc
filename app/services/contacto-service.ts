import { apiFetch } from "./api";
import { ContactoDTO, ContactoRequestDTO } from "../models";

// Funciones de contacto
export async function obtenerTodosLosContactos(): Promise<ContactoDTO[]> {
  const response = await apiFetch("/contactos");
  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.contactos && Array.isArray(response.contactos)) {
    return response.contactos;
  }
  console.warn("Formato de respuesta inesperado en obtenerTodosLosContactos:", response);
  return [];
}

export async function obtenerClientes(activo?: boolean | null): Promise<ContactoDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/contactos/clientes?${queryString}` : '/contactos/clientes';
  const response = await apiFetch(url);

  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.clientes && Array.isArray(response.clientes)) {
    return response.clientes;
  }
  console.warn("Formato de respuesta inesperado en obtenerClientes:", response);
  return [];
}

export async function obtenerEmpresas(activo?: boolean | null): Promise<ContactoDTO[]> {
  const params = new URLSearchParams();
  if (activo !== undefined && activo !== null) {
    params.append('activo', activo.toString());
  }
  const queryString = params.toString();
  const url = queryString ? `/contactos/empresas?${queryString}` : '/contactos/empresas';
  const response = await apiFetch(url);

  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.empresas && Array.isArray(response.empresas)) {
    return response.empresas;
  }
  console.warn("Formato de respuesta inesperado en obtenerEmpresas:", response);
  return [];
}

export async function obtenerContactoPorId(contactoID: number): Promise<ContactoDTO> {
  return apiFetch(`/contactos/${contactoID}`);
}

export async function crearContacto(solicitud: ContactoRequestDTO): Promise<ContactoDTO> {
  return apiFetch("/contactos", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarContacto(contactoID: number, solicitud: ContactoRequestDTO): Promise<ContactoDTO> {
  return apiFetch(`/contactos/${contactoID}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarContacto(contactoID: number): Promise<void> {
  return apiFetch(`/contactos/${contactoID}`, {
    method: "DELETE",
  });
}

export async function reactivarContacto(contactoID: number): Promise<ContactoDTO> {
  return apiFetch(`/contactos/${contactoID}/reactivar`, {
    method: "PUT",
  });
}

export async function buscarContactosPorNombre(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/contactos/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarClientes(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/contactos/clientes/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarEmpresas(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/contactos/empresas/buscar?nombre=${encodeURIComponent(nombre)}`);
}

// Función de listado paginado
export async function obtenerContactosPaginados(
  page: number = 0,
  size: number = 10,
  search?: string,
  activo?: boolean,
  tipo?: string
): Promise<{ content: ContactoDTO[]; totalElements: number; totalPages: number; last: boolean; first: boolean }> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  if (search) params.append("search", search);
  if (activo !== undefined) params.append("activo", activo.toString());
  if (tipo) params.append("tipo", tipo);

  const response = await apiFetch(`/api/contactos/listado?${params.toString()}`);
  
  // Manejar ambos formatos de respuesta (con y sin objeto 'page')
  const content = response.content || [];
  const pageMeta = response.page ? response.page : response;
  
  return {
    content,
    totalElements: pageMeta.totalElements || 0,
    totalPages: pageMeta.totalPages || 0,
    last: pageMeta.last || false,
    first: pageMeta.first || true
  };
}
