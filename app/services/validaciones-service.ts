// service.ts
import { apiFetch } from '@/lib/api-client';

interface ValidacionLoteDTO {
  ficha: string;
  nomLote: string;
  loteID?: number;
}

interface ValidacionLoteResponseDTO {
  fichaExiste: boolean;
  nomLoteExiste: boolean;
}

export async function validarCamposUnicos(data: ValidacionLoteDTO): Promise<ValidacionLoteResponseDTO> {
  return await apiFetch<ValidacionLoteResponseDTO>('/api/lotes/validar-campos', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}