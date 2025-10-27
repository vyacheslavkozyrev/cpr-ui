import type { AlertColor } from '@mui/material'
import { create } from 'zustand'

export interface ToastMessage {
  id: string
  message: string
  severity: AlertColor
  duration?: number
}

interface ToastState {
  toasts: ToastMessage[]
  addToast: (message: string, severity?: AlertColor, duration?: number) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showWarning: (message: string) => void
  showInfo: (message: string) => void
}

export const useToastStore = create<ToastState>(set => {
  const store = {
    toasts: [],

    addToast: (
      message: string,
      severity: AlertColor = 'info',
      duration = 6000
    ) => {
      const id = Date.now().toString()
      const newToast: ToastMessage = {
        id,
        message,
        severity,
        duration,
      }

      set(state => ({
        toasts: [...state.toasts, newToast],
      }))

      // Auto-remove toast after duration
      if (duration > 0) {
        setTimeout(() => {
          set(state => ({
            toasts: state.toasts.filter(toast => toast.id !== id),
          }))
        }, duration)
      }
    },

    removeToast: (id: string) => {
      set(state => ({
        toasts: state.toasts.filter(toast => toast.id !== id),
      }))
    },

    clearAllToasts: () => {
      set({ toasts: [] })
    },

    showSuccess: (message: string) => {
      store.addToast(message, 'success')
    },

    showError: (message: string) => {
      store.addToast(message, 'error')
    },

    showWarning: (message: string) => {
      store.addToast(message, 'warning')
    },

    showInfo: (message: string) => {
      store.addToast(message, 'info')
    },
  }

  return store
})

// Convenience hook for toast actions
export const useToast = () => {
  const showSuccess = useToastStore(state => state.showSuccess)
  const showError = useToastStore(state => state.showError)
  const showWarning = useToastStore(state => state.showWarning)
  const showInfo = useToastStore(state => state.showInfo)
  const addToast = useToastStore(state => state.addToast)

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast: addToast,
  }
}
