import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import NotificationsIcon from '@mui/icons-material/Notifications'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDateFormat } from '../../../hooks'
import type {
  FeedbackRequestDto,
  FeedbackRequestListDto,
} from '../../../types/feedbackRequest'
import { RecipientStatusBadge } from '../badges/RecipientStatusBadge'

/**
 * Props for FeedbackRequestCard component
 */
interface FeedbackRequestCardProps {
  /** Feedback request data */
  request: FeedbackRequestListDto | FeedbackRequestDto
  /** Callback when cancel request is clicked */
  onCancelRequest?: (requestId: string) => void
  /** Callback when cancel individual recipient is clicked */
  onCancelRecipient?: (requestId: string, recipientId: string) => void
  /** Callback when send reminder is clicked */
  onSendReminder?: (requestId: string, recipientId: string) => void
  /** Callback when remind all is clicked */
  onRemindAll?: (requestId: string) => void
  /** Whether card is in manager view (read-only) */
  isManagerView?: boolean
  /** Whether this is a todo item (shows respond button) */
  isTodoView?: boolean
}

/**
 * Feedback Request Card Component
 * Displays a feedback request with expandable details and actions
 * Feature 0004 - Phase 4 US-002
 */
export const FeedbackRequestCard: React.FC<FeedbackRequestCardProps> = ({
  request,
  onCancelRequest,
  onCancelRecipient,
  onSendReminder,
  onRemindAll,
  isManagerView = false,
  isTodoView = false,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { formatDateRelative, formatDate } = useDateFormat()

  const [expanded, setExpanded] = useState(false)
  const [showFullMessage, setShowFullMessage] = useState(false)

  // Determine if this is a list item or full detail
  const isListDto = 'message_preview' in request
  const recipients = isListDto
    ? request.recipients_preview
    : (request as FeedbackRequestDto).recipients

  // Get message - handle both DTO types
  const message = isListDto
    ? (request as FeedbackRequestListDto).message_preview
    : (request as FeedbackRequestDto).message

  // Calculate urgency based on due date
  const isOverdue = request.due_date && new Date(request.due_date) < new Date()
  const isDueSoon =
    request.due_date &&
    new Date(request.due_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days

  // Get due date badge color
  const getDueDateColor = (): 'error' | 'warning' | 'default' => {
    if (isOverdue) return 'error'
    if (isDueSoon) return 'warning'
    return 'default'
  }

  // Handle view feedback
  const handleViewFeedback = (feedbackId: string) => {
    navigate(`/feedback/${feedbackId}`)
  }

  // Handle view all responses
  const handleViewAllResponses = () => {
    navigate(`/feedback/request/${request.id}/responses`)
  }

  // Check if reminder can be sent (48 hour cooldown)
  const canSendReminder = (lastReminderAt?: string | null) => {
    if (!lastReminderAt) return true
    const hoursSinceReminder =
      (Date.now() - new Date(lastReminderAt).getTime()) / (1000 * 60 * 60)
    return hoursSinceReminder >= 48
  }

  // Calculate eligible recipients for remind all
  const eligibleForReminder = recipients.filter(
    (r: (typeof recipients)[0]) =>
      r.status === 'pending' && canSendReminder(r.last_reminder_at)
  )

  return (
    <Card
      sx={{
        mb: 2,
        border: isOverdue ? 2 : 1,
        borderColor: isOverdue ? 'error.main' : 'divider',
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent>
        {/* Requestor Name - Manager View Only */}
        {isManagerView && 'requestor' in request && request.requestor && (
          <Box mb={1}>
            <Typography variant='subtitle2' color='primary'>
              {request.requestor.display_name}
            </Typography>
          </Box>
        )}

        {/* Header Section */}
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='flex-start'
          mb={2}
        >
          <Stack direction='row' spacing={1} alignItems='center'>
            {/* Created date */}
            <Typography variant='caption' color='text.secondary'>
              {formatDateRelative(request.created_at)}
            </Typography>

            {/* Due date badge */}
            {request.due_date && (
              <Chip
                label={`${t('pages.feedback.request.card.dueDate.label')} ${formatDate(request.due_date)}`}
                size='small'
                color={getDueDateColor()}
                {...(isOverdue && { icon: <NotificationsIcon /> })}
              />
            )}

            {/* Project/Goal context */}
            {request.project && (
              <Chip
                label={request.project.name}
                size='small'
                variant='outlined'
              />
            )}
            {request.goal && (
              <Chip
                label={request.goal.title}
                size='small'
                variant='outlined'
              />
            )}
          </Stack>

          {/* Status badge */}
          <Chip
            label={t(`pages.feedback.request.card.status.${request.status}`)}
            size='small'
            color={request.status === 'complete' ? 'success' : 'default'}
          />
        </Stack>

        {/* Recipients Section */}
        <Box mb={2}>
          <Typography variant='subtitle2' gutterBottom>
            {t('pages.feedback.request.card.recipients.multiple', {
              count: request.total_recipients,
            })}
          </Typography>

          <Stack
            direction='row'
            spacing={1}
            alignItems='center'
            flexWrap='wrap'
          >
            {/* Show first 3 recipients or all if expanded */}
            {(expanded ? recipients : recipients.slice(0, 3)).map(
              (recipient: (typeof recipients)[0]) => (
                <Stack
                  key={recipient.id}
                  direction='row'
                  spacing={1}
                  alignItems='center'
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    {...(recipient.employee?.display_name && {
                      alt: recipient.employee.display_name,
                    })}
                    sx={{ width: 32, height: 32 }}
                  >
                    {recipient.employee?.display_name?.charAt(0)}
                  </Avatar>
                  <Typography variant='body2'>
                    {recipient.employee?.display_name}
                  </Typography>
                  <RecipientStatusBadge
                    status={recipient.status}
                    {...(recipient.responded_at && {
                      tooltip: `Responded ${formatDateRelative(recipient.responded_at)}`,
                    })}
                  />
                </Stack>
              )
            )}

            {/* Show more link */}
            {!expanded && request.total_recipients > 3 && (
              <Button
                size='small'
                onClick={() => setExpanded(true)}
                endIcon={<ExpandMore />}
              >
                {t('pages.feedback.request.card.recipients.showMore', {
                  count: request.total_recipients - 3,
                })}
              </Button>
            )}
          </Stack>
        </Box>

        {/* Progress bar for multi-recipient requests */}
        {request.total_recipients > 1 && (
          <Box mb={2}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              mb={0.5}
            >
              <Typography variant='caption' color='text.secondary'>
                {t('pages.feedback.request.card.status.partial', {
                  responded: request.responded_count,
                  total: request.total_recipients,
                })}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {Math.round(
                  (request.responded_count / request.total_recipients) * 100
                )}
                %
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={(request.responded_count / request.total_recipients) * 100}
              color={request.status === 'complete' ? 'success' : 'primary'}
            />
          </Box>
        )}

        {/* Message Preview */}
        {message && (
          <Box mb={2}>
            <Typography variant='body2' color='text.secondary'>
              {showFullMessage || !isListDto
                ? (request as FeedbackRequestDto).message
                : message}
              {isListDto && !showFullMessage && message && (
                <Button
                  size='small'
                  onClick={() => setShowFullMessage(true)}
                  sx={{ ml: 1 }}
                >
                  {t('pages.feedback.request.card.actions.showMore')}
                </Button>
              )}
              {isListDto && showFullMessage && (
                <Button
                  size='small'
                  onClick={() => setShowFullMessage(false)}
                  sx={{ ml: 1 }}
                >
                  {t('pages.feedback.request.card.actions.showLess')}
                </Button>
              )}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        {!isManagerView && (
          <Stack direction='row' spacing={1} flexWrap='wrap'>
            {/* Respond Button - shown in todo view */}
            {isTodoView && request.status !== 'complete' && (
              <Button
                size='small'
                variant='contained'
                color='primary'
                onClick={() => {
                  // Navigate to feedback form with pre-filled data
                  const requestorId =
                    'requestor' in request ? request.requestor?.id : undefined
                  const params = new URLSearchParams({
                    ...(requestorId && { employee_id: requestorId }),
                    ...(request.goal?.id && { goal_id: request.goal.id }),
                    ...(request.project?.id && {
                      project_id: request.project.id,
                    }),
                    feedback_request_id: request.id,
                  })
                  navigate(`/feedback/give?${params.toString()}`)
                }}
              >
                {t('pages.feedback.request.card.actions.respond')}
              </Button>
            )}

            {/* View Responses - if any responses exist */}
            {!isTodoView && request.responded_count > 0 && (
              <Button
                size='small'
                variant='outlined'
                startIcon={<VisibilityIcon />}
                onClick={handleViewAllResponses}
              >
                {t('pages.feedback.request.card.actions.viewResponses', {
                  count: request.responded_count,
                })}
              </Button>
            )}

            {/* Send Reminder / Remind All */}
            {!isTodoView && eligibleForReminder.length > 0 && (
              <Button
                size='small'
                variant='outlined'
                startIcon={<NotificationsIcon />}
                onClick={() => {
                  if (eligibleForReminder.length === 1) {
                    onSendReminder?.(request.id, eligibleForReminder[0].id)
                  } else {
                    onRemindAll?.(request.id)
                  }
                }}
              >
                {eligibleForReminder.length === 1
                  ? t('pages.feedback.request.card.actions.sendReminder')
                  : t('pages.feedback.request.card.actions.remindAll')}
              </Button>
            )}

            {/* Cancel Request - only in sent view */}
            {!isTodoView &&
              request.status !== 'complete' &&
              request.status !== 'cancelled' && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  onClick={() => onCancelRequest?.(request.id)}
                >
                  {t('pages.feedback.request.card.actions.cancelRequest')}
                </Button>
              )}

            {/* Expand/Collapse button */}
            <IconButton
              size='small'
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'collapse' : 'expand'}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
        )}

        {/* Expanded Details */}
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <Divider sx={{ my: 2 }} />

          {/* Full recipient list with individual actions */}
          {!isListDto && (
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                {t('pages.feedback.request.detail.recipients', {
                  count: request.total_recipients,
                })}
              </Typography>
              <List dense>
                {(request as FeedbackRequestDto).recipients.map(
                  (recipient: (typeof recipients)[0]) => (
                    <ListItem
                      key={recipient.id}
                      secondaryAction={
                        !isManagerView && (
                          <Stack direction='row' spacing={1}>
                            {recipient.status === 'responded' &&
                              recipient.feedback_id && (
                                <Button
                                  size='small'
                                  onClick={() =>
                                    handleViewFeedback(recipient.feedback_id!)
                                  }
                                >
                                  {t(
                                    'pages.feedback.request.card.actions.viewFeedback'
                                  )}
                                </Button>
                              )}
                            {recipient.status === 'pending' &&
                              canSendReminder(recipient.last_reminder_at) && (
                                <Button
                                  size='small'
                                  onClick={() =>
                                    onSendReminder?.(request.id, recipient.id)
                                  }
                                >
                                  {t(
                                    'pages.feedback.request.card.actions.sendReminder'
                                  )}
                                </Button>
                              )}
                            {recipient.status === 'pending' && (
                              <Button
                                size='small'
                                color='error'
                                onClick={() =>
                                  onCancelRecipient?.(request.id, recipient.id)
                                }
                              >
                                {t(
                                  'feedbackRequest.card.actions.cancelForRecipient',
                                  {
                                    name: recipient.employee?.display_name,
                                  }
                                )}
                              </Button>
                            )}
                          </Stack>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar
                          {...(recipient.employee?.display_name && {
                            alt: recipient.employee.display_name,
                          })}
                        >
                          {recipient.employee?.display_name?.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={recipient.employee?.display_name}
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant='caption' component='span'>
                              {recipient.employee?.job_title} â€¢{' '}
                              {recipient.employee?.department}
                            </Typography>
                            <Stack
                              direction='row'
                              spacing={1}
                              alignItems='center'
                            >
                              <RecipientStatusBadge status={recipient.status} />
                              {recipient.responded_at && (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {formatDateRelative(recipient.responded_at)}
                                </Typography>
                              )}
                              {recipient.last_reminder_at && (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  {t(
                                    'pages.feedback.request.card.reminders.lastSent',
                                    {
                                      time: formatDateRelative(
                                        recipient.last_reminder_at
                                      ),
                                    }
                                  )}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        }
                      />
                    </ListItem>
                  )
                )}
              </List>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  )
}
