import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import { memo, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ISuggestGoalDto } from '../../../dtos/TeamMemberDto'

const schema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  skill_category_id: z.string().uuid().optional().or(z.literal('')),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']),
  due_date: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface SuggestGoalModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (dto: ISuggestGoalDto) => void
  isPending?: boolean
}

const TIMEFRAME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'week', label: 'team_dashboard.timeframe.week' },
  { value: 'month', label: 'team_dashboard.timeframe.month' },
  { value: 'quarter', label: 'team_dashboard.timeframe.quarter' },
  { value: 'year', label: 'team_dashboard.timeframe.year' },
]

/**
 * Modal form for suggesting a goal to a direct report.
 */
export const SuggestGoalModal: React.FC<SuggestGoalModalProps> = memo(
  ({ open, onClose, onSubmit, isPending = false }) => {
    const { t } = useTranslation()

    const {
      control,
      handleSubmit,
      reset,
      formState: { errors, isValid },
    } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { name: '', description: '', timeframe: 'month' },
      mode: 'onChange',
    })

    const handleClose = useCallback(() => {
      reset()
      onClose()
    }, [reset, onClose])

    const handleFormSubmit = useCallback(
      (values: FormValues) => {
        const dto: ISuggestGoalDto = {
          name: values.name,
          timeframe: values.timeframe as ISuggestGoalDto['timeframe'],
          ...(values.description && { description: values.description }),
          ...(values.skill_category_id && {
            skill_category_id: values.skill_category_id,
          }),
          ...(values.due_date && { due_date: values.due_date }),
        }
        onSubmit(dto)
        reset()
      },
      [onSubmit, reset]
    )

    return (
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          {t('team_dashboard.suggest_goal.title', 'Suggest a Goal')}
        </DialogTitle>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Controller
                name='name'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('team_dashboard.suggest_goal.name', 'Goal Name')}
                    required
                    fullWidth
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    inputProps={{ maxLength: 200 }}
                  />
                )}
              />

              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t(
                      'team_dashboard.suggest_goal.description',
                      'Description'
                    )}
                    fullWidth
                    multiline
                    rows={3}
                    error={Boolean(errors.description)}
                    helperText={errors.description?.message}
                    inputProps={{ maxLength: 2000 }}
                  />
                )}
              />

              <Controller
                name='timeframe'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t(
                      'team_dashboard.suggest_goal.timeframe',
                      'Timeframe'
                    )}
                    required
                    fullWidth
                    error={Boolean(errors.timeframe)}
                    helperText={errors.timeframe?.message}
                  >
                    {TIMEFRAME_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {t(opt.label, opt.value)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name='due_date'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t(
                      'team_dashboard.suggest_goal.due_date',
                      'Due Date'
                    )}
                    type='date'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isPending}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={!isValid || isPending}
            >
              {t('team_dashboard.suggest_goal.submit', 'Suggest Goal')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    )
  }
)

SuggestGoalModal.displayName = 'SuggestGoalModal'
