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
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCreateSkill,
  useSkillCategories,
  useUpdateSkill,
} from '@/hooks/useTaxonomy'
import type { ISkillDetail } from '@/types/taxonomy.types'

const makeSchema = (t: (key: string) => string) =>
  z.object({
    title: z
      .string()
      .min(1, t('taxonomy.admin.validation.titleRequired'))
      .max(200, t('taxonomy.admin.validation.titleMax200')),
    description: z
      .string()
      .max(1000, t('taxonomy.admin.validation.descMax1000'))
      .nullable()
      .optional(),
    category_id: z
      .string()
      .min(1, t('taxonomy.admin.validation.categoryRequired')),
  })

type TFormData = z.infer<ReturnType<typeof makeSchema>>

interface ISkillFormProps {
  open: boolean
  onClose: () => void
  existing?: ISkillDetail | null
}

const getStyles = () => ({
  dialogContent: {
    minWidth: 420,
  },
})

const SkillForm: React.FC<ISkillFormProps> = React.memo(
  ({ open, onClose, existing }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const isEdit = Boolean(existing)
    const schema = useMemo(() => makeSchema(t), [t])

    const { data: categories, isLoading: categoriesLoading } =
      useSkillCategories()
    const createMutation = useCreateSkill()
    const updateMutation = useUpdateSkill()
    const isPending = createMutation.isPending || updateMutation.isPending
    const mutationError = createMutation.error || updateMutation.error

    const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors },
    } = useForm<TFormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: existing?.title ?? '',
        description: existing?.description ?? '',
        category_id: existing?.category_id ?? '',
      },
    })

    useEffect(() => {
      if (open) {
        reset({
          title: existing?.title ?? '',
          description: existing?.description ?? '',
          category_id: existing?.category_id ?? '',
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
                category_id: data.category_id,
              },
            })
          } else {
            await createMutation.mutateAsync({
              title: data.title,
              description: data.description ?? null,
              category_id: data.category_id,
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
            ? t('taxonomy.admin.editSkill', 'Edit Skill')
            : t('taxonomy.admin.addSkill', 'Add Skill')}
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
            <FormControl fullWidth error={Boolean(errors.category_id)}>
              <InputLabel>
                {t('taxonomy.skill.category', 'Category')}
              </InputLabel>
              <Controller
                name='category_id'
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label={t('taxonomy.skill.category', 'Category')}
                    disabled={isPending || categoriesLoading}
                    startAdornment={
                      categoriesLoading ? <CircularProgress size={16} /> : null
                    }
                  >
                    {(categories ?? []).map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.title}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.category_id && (
                <FormHelperText>{errors.category_id.message}</FormHelperText>
              )}
            </FormControl>
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

SkillForm.displayName = 'SkillForm'

export default SkillForm
