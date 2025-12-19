import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FeedbackSubmissionForm } from '../../components/Feedback/FeedbackSubmissionForm'
import { logger } from '../../utils/logger'

/**
 * NewFeedbackPage Component
 * Feature 0005 - Phase 4 US-003: Submit Unsolicited Feedback
 *
 * Allows users to proactively submit feedback to any employee
 * without a formal feedback request. Users can:
 * - Search and select any employee as recipient
 * - Associate feedback with a goal (optional)
 * - Associate feedback with a project (optional)
 * - Rate performance (1-5 stars)
 * - Provide detailed feedback content
 *
 * Validations:
 * - Cannot submit feedback to self
 * - Duplicate detection (same recipient + goal within 24 hours)
 * - Goal selection is optional for general feedback
 *
 * Routes:
 * - /feedback/new - Unsolicited feedback submission
 * - Navigates back to /feedback on success or cancel
 */
export const NewFeedbackPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSuccess = (feedbackId: string) => {
    logger.info('Feedback submitted successfully', { feedbackId })
    // Navigate to feedback detail page
    navigate(`/feedback/${feedbackId}`)
  }

  const handleCancel = () => {
    logger.info('Feedback submission cancelled')
    navigate('/feedback')
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/feedback')}
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
        />
      </Paper>
    </Container>
  )
}
