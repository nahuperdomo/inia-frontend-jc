'use client'

import { useToastState, removeToast, type Toast } from '@/lib/hooks/useToast'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-orange-50 border-orange-200 text-orange-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-orange-600',
  info: 'text-blue-600',
}

function ToastItem({ toast }: { toast: Toast }) {
  const Icon = toastIcons[toast.type]

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[500px] animate-in slide-in-from-right ${toastStyles[toast.type]}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconStyles[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{toast.title}</div>
        {toast.message && (
          <div className="text-sm mt-1 opacity-90">{toast.message}</div>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastState()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}
