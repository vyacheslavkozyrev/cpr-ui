import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

export interface DuplicateRecipient {
  id: string
  display_name: string
}

interface DuplicateDetectionModalProps {
  open: boolean
  duplicateEmployees: DuplicateRecipient[]
  isFullDuplicate: boolean
  context: string // 'project', 'goal', or 'general'
  onRemoveDuplicates: () => void
  onViewExisting: () => void
  onCancel: () => void
}

/**
 * Modal for displaying duplicate recipient detection results
 * Shows different UI based on partial vs full duplicates
 */
export const DuplicateDetectionModal: React.FC<
  DuplicateDetectionModalProps
> = ({
  open,
  duplicateEmployees,
  isFullDuplicate,
  context,
  onRemoveDuplicates,
  onViewExisting,
  onCancel,
}) => {
  const { t } = useTranslation()

  const contextLabel =
    context === 'project' ? 'project' : context === 'goal' ? 'goal' : 'context'

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth='sm'
      fullWidth
      aria-labelledby='duplicate-detection-dialog-title'
    >
      <DialogTitle id='duplicate-detection-dialog-title'>
        {t('pages.feedback.request.duplicate.title')}
      </DialogTitle>

      <DialogContent>
        {isFullDuplicate ? (
          <>
            <Alert severity='error' sx={{ mb: 2 }}>
              {t('pages.feedback.request.duplicate.fullMessage', {
                context: contextLabel,
              })}
            </Alert>
          </>
        ) : (
          <>
            <DialogContentText>
              {t('pages.feedback.request.duplicate.partialMessage', {
                count: duplicateEmployees.length,
                context: contextLabel,
              })}
            </DialogContentText>

            <List dense sx={{ mt: 2 }}>
              {duplicateEmployees.map(employee => (
                <ListItem key={employee.id} disableGutters>
                  <ListItemText
                    primary={employee.display_name}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {isFullDuplicate ? (
          <>
            <Button
              onClick={onViewExisting}
              color='primary'
              variant='contained'
            >
              {t('pages.feedback.request.duplicate.actions.viewExisting')}
            </Button>
            <Button onClick={onCancel} color='inherit'>
              {t('pages.feedback.request.duplicate.actions.cancel')}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onRemoveDuplicates}
              color='primary'
              variant='contained'
            >
              {t('pages.feedback.request.duplicate.actions.removeDuplicates')}
            </Button>
            <Button onClick={onViewExisting} color='inherit'>
              {t('pages.feedback.request.duplicate.actions.viewExisting')}
            </Button>
            <Button onClick={onCancel} color='inherit'>
              {t('pages.feedback.request.duplicate.actions.cancel')}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
