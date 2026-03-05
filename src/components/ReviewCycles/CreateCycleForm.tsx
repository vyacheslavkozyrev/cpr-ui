import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useCreateReviewCycle } from '../../hooks/useReviewCycles'
import type { ICreateReviewCycleRequest } from '../../types/reviewCycle.types'

interface CreateCycleFormProps {
  open: boolean
  onClose: () => void
}

const CreateCycleForm: React.FC<CreateCycleFormProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const createMutation = useCreateReviewCycle()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ICreateReviewCycleRequest>({
    defaultValues: { title: '', subject_employee_id: '', description: '' },
  })

  const titleValue = watch('title', '')
  const descriptionValue = watch('description', '')

  const onSubmit = async (data: ICreateReviewCycleRequest) => {
    await createMutation.mutateAsync(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>{t('pages.reviewCycles.createButton')}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <TextField
            label={t('pages.reviewCycles.titleColumn')}
            fullWidth
            margin='normal'
            required
            inputProps={{ maxLength: 200 }}
            helperText={`${titleValue.length}/200${errors.title ? ` — ${errors.title.message}` : ''}`}
            error={Boolean(errors.title)}
            {...register('title', {
              required:
                t('pages.reviewCycles.titleRequired') || 'Title is required',
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
          />
          <TextField
            label={
              t('pages.reviewCycles.subjectLabel') || 'Subject Employee ID'
            }
            fullWidth
            margin='normal'
            required
            error={Boolean(errors.subject_employee_id)}
            helperText={errors.subject_employee_id?.message}
            {...register('subject_employee_id', {
              required: 'Subject employee is required',
            })}
          />
          <TextField
            label={t('pages.reviewCycles.descriptionColumn') || 'Description'}
            fullWidth
            margin='normal'
            multiline
            rows={3}
            inputProps={{ maxLength: 2000 }}
            helperText={`${(descriptionValue ?? '').length}/2000`}
            {...register('description', {
              maxLength: { value: 2000, message: 'Max 2000 characters' },
            })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button
            type='submit'
            variant='contained'
            disabled={isSubmitting || createMutation.isPending}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateCycleForm
