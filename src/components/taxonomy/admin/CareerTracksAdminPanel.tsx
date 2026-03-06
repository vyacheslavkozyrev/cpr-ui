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
import { useCareerTracks } from '@/services/taxonomyQueryService'
import type { ICareerTrackSummary } from '@/types/taxonomy.types'
import CareerTrackForm from './CareerTrackForm'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
})

const CareerTracksAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { data: tracks, isLoading, isError } = useCareerTracks()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ICareerTrackSummary | null>(null)

  const handleAdd = useCallback(() => {
    setEditTarget(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((track: ICareerTrackSummary) => {
    setEditTarget(track)
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
          {t('taxonomy.admin.careerTracks', 'Career Tracks')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size='small'
        >
          {t('taxonomy.careerPath.addTrack', 'Add Career Track')}
        </Button>
      </Box>

      <List>
        {(tracks ?? []).map(track => (
          <ListItem key={track.id} divider>
            <ListItemText
              primary={track.title}
              secondary={`${track.career_path_title} — ${track.description ?? ''}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge='end'
                size='small'
                onClick={() => handleEdit(track)}
                aria-label={t('common.edit', 'Edit')}
              >
                <EditIcon fontSize='small' />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        {(tracks ?? []).length === 0 && (
          <Typography color='text.secondary' sx={{ py: 2 }}>
            {t('taxonomy.admin.noTracks', 'No career tracks found.')}
          </Typography>
        )}
      </List>

      <CareerTrackForm
        open={formOpen}
        onClose={handleClose}
        existing={editTarget}
      />
    </Box>
  )
})

CareerTracksAdminPanel.displayName = 'CareerTracksAdminPanel'

export default CareerTracksAdminPanel
