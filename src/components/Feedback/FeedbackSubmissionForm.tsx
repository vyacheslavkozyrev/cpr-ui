import { zodResolver } from '@hookform/resolvers/zod'
import SendIcon from '@mui/icons-material/Send'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { TGoalDto } from '../../dtos/GoalDto'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useGoals, useProjects, useSubmitFeedback } from '../../services'
import { draftManager } from '../../services/draftManager'
import { offlineQueue } from '../../services/offlineQueue'
import type { ProjectSummaryDto } from '../../services/projectQueryService'
import { useToast } from '../../stores/toastStore'
import type { RatingValue, SubmitFeedbackRequest } from '../../types/feedback'
import { checkDuplicateFeedback } from '../../utils/duplicateDetection'
import { logger } from '../../utils/logger'
import { ConfirmationDialog, RatingInput, SearchableDropdown } from '../shared'

/**
 * Props for FeedbackSubmissionForm component
 */
export interface FeedbackSubmissionFormProps {
  /** Feedback request ID if responding to a request */
  feedbackRequestId?: string
  /** Pre-selected employee (when responding to request or from context) */
  initialEmployeeId?: string
  /** Pre-selected goal ID */
  initialGoalId?: string
  /** Pre-selected project ID */
  initialProjectId?: string
  /** Callback after successful submission */
  onSuccess?: (feedbackId: string) => void
  /** Callback on cancel */
  onCancel?: () => void
  /** Show as compact mode (less padding, smaller text) */
  compact?: boolean
}

// Validation schema using Zod
const feedbackSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  goalId: z.string().min(1, 'Goal is required'),
  projectId: z.string().nullable().optional(),
  content: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must be 2000 characters or less'),
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Invalid rating value'),
})

type FeedbackFormSchema = z.infer<typeof feedbackSchema>

/**
 * Feedback Submission Form Component
 * Submit feedback for employees with goal/project context and rating
 * Feature 0005 - Phase 2 US-001
 */
export const FeedbackSubmissionForm: React.FC<FeedbackSubmissionFormProps> = ({
  feedbackRequestId,
  initialEmployeeId,
  initialGoalId,
  initialProjectId,
  onSuccess,
  onCancel,
  compact = false,
}) => {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()
  const { showSuccess, showError, showInfo } = useToast()

  // State
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDiscardDraftConfirm, setShowDiscardDraftConfirm] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState<{
    hoursRemaining: number
  } | null>(null)
  const [contentLength, setContentLength] = useState(0)
  const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [isLoadingDraft, setIsLoadingDraft] = useState(true) // React Hook Form setup with Zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
    reset,
    setValue,
  } = useForm<FeedbackFormSchema>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      employeeId: initialEmployeeId || '',
      goalId: initialGoalId || '',
      projectId: initialProjectId || '',
      content: '',
      rating: 0,
    },
  })

  // Watch all form fields for auto-save
  const watchedFields = watch()

  // Update content length
  useEffect(() => {
    setContentLength(watchedFields.content?.length || 0)
  }, [watchedFields.content])

  // T035: Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        setIsLoadingDraft(true)
        const draft = await draftManager.loadDraft(
          feedbackRequestId,
          initialEmployeeId
        )

        if (draft) {
          logger.info('Draft loaded', {
            draftId: draft.id,
            age: draft.updated_at,
          })

          // Populate form with draft data
          if (draft.employee_id) setValue('employeeId', draft.employee_id)
          if (draft.goal_id) setValue('goalId', draft.goal_id)
          if (draft.project_id) setValue('projectId', draft.project_id)
          if (draft.content) setValue('content', draft.content)
          if (draft.rating) setValue('rating', draft.rating)

          setDraftId(draft.id)
          setDraftSavedAt(new Date(draft.updated_at))
        }
      } catch (error) {
        logger.error('Failed to load draft', { error })
      } finally {
        setIsLoadingDraft(false)
      }
    }

    loadDraft()
  }, [feedbackRequestId, initialEmployeeId, setValue])

  // T033: Auto-save draft every 30 seconds
  useEffect(() => {
    // Don't auto-save if form is empty or submitting
    if (isSubmitting || !isDirty || isLoadingDraft) {
      return
    }

    // Don't auto-save if no meaningful content
    const hasContent =
      watchedFields.content || watchedFields.goalId || watchedFields.rating
    if (!hasContent) {
      return
    }

    const saveDraft = async () => {
      try {
        const draftData = {
          employee_id: watchedFields.employeeId || null,
          goal_id: watchedFields.goalId || null,
          project_id: watchedFields.projectId || null,
          content: watchedFields.content || null,
          rating: watchedFields.rating || null,
          feedback_request_id: feedbackRequestId || null,
        }

        const savedDraftId = await draftManager.saveDraft(draftData, false)
        setDraftId(savedDraftId)
        setDraftSavedAt(new Date())

        logger.debug('Draft auto-saved', { draftId: savedDraftId })
      } catch (error) {
        logger.error('Failed to auto-save draft', { error })
      }
    }

    // Subscribe to draft events
    const unsubscribe = draftManager.subscribe(event => {
      if (event.type === 'saved' && event.draft) {
        setDraftSavedAt(new Date(event.draft.updated_at))
      }
    })

    // Debounce auto-save (will trigger 30s after last change)
    const timeoutId = setTimeout(saveDraft, 30000)

    return () => {
      clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [watchedFields, isDirty, isSubmitting, isLoadingDraft, feedbackRequestId])

  // Load data for dropdowns
  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsError,
  } = useGoals({ per_page: 100, status: 'in_progress' })

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects()

  const goals = useMemo<TGoalDto[]>(() => goalsData?.items || [], [goalsData])
  const projects = useMemo<ProjectSummaryDto[]>(
    () => projectsData || [],
    [projectsData]
  )

  // Convert goals to SearchableDropdown format
  const goalOptions = useMemo(
    () =>
      goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || null,
        metadata: `Status: ${goal.status}`,
      })),
    [goals]
  )

  // Convert projects to SearchableDropdown format
  const projectOptions = useMemo(
    () =>
      projects.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description || null,
        metadata: null,
      })),
    [projects]
  )

  // Mutation
  const submitMutation = useSubmitFeedback()

  // Get character counter color
  const getCounterColor = (length: number): string => {
    if (length < 10) return 'error.main'
    if (length < 200) return 'error.main'
    if (length < 500) return 'warning.main'
    return 'success.main'
  }

  // Handle form submission
  const onSubmit = async (data: FeedbackFormSchema) => {
    try {
      // T039: Check for duplicate feedback (unless responding to request)
      if (!feedbackRequestId) {
        const duplicateCheck = await checkDuplicateFeedback(
          data.employeeId,
          data.goalId,
          feedbackRequestId
        )

        if (duplicateCheck.isDuplicate && duplicateCheck.existingFeedback) {
          logger.warn('Duplicate feedback detected', {
            hoursRemaining: duplicateCheck.existingFeedback.hours_remaining,
          })

          setDuplicateInfo({
            hoursRemaining: duplicateCheck.existingFeedback.hours_remaining,
          })
          setShowDuplicateDialog(true)
          return
        }
      }

      // Prepare submission data
      const submissionData: SubmitFeedbackRequest = {
        employee_id: data.employeeId,
        goal_id: data.goalId,
        project_id: data.projectId || null,
        content: data.content,
        rating: data.rating as RatingValue,
        feedback_request_id: feedbackRequestId || null,
      }

      logger.info('Submitting feedback', {
        to: data.employeeId,
        goal: data.goalId,
        requestId: feedbackRequestId,
        isOnline,
      })

      // T038: Handle offline submission
      if (!isOnline) {
        try {
          await offlineQueue.addToQueue(submissionData)
          logger.info('Feedback queued for offline submission', {
            to: data.employeeId,
          })

          // T040: Show queued toast
          showInfo(t('pages.feedback.submission.toasts.queued_offline'))

          // T037: Clean up draft after queuing
          if (draftId) {
            try {
              await draftManager.discardDraft(draftId)
              logger.info('Draft cleaned up after queuing', { draftId })
            } catch (error) {
              logger.error('Failed to cleanup draft', { error })
            }
          }

          // Reset form
          reset()
          setDraftId(null)
          setDraftSavedAt(null)

          // Call success callback (queued counts as success)
          if (onSuccess) {
            onSuccess('queued')
          }

          return
        } catch (error) {
          logger.error('Failed to queue feedback', { error })
          showError(t('pages.feedback.submission.toasts.error'))
          return
        }
      }

      // Online submission
      const result = await submitMutation.mutateAsync(submissionData)

      logger.info('Feedback submitted successfully', { feedbackId: result.id })

      // T040: Show success toast with recipient name
      showSuccess(
        t('pages.feedback.submission.toasts.success', {
          name: data.employeeId, // Note: In production, you'd want to get the actual display name
        })
      )

      // T037: Clean up draft after successful submission
      if (draftId) {
        try {
          await draftManager.discardDraft(draftId)
          logger.info('Draft cleaned up after submission', { draftId })
        } catch (error) {
          logger.error('Failed to cleanup draft', { error })
        }
      }

      // Reset form
      reset()
      setDraftId(null)
      setDraftSavedAt(null)

      // Call success callback
      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (error) {
      logger.error('Failed to submit feedback', { error })
      // T040: Show error toast
      showError(t('pages.feedback.submission.toasts.error'))
    }
  } // Handle cancel
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true)
    } else {
      if (onCancel) {
        onCancel()
      }
    }
  }

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false)
    reset()
    if (onCancel) {
      onCancel()
    }
  }

  // T036: Handle discard draft
  const handleDiscardDraft = () => {
    if (draftId) {
      setShowDiscardDraftConfirm(true)
    }
  }

  const handleConfirmDiscardDraft = async () => {
    if (draftId) {
      try {
        await draftManager.discardDraft(draftId)
        logger.info('Draft discarded', { draftId })

        setDraftId(null)
        setDraftSavedAt(null)
        setShowDiscardDraftConfirm(false)

        // Reset form to initial values
        reset({
          employeeId: initialEmployeeId || '',
          goalId: initialGoalId || '',
          projectId: initialProjectId || '',
          content: '',
          rating: 0,
        })
      } catch (error) {
        logger.error('Failed to discard draft', { error })
      }
    }
  }

  // Determine if responding to request
  const isRespondingToRequest = Boolean(feedbackRequestId)

  // Offline banner
  const showOfflineBanner = !isOnline

  return (
    <Box>
      {/* Offline Alert */}
      {showOfflineBanner && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          {t('pages.feedback.submission.form.offline.banner')}
        </Alert>
      )}

      {/* Main Form Card */}
      <Card>
        <CardContent sx={{ p: compact ? 2 : 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant={compact ? 'h6' : 'h5'}
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {t('pages.feedback.submission.title')}
              {isRespondingToRequest && (
                <Chip
                  label={t(
                    'pages.feedback.submission.form.responding_to_request',
                    'Responding to Request'
                  )}
                  color='primary'
                  size='small'
                />
              )}
            </Typography>

            {/* T034: Draft Saved Indicator */}
            {draftSavedAt && draftId && !isLoadingDraft && (
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mt: 1 }}
              >
                <Typography variant='caption' color='text.secondary'>
                  {t('pages.feedback.submission.form.draft.saved_at', {
                    time: draftSavedAt.toLocaleTimeString(),
                  })}
                </Typography>
                {/* T036: Discard Draft Button */}
                <Button
                  size='small'
                  variant='text'
                  color='error'
                  onClick={handleDiscardDraft}
                  disabled={isSubmitting}
                  sx={{ minWidth: 'auto', px: 1, py: 0 }}
                >
                  {t('pages.feedback.submission.form.buttons.discard_draft')}
                </Button>
              </Stack>
            )}
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* Employee Field - Read-only when initialEmployeeId provided */}
              <FormControl
                fullWidth
                required
                error={Boolean(errors.employeeId)}
              >
                <Controller
                  name='employeeId'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('pages.feedback.submission.form.recipient')}
                      value={field.value}
                      disabled={true}
                      required
                      error={Boolean(errors.employeeId)}
                      helperText={errors.employeeId?.message}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                />
              </FormControl>

              {/* Goal Dropdown */}
              <FormControl fullWidth required error={Boolean(errors.goalId)}>
                <Controller
                  name='goalId'
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel shrink>
                        {t('pages.feedback.submission.form.goal.label')}
                      </InputLabel>
                      <SearchableDropdown
                        value={
                          goalOptions.find(opt => opt.id === field.value) ||
                          null
                        }
                        onChange={option => field.onChange(option?.id || '')}
                        options={goalOptions}
                        label={t('pages.feedback.submission.form.goal.label')}
                        loading={goalsLoading}
                        placeholder={t(
                          'pages.feedback.submission.form.goal.placeholder'
                        )}
                        disabled={isSubmitting || Boolean(initialGoalId)}
                      />
                      {errors.goalId && (
                        <Typography
                          variant='caption'
                          color='error'
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {errors.goalId.message}
                        </Typography>
                      )}
                      {goalsError && (
                        <Typography
                          variant='caption'
                          color='error'
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {t('common.error.loadFailed')}
                        </Typography>
                      )}
                      {!goalsLoading && goals.length === 0 && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {t('pages.feedback.submission.form.goal.no_goals')}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </FormControl>

              {/* Project Dropdown (Optional) */}
              <FormControl fullWidth error={Boolean(errors.projectId)}>
                <Controller
                  name='projectId'
                  control={control}
                  render={({ field }) => (
                    <>
                      <InputLabel shrink>
                        {t('pages.feedback.submission.form.project.label')}
                      </InputLabel>
                      <SearchableDropdown
                        value={
                          projectOptions.find(opt => opt.id === field.value) ||
                          null
                        }
                        onChange={option => field.onChange(option?.id || '')}
                        options={projectOptions}
                        label={t(
                          'pages.feedback.submission.form.project.label'
                        )}
                        loading={projectsLoading}
                        placeholder={t(
                          'pages.feedback.submission.form.project.placeholder'
                        )}
                        disabled={isSubmitting || Boolean(initialProjectId)}
                      />
                      {projectsError && (
                        <Typography
                          variant='caption'
                          color='error'
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {t('common.error.loadFailed')}
                        </Typography>
                      )}
                      {!projectsLoading && projects.length === 0 && (
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mt: 0.5, ml: 1.75 }}
                        >
                          {t(
                            'pages.feedback.submission.form.project.no_projects'
                          )}
                        </Typography>
                      )}
                    </>
                  )}
                />
              </FormControl>

              {/* Rating Input */}
              <FormControl fullWidth required error={Boolean(errors.rating)}>
                <Controller
                  name='rating'
                  control={control}
                  render={({ field }) => (
                    <RatingInput
                      value={field.value as RatingValue | null}
                      onChange={value => field.onChange(value || 0)}
                      error={Boolean(errors.rating)}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </FormControl>

              {/* Content Textarea */}
              <FormControl fullWidth required error={Boolean(errors.content)}>
                <Controller
                  name='content'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('pages.feedback.submission.form.content.label')}
                      placeholder={t(
                        'pages.feedback.submission.form.content.placeholder'
                      )}
                      multiline
                      rows={6}
                      disabled={isSubmitting}
                      error={Boolean(errors.content)}
                      helperText={
                        errors.content ? (
                          errors.content.message
                        ) : (
                          <Box
                            component='span'
                            sx={{ color: getCounterColor(contentLength) }}
                          >
                            {t(
                              'pages.feedback.submission.form.content.currentLength',
                              { current: contentLength }
                            )}
                          </Box>
                        )
                      }
                    />
                  )}
                />
              </FormControl>

              {/* Form Actions */}
              <Stack direction='row' spacing={2} justifyContent='flex-end'>
                {onCancel && (
                  <Button
                    variant='outlined'
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {t('pages.feedback.submission.form.buttons.cancel')}
                  </Button>
                )}
                <Button
                  type='submit'
                  variant='contained'
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color='inherit' />
                    ) : (
                      <SendIcon />
                    )
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t('pages.feedback.submission.form.buttons.submitting')
                    : t('pages.feedback.submission.form.buttons.submit')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelConfirm}
        title={t('pages.feedback.submission.form.confirmation.unsaved_title')}
        message={t(
          'pages.feedback.submission.form.confirmation.unsaved_message'
        )}
        confirmText={t(
          'pages.feedback.submission.form.confirmation.discard_changes'
        )}
        cancelText={t(
          'pages.feedback.submission.form.confirmation.keep_editing'
        )}
        onConfirm={handleConfirmCancel}
        onClose={() => setShowCancelConfirm(false)}
        confirmColor='error'
      />

      {/* Discard Draft Confirmation Dialog */}
      <ConfirmationDialog
        open={showDiscardDraftConfirm}
        title={t('pages.feedback.submission.form.draft.confirm_discard_title')}
        message={t(
          'pages.feedback.submission.form.draft.confirm_discard_message'
        )}
        confirmText={t('pages.feedback.submission.form.draft.confirm_discard')}
        cancelText={t(
          'pages.feedback.submission.form.confirmation.keep_editing'
        )}
        onConfirm={handleConfirmDiscardDraft}
        onClose={() => setShowDiscardDraftConfirm(false)}
        confirmColor='error'
      />

      {/* T039: Duplicate Detection Dialog */}
      <ConfirmationDialog
        open={showDuplicateDialog}
        title={t('pages.feedback.submission.form.duplicate.title')}
        message={t('pages.feedback.submission.form.duplicate.message', {
          hours: 24,
          remaining: duplicateInfo?.hoursRemaining || 0,
        })}
        confirmText={t('pages.feedback.submission.form.duplicate.button')}
        onConfirm={() => setShowDuplicateDialog(false)}
        onClose={() => setShowDuplicateDialog(false)}
        confirmColor='primary'
      />
    </Box>
  )
}
