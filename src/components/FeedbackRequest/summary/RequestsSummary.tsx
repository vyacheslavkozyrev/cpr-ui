import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

/**
 * Props for RequestsSummary component
 */
interface RequestsSummaryProps {
  /** Current number of items showing on page */
  showing: number
  /** Total number of items across all pages */
  total: number
  /** Number of pending requests */
  pending: number
  /** Number of partially complete requests */
  partial: number
  /** Number of fully complete requests */
  complete: number
}

/**
 * Requests Summary Component
 * Displays summary statistics for feedback requests list
 * Feature 0004 - Phase 4 US-002
 */
export const RequestsSummary: React.FC<RequestsSummaryProps> = ({
  showing,
  total,
  pending,
  partial,
  complete,
}) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant='body2' color='text.secondary'>
        {t('pages.feedback.request.list.sent.summary', {
          showing,
          total,
          pending,
          partial,
          complete,
        })}
      </Typography>
    </Box>
  )
}
