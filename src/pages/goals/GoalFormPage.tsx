import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Link as MuiLink,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type {
  TCreateGoalDto,
  TGoalVisibility,
  TUpdateGoalDto,
} from '../../dtos/GoalDto'
import { useAutoSave, useDebounce } from '../../hooks'
import { useCreateGoal, useGoal, useUpdateGoal } from '../../services'

/**
 * Goal Form Page
 * Create or edit a goal with auto-save
 * Feature 0001 - Phase 3 & 5B
 */
export const GoalFormPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { goalId } = useParams<{ goalId?: string }>()
  const isEdit = Boolean(goalId)

  // Fetch existing goal if editing
  const {
    data: goal,
    isLoading: isLoadingGoal,
    error: goalError,
  } = useGoal(goalId || '', isEdit)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    relatedSkillId: '',
    relatedSkillLevelId: '',
    priority: '50',
    visibility: 'private' as TGoalVisibility,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [initialFormData, setInitialFormData] = useState(formData)

  // Auto-save form data to localStorage
  const { clearDraft } = useAutoSave({
    storageKey: isEdit ? `goal-form-draft-${goalId}` : 'goal-form-draft-new',
    data: formData,
    isDirty: isDirty && !isEdit, // Only auto-save for new goals, not edits
    delay: 2000,
    onRestore: restored => {
      if (!isEdit && !goal) {
        setFormData(restored)
        setInitialFormData(restored)
      }
    },
  })

  // Debounce form values for real-time validation
  const debouncedTitle = useDebounce(formData.title, 500)
  const debouncedDescription = useDebounce(formData.description, 500)
  const debouncedDeadline = useDebounce(formData.deadline, 500)
  const debouncedPriority = useDebounce(formData.priority, 500)

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      const loadedData = {
        title: goal.title,
        description: goal.description || '',
        deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
        relatedSkillId: goal.relatedSkillId || '',
        relatedSkillLevelId: goal.relatedSkillLevelId || '',
        priority: (goal.priority || 50).toString(),
        visibility: (goal.visibility as TGoalVisibility) || 'private',
      }
      setFormData(loadedData)
      setInitialFormData(loadedData)
    }
  }, [goal])

  // Track form changes
  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(initialFormData)
    setIsDirty(hasChanges)
  }, [formData, initialFormData])

  // Warn on navigation if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const createGoalMutation = useCreateGoal()
  const updateGoalMutation = useUpdateGoal()

  // Validate individual field
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'title':
        if (!value.trim()) {
          return t('validation.required', 'This field is required')
        }
        if (value.length > 250) {
          return t('validation.maxLength', {
            max: 250,
            defaultValue: 'Maximum 250 characters',
          })
        }
        break
      case 'description':
        if (value && value.length > 2000) {
          return t('validation.maxLength', {
            max: 2000,
            defaultValue: 'Maximum 2000 characters',
          })
        }
        break
      case 'deadline':
        if (value) {
          const deadlineDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (deadlineDate < today) {
            return t('validation.futureDateRequired', {
              defaultValue: 'Deadline must be a future date',
            })
          }
        }
        break
      case 'priority': {
        const priority = parseInt(value, 10)
        if (isNaN(priority) || priority < 0 || priority > 100) {
          return t('validation.priorityRange', {
            defaultValue: 'Priority must be between 0 and 100',
          })
        }
        break
      }
    }
    return ''
  }

  // Real-time validation with debounce
  useEffect(() => {
    if (!isDirty) return // Skip validation on initial load
    const error = validateField('title', debouncedTitle)
    setErrors(prev => ({ ...prev, title: error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle, isDirty, t])

  useEffect(() => {
    if (!isDirty) return
    const error = validateField('description', debouncedDescription)
    setErrors(prev => ({ ...prev, description: error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescription, isDirty, t])

  useEffect(() => {
    if (!isDirty) return
    const error = validateField('deadline', debouncedDeadline)
    setErrors(prev => ({ ...prev, deadline: error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDeadline, isDirty, t])

  useEffect(() => {
    if (!isDirty) return
    const error = validateField('priority', debouncedPriority)
    setErrors(prev => ({ ...prev, priority: error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPriority, isDirty, t])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors['title'] = t('validation.required', 'This field is required')
    } else if (formData.title.length > 250) {
      newErrors['title'] = t('validation.maxLength', {
        max: 250,
        defaultValue: 'Maximum 250 characters',
      })
    }

    // Description validation
    if (formData.description && formData.description.length > 2000) {
      newErrors['description'] = t('validation.maxLength', {
        max: 2000,
        defaultValue: 'Maximum 2000 characters',
      })
    }

    // Deadline validation - must be a future date
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for fair comparison

      if (deadlineDate < today) {
        newErrors['deadline'] = t('validation.futureDateRequired', {
          defaultValue: 'Deadline must be a future date',
        })
      }
    }

    // Priority validation
    const priority = parseInt(formData.priority, 10)
    if (isNaN(priority) || priority < 0 || priority > 100) {
      newErrors['priority'] = t('validation.priorityRange', {
        defaultValue: 'Priority must be between 0 and 100',
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (isEdit && goalId) {
        // Update existing goal
        const updateData: TUpdateGoalDto = {
          title: formData.title,
        }

        if (formData.description) {
          updateData.description = formData.description
        }

        if (formData.deadline) {
          updateData.deadline = new Date(formData.deadline).toISOString()
        }

        if (formData.relatedSkillId) {
          updateData.relatedSkillId = formData.relatedSkillId
        }

        if (formData.relatedSkillLevelId) {
          updateData.relatedSkillLevelId = formData.relatedSkillLevelId
        }

        updateData.priority = parseInt(formData.priority, 10)
        updateData.visibility = formData.visibility

        await updateGoalMutation.mutateAsync({
          goalId,
          goalData: updateData,
        })

        clearDraft() // Clear auto-saved draft
        setIsDirty(false) // Clear dirty flag before navigation
        navigate(`/goals/${goalId}`)
      } else {
        // Create new goal
        const createData: TCreateGoalDto = {
          title: formData.title,
        }

        if (formData.description) {
          createData.description = formData.description
        }

        if (formData.deadline) {
          createData.deadline = new Date(formData.deadline).toISOString()
        }

        if (formData.relatedSkillId) {
          createData.relatedSkillId = formData.relatedSkillId
        }

        if (formData.relatedSkillLevelId) {
          createData.relatedSkillLevelId = formData.relatedSkillLevelId
        }

        createData.priority = parseInt(formData.priority, 10)
        createData.visibility = formData.visibility

        const newGoal = await createGoalMutation.mutateAsync(createData)
        clearDraft() // Clear auto-saved draft
        setIsDirty(false) // Clear dirty flag before navigation
        navigate(`/goals/${newGoal.id}`)
      }
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        t(
          'pages.goalForm.unsavedChanges',
          'You have unsaved changes. Are you sure you want to leave?'
        )
      )
      if (!confirmLeave) return
    }

    clearDraft() // Clear auto-saved draft on cancel

    if (isEdit && goalId) {
      navigate(`/goals/${goalId}`)
    } else {
      navigate('/goals')
    }
  }

  const isPending = createGoalMutation.isPending || updateGoalMutation.isPending
  const mutationError = createGoalMutation.error || updateGoalMutation.error

  // Loading state for edit mode
  if (isEdit && isLoadingGoal) {
    return (
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  // Error state for edit mode
  if (isEdit && goalError) {
    return (
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Alert severity='error'>
          {t('errors.loadGoalFailed', 'Failed to load goal. Please try again.')}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to='/' underline='hover' color='inherit'>
          {t('navigation.home', 'Home')}
        </MuiLink>
        <MuiLink component={Link} to='/goals' underline='hover' color='inherit'>
          {t('navigation.goals', 'Goals')}
        </MuiLink>
        <Typography color='text.primary'>
          {isEdit
            ? t('pages.goalForm.editTitle', 'Edit Goal')
            : t('pages.goalForm.createTitle', 'Create Goal')}
        </Typography>
      </Breadcrumbs>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <Stack direction='row' alignItems='center' spacing={2} mb={3}>
          <Button
            variant='text'
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            disabled={isPending}
          >
            {t('common.back', 'Back')}
          </Button>
          <Typography variant='h4' component='h1' sx={{ flexGrow: 1 }}>
            {isEdit
              ? t('pages.goalForm.editTitle', 'Edit Goal')
              : t('pages.goalForm.createTitle', 'Create Goal')}
          </Typography>
        </Stack>

        {mutationError && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {t(
              'errors.saveGoalFailed',
              'Failed to save goal. Please try again.'
            )}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              fullWidth
              label={t('pages.goals.goalTitle', 'Goal Title')}
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              error={Boolean(errors['title'])}
              helperText={
                errors['title'] ||
                t(
                  'pages.goals.titleHelp',
                  'Clear, specific goal (1-250 characters)'
                )
              }
              required
              disabled={isPending}
              autoFocus
            />

            {/* Description */}
            <TextField
              fullWidth
              label={t('pages.goals.description', 'Description')}
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              error={Boolean(errors['description'])}
              helperText={
                errors['description'] ||
                t(
                  'pages.goals.descriptionHelp',
                  'Detailed explanation (optional, max 2000 characters)'
                )
              }
              multiline
              rows={4}
              disabled={isPending}
            />

            {/* Deadline */}
            <TextField
              fullWidth
              type='date'
              label={t('pages.goals.deadlineLabel', 'Deadline')}
              value={formData.deadline}
              onChange={e => handleChange('deadline', e.target.value)}
              error={Boolean(errors['deadline'])}
              helperText={
                errors['deadline'] ||
                t(
                  'pages.goals.deadlineHelp',
                  'Target completion date (optional, must be future date)'
                )
              }
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: new Date().toISOString().split('T')[0], // Minimum date is today
              }}
              disabled={isPending}
            />

            {/* Priority */}
            <TextField
              fullWidth
              type='number'
              label={t('pages.goals.priorityLabel', 'Priority')}
              value={formData.priority}
              onChange={e => handleChange('priority', e.target.value)}
              error={Boolean(errors['priority'])}
              helperText={
                errors['priority'] ||
                t(
                  'pages.goals.priorityHelp',
                  'Priority level (0-100, default: 50)'
                )
              }
              inputProps={{ min: 0, max: 100, step: 1 }}
              disabled={isPending}
            />

            {/* Visibility */}
            <FormControl fullWidth disabled={isPending}>
              <InputLabel id='visibility-label'>
                {t('pages.goals.visibilityLabel', 'Visibility')}
              </InputLabel>
              <Select
                labelId='visibility-label'
                value={formData.visibility}
                onChange={e => handleChange('visibility', e.target.value)}
                label={t('pages.goals.visibilityLabel', 'Visibility')}
              >
                <MenuItem value='private'>
                  {t('pages.goals.visibility.private', 'Private')}
                </MenuItem>
                <MenuItem value='team'>
                  {t('pages.goals.visibility.team', 'Team')}
                </MenuItem>
                <MenuItem value='org'>
                  {t('pages.goals.visibility.org', 'Organization')}
                </MenuItem>
              </Select>
              <FormHelperText>
                {t('pages.goals.visibilityHelp', 'Who can see this goal')}
              </FormHelperText>
            </FormControl>

            {/* 
                            TODO: Skills Integration
                            Add dropdown selects for:
                            1. Related Skill (from user's next position skills)
                            2. Related Skill Level (target level for the selected skill)
                            
                            These fields are hidden until the Skills Taxonomy API is implemented.
                            Backend supports relatedSkillId and relatedSkillLevelId (UUIDs) but
                            frontend needs to fetch available skills/levels for user-friendly selection.
                            
                            Implementation requires:
                            - GET /api/taxonomy/skills (or similar endpoint)
                            - GET /api/taxonomy/skill-levels (or similar endpoint)
                            - GET /api/me/next-position (to get user's career path)
                        */}

            {/* Form Actions */}
            <Stack direction='row' spacing={2} justifyContent='flex-end'>
              <Button onClick={handleCancel} disabled={isPending}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                variant='contained'
                startIcon={<SaveIcon />}
                disabled={isPending}
              >
                {isPending
                  ? t('common.saving', 'Saving...')
                  : isEdit
                    ? t('common.save', 'Save')
                    : t('common.create', 'Create')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
}
