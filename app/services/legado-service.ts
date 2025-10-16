import { apiFetch } from "./api"
import type { LegadoSimpleDTO, LegadoDTO } from "@/app/models/interfaces/legado"

const legadoService = {
  // Obtener todos los legados
  getAll: async (): Promise<LegadoSimpleDTO[]> => {
    return apiFetch("/api/legados")
  },

  // Obtener un legado por ID
  getById: async (id: number): Promise<LegadoDTO> => {
    return apiFetch(`/api/legados/${id}`)
  },

  // Obtener legados por archivo
  getByArchivo: async (nombreArchivo: string): Promise<LegadoSimpleDTO[]> => {
    return apiFetch(`/api/legados/archivo/${nombreArchivo}`)
  },

  // Obtener legados por ficha
  getByFicha: async (ficha: string): Promise<LegadoSimpleDTO[]> => {
    return apiFetch(`/api/legados/ficha/${ficha}`)
  },

  // Desactivar un legado
  delete: async (id: number): Promise<void> => {
    await apiFetch(`/api/legados/${id}`, {
      method: "DELETE"
    })
  },
}

export default legadoService
