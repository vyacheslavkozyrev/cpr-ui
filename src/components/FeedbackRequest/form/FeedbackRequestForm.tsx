import SaveIcon from '@mui/icons-material/Save'
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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCreateFeedbackRequest } from '../../../services'
import { useFeedbackRequestDraftStore } from '../../../stores'
import { useToastStore } from '../../../stores/toastStore'
import type { CreateFeedbackRequestDto } from '../../../types/feedbackRequest'
import { logger } from '../../../utils/logger'
import { EmployeeMultiSelect } from './EmployeeMultiSelect'

/**
 * Form data interface (camelCase for form, will convert to snake_case for API)
 */
interface FeedbackRequestFormData {
  employeeIds: string[]
  projectId?: string
  goalId?: string
  message?: string
  dueDate?: Date | null
}

/**
 * Props for FeedbackRequestForm component
 */
interface FeedbackRequestFormProps {
  /** Optional initial employee ID from context (e.g., from employee profile page) */
  initialEmployeeId?: string
  /** Callback after successful submission */
  onSuccess?: () => void
  /** Callback on cancel */
  onCancel?: () => void
}

/**
 * Feedback Request Form Component
 * Create multi-recipient feedback requests with auto-save, validation, and duplicate detection
 * Feature 0004 - Phase 3 US-001
 */
export const FeedbackRequestForm: React.FC<FeedbackRequestFormProps> = ({
  initialEmployeeId,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addToast = useToastStore(state => state.addToast)

  // Draft store
  const { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge, markDirty } =
    useFeedbackRequestDraftStore()

  // Create mutation
  const createMutation = useCreateFeedbackRequest()

  // Form state
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<FeedbackRequestFormData>({
    defaultValues: {
      employeeIds: initialEmployeeId ? [initialEmployeeId] : [],
      projectId: '',
      goalId: '',
      message: '',
      dueDate: null,
    },
  })

  // Watch all form values for auto-save
  const watchedValues = watch()
  const message = watch('message') || ''
  const employeeIds = watch('employeeIds') || []

  // Local state
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  // Character count for message
  const messageLength = message.length
  const maxMessageLength = 500

  // Check for existing draft on mount
  useEffect(() => {
    // TODO: Get current employee ID from auth context
    const currentEmployeeId = 'current-employee-id' // Placeholder

    if (hasDraft(currentEmployeeId)) {
      setShowDraftBanner(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save draft every 30 seconds when form is dirty
  useEffect(() => {
    if (isDirty) {
      // Clear existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }

      // Set new timer for 30 seconds
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 30000) // 30 seconds

      setAutoSaveTimer(timer)

      return () => {
        if (timer) {
          clearTimeout(timer)
        }
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, watchedValues])

  /**
   * Auto-save draft to localStorage
   */
  const handleAutoSave = () => {
    // TODO: Get current employee ID from auth context
    const currentEmployeeId = 'current-employee-id' // Placeholder

    // Convert form data to API format
    const draftData: Partial<CreateFeedbackRequestDto> = {
      employee_ids: watchedValues.employeeIds,
      project_id: watchedValues.projectId || null,
      goal_id: watchedValues.goalId || null,
      message: watchedValues.message || null,
      due_date: watchedValues.dueDate
        ? watchedValues.dueDate.toISOString()
        : null,
    }

    saveDraft(draftData, currentEmployeeId)
    markDirty()

    logger.debug('Form auto-saved', {
      employeeCount: watchedValues.employeeIds.length,
    })
  }

  /**
   * Load draft into form
   */
  const handleLoadDraft = () => {
    // TODO: Get current employee ID from auth context
    const currentEmployeeId = 'current-employee-id' // Placeholder

    const draftData = loadDraft(currentEmployeeId)

    if (draftData) {
      // Convert API format back to form format
      reset({
        employeeIds: draftData.employee_ids || [],
        projectId: draftData.project_id || '',
        goalId: draftData.goal_id || '',
        message: draftData.message || '',
        dueDate: draftData.due_date ? new Date(draftData.due_date) : null,
      })

      setShowDraftBanner(false)
      addToast(t('feedbackRequest.form.draft.loaded'), 'info')
    }
  }

  /**
   * Discard draft
   */
  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    addToast(t('feedbackRequest.form.draft.discarded'), 'info')
  }

  /**
   * Handle form submission
   */
  const onSubmit = async (data: FeedbackRequestFormData) => {
    try {
      // Convert to API format (snake_case)
      const requestData: CreateFeedbackRequestDto = {
        employee_ids: data.employeeIds,
        project_id: data.projectId || null,
        goal_id: data.goalId || null,
        message: data.message || null,
        due_date: data.dueDate ? data.dueDate.toISOString() : null,
      }

      // Submit via mutation
      await createMutation.mutateAsync(requestData)

      // Clear draft on successful submission
      clearDraft()

      // Show success toast
      addToast(
        t('feedbackRequest.toasts.createSuccess', {
          count: data.employeeIds.length,
        }),
        'success'
      )

      // Navigate to sent list or call onSuccess callback
      if (onSuccess) {
        onSuccess()
      } else {
        navigate('/feedback/requests/sent')
      }
    } catch (error) {
      logger.error('Failed to create feedback request', { error })

      addToast(t('feedbackRequest.toasts.createError'), 'error')
    }
  }

  /**
   * Handle cancel button
   */
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true)
    } else {
      if (onCancel) {
        onCancel()
      } else {
        navigate(-1)
      }
    }
  }

  /**
   * Confirm cancel (discard changes)
   */
  const handleConfirmCancel = () => {
    // Auto-save as draft before discarding
    handleAutoSave()

    setShowCancelConfirm(false)

    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }

  /**
   * Quick select due date helpers
   */
  const handleQuickSelectDueDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setValue('dueDate', date, { shouldDirty: true })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 800, mx: 'auto', py: 3 }}>
        {/* Draft Banner */}
        {showDraftBanner && (
          <Alert
            severity='info'
            sx={{ mb: 3 }}
            action={
              <Stack direction='row' spacing={1}>
                <Button size='small' onClick={handleLoadDraft}>
                  {t('feedbackRequest.form.buttons.loadDraft')}
                </Button>
                <Button size='small' onClick={handleDiscardDraft}>
                  {t('feedbackRequest.form.buttons.discardDraft')}
                </Button>
              </Stack>
            }
          >
            {t('feedbackRequest.form.draft.banner', {
              time: getDraftAge() !== null ? `${getDraftAge()} days ago` : '',
            })}
          </Alert>
        )}

        {/* Main Form Card */}
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {t('feedbackRequest.form.title')}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {/* Employee Multi-Select */}
                <FormControl
                  fullWidth
                  required
                  error={Boolean(errors.employeeIds)}
                >
                  <InputLabel>
                    {t('feedbackRequest.form.employees.label')}
                  </InputLabel>
                  <Controller
                    name='employeeIds'
                    control={control}
                    rules={{
                      required: t('feedbackRequest.form.employees.required'),
                      validate: value => {
                        if (value.length === 0) {
                          return t('feedbackRequest.form.employees.required')
                        }
                        if (value.length > 20) {
                          return t('feedbackRequest.form.employees.maxExceeded')
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <EmployeeMultiSelect
                        value={field.value || []}
                        onChange={field.onChange}
                        {...(errors.employeeIds?.message && {
                          error: errors.employeeIds.message,
                        })}
                        required
                        maxSelection={20}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </FormControl>

                {/* Project Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>
                    {t('feedbackRequest.form.project.label')}
                  </InputLabel>
                  <Controller
                    name='projectId'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ''}
                        label={t('feedbackRequest.form.project.label')}
                      >
                        <MenuItem value=''>
                          <em>
                            {t('feedbackRequest.form.project.placeholder')}
                          </em>
                        </MenuItem>
                        {/* TODO: Load projects from API */}
                        <MenuItem value='project-1'>Sample Project 1</MenuItem>
                        <MenuItem value='project-2'>Sample Project 2</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* Goal Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>
                    {t('feedbackRequest.form.goal.label')}
                  </InputLabel>
                  <Controller
                    name='goalId'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ''}
                        label={t('feedbackRequest.form.goal.label')}
                      >
                        <MenuItem value=''>
                          <em>{t('feedbackRequest.form.goal.placeholder')}</em>
                        </MenuItem>
                        {/* TODO: Load goals from API */}
                        <MenuItem value='goal-1'>Sample Goal 1</MenuItem>
                        <MenuItem value='goal-2'>Sample Goal 2</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                {/* Message Textarea */}
                <FormControl fullWidth error={Boolean(errors.message)}>
                  <Controller
                    name='message'
                    control={control}
                    rules={{
                      maxLength: {
                        value: maxMessageLength,
                        message: t('feedbackRequest.form.message.maxLength'),
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('feedbackRequest.form.message.label')}
                        placeholder={t(
                          'feedbackRequest.form.message.placeholder'
                        )}
                        multiline
                        rows={4}
                        helperText={
                          errors.message
                            ? errors.message.message
                            : t('feedbackRequest.form.message.currentLength', {
                              current: messageLength,
                            })
                        }
                        error={Boolean(errors.message)}
                      />
                    )}
                  />
                </FormControl>

                {/* Due Date Picker */}
                <Box>
                  <Controller
                    name='dueDate'
                    control={control}
                    rules={{
                      validate: value => {
                        if (value && value < new Date()) {
                          return t('feedbackRequest.form.dueDate.error')
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        value={field.value ?? null}
                        label={t('feedbackRequest.form.dueDate.label')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(errors.dueDate),
                            helperText: errors.dueDate?.message,
                          },
                        }}
                      />
                    )}
                  />

                  {/* Quick Select Chips */}
                  <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={t(
                        'feedbackRequest.form.dueDate.quickSelect.3days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(3)}
                    />
                    <Chip
                      label={t(
                        'feedbackRequest.form.dueDate.quickSelect.7days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(7)}
                    />
                    <Chip
                      label={t(
                        'feedbackRequest.form.dueDate.quickSelect.14days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(14)}
                    />
                    <Chip
                      label={t(
                        'feedbackRequest.form.dueDate.quickSelect.30days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(30)}
                    />
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction='row' spacing={2} justifyContent='flex-end'>
                  <Button
                    variant='outlined'
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {t('feedbackRequest.form.buttons.cancel')}
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<SaveIcon />}
                    onClick={handleAutoSave}
                    disabled={!isDirty || isSubmitting}
                  >
                    {t('feedbackRequest.form.buttons.saveDraft')}
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SendIcon />
                      )
                    }
                    disabled={isSubmitting || employeeIds.length === 0}
                  >
                    {isSubmitting
                      ? t('feedbackRequest.form.buttons.sending')
                      : t('feedbackRequest.form.buttons.send')}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <Alert
            severity='warning'
            sx={{ mt: 3 }}
            action={
              <Stack direction='row' spacing={1}>
                <Button
                  size='small'
                  onClick={() => setShowCancelConfirm(false)}
                >
                  {t('feedbackRequest.form.confirmation.actions.keepEditing')}
                </Button>
                <Button size='small' onClick={handleConfirmCancel}>
                  {t('feedbackRequest.form.confirmation.actions.discard')}
                </Button>
              </Stack>
            }
          >
            {t('feedbackRequest.form.confirmation.message')}
          </Alert>
        )}
      </Box>
    </LocalizationProvider>
  )
}
