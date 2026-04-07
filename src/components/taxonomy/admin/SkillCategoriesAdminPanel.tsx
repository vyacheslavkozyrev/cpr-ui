import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkillCategories } from '@/hooks/useTaxonomy'
import type { ISkillCategory } from '@/types/taxonomy.types'
import SkillCategoryForm from './SkillCategoryForm'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
})

const SkillCategoriesAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { data: categories, isLoading, isError } = useSkillCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ISkillCategory | null>(null)

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((cat: ISkillCategory) => {
    setEditTarget(cat)
    setFormOpen(true)
  }, [])

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
          {t('taxonomy.admin.skillCategories', 'Skill Categories')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size='small'
        >
          {t('taxonomy.admin.addSkillCategory', 'Add Skill Category')}
        </Button>
      </Box>

      <List>
        {(categories ?? []).map(cat => (
          <ListItem key={cat.id} divider>
            <ListItemText primary={cat.title} secondary={cat.description} />
            <ListItemSecondaryAction>
              <IconButton
                edge='end'
                size='small'
                onClick={() => handleEdit(cat)}
                aria-label={t('common.edit', 'Edit')}
              >
                <EditIcon fontSize='small' />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {(categories ?? []).length === 0 && (
          <Typography color='text.secondary' sx={{ py: 2 }}>
            {t('taxonomy.admin.noCategories', 'No skill categories found.')}
          </Typography>
        )}
      </List>

      <SkillCategoryForm
        open={formOpen}
        onClose={handleClose}
        existing={editTarget}
      />
    </Box>
  )
})

SkillCategoriesAdminPanel.displayName = 'SkillCategoriesAdminPanel'

export default SkillCategoriesAdminPanel
