import { apiFetch } from "./api";
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
    const response = await apiFetch("/api/cultivar");
    return response.map((item: any) => ({ id: item.cultivarID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener cultivares:", error);
    return [];
  }
};

export const obtenerEmpresas = async (): Promise<EmpresaOption[]> => {
  try {
    const response = await apiFetch("/api/contactos/empresas");
    return response.map((item: any) => ({ id: item.contactoID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return [];
  }
};

export const obtenerClientes = async (): Promise<ClienteOption[]> => {
  try {
    const response = await apiFetch("/api/contactos/clientes");
    return response.map((item: any) => ({ id: item.contactoID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export const obtenerDepositos = async (): Promise<DepositoOption[]> => {
  try {
    console.log("🔍 Llamando a /api/catalogo/depositos");
    const response = await apiFetch("/api/catalogo/depositos");
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
    const response = await apiFetch("/api/catalogo/humedad");
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener tipos de humedad:", error);
    return [];
  }
};

export const obtenerOrigenes = async (): Promise<OrigenOption[]> => {
  try {
    const response = await apiFetch("/api/catalogo/origenes");
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener orígenes:", error);
    return [];
  }
};

export const obtenerEstados = async (): Promise<EstadoOption[]> => {
  try {
    const response = await apiFetch("/api/catalogo/estados");
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener estados:", error);
    return [];
  }
};

export const obtenerEspecies = async (): Promise<EspecieOption[]> => {
  try {
    const response = await apiFetch("/api/especie");
    return response.map((item: any) => ({ id: item.especieID, nombre: item.nombre })) || [];
  } catch (error) {
    console.error("Error al obtener especies:", error);
    return [];
  }
};

export const obtenerUnidadesEmbolsado = async (): Promise<UnidadEmbolsadoOption[]> => {
  try {
    const response = await apiFetch("/api/catalogo/unidades-embolsado");
    return response.map((item: any) => ({ id: item.id, nombre: item.valor })) || [];
  } catch (error) {
    console.error("Error al obtener unidades de embolsado:", error);
    return [];
  }
};

export const obtenerArticulos = async (): Promise<ArticuloOption[]> => {
  try {
    console.log("🔍 Llamando a /api/catalogo/articulos");
    const response = await apiFetch("/api/catalogo/articulos");
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