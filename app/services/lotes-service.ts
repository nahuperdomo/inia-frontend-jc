import { apiFetch } from "./api";
import { LoteRequestDTO, LoteDTO, ResponseListadoLote } from "@/app/models/interfaces/lote";

export const getLotes = async (): Promise<LoteDTO[]> => {
    const response: ResponseListadoLote = await apiFetch("/api/lotes/activos");
    return response.lotes || []; // Devolvemos el array de lotes o un array vacío si no hay datos
};

export const getLoteById = async (id: string): Promise<LoteDTO> => {
    const response = await apiFetch(`/api/lotes/${id}`);
    return response;
};

export const createLote = async (loteData: LoteRequestDTO): Promise<LoteDTO> => {
    return apiFetch("/api/lotes", {
        method: "POST",
        body: JSON.stringify(loteData),
    });
};

export const updateLote = async (id: string, loteData: Partial<LoteRequestDTO>): Promise<LoteDTO> => {
    return apiFetch(`/api/lotes/${id}`, {
        method: "PUT",
        body: JSON.stringify(loteData),
    });
};

export const deleteLote = async (id: string): Promise<void> => {
    return apiFetch(`/api/lotes/${id}`, {
        method: "DELETE",
    });
};
