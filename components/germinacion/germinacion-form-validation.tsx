"use client"

import { useState, useEffect } from "react"

export interface GerminacionFormData {
  idLote: number
  fechaInicioGerm: string
  fechaConteos: string[]
  fechaUltConteo: string
  numeroRepeticiones: number
  numeroConteos: number
  numDias: string
  comentarios?: string
}

export interface ValidationErrors {
  idLote?: string
  fechaInicioGerm?: string
  fechaConteos?: string
  fechaUltConteo?: string
  numeroRepeticiones?: string
  numeroConteos?: string
  numDias?: string
}

export function useGerminacionValidation(formData: GerminacionFormData) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const newErrors: ValidationErrors = {}

    // Validate idLote
    if (!formData.idLote || formData.idLote <= 0) {
      newErrors.idLote = "Debe seleccionar un lote válido"
    }

    // Validate fechaInicioGerm
    if (!formData.fechaInicioGerm) {
      newErrors.fechaInicioGerm = "La fecha de inicio es requerida"
    }

    // Validate fechaUltConteo
    if (!formData.fechaUltConteo) {
      newErrors.fechaUltConteo = "La fecha del último conteo es requerida"
    }

    // Validate date sequence
    if (formData.fechaInicioGerm && formData.fechaUltConteo) {
      const fechaInicio = new Date(formData.fechaInicioGerm)
      const fechaUltimo = new Date(formData.fechaUltConteo)
      if (fechaUltimo <= fechaInicio) {
        newErrors.fechaUltConteo = "La fecha del último conteo debe ser posterior a la fecha de inicio"
      }
    }

    // Validate numeroRepeticiones
    if (!formData.numeroRepeticiones || formData.numeroRepeticiones <= 0) {
      newErrors.numeroRepeticiones = "El número de repeticiones debe ser mayor a 0"
    }

    // Validate numeroConteos
    if (!formData.numeroConteos || formData.numeroConteos <= 0) {
      newErrors.numeroConteos = "El número de conteos debe ser mayor a 0"
    }

    // Validate fechaConteos (array no-null)
    if (!formData.fechaConteos || formData.fechaConteos.length !== formData.numeroConteos) {
      newErrors.fechaConteos = `Debe especificar exactamente ${formData.numeroConteos} fechas de conteo`
    } else {
      const emptyDates = formData.fechaConteos.filter((fecha) => !fecha || fecha.trim() === "")
      if (emptyDates.length > 0) {
        newErrors.fechaConteos = "Todas las fechas de conteo son obligatorias (array no-null)"
      } else {
        // Validate date sequence in fechaConteos
        const sortedDates = [...formData.fechaConteos].sort()
        const isSequential = sortedDates.every((fecha, index) => {
          if (index === 0) return true
          return new Date(fecha) >= new Date(sortedDates[index - 1])
        })
        if (!isSequential) {
          newErrors.fechaConteos = "Las fechas de conteo deben estar en orden cronológico"
        }
      }
    }

    // Validate numDias
    if (!formData.numDias || formData.numDias.trim() === "") {
      newErrors.numDias = "El número de días es requerido"
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [formData])

  return { errors, isValid }
}

export function GerminacionValidationSummary({ errors }: { errors: ValidationErrors }) {
  const errorCount = Object.keys(errors).length

  if (errorCount === 0) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-700">✓ Todos los campos están correctamente completados</p>
      </div>
    )
  }

  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-700 font-medium mb-2">
        Se encontraron {errorCount} error{errorCount > 1 ? "es" : ""} de validación:
      </p>
      <ul className="text-sm text-red-600 space-y-1">
        {Object.entries(errors).map(([field, error]) => (
          <li key={field}>• {error}</li>
        ))}
      </ul>
    </div>
  )
}
