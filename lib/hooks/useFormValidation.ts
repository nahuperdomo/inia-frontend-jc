"use client"

import { useState } from "react"
import { z } from "zod"

type ValidationResult = {
    isValid: boolean
    errors: Record<string, string>
}


export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    schema: z.ZodType<T>
) {
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    
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

    
    const handleBlur = (fieldName: string, value: any, data: T) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }))
        validateField(fieldName, value, data)
    }

    
    const isValid = (data: T) => {
        const { isValid } = validateForm(data)
        return isValid
    }

    
    const hasError = (fieldName: string): boolean => {
        return Boolean(touched[fieldName] && errors[fieldName])
    }

    
    const getErrorMessage = (fieldName: string): string => {
        return touched[fieldName] ? errors[fieldName] || "" : ""
    }

    
    const touchAll = (data: T) => {
        const touchedFields: Record<string, boolean> = {}
        Object.keys(data).forEach(key => {
            touchedFields[key] = true
        })
        setTouched(touchedFields)
        validateForm(data)
    }

    
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