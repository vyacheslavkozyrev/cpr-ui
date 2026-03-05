import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDateFormat } from '../../hooks/useDateFormat'
import { useFeedbackById } from '../../services/feedbackQueryService'

/**
 * Feedback Detail Page
 * Displays full feedback content with provider info, goal/project context, and action buttons
 * Feature 0005 - Phase 3 US-002 (T069-T082)
 *
 * Features:
 * - Full feedback content display
 * - Provider information with avatar
 * - Goal and project context
 * - Rating with descriptive label
 * - Timestamps (received date/time)
 * - Back navigation with filter preservation
 * - Deep linkable URL
 */
export const FeedbackDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()

  // Get navigation state for back button
  const navigationState = location.state as {
    filters?: unknown
    sortBy?: string
    sortOrder?: string
    currentPage?: number
  } | null

  // Fetch feedback detail
  const { data: feedback, isLoading, isError, error } = useFeedbackById(id)

  // Get rating label
  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1:
        return t(
          'pages.feedback.submission.form.rating.label_1',
          'Needs Improvement'
        )
      case 2:
        return t(
          'pages.feedback.submission.form.rating.label_2',
          'Below Expectations'
        )
      case 3:
        return t(
          'pages.feedback.submission.form.rating.label_3',
          'Meets Expectations'
        )
      case 4:
        return t(
          'pages.feedback.submission.form.rating.label_4',
          'Exceeds Expectations'
        )
      case 5:
        return t('pages.feedback.submission.form.rating.label_5', 'Outstanding')
      default:
        return ''
    }
  }

  // Handle back navigation
  const handleBack = () => {
    if (navigationState) {
      // Return to feedback list with preserved state
      navigate('/feedback', { state: navigationState })
    } else {
      // Default back navigation
      navigate('/feedback')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (isError || !feedback) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          {t('pages.feedback.detail.back', 'Back to Feedback List')}
        </Button>
        <Alert severity='error'>
          {t(
            'pages.feedback.detail.error',
            'Failed to load feedback details. Please try again.'
          )}
          {error && typeof error === 'object' && 'message' in error && (
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              {String((error as { message: string }).message)}
            </Typography>
          )}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          {t('pages.feedback.detail.back', 'Back to Feedback List')}
        </Button>
        <Typography variant='h4' gutterBottom>
          {t('pages.feedback.detail.title', 'Feedback Details')}
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Provider Information */}
            <Box>
              <Typography
                variant='overline'
                color='text.secondary'
                gutterBottom
              >
                {t('pages.feedback.detail.from', 'From')}
              </Typography>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {feedback.from_employee.display_name
                    .split(' ')
                    .map(name => name[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant='h6'>
                    {feedback.from_employee.display_name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {feedback.from_employee.job_title ||
                      t('common.notProvided', 'Not provided')}
                  </Typography>
                  {feedback.from_employee.department && (
                    <Typography variant='caption' color='text.secondary'>
                      {feedback.from_employee.department}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Rating */}
            <Box>
              <Typography
                variant='overline'
                color='text.secondary'
                gutterBottom
              >
                {t('pages.feedback.detail.rating', 'Rating')}
              </Typography>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Rating value={feedback.rating} readOnly size='large' />
                <Typography variant='body1' fontWeight='medium'>
                  {feedback.rating} {t('common.stars', 'stars')} -{' '}
                  {getRatingLabel(feedback.rating)}
                </Typography>
              </Stack>
            </Box>

            <Divider />

            {/* Feedback Content */}
            <Box>
              <Typography
                variant='overline'
                color='text.secondary'
                gutterBottom
              >
                {t('pages.feedback.detail.content', 'Feedback')}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.8,
                }}
              >
                {feedback.content}
              </Typography>
            </Box>

            <Divider />

            {/* Goal Context */}
            {feedback.goal && (
              <Box>
                <Typography
                  variant='overline'
                  color='text.secondary'
                  gutterBottom
                >
                  {t('pages.feedback.detail.goal', 'Related Goal')}
                </Typography>
                <Card variant='outlined'>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant='h6'>
                        {feedback.goal.title}
                      </Typography>
                      {feedback.goal.description && (
                        <Typography variant='body2' color='text.secondary'>
                          {feedback.goal.description}
                        </Typography>
                      )}
                      <Stack
                        direction='row'
                        spacing={1}
                        flexWrap='wrap'
                        useFlexGap
                      >
                        {feedback.goal.status && (
                          <Chip
                            label={feedback.goal.status}
                            size='small'
                            color={
                              feedback.goal.status === 'completed'
                                ? 'success'
                                : feedback.goal.status === 'in_progress'
                                  ? 'info'
                                  : feedback.goal.status === 'not_started'
                                    ? 'default'
                                    : 'warning'
                            }
                          />
                        )}
                        {feedback.goal.progress !== undefined && (
                          <Chip
                            label={`${feedback.goal.progress}% Complete`}
                            size='small'
                            variant='outlined'
                          />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Project Context (if applicable) */}
            {feedback.project && (
              <Box>
                <Typography
                  variant='overline'
                  color='text.secondary'
                  gutterBottom
                >
                  {t('pages.feedback.detail.project', 'Related Project')}
                </Typography>
                <Card variant='outlined'>
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant='h6'>
                        {feedback.project.name}
                      </Typography>
                      {feedback.project.description && (
                        <Typography variant='body2' color='text.secondary'>
                          {feedback.project.description}
                        </Typography>
                      )}
                      <Stack
                        direction='row'
                        spacing={1}
                        flexWrap='wrap'
                        useFlexGap
                      >
                        {feedback.project.status && (
                          <Chip
                            label={feedback.project.status}
                            size='small'
                            color={
                              feedback.project.status === 'completed'
                                ? 'success'
                                : feedback.project.status === 'active'
                                  ? 'info'
                                  : 'default'
                            }
                          />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Divider />

            {/* Timestamps */}
            <Box>
              <Typography
                variant='overline'
                color='text.secondary'
                gutterBottom
              >
                {t('pages.feedback.detail.received', 'Received')}
              </Typography>
              <Typography variant='body2'>
                {formatDate(feedback.created_at, 'DATETIME_LONG')}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant='outlined' onClick={handleBack}>
          {t('pages.feedback.detail.close', 'Close')}
        </Button>
      </Box>
    </Box>
  )
}
