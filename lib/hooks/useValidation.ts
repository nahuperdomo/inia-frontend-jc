/**
 * Hook personalizado para manejar validación de formularios
 */

import { useState, useCallback, useMemo } from 'react';

// Tipo para el schema de validación
export type ValidationSchema<T extends Record<string, any>> = {
    [K in keyof T]?: (value: T[K], allValues: T) => string | null;
};

/**
 * Hook que maneja la validación del formulario
 * @param initialValues - Valores iniciales del formulario
 * @param schema - Esquema de validación
 */
export function useValidation<T extends Record<string, any>>(
    initialValues: T,
    validationSchema: ValidationSchema<T>
) {
    // Estado para los errores de validación
    const [errors, setErrors] = useState<Record<string, string>>({});
    // Estado para los campos "tocados" (que han sido modificados o han perdido el foco)
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Validar un campo específico
    const validateField = useCallback(
        (name: keyof T, value: any, allValues: T): string | null => {
            const validator = validationSchema[name];
            if (!validator) return null;
            return validator(value, allValues);
        },
        [validationSchema]
    );

    // Validar todos los campos
    const validateForm = useCallback(
        (values: T): Record<string, string> => {
            const newErrors: Record<string, string> = {};

            Object.keys(validationSchema).forEach((key) => {
                const fieldName = key as keyof T;
                const error = validateField(fieldName, values[fieldName], values);
                if (error) {
                    newErrors[key] = error;
                }
            });

            setErrors(newErrors);
            return newErrors;
        },
        [validateField, validationSchema]
    );

    // Verificar si el formulario es válido
    const isValid = useCallback(
        (values: T): boolean => {
            const formErrors = validateForm(values);
            return Object.keys(formErrors).length === 0;
        },
        [validateForm]
    );

    // Manejar el evento onBlur
    const handleBlur = useCallback(
        (fieldName: string, value: any, allValues: T) => {
            setTouched((prev) => ({ ...prev, [fieldName]: true }));

            const error = validateField(fieldName as keyof T, value, allValues);
            setErrors((prev) => ({
                ...prev,
                [fieldName]: error || ''
            }));
        },
        [validateField]
    );

    // Verificar si un campo tiene error y ha sido tocado
    const hasError = useCallback(
        (fieldName: string): boolean => {
            return touched[fieldName] === true && !!errors[fieldName];
        },
        [touched, errors]
    );

    // Obtener el mensaje de error de un campo
    const getErrorMessage = useCallback(
        (fieldName: string): string => {
            return touched[fieldName] && errors[fieldName] ? errors[fieldName] : '';
        },
        [touched, errors]
    );

    // Marcar todos los campos como tocados (útil al enviar el formulario)
    const touchAll = useCallback(
        (values: T) => {
            const touchedFields: Record<string, boolean> = {};
            Object.keys(validationSchema).forEach((key) => {
                touchedFields[key] = true;
            });
            setTouched(touchedFields);
            validateForm(values);
        },
        [validateForm, validationSchema]
    );

    // Reiniciar el estado de validación
    const resetValidation = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    // Resultados del hook
    const validationHelpers = useMemo(
        () => ({
            errors,
            touched,
            validateField,
            validateForm,
            isValid,
            handleBlur,
            hasError,
            getErrorMessage,
            touchAll,
            resetValidation,
        }),
        [
            errors,
            touched,
            validateField,
            validateForm,
            isValid,
            handleBlur,
            hasError,
            getErrorMessage,
            touchAll,
            resetValidation,
        ]
    );

    return validationHelpers;
}

export default useValidation;