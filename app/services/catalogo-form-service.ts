const API_URL = process.env.NEXT_PUBLIC_API_URL;
import {
  CultivarOption,
  EmpresaOption,
  ClienteOption,
  DepositoOption,
  TipoHumedadOption,
  OrigenOption,
  EstadoOption,
  EspecieOption,
  UnidadEmbolsadoOption,
  ArticuloOption
} from "@/app/models/interfaces/lote";

// Opciones estáticas (pueden convertirse en dinámicas más adelante)
export const tipoOptions = [
  { id: "INTERNO", nombre: "Interno" },
  { id: "OTROS_CENTROS_COSTOS", nombre: "Otros Centros de Costos" },
  { id: "EXTERNOS", nombre: "Externos" }
];

// Servicios para obtener datos del backend
export const obtenerCultivares = async (): Promise<CultivarOption[]> => {
  try {
    const res = await fetch(`${API_URL}/cultivar`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.cultivarID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener cultivares:", error);
    return [];
  }
};

export const obtenerEmpresas = async (): Promise<EmpresaOption[]> => {
  try {
    const res = await fetch(`${API_URL}/contactos/empresas`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.contactoID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return [];
  }
};

export const obtenerClientes = async (): Promise<ClienteOption[]> => {
  try {
    const res = await fetch(`${API_URL}/contactos/clientes`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.contactoID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export const obtenerDepositos = async (): Promise<DepositoOption[]> => {
  try {
    console.log("🔍 Llamando a /catalogo/depositos");
    const res = await fetch(`${API_URL}/catalogo/depositos`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    console.log("📦 Response depositos:", response);
    console.log("📦 Response type:", typeof response);
    console.log("📦 Response isArray:", Array.isArray(response));
    if (Array.isArray(response)) {
      console.log("📦 Response length:", response.length);
      if (response.length > 0) {
        console.log("📦 First item:", response[0]);
      }
    }
    const mapped = response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
    console.log("📦 Mapped depositos:", mapped);
    return mapped;
  } catch (error) {
    console.error("❌ Error al obtener depósitos:", error);
    return [];
  }
};

export const obtenerTiposHumedad = async (): Promise<TipoHumedadOption[]> => {
  try {
    const res = await fetch(`${API_URL}/catalogo/humedad`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener tipos de humedad:", error);
    return [];
  }
};

export const obtenerOrigenes = async (): Promise<OrigenOption[]> => {
  try {
    const res = await fetch(`${API_URL}/catalogo/origenes`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener orígenes:", error);
    return [];
  }
};

export const obtenerEstados = async (): Promise<EstadoOption[]> => {
  try {
    const res = await fetch(`${API_URL}/catalogo/estados`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener estados:", error);
    return [];
  }
};

export const obtenerEspecies = async (): Promise<EspecieOption[]> => {
  try {
    const res = await fetch(`${API_URL}/especie`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.especieID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener especies:", error);
    return [];
  }
};

export const obtenerUnidadesEmbolsado = async (): Promise<UnidadEmbolsadoOption[]> => {
  try {
    const res = await fetch(`${API_URL}/catalogo/unidades-embolsado`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener unidades de embolsado:", error);
    return [];
  }
};

export const obtenerArticulos = async (): Promise<ArticuloOption[]> => {
  try {
    console.log("🔍 Llamando a /catalogo/articulos");
    const res = await fetch(`${API_URL}/catalogo/articulos`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    const response = await res.json();
    console.log("📦 Response articulos:", response);
    if (Array.isArray(response)) {
      console.log("📦 Response length:", response.length);
      if (response.length > 0) {
        console.log("📦 First item:", response[0]);
      }
    }
    const mapped = response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
    console.log("📦 Mapped articulos:", mapped);
    return mapped;
  } catch (error) {
    console.error("❌ Error al obtener artículos:", error);
    return [];
  }
};