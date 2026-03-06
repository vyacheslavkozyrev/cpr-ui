import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { type Resolver, type SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useAddSkillLevel,
  useUpdateSkillLevel,
} from '@/services/taxonomyQueryService'
import type { ISkillDetail, ISkillLevelSummary } from '@/types/taxonomy.types'

const buildSchema = (existingValues: number[], editingValue?: number) =>
  z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(500).nullable().optional(),
    value: z.coerce
      .number()
      .int()
      .min(1, 'Value must be between 1 and 5')
      .max(5, 'Value must be between 1 and 5')
      .refine(
        v => !existingValues.includes(v) || v === editingValue,
        'This value already exists'
      ),
  })

type TFormData = { title: string; description?: string | null; value: number }

interface ISkillLevelsSubPanelProps {
  skill: ISkillDetail
}

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
})

const SkillLevelsSubPanel: React.FC<ISkillLevelsSubPanelProps> = React.memo(
  ({ skill }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<ISkillLevelSummary | null>(
      null
    )

    const addLevelMutation = useAddSkillLevel()
    const updateLevelMutation = useUpdateSkillLevel()
    const isPending =
      addLevelMutation.isPending || updateLevelMutation.isPending
    const mutationError = addLevelMutation.error || updateLevelMutation.error

    const existingValues = useMemo(
      () => skill.levels.map(l => l.value),
      [skill.levels]
    )

    const schema = useMemo(
      () => buildSchema(existingValues, editTarget?.value),
      [existingValues, editTarget]
    )

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<TFormData>({
      resolver: zodResolver(schema) as Resolver<TFormData>,
      defaultValues: {
        title: '',
        description: '',
        value: 1,
      },
    })

    const handleAdd = useCallback(() => {
      setEditTarget(null)
      reset({ title: '', description: '', value: 1 })
      setFormOpen(true)
    }, [reset])

    const handleEdit = useCallback(
      (level: ISkillLevelSummary) => {
        setEditTarget(level)
        reset({
          title: level.title,
          description: level.description ?? '',
          value: level.value,
        })
        setFormOpen(true)
      },
      [reset]
    )

    const handleClose = useCallback(() => {
      if (!isPending) {
        setFormOpen(false)
        setEditTarget(null)
      }
    }, [isPending])

    const onSubmit: SubmitHandler<TFormData> = useCallback(
      async (data: TFormData) => {
        try {
          if (editTarget) {
            await updateLevelMutation.mutateAsync({
              skillId: skill.id,
              levelId: editTarget.id,
              dto: {
                title: data.title,
                description: data.description ?? null,
                value: data.value,
              },
            })
          } else {
            await addLevelMutation.mutateAsync({
              skillId: skill.id,
              dto: {
                title: data.title,
                description: data.description ?? null,
                value: data.value,
              },
            })
          }
          handleClose()
        } catch {
          // error displayed via mutationError
        }
      },
      [editTarget, skill.id, addLevelMutation, updateLevelMutation, handleClose]
    )

    const sortedLevels = useMemo(
      () => [...skill.levels].sort((a, b) => a.value - b.value),
      [skill.levels]
    )

    return (
      <Box>
        <Box sx={styles.header}>
          <Typography variant='subtitle2'>
            {t('taxonomy.skill.proficiencyLevels', 'Proficiency Levels')}
          </Typography>
          <Button
            size='small'
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={skill.levels.length >= 5}
          >
            {t('taxonomy.admin.addLevel', 'Add Level')}
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <List dense>
          {sortedLevels.map(level => (
            <ListItem key={level.id} divider>
              <Chip
                label={level.value}
                size='small'
                color='primary'
                sx={{ mr: 1 }}
              />
              <ListItemText
                primary={level.title}
                secondary={level.description}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size='small'
                  onClick={() => handleEdit(level)}
                  aria-label={t('common.edit', 'Edit')}
                >
                  <EditIcon fontSize='small' />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {sortedLevels.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
              {t('taxonomy.skill.noLevels', 'No levels defined yet.')}
            </Typography>
          )}
        </List>

        <Dialog open={formOpen} onClose={handleClose} maxWidth='xs' fullWidth>
          <DialogTitle>
            {editTarget
              ? t('taxonomy.admin.editLevel', 'Edit Level')
              : t('taxonomy.admin.addLevel', 'Add Level')}
          </DialogTitle>
          <DialogContent>
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
                rows={2}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
                disabled={isPending}
                {...register('description')}
              />
              <TextField
                label={t('taxonomy.admin.valueField', 'Value (1–5)')}
                type='number'
                fullWidth
                required
                error={Boolean(errors.value)}
                helperText={errors.value?.message}
                disabled={isPending}
                inputProps={{ min: 1, max: 5, step: 1 }}
                {...register('value')}
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
              {isPending ? (
                <CircularProgress size={16} />
              ) : (
                t('taxonomy.admin.save', 'Save')
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
)

SkillLevelsSubPanel.displayName = 'SkillLevelsSubPanel'

export default SkillLevelsSubPanel
