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
import { useCareerPaths } from '@/hooks/useTaxonomy'
import type { ICareerPathSummary } from '@/types/taxonomy.types'
import CareerPathForm from './CareerPathForm'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
})

const CareerPathsAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { data: paths, isLoading, isError } = useCareerPaths()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ICareerPathSummary | null>(null)

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((path: ICareerPathSummary) => {
    setEditTarget(path)
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
          {t('taxonomy.careerFramework.title', 'Career Paths')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size='small'
        >
          {t('taxonomy.careerFramework.addCareerPath', 'Add Career Path')}
        </Button>
      </Box>

      <List>
        {(paths ?? []).map(path => (
          <ListItem key={path.id} divider>
            <ListItemText primary={path.title} secondary={path.description} />
            <ListItemSecondaryAction>
              <IconButton
                edge='end'
                size='small'
                onClick={() => handleEdit(path)}
                aria-label={t('common.edit', 'Edit')}
              >
                <EditIcon fontSize='small' />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {(paths ?? []).length === 0 && (
          <Typography color='text.secondary' sx={{ py: 2 }}>
            {t('taxonomy.careerFramework.emptyState', 'No career paths found.')}
          </Typography>
        )}
      </List>

      <CareerPathForm
        open={formOpen}
        onClose={handleClose}
        existing={editTarget}
      />
    </Box>
  )
})

CareerPathsAdminPanel.displayName = 'CareerPathsAdminPanel'

export default CareerPathsAdminPanel
