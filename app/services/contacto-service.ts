import { apiFetch } from "./api";
import { ContactoDTO, ContactoRequestDTO } from "../models";

// Funciones de contacto
export async function obtenerTodosLosContactos(): Promise<ContactoDTO[]> {
  const response = await apiFetch("/api/contactos");
  // Asegurar que siempre devolvemos un array, incluso si la respuesta está en otra estructura
  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.contactos && Array.isArray(response.contactos)) {
    // Si la respuesta viene en formato { contactos: [...] }
    return response.contactos;
  }
  console.warn("Formato de respuesta inesperado en obtenerTodosLosContactos:", response);
  return [];
}

export async function obtenerClientes(): Promise<ContactoDTO[]> {
  const response = await apiFetch("/api/contactos/clientes");
  // Asegurar que siempre devolvemos un array, incluso si la respuesta está en otra estructura
  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.clientes && Array.isArray(response.clientes)) {
    // Si la respuesta viene en formato { clientes: [...] }
    return response.clientes;
  }
  console.warn("Formato de respuesta inesperado en obtenerClientes:", response);
  return [];
}

export async function obtenerEmpresas(): Promise<ContactoDTO[]> {
  const response = await apiFetch("/api/contactos/empresas");
  // Asegurar que siempre devolvemos un array, incluso si la respuesta está en otra estructura
  if (response && Array.isArray(response)) {
    return response;
  } else if (response && response.empresas && Array.isArray(response.empresas)) {
    // Si la respuesta viene en formato { empresas: [...] }
    return response.empresas;
  }
  console.warn("Formato de respuesta inesperado en obtenerEmpresas:", response);
  return [];
}

export async function obtenerContactoPorId(contactoID: number): Promise<ContactoDTO> {
  return apiFetch(`/api/contactos/${contactoID}`);
}

export async function crearContacto(solicitud: ContactoRequestDTO): Promise<ContactoDTO> {
  return apiFetch("/api/contactos", {
    method: "POST",
    body: JSON.stringify(solicitud),
  });
}

export async function actualizarContacto(contactoID: number, solicitud: ContactoRequestDTO): Promise<ContactoDTO> {
  return apiFetch(`/api/contactos/${contactoID}`, {
    method: "PUT",
    body: JSON.stringify(solicitud),
  });
}

export async function eliminarContacto(contactoID: number): Promise<void> {
  return apiFetch(`/api/contactos/${contactoID}`, {
    method: "DELETE",
  });
}

export async function reactivarContacto(contactoID: number): Promise<ContactoDTO> {
  return apiFetch(`/api/contactos/${contactoID}/reactivar`, {
    method: "PATCH",
  });
}

export async function buscarContactosPorNombre(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/api/contactos/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarClientes(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/api/contactos/clientes/buscar?nombre=${encodeURIComponent(nombre)}`);
}

export async function buscarEmpresas(nombre: string): Promise<ContactoDTO[]> {
  return apiFetch(`/api/contactos/empresas/buscar?nombre=${encodeURIComponent(nombre)}`);
}