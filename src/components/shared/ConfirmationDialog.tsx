// ConfirmationDialog Component
// Feature 0005 - Feedback Submission Collection
// Reusable confirmation dialog for unsaved changes, discard drafts, etc.

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Props for ConfirmationDialog component
 */
export interface ConfirmationDialogProps {
  /** Dialog open state */
  open: boolean
  /** Close handler */
  onClose: () => void
  /** Confirm action handler */
  onConfirm: () => void
  /** Dialog title */
  title: string
  /** Dialog message */
  message: string
  /** Confirm button text (default: "Confirm") */
  confirmText?: string
  /** Cancel button text (default: "Cancel") */
  cancelText?: string
  /** Confirm button color */
  confirmColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
  /** Loading state (disables buttons) */
  loading?: boolean
}

/**
 * ConfirmationDialog Component
 * Reusable confirmation dialog with customizable title, message, and actions
 *
 * Features:
 * - Accessible (ARIA labels, keyboard navigation)
 * - Backdrop click to cancel
 * - Escape key to cancel
 * - Loading state support
 * - Customizable button colors and text
 *
 * Usage (Unsaved Changes):
 * ```tsx
 * <ConfirmationDialog
 *   open={showUnsavedDialog}
 *   onClose={() => setShowUnsavedDialog(false)}
 *   onConfirm={() => {
 *     discardChanges()
 *     navigate('/feedback')
 *   }}
 *   title="Unsaved Changes"
 *   message="You have unsaved changes. Are you sure you want to leave?"
 *   confirmText="Discard Changes"
 *   confirmColor="error"
 * />
 * ```
 *
 * Usage (Discard Draft):
 * ```tsx
 * <ConfirmationDialog
 *   open={showDiscardDraft}
 *   onClose={() => setShowDiscardDraft(false)}
 *   onConfirm={handleDiscardDraft}
 *   title="Discard Draft"
 *   message="This will permanently delete your draft. This action cannot be undone."
 *   confirmText="Discard"
 *   confirmColor="error"
 * />
 * ```
 */
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'primary',
  loading = false,
}) => {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby='confirmation-dialog-title'
      aria-describedby='confirmation-dialog-description'
    >
      <DialogTitle id='confirmation-dialog-title'>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id='confirmation-dialog-description'>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText || t('common.cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color={confirmColor}
          variant='contained'
          disabled={loading}
          autoFocus
        >
          {confirmText || t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
