import { apiFetch } from "./api"

export interface LoteSimple {
  loteID: number
  numeroFicha: number
  ficha: string
  activo: boolean
}

const MOCK_LOTES: LoteSimple[] = [
  { loteID: 18, numeroFicha: 1001, ficha: "RG-LE-ex-0018", activo: true },
  { loteID: 19, numeroFicha: 1002, ficha: "RG-LE-ex-0019", activo: true },
  { loteID: 20, numeroFicha: 1003, ficha: "RG-LE-ex-0020", activo: true },
  { loteID: 21, numeroFicha: 1004, ficha: "RG-LE-ex-0021", activo: true },
  { loteID: 22, numeroFicha: 1005, ficha: "RG-LE-ex-0022", activo: true },
  { loteID: 23, numeroFicha: 1006, ficha: "RG-LE-ex-0023", activo: true },
  { loteID: 24, numeroFicha: 1007, ficha: "RG-LE-ex-0024", activo: true },
  { loteID: 25, numeroFicha: 1008, ficha: "RG-LE-ex-0025", activo: true },
  { loteID: 26, numeroFicha: 1009, ficha: "RG-LE-ex-0026", activo: true },
  { loteID: 27, numeroFicha: 1010, ficha: "RG-LE-ex-0027", activo: true },
]

export async function obtenerLotesActivos(): Promise<LoteSimple[]> {
  try {
    const res = await apiFetch("/api/lotes/activos")
    // El backend responde { lotes: [...] }
    return res.lotes || []
  } catch (error) {
    console.log("[v0] API failed, returning mock lotes for testing:", error)
    return MOCK_LOTES
  }
}
