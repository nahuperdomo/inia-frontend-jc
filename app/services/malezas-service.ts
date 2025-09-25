import { apiFetch } from "@/app/services/api"

export type MalezaCatalogo = {
  catalogoid: number
  nombreComun: string
  nombreCientifico: string
  maleza: boolean
  activo: boolean
}

export async function obtenerMalezas(): Promise<MalezaCatalogo[]> {
  const data = await apiFetch("/api/malezas-cultivos") as MalezaCatalogo[]
  
  return data.filter((item) => item.maleza === true)
}
