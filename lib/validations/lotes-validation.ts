

import { ValidationSchema } from '../hooks/useValidation';
import { TipoAnalisis } from '@/app/models/types/enums';
import {
    required,
    isNumber,
    minValue,
    minLength,
    isValidDate,
    isPastOrPresent,
    isFutureOrPresent,
    compose
} from './validation-rules';


export interface LoteFormData {
    ficha: string;
    nomLote: string;
    cultivarID: number | "";
    tipo: string;
    empresaID: number | "";
    clienteID: number | "";
    codigoCC: string;
    codigoFF: string;
    fechaEntrega: string;
    fechaRecibo: string;
    depositoID: number | "";
    unidadEmbolsado: string;
    remitente: string;
    observaciones: string;
    kilosLimpios: number | "";
    datosHumedad: Array<{
        tipoHumedadID: number | "";
        valor: number | "";
    }>;
    numeroArticuloID: number | "";
    origenID: number | "";
    estadoID: number | "";
    fechaCosecha: string;
    tiposAnalisisAsignados: TipoAnalisis[];
}


export const loteValidationSchema: ValidationSchema<LoteFormData> = {
    // Pestaña "datos"
    ficha: minLength(2),
    nomLote: minLength(2),
    cultivarID: compose([
        required,
        isNumber
    ]),
    tipo: required,

    // Pestaña "empresa"
    empresaID: compose([
        required,
        isNumber
    ]),
    clienteID: compose([
        required,
        isNumber
    ]),
    codigoCC: minLength(2),
    codigoFF: minLength(2),

    // Pestaña "recepcion"
    fechaEntrega: compose([
        isValidDate,
        isFutureOrPresent
    ]),
    fechaRecibo: compose([
        required,
        isValidDate,
        isPastOrPresent
    ]),
    depositoID: isNumber,
    unidadEmbolsado: minLength(1),
    remitente: minLength(2),

    // Pestaña "calidad"
    kilosLimpios: compose([
        required,
        isNumber,
        minValue(0.1)
    ]),
    // La validación de datosHumedad se maneja de forma especial en el componente
    numeroArticuloID: isNumber,
    origenID: compose([
        required,
        isNumber
    ]),
    estadoID: compose([
        required,
        isNumber
    ]),
    fechaCosecha: compose([
        isValidDate,
        isPastOrPresent
    ]),
    tiposAnalisisAsignados: (value: TipoAnalisis[]) => {
        if (!value || value.length === 0) {
            return 'Debe seleccionar al menos un tipo de análisis';
        }
        return null;
    }
};


export const validateHumedadData = (data: Array<{ tipoHumedadID: number | "", valor: number | "" }>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (data && data.length > 0) {
        const firstItem = data[0];

        if (!firstItem.tipoHumedadID && firstItem.tipoHumedadID !== 0) {
            errors['tipoHumedadID'] = 'El tipo de humedad es obligatorio';
        }

        if (!firstItem.valor && firstItem.valor !== 0) {
            errors['valorHumedad'] = 'El valor de humedad es obligatorio';
        } else if (isNaN(Number(firstItem.valor))) {
            errors['valorHumedad'] = 'Debe ser un número válido';
        } else if (Number(firstItem.valor) < 0 || Number(firstItem.valor) > 100) {
            errors['valorHumedad'] = 'El valor debe estar entre 0 y 100';
        }
    }

    return errors;
};