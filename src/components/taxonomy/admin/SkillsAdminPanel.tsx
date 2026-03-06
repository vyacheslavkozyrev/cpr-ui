import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteSkill,
  useSkill,
  useSkills,
} from '@/services/taxonomyQueryService'
import type { ISkillDetail, ISkillSummary } from '@/types/taxonomy.types'
import SkillForm from './SkillForm'
import SkillLevelsSubPanel from './SkillLevelsSubPanel'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
})

interface ISkillRowProps {
  skill: ISkillSummary
  onEdit: (skill: ISkillSummary) => void
  onDelete: (skill: ISkillSummary) => void
}

const SkillRow: React.FC<ISkillRowProps> = React.memo(
  ({ skill, onEdit, onDelete }) => {
    const { t } = useTranslation()
    const { data: skillDetail } = useSkill(skill.id)

    const handleEdit = useCallback(() => onEdit(skill), [skill, onEdit])
    const handleDelete = useCallback(() => onDelete(skill), [skill, onDelete])

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              pr: 1,
            }}
          >
            <Box>
              <Typography variant='subtitle2'>{skill.title}</Typography>
              <Chip label={skill.category_title} size='small' />
            </Box>
            <Box onClick={e => e.stopPropagation()}>
              <IconButton
                size='small'
                onClick={handleEdit}
                aria-label={t('common.edit', 'Edit')}
              >
                <EditIcon fontSize='small' />
              </IconButton>
              <IconButton
                size='small'
                onClick={handleDelete}
                aria-label={t('common.delete', 'Delete')}
                color='error'
              >
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {skillDetail ? (
            <SkillLevelsSubPanel skill={skillDetail} />
          ) : (
            <CircularProgress size={20} />
          )}
        </AccordionDetails>
      </Accordion>
    )
  }
)

SkillRow.displayName = 'SkillRow'

const SkillsAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { data: skills, isLoading, isError } = useSkills()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ISkillDetail | null>(null)

  const deleteMutation = useDeleteSkill()

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((skill: ISkillSummary) => {
    setEditTarget({ ...skill, levels: [] } as ISkillDetail)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    (skill: ISkillSummary) => {
      if (
        window.confirm(
          t(
            'taxonomy.admin.confirmDelete',
            'Are you sure you want to delete this?'
          )
        )
      ) {
        deleteMutation.mutate(skill.id)
      }
    },
    [deleteMutation, t]
  )

  const handleClose = useCallback(() => {
    setFormOpen(false)
    setEditTarget(null)
  }, [])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert severity='error'>
        {t(
          'taxonomy.errors.loadFailed',
          'Failed to load data. Please try again.'
        )}
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={styles.header}>
        <Typography variant='h6'>
          {t('taxonomy.admin.skills', 'Skills')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size='small'
        >
          {t('taxonomy.admin.addSkill', 'Add Skill')}
        </Button>
      </Box>

      {(skills ?? []).map(skill => (
        <SkillRow
          key={skill.id}
          skill={skill}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}

      {(skills ?? []).length === 0 && (
        <Typography color='text.secondary' sx={{ py: 2 }}>
          {t('taxonomy.admin.noSkills', 'No skills found.')}
        </Typography>
      )}

      <SkillForm open={formOpen} onClose={handleClose} existing={editTarget} />
    </Box>
  )
})

SkillsAdminPanel.displayName = 'SkillsAdminPanel'

export default SkillsAdminPanel
