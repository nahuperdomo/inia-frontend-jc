import { apiFetch } from "./api";

interface LoteData {
    numeroFicha: number
    ficha: string
    cultivarID: number
    tipo: string
    empresaID: number
    clienteID: number
    codigoCC: string
    codigoFF: string
    fechaEntrega: string
    fechaRecibo: string
    depositoID: number
    unidadEmbolsado: string
    remitente: string
    observaciones: string
    kilosLimpios: number
    datosHumedad: Array<{
        tipoHumedadID: number
        valor: number
    }>
    numeroArticuloID: number
    cantidad: number
    origenID: number
    estadoID: number
    fechaCosecha: string
}

export const getLotes = async () => {
    const response = await apiFetch("/api/lotes/activos");
    return response.lotes || []; // Devolvemos el array de lotes o un array vacío si no hay datos
};

export const obtenerLotesPaginadas = async (page: number = 0, size: number = 10): Promise<any> => {
    return apiFetch(`/api/lotes/listado?page=${page}&size=${size}`);
};

export const getLoteById = async (id: string) => {
    const response = await apiFetch(`/api/lotes/${id}`);
    return response;
};

export const createLote = async (loteData: LoteData) => {
    return apiFetch("/api/lotes", {
        method: "POST",
        body: JSON.stringify(loteData),
    });
};

export const updateLote = async (id: string, loteData: Partial<LoteData>) => {
    return apiFetch(`/api/lotes/${id}`, {
        method: "PUT",
        body: JSON.stringify(loteData),
    });
};

export const deleteLote = async (id: string) => {
    return apiFetch(`/api/lotes/${id}`, {
        method: "DELETE",
    });
};
