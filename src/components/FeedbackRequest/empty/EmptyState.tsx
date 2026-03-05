import FeedbackIcon from '@mui/icons-material/Feedback'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Type of empty state to display */
  type: 'sent' | 'todo' | 'teamSent' | 'teamReceived'
}

/**
 * Empty State Component
 * Displays friendly empty state when no feedback requests exist
 * Feature 0004 - Phase 4 US-002
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const config: Record<
    string,
    {
      icon: React.ReactElement
      title: string
      description: string
      showButton: boolean
      buttonText?: string
      buttonAction?: () => void
    }
  > = {
    sent: {
      icon: <FeedbackIcon sx={{ fontSize: 80, color: 'text.disabled' }} />,
      title: t('pages.feedback.request.list.sent.empty'),
      description: t('pages.feedback.request.list.sent.emptyDescription'),
      showButton: true,
      buttonText: t('pages.feedback.request.form.title'),
      buttonAction: () => navigate('/feedback/request/new'),
    },
    todo: {
      icon: <FeedbackIcon sx={{ fontSize: 80, color: 'success.light' }} />,
      title: t('pages.feedback.request.list.todo.empty'),
      description: t('pages.feedback.request.list.todo.emptyDescription'),
      showButton: false,
    },
    teamSent: {
      icon: <FeedbackIcon sx={{ fontSize: 80, color: 'text.disabled' }} />,
      title: t('pages.feedback.request.list.team.sent.empty'),
      description: '',
      showButton: false,
    },
    teamReceived: {
      icon: <FeedbackIcon sx={{ fontSize: 80, color: 'text.disabled' }} />,
      title: t('pages.feedback.request.list.team.received.empty'),
      description: '',
      showButton: false,
    },
  }

  const emptyConfig = config[type]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Stack spacing={3} alignItems='center' maxWidth={400}>
        {emptyConfig.icon}
        <Typography variant='h5' color='text.secondary'>
          {emptyConfig.title}
        </Typography>
        {emptyConfig.description && (
          <Typography variant='body2' color='text.secondary'>
            {emptyConfig.description}
          </Typography>
        )}
        {emptyConfig.showButton && (
          <Button
            variant='contained'
            size='large'
            startIcon={<FeedbackIcon />}
            onClick={emptyConfig.buttonAction}
          >
            {emptyConfig.buttonText}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
