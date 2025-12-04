

import { validarCamposUnicos } from "@/app/services/validaciones-service";

export async function validarFichaUnica(ficha: string, loteId?: number): Promise<boolean> {
    try {
        const resultado = await validarCamposUnicos({ ficha, nomLote: '', loteID: loteId });
        return !resultado.fichaExiste;
    } catch (error) {
        console.error('Error al validar ficha:', error);
        return true; // En caso de error, permitimos continuar
    }
}

export async function validarNombreLoteUnico(nomLote: string, loteId?: number): Promise<boolean> {
    try {
        const resultado = await validarCamposUnicos({ ficha: '', nomLote, loteID: loteId });
        return !resultado.nomLoteExiste;
    } catch (error) {
        console.error('Error al validar nombre de lote:', error);
        return true; // En caso de error, permitimos continuar
    }
}