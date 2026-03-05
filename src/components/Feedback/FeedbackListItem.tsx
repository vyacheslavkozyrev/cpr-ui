import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Rating,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useDateFormat } from '../../hooks/useDateFormat'
import type { MyFeedback } from '../../types/feedback'

/**
 * Props for FeedbackListItem component
 */
export interface FeedbackListItemProps {
  /** Feedback item to display */
  feedback: MyFeedback
  /** Click handler for viewing details */
  onClick?: (feedbackId: string) => void
  /** Show as compact mode (smaller padding, less detail) */
  compact?: boolean
}

/**
 * Feedback List Item Component
 * Card display for a single feedback item in the list
 * Feature 0005 - Phase 3 US-002 (T043)
 */
export const FeedbackListItem: React.FC<FeedbackListItemProps> = ({
  feedback,
  onClick,
  compact = false,
}) => {
  const { t } = useTranslation()
  const { formatDate } = useDateFormat()

  const handleClick = () => {
    if (onClick) {
      onClick(feedback.id)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(feedback.id)
    }
  }

  // Get rating label
  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1:
        return t('pages.feedback.submission.form.rating.label_1')
      case 2:
        return t('pages.feedback.submission.form.rating.label_2')
      case 3:
        return t('pages.feedback.submission.form.rating.label_3')
      case 4:
        return t('pages.feedback.submission.form.rating.label_4')
      case 5:
        return t('pages.feedback.submission.form.rating.label_5')
      default:
        return ''
    }
  }

  // Truncate content for preview
  const getContentPreview = (content: string, maxLength = 150): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  return (
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              boxShadow: 3,
              transform: 'translateY(-2px)',
            }
          : {},
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Stack spacing={2}>
          {/* Header: Avatar, Name, Date */}
          <Stack direction='row' spacing={2} alignItems='center'>
            <Avatar
              sx={{
                width: compact ? 40 : 48,
                height: compact ? 40 : 48,
                bgcolor: 'primary.main',
              }}
            >
              {feedback.from_employee.display_name
                .split(' ')
                .map(name => name[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant={compact ? 'subtitle2' : 'subtitle1'}
                fontWeight='medium'
              >
                {feedback.from_employee.display_name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {feedback.from_employee.job_title || t('common.notProvided')}
              </Typography>
            </Box>

            <Typography variant='caption' color='text.secondary'>
              {formatDate(feedback.created_at, 'MEDIUM')}
            </Typography>
          </Stack>

          {/* Rating */}
          <Stack direction='row' spacing={1} alignItems='center'>
            <Rating
              value={feedback.rating}
              readOnly
              size={compact ? 'small' : 'medium'}
            />
            <Typography variant='body2' color='text.secondary'>
              {getRatingLabel(feedback.rating)}
            </Typography>
          </Stack>

          {/* Goal and Project Tags */}
          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Chip
              label={feedback.goal.title}
              size='small'
              variant='outlined'
              color='primary'
            />
            {feedback.project && (
              <Chip
                label={feedback.project.name}
                size='small'
                variant='outlined'
                color='secondary'
              />
            )}
          </Stack>

          {/* Content Preview */}
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {getContentPreview(feedback.content, compact ? 120 : 200)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
