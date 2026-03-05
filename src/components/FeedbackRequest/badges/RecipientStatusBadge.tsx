import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import { Chip, type SxProps, type Theme } from '@mui/material'
import { useTranslation } from 'react-i18next'

/**
 * Recipient status types for feedback requests
 */
export type RecipientStatus = 'pending' | 'overdue' | 'responded' | 'cancelled'

/**
 * Props for RecipientStatusBadge component
 */
interface RecipientStatusBadgeProps {
  /** Current status of the recipient */
  status: RecipientStatus
  /** Optional size variant */
  size?: 'small' | 'medium'
  /** Optional additional tooltip info */
  tooltip?: string
}

/**
 * Recipient Status Badge Component
 * Displays visual status indicator for feedback request recipients
 * Feature 0004 - Phase 4 US-002
 */
export const RecipientStatusBadge: React.FC<RecipientStatusBadgeProps> = ({
  status,
  size = 'small',
  tooltip,
}) => {
  const { t } = useTranslation()

  // Get status configuration based on status type
  const getStatusProps = () => {
    switch (status) {
      case 'pending':
        return {
          label: t('pages.feedback.request.status.pending'),
          color: 'default' as const,
          icon: undefined,
          sx: {},
        }
      case 'overdue':
        return {
          label: t('pages.feedback.request.status.overdue'),
          color: 'error' as const,
          icon: <WarningIcon />,
          sx: {},
        }
      case 'responded':
        return {
          label: t('pages.feedback.request.status.responded'),
          color: 'success' as const,
          icon: <CheckCircleIcon />,
          sx: {},
        }
      case 'cancelled':
        return {
          label: t('pages.feedback.request.status.cancelled'),
          color: 'default' as const,
          icon: <CancelIcon />,
          sx: { textDecoration: 'line-through' } as SxProps<Theme>,
        }
    }
  }

  const statusProps = getStatusProps()

  return (
    <Chip
      label={statusProps.label}
      color={statusProps.color}
      size={size}
      {...(statusProps.icon && { icon: statusProps.icon })}
      {...(tooltip && { title: tooltip })}
      sx={{
        ...statusProps.sx,
        fontWeight: 500,
      }}
    />
  )
}
