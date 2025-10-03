/**
 * Biblioteca de reglas de validación reutilizables
 * Este archivo contiene funciones de validación para distintos tipos de datos
 */

/**
 * Verifica si un valor es requerido (no está vacío)
 */
export const required = (value: any): string | null => {
    if (value === undefined || value === null || value === '') {
        return 'Este campo es obligatorio';
    }
    return null;
};

/**
 * Verifica si un valor es un número válido
 */
export const isNumber = (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    if (isNaN(Number(value))) {
        return 'Debe ser un número válido';
    }
    return null;
};

/**
 * Verifica si un número es mayor que un valor mínimo
 */
export const minValue = (min: number) => (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
        return `Debe ser mayor o igual a ${min}`;
    }
    return null;
};

/**
 * Verifica si un número es menor que un valor máximo
 */
export const maxValue = (max: number) => (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > max) {
        return `Debe ser menor o igual a ${max}`;
    }
    return null;
};

/**
 * Verifica si una cadena tiene una longitud mínima
 */
export const minLength = (min: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
        return `Debe tener al menos ${min} caracteres`;
    }
    return null;
};

/**
 * Verifica si una cadena tiene una longitud máxima
 */
export const maxLength = (max: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
        return `Debe tener máximo ${max} caracteres`;
    }
    return null;
};

/**
 * Verifica si una cadena coincide con un patrón (expresión regular)
 */
export const pattern = (regex: RegExp, message: string) => (value: string): string | null => {
    if (!value) return null;
    if (!regex.test(value)) {
        return message;
    }
    return null;
};

/**
 * Verifica si una fecha es válida
 */
export const isValidDate = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return 'Fecha no válida';
    }
    return null;
};

/**
 * Verifica si una fecha es posterior a otra
 */
export const isAfterDate = (dateToCompare: string | Date, fieldName?: string) => (value: string): string | null => {
    if (!value || !dateToCompare) return null;

    const date = new Date(value);
    const compareDate = new Date(dateToCompare);

    if (date <= compareDate) {
        return `Debe ser posterior a ${fieldName || 'la fecha de referencia'}`;
    }
    return null;
};

/**
 * Verifica si un email es válido
 */
export const isEmail = (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
        return 'Dirección de email no válida';
    }
    return null;
};

/**
 * Combina múltiples validaciones en una sola
 */
export const compose = (validators: Array<(value: any) => string | null>) => (value: any): string | null => {
    for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
    }
    return null;
};