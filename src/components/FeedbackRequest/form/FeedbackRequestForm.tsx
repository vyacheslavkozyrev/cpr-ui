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
import type { TGoalDto } from '../../../dtos/GoalDto'
import { useOfflineQueue } from '../../../hooks/useOfflineQueue'
import {
  type ProjectSummaryDto,
  useCreateFeedbackRequest,
  useGoals,
  useProjects,
} from '../../../services'
import type { EmployeeSummaryDto } from '../../../services/employeeQueryService'
import { offlineQueueService } from '../../../services/offlineQueueService'
import { useFeedbackRequestDraftStore } from '../../../stores'
import { useAuthStore } from '../../../stores/authStore'
import { useToastStore } from '../../../stores/toastStore'
import type { CreateFeedbackRequestDto } from '../../../types/feedbackRequest'
import { logger } from '../../../utils/logger'
import { DuplicateDetectionModal } from './DuplicateDetectionModal'
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

  // Get current user ID for draft management
  const { user } = useAuthStore()
  const currentEmployeeId = user?.id || 'anonymous'

  // Draft store
  const { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge, markDirty } =
    useFeedbackRequestDraftStore()

  // Offline queue
  const { isOnline, pendingCount } = useOfflineQueue()

  // Create mutation
  const createMutation = useCreateFeedbackRequest()

  // Load projects and goals for dropdowns
  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects()
  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsError,
  } = useGoals({ per_page: 100 }) // Load up to 100 goals for dropdown

  const projects = projectsData || []
  const goals = goalsData?.items || []

  // Form state
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
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

  // Watch message for character count only
  const message = watch('message') || ''

  // Local state
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [duplicateEmployeeIds, setDuplicateEmployeeIds] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<
    EmployeeSummaryDto[]
  >([])

  // Character count for message
  const messageLength = message.length
  const maxMessageLength = 500

  // Check for existing draft on mount
  useEffect(() => {
    if (currentEmployeeId && hasDraft(currentEmployeeId)) {
      setShowDraftBanner(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmployeeId])

  // Auto-save draft every 30 seconds when form is dirty
  useEffect(() => {
    if (isDirty) {
      // Set new timer for 30 seconds
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 30000) // 30 seconds

      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty])

  /**
   * Auto-save draft to localStorage
   */
  const handleAutoSave = () => {
    if (!currentEmployeeId) {
      logger.warn('Cannot auto-save: no employee ID available')
      return
    }

    // Get current form values
    const formValues = getValues()

    // Convert form data to API format
    const draftData: Partial<CreateFeedbackRequestDto> = {
      employee_ids: formValues.employeeIds,
      project_id: formValues.projectId || null,
      goal_id: formValues.goalId || null,
      message: formValues.message || null,
      due_date: formValues.dueDate ? formValues.dueDate.toISOString() : null,
    }

    saveDraft(draftData, currentEmployeeId)
    markDirty()

    logger.debug('Form auto-saved', {
      employeeId: currentEmployeeId,
      employeeCount: formValues.employeeIds.length,
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Load draft into form
   */
  const handleLoadDraft = () => {
    if (!currentEmployeeId) {
      logger.warn('Cannot load draft: no employee ID available')
      return
    }

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
      addToast(t('pages.feedback.request.form.draft.loaded'), 'info')
    }
  }

  /**
   * Discard draft
   */
  const handleDiscardDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
    addToast(t('pages.feedback.request.form.draft.discarded'), 'info')
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

      // Check if offline - queue the request
      if (!isOnline) {
        await offlineQueueService.enqueue(requestData, currentEmployeeId)
        clearDraft()
        addToast(
          t('pages.feedback.request.toasts.queuedOffline', {
            count: data.employeeIds.length,
          }),
          'info'
        )

        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/feedback/requests/sent')
        }
        return
      }

      // Submit via mutation
      await createMutation.mutateAsync(requestData)

      // Clear draft on successful submission
      clearDraft()

      // Show success toast
      addToast(
        t('pages.feedback.request.toasts.createSuccess', {
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
    } catch (error: unknown) {
      logger.error('Failed to create feedback request', { error })

      // Type guard for error with status
      const isErrorWithStatus = (
        err: unknown
      ): err is {
        status?: number
        response?: { status?: number; data?: { message?: string } }
        message?: string
      } => {
        return typeof err === 'object' && err !== null
      }

      // Check for 409 Conflict (duplicate recipients)
      if (
        isErrorWithStatus(error) &&
        (error?.status === 409 || error?.response?.status === 409)
      ) {
        // Extract duplicate employee IDs from error message if available
        // Backend returns: "Active feedback requests already exist for these recipients: guid1, guid2"
        const errorMessage =
          error?.message || error?.response?.data?.message || ''
        const duplicateIds = extractDuplicateIds(errorMessage, data.employeeIds)

        setDuplicateEmployeeIds(duplicateIds)
        setShowDuplicateModal(true)
      } else {
        addToast(t('pages.feedback.request.toasts.createError'), 'error')
      }
    }
  }

  /**
   * Extract duplicate employee IDs from error message
   */
  const extractDuplicateIds = (
    errorMessage: string,
    allEmployeeIds: string[]
  ): string[] => {
    // If the backend provides specific IDs in the error message, parse them
    // Otherwise, assume all employees are duplicates (full duplicate case)
    if (errorMessage.includes('recipients:')) {
      // Try to extract GUIDs from the error message
      const guidPattern =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
      const matches = errorMessage.match(guidPattern)
      if (matches && matches.length > 0) {
        return matches
      }
    }

    // Fallback: assume all are duplicates
    return allEmployeeIds
  }

  /**
   * Handle removing duplicate employees and resubmitting
   */
  const handleRemoveDuplicates = () => {
    // Remove duplicate employees from the form
    const currentEmployeeIds = getValues('employeeIds') || []
    const filteredIds = currentEmployeeIds.filter(
      id => !duplicateEmployeeIds.includes(id)
    )

    setValue('employeeIds', filteredIds, { shouldValidate: true })
    setShowDuplicateModal(false)
    setDuplicateEmployeeIds([])

    // Show toast to inform user
    addToast(
      t('pages.feedback.request.toasts.duplicatesRemoved', {
        count: duplicateEmployeeIds.length,
      }),
      'info'
    )
  }

  /**
   * Handle viewing existing requests
   */
  const handleViewExisting = () => {
    setShowDuplicateModal(false)
    navigate('/feedback/requests/sent')
  }

  /**
   * Handle cancel duplicate modal
   */
  const handleCancelDuplicateModal = () => {
    setShowDuplicateModal(false)
    setDuplicateEmployeeIds([])
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
                  {t('pages.feedback.request.form.buttons.loadDraft')}
                </Button>
                <Button size='small' onClick={handleDiscardDraft}>
                  {t('pages.feedback.request.form.buttons.discardDraft')}
                </Button>
              </Stack>
            }
          >
            {t('pages.feedback.request.form.draft.banner', {
              time: getDraftAge() !== null ? `${getDraftAge()} days ago` : '',
            })}
          </Alert>
        )}

        {/* Offline Queue Indicator */}
        {!isOnline && (
          <Alert severity='warning' sx={{ mb: 3 }}>
            {t('pages.feedback.request.form.offline.banner')}
          </Alert>
        )}

        {pendingCount > 0 && isOnline && (
          <Alert severity='info' sx={{ mb: 3 }}>
            {t('pages.feedback.request.form.offline.syncing', {
              count: pendingCount,
            })}
          </Alert>
        )}

        {/* Main Form Card */}
        <Card>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              {t('pages.feedback.request.form.title')}
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
                    {t('pages.feedback.request.form.employees.label')}
                  </InputLabel>
                  <Controller
                    name='employeeIds'
                    control={control}
                    rules={{
                      required: t(
                        'pages.feedback.request.form.employees.required'
                      ),
                      validate: value => {
                        if (value.length === 0) {
                          return t(
                            'pages.feedback.request.form.employees.required'
                          )
                        }
                        if (value.length > 20) {
                          return t(
                            'pages.feedback.request.form.employees.maxExceeded'
                          )
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <EmployeeMultiSelect
                        value={field.value || []}
                        onChange={field.onChange}
                        onSelectedEmployeesChange={setSelectedEmployees}
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
                    {t('pages.feedback.request.form.project.label')}
                  </InputLabel>
                  <Controller
                    name='projectId'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ''}
                        label={t('pages.feedback.request.form.project.label')}
                        disabled={projectsLoading || isSubmitting}
                      >
                        <MenuItem value=''>
                          <em>
                            {t(
                              'pages.feedback.request.form.project.placeholder'
                            )}
                          </em>
                        </MenuItem>
                        {projectsLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            {t('common.loading')}
                          </MenuItem>
                        )}
                        {projectsError && (
                          <MenuItem disabled>
                            {t('common.error.loadFailed')}
                          </MenuItem>
                        )}
                        {!projectsLoading &&
                          !projectsError &&
                          projects.length === 0 && (
                            <MenuItem disabled>
                              {t('pages.feedback.request.form.project.empty')}
                            </MenuItem>
                          )}
                        {projects.map((project: ProjectSummaryDto) => (
                          <MenuItem key={project.id} value={project.id}>
                            {project.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                {/* Goal Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>
                    {t('pages.feedback.request.form.goal.label')}
                  </InputLabel>
                  <Controller
                    name='goalId'
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value || ''}
                        label={t('pages.feedback.request.form.goal.label')}
                        disabled={goalsLoading || isSubmitting}
                      >
                        <MenuItem value=''>
                          <em>
                            {t('pages.feedback.request.form.goal.placeholder')}
                          </em>
                        </MenuItem>
                        {goalsLoading && (
                          <MenuItem disabled>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            {t('common.loading')}
                          </MenuItem>
                        )}
                        {goalsError && (
                          <MenuItem disabled>
                            {t('common.error.loadFailed')}
                          </MenuItem>
                        )}
                        {!goalsLoading && !goalsError && goals.length === 0 && (
                          <MenuItem disabled>
                            {t('pages.feedback.request.form.goal.empty')}
                          </MenuItem>
                        )}
                        {goals.map((goal: TGoalDto) => (
                          <MenuItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </MenuItem>
                        ))}
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
                        message: t(
                          'pages.feedback.request.form.message.maxLength'
                        ),
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={t('pages.feedback.request.form.message.label')}
                        placeholder={t(
                          'pages.feedback.request.form.message.placeholder'
                        )}
                        multiline
                        rows={4}
                        helperText={
                          errors.message
                            ? errors.message.message
                            : t(
                                'pages.feedback.request.form.message.currentLength',
                                {
                                  current: messageLength,
                                }
                              )
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
                          return t('pages.feedback.request.form.dueDate.error')
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        value={field.value ?? null}
                        label={t('pages.feedback.request.form.dueDate.label')}
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
                        'pages.feedback.request.form.dueDate.quickSelect.3days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(3)}
                    />
                    <Chip
                      label={t(
                        'pages.feedback.request.form.dueDate.quickSelect.7days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(7)}
                    />
                    <Chip
                      label={t(
                        'pages.feedback.request.form.dueDate.quickSelect.14days'
                      )}
                      size='small'
                      onClick={() => handleQuickSelectDueDate(14)}
                    />
                    <Chip
                      label={t(
                        'pages.feedback.request.form.dueDate.quickSelect.30days'
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
                    {t('pages.feedback.request.form.buttons.cancel')}
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<SaveIcon />}
                    onClick={handleAutoSave}
                    disabled={!isDirty || isSubmitting}
                  >
                    {t('pages.feedback.request.form.buttons.saveDraft')}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t('pages.feedback.request.form.buttons.sending')
                      : t('pages.feedback.request.form.buttons.send')}
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
                  {t(
                    'pages.feedback.request.form.confirmation.actions.keepEditing'
                  )}
                </Button>
                <Button size='small' onClick={handleConfirmCancel}>
                  {t(
                    'pages.feedback.request.form.confirmation.actions.discard'
                  )}
                </Button>
              </Stack>
            }
          >
            {t('pages.feedback.request.form.confirmation.message')}
          </Alert>
        )}

        {/* Duplicate Detection Modal */}
        <DuplicateDetectionModal
          open={showDuplicateModal}
          duplicateEmployees={duplicateEmployeeIds.map(id => {
            const employee = selectedEmployees.find(emp => emp.id === id)
            return {
              id,
              display_name:
                employee?.display_name || `Employee ${id.substring(0, 8)}`,
            }
          })}
          isFullDuplicate={
            duplicateEmployeeIds.length === getValues('employeeIds')?.length
          }
          context='general'
          onRemoveDuplicates={handleRemoveDuplicates}
          onViewExisting={handleViewExisting}
          onCancel={handleCancelDuplicateModal}
        />
      </Box>
    </LocalizationProvider>
  )
}
