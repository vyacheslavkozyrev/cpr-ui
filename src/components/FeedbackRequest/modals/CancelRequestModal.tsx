import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

/**
 * Props for CancelRequestModal component
 */
interface CancelRequestModalProps {
  /** Whether modal is open */
  open: boolean
  /** Name of the single recipient (for single-recipient requests) */
  recipientName?: string | undefined
  /** Total number of recipients (for multi-recipient requests) */
  totalRecipients?: number | undefined
  /** Callback when user confirms cancellation */
  onConfirm: () => void
  /** Callback when user cancels the action */
  onCancel: () => void
  /** Whether cancelling entire request or individual recipient */
  isCancellingIndividual?: boolean
}

/**
 * Cancel Request Modal Component
 * Confirmation dialog for cancelling feedback requests
 * Feature 0004 - Phase 4 US-002
 */
export const CancelRequestModal: React.FC<CancelRequestModalProps> = ({
  open,
  recipientName,
  totalRecipients = 1,
  onConfirm,
  onCancel,
  isCancellingIndividual = false,
}) => {
  const { t } = useTranslation()

  // Determine message based on context
  const getDialogContent = () => {
    if (isCancellingIndividual && recipientName) {
      return t('pages.feedback.request.cancel.individual.message', {
        name: recipientName,
      })
    }

    if (totalRecipients === 1 && recipientName) {
      return t('pages.feedback.request.cancel.single.message', {
        name: recipientName,
      })
    }

    return t('pages.feedback.request.cancel.multiple.message', {
      count: totalRecipients,
    })
  }

  const getDialogTitle = () => {
    if (isCancellingIndividual) {
      return t('pages.feedback.request.cancel.individual.title')
    }
    return t('pages.feedback.request.cancel.title')
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth='sm' fullWidth>
      <DialogTitle>{getDialogTitle()}</DialogTitle>
      <DialogContent>
        <DialogContentText>{getDialogContent()}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color='inherit'>
          {t('pages.feedback.request.cancel.actions.keepRequest')}
        </Button>
        <Button onClick={onConfirm} color='error' variant='contained' autoFocus>
          {t('pages.feedback.request.cancel.actions.yesCancel')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
