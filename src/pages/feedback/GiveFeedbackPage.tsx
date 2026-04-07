import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FeedbackSubmissionForm } from '../../components/Feedback/FeedbackSubmissionForm'
import { logger } from '../../utils/logger'

/**
 * GiveFeedbackPage Component
 *
 * Entry point for responding to a feedback request. Reached via
 * /feedback/give?employee_id=...&feedback_request_id=...&goal_id=...
 * (navigated to from FeedbackRequestCard).
 *
 * Reads query params and passes them to FeedbackSubmissionForm as
 * pre-filled values so the form is scoped to the correct recipient
 * and request context.
 */
export const GiveFeedbackPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const feedbackRequestId = searchParams.get('feedback_request_id') ?? undefined
  const initialEmployeeId = searchParams.get('employee_id') ?? undefined

  const handleSuccess = useCallback(
    (feedbackId: string) => {
      logger.info('Feedback submitted successfully', { feedbackId })
      navigate(`/feedback/${feedbackId}`)
    },
    [navigate]
  )

  const handleCancel = useCallback(() => {
    logger.info('Feedback submission cancelled')
    navigate('/feedback')
  }, [navigate])

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          {t('pages.feedback.new.back')}
        </Button>

        <Typography variant='h4' component='h1' gutterBottom>
          {t('pages.feedback.new.title')}
        </Typography>
        <Typography variant='body1' color='text.secondary' paragraph>
          {t('pages.feedback.new.description')}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <FeedbackSubmissionForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          {...(feedbackRequestId && { feedbackRequestId })}
          {...(initialEmployeeId && { initialEmployeeId })}
        />
      </Paper>
    </Container>
  )
}
