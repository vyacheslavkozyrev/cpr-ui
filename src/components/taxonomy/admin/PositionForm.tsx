import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  type Resolver,
  type SubmitHandler,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCareerTracks,
  useCreatePosition,
  useUpdatePosition,
} from '@/services/taxonomyQueryService'
import type { IPositionSummary } from '@/types/taxonomy.types'

const schema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .nullable()
    .optional(),
  expectations: z
    .string()
    .max(2000, 'Expectations must be at most 2000 characters')
    .nullable()
    .optional(),
  career_track_id: z.string().min(1, 'Career track is required'),
  sort_order: z.coerce.number().int().min(0).default(0),
})

type TFormData = z.infer<typeof schema>

interface IPositionFormProps {
  open: boolean
  onClose: () => void
  existing?: IPositionSummary | null
}

const getStyles = () => ({
  dialogContent: {
    minWidth: 440,
  },
})

const PositionForm: React.FC<IPositionFormProps> = React.memo(
  ({ open, onClose, existing }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const isEdit = Boolean(existing)

    const { data: careerTracks, isLoading: tracksLoading } = useCareerTracks()
    const createMutation = useCreatePosition()
    const updateMutation = useUpdatePosition()
    const isPending = createMutation.isPending || updateMutation.isPending
    const mutationError = createMutation.error || updateMutation.error

    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors },
    } = useForm<TFormData>({
      resolver: zodResolver(schema) as Resolver<TFormData>,
      defaultValues: {
        title: existing?.title ?? '',
        description: existing?.description ?? '',
        expectations: existing?.expectations ?? '',
        career_track_id: existing?.career_track_id ?? '',
        sort_order: existing?.sort_order ?? 0,
      },
    })

    useEffect(() => {
      if (open) {
        reset({
          title: existing?.title ?? '',
          description: existing?.description ?? '',
          expectations: existing?.expectations ?? '',
          career_track_id: existing?.career_track_id ?? '',
          sort_order: existing?.sort_order ?? 0,
        })
      }
    }, [open, existing, reset])

    const onSubmit: SubmitHandler<TFormData> = useCallback(
      async (data: TFormData) => {
        try {
          if (isEdit && existing) {
            await updateMutation.mutateAsync({
              id: existing.id,
              dto: {
                title: data.title,
                ...(data.description !== undefined
                  ? { description: data.description ?? null }
                  : {}),
                ...(data.expectations !== undefined
                  ? { expectations: data.expectations ?? null }
                  : {}),
                career_track_id: data.career_track_id,
                sort_order: data.sort_order,
              },
            })
          } else {
            await createMutation.mutateAsync({
              title: data.title,
              ...(data.description !== undefined
                ? { description: data.description ?? null }
                : {}),
              ...(data.expectations !== undefined
                ? { expectations: data.expectations ?? null }
                : {}),
              career_track_id: data.career_track_id,
              sort_order: data.sort_order,
            })
          }
          onClose()
        } catch {
          // error displayed via mutationError
        }
      },
      [isEdit, existing, createMutation, updateMutation, onClose]
    )

    const handleClose = useCallback(() => {
      if (!isPending) onClose()
    }, [isPending, onClose])

    return (
      <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>
          {isEdit
            ? t('taxonomy.position.edit', 'Edit Position')
            : t('taxonomy.careerTrack.addPosition', 'Add Position')}
        </DialogTitle>
        <DialogContent sx={styles.dialogContent}>
          {mutationError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {t(
                'taxonomy.errors.saveFailed',
                'Failed to save. Please try again.'
              )}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('taxonomy.admin.titleField', 'Title')}
              fullWidth
              required
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              disabled={isPending}
              {...register('title')}
            />
            <TextField
              label={t('taxonomy.admin.descriptionField', 'Description')}
              fullWidth
              multiline
              rows={3}
              error={Boolean(errors.description)}
              helperText={errors.description?.message}
              disabled={isPending}
              {...register('description')}
            />
            <TextField
              label={t('taxonomy.position.expectations', 'Expectations')}
              fullWidth
              multiline
              rows={3}
              error={Boolean(errors.expectations)}
              helperText={errors.expectations?.message}
              disabled={isPending}
              {...register('expectations')}
            />
            <FormControl fullWidth error={Boolean(errors.career_track_id)}>
              <InputLabel>
                {t('taxonomy.admin.careerTrackField', 'Career Track')}
              </InputLabel>
              <Controller
                name='career_track_id'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('taxonomy.admin.careerTrackField', 'Career Track')}
                    disabled={isPending || tracksLoading}
                    startAdornment={
                      tracksLoading ? <CircularProgress size={16} /> : null
                    }
                  >
                    {(careerTracks ?? []).map(tr => (
                      <MenuItem key={tr.id} value={tr.id}>
                        {tr.title}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.career_track_id && (
                <FormHelperText>
                  {errors.career_track_id.message}
                </FormHelperText>
              )}
            </FormControl>
            <TextField
              label={t('taxonomy.admin.sortOrderField', 'Sort Order')}
              type='number'
              fullWidth
              error={Boolean(errors.sort_order)}
              helperText={errors.sort_order?.message}
              disabled={isPending}
              {...register('sort_order')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isPending}>
            {t('taxonomy.admin.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {t('taxonomy.admin.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

PositionForm.displayName = 'PositionForm'

export default PositionForm
