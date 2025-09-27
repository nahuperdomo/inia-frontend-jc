import { apiFetch } from "./api";

export interface ContactoDTO {
  contactoID: number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoContacto: 'CLIENTE' | 'EMPRESA';
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface ContactoRequestDTO {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tipoContacto: 'CLIENTE' | 'EMPRESA';
}

// Funciones de contacto
export async function obtenerTodosLosContactos(): Promise<ContactoDTO[]> {
  return apiFetch("/api/contactos");
}

export async function obtenerClientes(): Promise<ContactoDTO[]> {
  return apiFetch("/api/contactos/clientes");
}

export async function obtenerEmpresas(): Promise<ContactoDTO[]> {
  return apiFetch("/api/contactos/empresas");
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