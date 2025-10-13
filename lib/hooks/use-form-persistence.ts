/**
 * Hook reutilizable para persistir el estado de formularios
 * Guarda automáticamente en sessionStorage para mantener datos durante navegación entre tabs
 * Se limpia automáticamente al cerrar la pestaña del navegador
 */

import { useState, useEffect, useCallback } from "react"

interface UsePersistentFormOptions {
  storageKey: string // Clave única para identificar el formulario
  initialData?: any // Datos iniciales opcionales
  storage?: "session" | "local" // Tipo de storage (default: session)
  expirationMinutes?: number // Tiempo de expiración opcional (solo para localStorage)
}

interface StorageData<T> {
  data: T
  timestamp: number
}

export function usePersistentForm<T extends Record<string, any>>(options: UsePersistentFormOptions) {
  const {
    storageKey,
    initialData = {},
    storage = "session",
    expirationMinutes
  } = options

  const getStorage = () => {
    if (typeof window === "undefined") return null
    return storage === "local" ? window.localStorage : window.sessionStorage
  }

  // Cargar datos del storage
  const loadFromStorage = useCallback((): T => {
    try {
      const storageInstance = getStorage()
      if (!storageInstance) return initialData

      const stored = storageInstance.getItem(storageKey)
      if (!stored) return initialData

      const parsed: StorageData<T> = JSON.parse(stored)

      // Verificar expiración (solo para localStorage)
      if (storage === "local" && expirationMinutes) {
        const now = Date.now()
        const elapsed = (now - parsed.timestamp) / 1000 / 60 // en minutos
        if (elapsed > expirationMinutes) {
          storageInstance.removeItem(storageKey)
          return initialData
        }
      }

      return parsed.data
    } catch (error) {
      console.error("Error loading from storage:", error)
      return initialData
    }
  }, [storageKey, initialData, storage, expirationMinutes])

  const [formState, setFormState] = useState<T>(loadFromStorage)

  // Guardar en storage cada vez que cambia el estado
  useEffect(() => {
    try {
      const storageInstance = getStorage()
      if (!storageInstance) return

      const dataToStore: StorageData<T> = {
        data: formState,
        timestamp: Date.now()
      }

      storageInstance.setItem(storageKey, JSON.stringify(dataToStore))
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }, [formState, storageKey, storage])

  // Función para actualizar un campo
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Función para actualizar múltiples campos
  const updateFields = useCallback((fields: Partial<T>) => {
    setFormState((prev) => ({
      ...prev,
      ...fields
    }))
  }, [])

  // Función para resetear el formulario
  const resetForm = useCallback(() => {
    setFormState(initialData)
    const storageInstance = getStorage()
    if (storageInstance) {
      storageInstance.removeItem(storageKey)
    }
  }, [initialData, storageKey])

  // Función para limpiar el storage manualmente
  const clearStorage = useCallback(() => {
    const storageInstance = getStorage()
    if (storageInstance) {
      storageInstance.removeItem(storageKey)
    }
  }, [storageKey])

  return {
    formState,
    updateField,
    updateFields,
    resetForm,
    clearStorage,
    setFormState // Por si necesitas reemplazar todo el estado
  }
}

// Hook específico para arrays (listados de malezas, cultivos, etc.)
export function usePersistentArray<T = any>(storageKey: string, initialArray: T[] = []) {
  const { formState, updateField, resetForm } = usePersistentForm<{ items: T[] }>({
    storageKey,
    initialData: { items: initialArray },
    storage: "session"
  })

  const setArray = useCallback((newArray: T[]) => {
    updateField("items", newArray)
  }, [updateField])

  return {
    array: formState.items,
    setArray,
    resetArray: resetForm
  }
}
