import SaveIcon from '@mui/icons-material/Save'
import { Box, Button, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  TCreateGoalTaskDto,
  TGoalTaskDto,
  TUpdateGoalTaskDto,
} from '../../../dtos/GoalDto'
import { useAutoSave } from '../../../hooks'
import { useCreateTask, useUpdateTask } from '../../../services'

interface TaskFormProps {
  goalId: string
  task?: TGoalTaskDto
  onCancel: () => void
  onSuccess: () => void
}

/**
 * Task Form Component
 * Create or edit task with auto-save
 * Feature 0001 - Phase 3 & 5B
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  goalId,
  task,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const isEdit = Boolean(task)

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Track if form has changes
  useEffect(() => {
    const hasChanges =
      formData.title !== (task?.title || '') ||
      formData.description !== (task?.description || '') ||
      formData.deadline !== (task?.deadline ? task.deadline.split('T')[0] : '')
    setIsDirty(hasChanges)
  }, [formData, task])

  // Auto-save form data to localStorage (only for new tasks)
  const { clearDraft } = useAutoSave({
    storageKey: isEdit
      ? `task-form-draft-${goalId}-${task?.id}`
      : `task-form-draft-${goalId}-new`,
    data: formData,
    isDirty: isDirty && !isEdit, // Only auto-save for new tasks
    delay: 2000,
    onRestore: restored => {
      if (!isEdit && !task) {
        setFormData(restored)
      }
    },
  })

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors['title'] = t('validation.required', 'This field is required')
    } else if (formData.title.length > 250) {
      newErrors['title'] = t('validation.maxLength', {
        max: 250,
        defaultValue: 'Maximum 250 characters',
      })
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors['description'] = t('validation.maxLength', {
        max: 2000,
        defaultValue: 'Maximum 2000 characters',
      })
    }

    // Validate deadline is in the future
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (deadlineDate < today) {
        newErrors['deadline'] = t('validation.futureDateRequired', {
          defaultValue: 'Deadline must be a future date',
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      if (isEdit && task) {
        const updateData: TUpdateGoalTaskDto = {
          title: formData.title,
        }

        if (formData.description) {
          updateData.description = formData.description
        }

        if (formData.deadline) {
          updateData.deadline = new Date(formData.deadline).toISOString()
        }

        await updateTaskMutation.mutateAsync({
          goalId,
          taskId: task.id,
          taskData: updateData,
        })
      } else {
        const createData: TCreateGoalTaskDto = {
          title: formData.title,
        }

        if (formData.description) {
          createData.description = formData.description
        }

        if (formData.deadline) {
          createData.deadline = new Date(formData.deadline).toISOString()
        }

        await createTaskMutation.mutateAsync({
          goalId,
          taskData: createData,
        })
      }

      clearDraft() // Clear auto-saved draft on success
      onSuccess()
    } catch {
      // Error handled by mutation
    }
  }

  const handleCancel = () => {
    clearDraft() // Clear auto-saved draft on cancel
    onCancel()
  }

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <Box component='form' onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label={t('tasks.title', 'Task Title')}
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          error={Boolean(errors['title'])}
          helperText={errors['title']}
          required
          disabled={isPending}
          autoFocus={!isEdit}
        />

        <TextField
          fullWidth
          label={t('tasks.description', 'Description')}
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          error={Boolean(errors['description'])}
          helperText={errors['description']}
          multiline
          rows={2}
          disabled={isPending}
        />

        <TextField
          fullWidth
          type='date'
          label={t('tasks.deadline', 'Deadline')}
          value={formData.deadline}
          onChange={e => handleChange('deadline', e.target.value)}
          error={Boolean(errors['deadline'])}
          helperText={
            errors['deadline'] ||
            t(
              'tasks.deadlineHelp',
              'Target completion date (optional, must be future date)'
            )
          }
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: new Date().toISOString().split('T')[0],
          }}
          disabled={isPending}
        />

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
                : t('common.add', 'Add')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
