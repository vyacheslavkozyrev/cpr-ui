import { Alert, Snackbar } from '@mui/material'
import React, { useMemo } from 'react'
import { useToastStore } from '../stores/toastStore'

const getStyles = () => ({
  snackbar: (index: number) => ({
    // Stack multiple toasts vertically
    position: 'fixed',
    top: `${80 + index * 70}px`,
    right: '16px',
    zIndex: 9999,
  }),
  alert: {
    minWidth: '300px',
  },
})

/**
 * ToastContainer Component
 * Renders all active toasts using Zustand store
 * Should be placed at the root level of the application
 */
export const ToastContainer: React.FC = () => {
  const toasts = useToastStore(state => state.toasts)
  const removeToast = useToastStore(state => state.removeToast)
  const styles = useMemo(() => getStyles(), [])

  const handleClose = React.useCallback(
    (id: string) => {
      removeToast(id)
    },
    [removeToast]
  )

  return (
    <>
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open={true}
          autoHideDuration={toast.duration || null}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={styles.snackbar(index)}
        >
          <Alert
            severity={toast.severity}
            onClose={() => handleClose(toast.id)}
            variant='filled'
            sx={styles.alert}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}
