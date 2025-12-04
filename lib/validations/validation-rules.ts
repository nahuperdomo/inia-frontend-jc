


export const required = (value: any): string | null => {
    if (value === undefined || value === null || value === '') {
        return 'Este campo es obligatorio';
    }
    return null;
};


export const isNumber = (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    if (isNaN(Number(value))) {
        return 'Debe ser un número válido';
    }
    return null;
};


export const minValue = (min: number) => (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min) {
        return `Debe ser mayor o igual a ${min}`;
    }
    return null;
};


export const maxValue = (max: number) => (value: any): string | null => {
    if (value === '' || value === undefined || value === null) return null;
    const numValue = Number(value);
    if (isNaN(numValue) || numValue > max) {
        return `Debe ser menor o igual a ${max}`;
    }
    return null;
};


export const minLength = (min: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
        return `Debe tener al menos ${min} caracteres`;
    }
    return null;
};


export const maxLength = (max: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
        return `Debe tener máximo ${max} caracteres`;
    }
    return null;
};


export const pattern = (regex: RegExp, message: string) => (value: string): string | null => {
    if (!value) return null;
    if (!regex.test(value)) {
        return message;
    }
    return null;
};


export const isValidDate = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return 'Fecha no válida';
    }
    return null;
};


export const isValidDateOptional = (value: string): string | null => {
    // Si está completamente vacío, es válido (campo opcional)
    if (!value || value === '') return null;
    
    // Si tiene algún contenido, debe ser una fecha válida
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return 'Fecha no válida';
    }
    return null;
};


export const isPastOrPresent = (value: string): string | null => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    
    // Establecer la hora de today a las 23:59:59 para permitir fechas del día actual
    today.setHours(23, 59, 59, 999);
    
    if (date > today) {
        return 'La fecha no puede ser posterior a la fecha actual';
    }
    return null;
};


export const isFutureOrPresent = (value: string): string | null => {
    if (!value) return null;
    
    // Para inputs de tipo date, el valor viene en formato YYYY-MM-DD
    // Crear la fecha en UTC para evitar problemas de timezone
    const [year, month, day] = value.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
        return 'La fecha no puede ser anterior a la fecha actual';
    }
    return null;
};


export const isAfterDate = (dateToCompare: string | Date, fieldName?: string) => (value: string): string | null => {
    if (!value || !dateToCompare) return null;

    const date = new Date(value);
    const compareDate = new Date(dateToCompare);

    if (date <= compareDate) {
        return `Debe ser posterior a ${fieldName || 'la fecha de referencia'}`;
    }
    return null;
};


export const isEmail = (value: string): string | null => {
    if (!value) return null;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value)) {
        return 'Dirección de email no válida';
    }
    return null;
};


export const compose = (validators: Array<(value: any) => string | null>) => (value: any): string | null => {
    for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
    }
    return null;
};