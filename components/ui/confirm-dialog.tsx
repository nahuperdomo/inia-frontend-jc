'use client'

import { useEffect, useState } from 'react'
import { useConfirmState, confirmAction, cancelAction } from '@/lib/hooks/useConfirm'
import { AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const variantStyles = {
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    iconBg: 'bg-red-100',
    confirmBtn: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    iconBg: 'bg-orange-100',
    confirmBtn: 'bg-orange-600 hover:bg-orange-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmBtn: 'bg-blue-600 hover:bg-blue-700',
  },
}

const variantIcons = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

export function ConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: null as (() => void) | null,
    onCancel: null as (() => void) | null,
  })

  useEffect(() => {
    return useConfirmState(setState)
  }, [])

  if (!state.isOpen) return null

  const styles = variantStyles[state.variant]
  const Icon = variantIcons[state.variant]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className={`p-6 rounded-t-lg border-b ${styles.bg} ${styles.border}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              <Icon className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {state.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {state.message}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 flex gap-3 justify-end bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={cancelAction}
            className="min-w-24"
          >
            {state.cancelText}
          </Button>
          <Button
            onClick={confirmAction}
            className={`min-w-24 text-white ${styles.confirmBtn}`}
          >
            {state.confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
