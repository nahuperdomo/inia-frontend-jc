'use client'

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  variant: 'danger' | 'warning' | 'info'
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
}

// Sin zustand, vamos a usar un approach similar al toast
let confirmListener: ((state: ConfirmDialogState) => void) | null = null
let confirmState: ConfirmDialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  variant: 'info',
  onConfirm: null,
  onCancel: null,
}

const notifyConfirmListener = () => {
  if (confirmListener) {
    confirmListener({ ...confirmState })
  }
}

export const openConfirmDialog = (options: {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}): Promise<boolean> => {
  return new Promise((resolve) => {
    confirmState = {
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      variant: options.variant || 'info',
      onConfirm: () => {
        confirmState.isOpen = false
        notifyConfirmListener()
        resolve(true)
      },
      onCancel: () => {
        confirmState.isOpen = false
        notifyConfirmListener()
        resolve(false)
      },
    }
    notifyConfirmListener()
  })
}

export const closeConfirmDialog = () => {
  if (confirmState.onCancel) {
    confirmState.onCancel()
  } else {
    confirmState.isOpen = false
    notifyConfirmListener()
  }
}

export const confirmAction = () => {
  if (confirmState.onConfirm) {
    confirmState.onConfirm()
  }
}

export const cancelAction = () => {
  if (confirmState.onCancel) {
    confirmState.onCancel()
  }
}

export const useConfirmState = (listener: (state: ConfirmDialogState) => void) => {
  confirmListener = listener
  return () => {
    confirmListener = null
  }
}

export const useConfirm = () => {
  return {
    confirm: openConfirmDialog,
  }
}
