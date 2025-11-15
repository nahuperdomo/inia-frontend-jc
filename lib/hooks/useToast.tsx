'use client'

import { useState, useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

// Global toast state
let toastListeners: Array<(toasts: Toast[]) => void> = []
let toastsState: Toast[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastsState]))
}

export const showToast = (type: ToastType, title: string, message?: string, duration = 3000) => {
  const id = Math.random().toString(36).substring(7)
  const newToast: Toast = { id, type, title, message }

  toastsState = [...toastsState, newToast]
  notifyListeners()

  // Auto-remove after duration
  setTimeout(() => {
    toastsState = toastsState.filter((t) => t.id !== id)
    notifyListeners()
  }, duration)
}

export const removeToast = (id: string) => {
  toastsState = toastsState.filter((t) => t.id !== id)
  notifyListeners()
}

export const useToastState = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastsState)

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts)
    }
  }, [])

  return toasts
}

export const useToast = () => {
  return {
    success: (title: string, message?: string, duration?: number) =>
      showToast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      showToast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      showToast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      showToast('info', title, message, duration),
  }
}
