import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
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
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
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
  useAddPositionSkill,
  useDeletePositionSkill,
  useSkill,
  useSkillCategories,
  useSkills,
  useUpdatePositionSkill,
} from '@/hooks/useTaxonomy'
import type {
  IPositionDetail,
  IPositionSkillRequirement,
} from '@/types/taxonomy.types'

const makeSchema = (t: (key: string) => string) =>
  z.object({
    skill_id: z.string().min(1, t('taxonomy.admin.validation.skillRequired')),
    skill_level_id: z
      .string()
      .min(1, t('taxonomy.admin.validation.levelRequired')),
    is_mandatory: z.boolean(),
    weight: z.coerce.number().nullable().optional(),
    rationale: z.string().max(500).nullable().optional(),
  })

type TFormData = z.infer<ReturnType<typeof makeSchema>>

interface IPositionSkillsPanelProps {
  position: IPositionDetail
}

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
})

const PositionSkillsPanel: React.FC<IPositionSkillsPanelProps> = React.memo(
  ({ position }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])
    const schema = useMemo(() => makeSchema(t), [t])

    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] =
      useState<IPositionSkillRequirement | null>(null)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

    const { data: categories } = useSkillCategories()
    const { data: skills } = useSkills(selectedCategoryId || undefined)

    const addSkillMutation = useAddPositionSkill()
    const updateSkillMutation = useUpdatePositionSkill()
    const deleteSkillMutation = useDeletePositionSkill()

    const isPending =
      addSkillMutation.isPending ||
      updateSkillMutation.isPending ||
      deleteSkillMutation.isPending
    const mutationError =
      addSkillMutation.error ||
      updateSkillMutation.error ||
      deleteSkillMutation.error

    const {
      register,
      handleSubmit,
      reset,
      control,
      watch,
      formState: { errors },
    } = useForm<TFormData>({
      resolver: zodResolver(schema) as Resolver<TFormData>,
      defaultValues: {
        skill_id: '',
        skill_level_id: '',
        is_mandatory: false,
        weight: null,
        rationale: '',
      },
    })

    const watchedSkillId = watch('skill_id')

    const { data: selectedSkillDetail } = useSkill(watchedSkillId)
    const { data: editTargetSkillDetail } = useSkill(editTarget?.skill_id ?? '')

    const availableLevels = useMemo(
      () =>
        editTarget
          ? (editTargetSkillDetail?.levels ?? [])
          : (selectedSkillDetail?.levels ?? []),
      [editTarget, editTargetSkillDetail, selectedSkillDetail]
    )

    const handleAdd = useCallback(() => {
      setEditTarget(null)
      reset({
        skill_id: '',
        skill_level_id: '',
        is_mandatory: false,
        weight: null,
        rationale: '',
      })
      setFormOpen(true)
    }, [reset])

    const handleEdit = useCallback(
      (req: IPositionSkillRequirement) => {
        setEditTarget(req)
        reset({
          skill_id: req.skill_id,
          skill_level_id: req.skill_level_id,
          is_mandatory: req.is_mandatory,
          weight: req.weight,
          rationale: req.rationale ?? '',
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

    const handleDelete = useCallback(
      (req: IPositionSkillRequirement) => {
        if (
          window.confirm(
            t(
              'taxonomy.admin.confirmDelete',
              'Are you sure you want to delete this?'
            )
          )
        ) {
          deleteSkillMutation.mutate({
            positionId: position.id,
            positionSkillId: req.id,
          })
        }
      },
      [position.id, deleteSkillMutation, t]
    )

    const onSubmit: SubmitHandler<TFormData> = useCallback(
      async (data: TFormData) => {
        try {
          if (editTarget) {
            await updateSkillMutation.mutateAsync({
              positionId: position.id,
              positionSkillId: editTarget.id,
              dto: {
                skill_level_id: data.skill_level_id,
                is_mandatory: data.is_mandatory,
                weight: data.weight ?? null,
                rationale: data.rationale ?? null,
              },
            })
          } else {
            await addSkillMutation.mutateAsync({
              positionId: position.id,
              dto: {
                skill_id: data.skill_id,
                skill_level_id: data.skill_level_id,
                is_mandatory: data.is_mandatory,
                weight: data.weight ?? null,
                rationale: data.rationale ?? null,
              },
            })
          }
          handleClose()
        } catch {
          // error displayed via mutationError
        }
      },
      [
        editTarget,
        position.id,
        addSkillMutation,
        updateSkillMutation,
        handleClose,
      ]
    )

    const handleCategoryChange = useCallback(
      (categoryId: string) => {
        setSelectedCategoryId(categoryId)
        reset(prev => ({ ...prev, skill_id: '', skill_level_id: '' }))
      },
      [reset]
    )

    return (
      <Box>
        <Box sx={styles.header}>
          <Typography variant='subtitle2'>
            {t('taxonomy.position.skills', 'Required Skills')}
          </Typography>
          <Button size='small' startIcon={<AddIcon />} onClick={handleAdd}>
            {t('taxonomy.admin.addSkillRequirement', 'Add Skill Requirement')}
          </Button>
        </Box>
        <Divider sx={{ mb: 1 }} />

        <List dense>
          {position.skills.map(req => (
            <ListItem key={req.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body2'>{req.skill_title}</Typography>
                    <Chip
                      label={req.skill_level_title}
                      size='small'
                      color='info'
                      variant='outlined'
                    />
                    {req.is_mandatory && (
                      <Chip
                        label={t('taxonomy.skill.mandatory', 'Mandatory')}
                        size='small'
                        color='primary'
                      />
                    )}
                  </Box>
                }
                secondary={req.category_title}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size='small'
                  onClick={() => handleEdit(req)}
                  aria-label={t('common.edit', 'Edit')}
                >
                  <EditIcon fontSize='small' />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => handleDelete(req)}
                  aria-label={t('common.delete', 'Delete')}
                  color='error'
                >
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {position.skills.length === 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ py: 1 }}>
              {t(
                'taxonomy.position.noSkills',
                'No skill requirements defined.'
              )}
            </Typography>
          )}
        </List>

        <Dialog open={formOpen} onClose={handleClose} maxWidth='sm' fullWidth>
          <DialogTitle>
            {editTarget
              ? t(
                  'taxonomy.admin.editSkillRequirement',
                  'Edit Skill Requirement'
                )
              : t(
                  'taxonomy.admin.addSkillRequirement',
                  'Add Skill Requirement'
                )}
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
              {!editTarget && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>
                      {t('taxonomy.skill.category', 'Category')}
                    </InputLabel>
                    <Select
                      value={selectedCategoryId}
                      onChange={e => handleCategoryChange(e.target.value)}
                      label={t('taxonomy.skill.category', 'Category')}
                    >
                      <MenuItem value=''>
                        {t('taxonomy.admin.allCategories', 'All Categories')}
                      </MenuItem>
                      {(categories ?? []).map(c => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth error={Boolean(errors.skill_id)}>
                    <InputLabel>
                      {t('taxonomy.skill.skillName', 'Skill')}
                    </InputLabel>
                    <Controller
                      name='skill_id'
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label={t('taxonomy.skill.skillName', 'Skill')}
                        >
                          {(skills ?? []).map(s => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.title}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.skill_id && (
                      <FormHelperText>{errors.skill_id.message}</FormHelperText>
                    )}
                  </FormControl>
                </>
              )}

              <FormControl fullWidth error={Boolean(errors.skill_level_id)}>
                <InputLabel>
                  {t('taxonomy.skill.level', 'Required Level')}
                </InputLabel>
                <Controller
                  name='skill_level_id'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={t('taxonomy.skill.level', 'Required Level')}
                    >
                      {availableLevels.map(l => (
                        <MenuItem key={l.id} value={l.id}>
                          {l.value}. {l.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.skill_level_id && (
                  <FormHelperText>
                    {errors.skill_level_id.message}
                  </FormHelperText>
                )}
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='body2'>
                  {t('taxonomy.skill.mandatory', 'Mandatory')}
                </Typography>
                <Controller
                  name='is_mandatory'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  )}
                />
              </Box>

              <TextField
                label={t('taxonomy.skill.weight', 'Weight')}
                type='number'
                fullWidth
                error={Boolean(errors.weight)}
                helperText={errors.weight?.message}
                disabled={isPending}
                inputProps={{ step: 0.1, min: 0 }}
                {...register('weight')}
              />
              <TextField
                label={t('taxonomy.skill.rationale', 'Rationale')}
                fullWidth
                multiline
                rows={2}
                error={Boolean(errors.rationale)}
                helperText={errors.rationale?.message}
                disabled={isPending}
                {...register('rationale')}
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

PositionSkillsPanel.displayName = 'PositionSkillsPanel'

export default PositionSkillsPanel
