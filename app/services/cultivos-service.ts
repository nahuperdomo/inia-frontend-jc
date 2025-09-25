import { apiFetch } from "@/app/services/api"

export type CultivoCatalogo = {
  catalogoID: number
  nombreComun: string
  nombreCientifico: string
  maleza: boolean
}

export async function obtenerCultivos(): Promise<CultivoCatalogo[]> {
  const data = await apiFetch("/api/malezas-cultivos") as CultivoCatalogo[]

  // solo cultivos
  return data.filter((item) => item.maleza === false)
}
