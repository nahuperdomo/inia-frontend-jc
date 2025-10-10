"use client"

import { useState } from "react"
import { z } from "zod"

type ValidationResult = {
    isValid: boolean
    errors: Record<string, string>
}

/**
 * Custom hook para gestionar la validación de formularios
 * 
 * @param initialData Datos iniciales del formulario
 * @param schema Esquema de validación Zod
 * @returns Funciones y estados para manejar la validación
 */
export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    schema: z.ZodType<T>
) {
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    /**
     * Validar todo el formulario
     */
    const validateForm = (data: T): ValidationResult => {
        try {
            schema.parse(data)
            return { isValid: true, errors: {} }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {}
                error.errors.forEach((err) => {
                    if (err.path.length > 0) {
                        formattedErrors[err.path.join(".")] = err.message
                    }
                })
                setErrors(formattedErrors)
                return { isValid: false, errors: formattedErrors }
            }
            return { isValid: false, errors: { form: "Error de validación" } }
        }
    }

    /**
     * Validar un campo específico
     */
    const validateField = (fieldName: string, value: any, data: T) => {
        try {
            // Validamos solo el valor del campo dentro del contexto completo
            const dataToValidate = { ...data, [fieldName]: value }
            schema.parse(dataToValidate)
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
            return true
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldError = error.errors[0]?.message
                setErrors(prev => ({ ...prev, [fieldName]: fieldError }))
                return false
            }
            return true
        }
    }

    /**
     * Marcar un campo como "tocado" y validarlo
     */
    const handleBlur = (fieldName: string, value: any, data: T) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }))
        validateField(fieldName, value, data)
    }

    /**
     * Verificar si el formulario es válido
     */
    const isValid = (data: T) => {
        const { isValid } = validateForm(data)
        return isValid
    }

    /**
     * Verificar si un campo tiene error
     */
    const hasError = (fieldName: string): boolean => {
        return Boolean(touched[fieldName] && errors[fieldName])
    }

    /**
     * Obtener mensaje de error de un campo
     */
    const getErrorMessage = (fieldName: string): string => {
        return touched[fieldName] ? errors[fieldName] || "" : ""
    }

    /**
     * Marcar todos los campos como tocados
     */
    const touchAll = (data: T) => {
        const touchedFields: Record<string, boolean> = {}
        Object.keys(data).forEach(key => {
            touchedFields[key] = true
        })
        setTouched(touchedFields)
        validateForm(data)
    }

    /**
     * Restablecer el estado de validación
     */
    const resetValidation = () => {
        setTouched({})
        setErrors({})
    }

    return {
        validateForm,
        validateField,
        handleBlur,
        isValid,
        hasError,
        getErrorMessage,
        touchAll,
        resetValidation,
        errors
    }
}