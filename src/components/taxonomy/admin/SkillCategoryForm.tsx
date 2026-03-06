import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCreateSkillCategory,
  useUpdateSkillCategory,
} from '@/services/taxonomyQueryService'
import type { ISkillCategory } from '@/types/taxonomy.types'

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
})

type TFormData = z.infer<typeof schema>

interface ISkillCategoryFormProps {
  open: boolean
  onClose: () => void
  existing?: ISkillCategory | null
}

const getStyles = () => ({
  dialogContent: {
    minWidth: 400,
  },
})

const SkillCategoryForm: React.FC<ISkillCategoryFormProps> = React.memo(
  ({ open, onClose, existing }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const isEdit = Boolean(existing)

    const createMutation = useCreateSkillCategory()
    const updateMutation = useUpdateSkillCategory()
    const isPending = createMutation.isPending || updateMutation.isPending
    const mutationError = createMutation.error || updateMutation.error

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<TFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: existing?.title ?? '',
        description: existing?.description ?? '',
      },
    })

    useEffect(() => {
      if (open) {
        reset({
          title: existing?.title ?? '',
          description: existing?.description ?? '',
        })
      }
    }, [open, existing, reset])

    const onSubmit = useCallback(
      async (data: TFormData) => {
        try {
          if (isEdit && existing) {
            await updateMutation.mutateAsync({
              id: existing.id,
              dto: {
                title: data.title,
                description: data.description ?? null,
              },
            })
          } else {
            await createMutation.mutateAsync({
              title: data.title,
              description: data.description ?? null,
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
            ? t('taxonomy.admin.editSkillCategory', 'Edit Skill Category')
            : t('taxonomy.admin.addSkillCategory', 'Add Skill Category')}
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

SkillCategoryForm.displayName = 'SkillCategoryForm'

export default SkillCategoryForm
