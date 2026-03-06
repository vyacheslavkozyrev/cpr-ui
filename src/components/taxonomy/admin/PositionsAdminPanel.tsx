import AddIcon from '@mui/icons-material/Add'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCareerTracks } from '@/services/taxonomyQueryService'
import type { IPositionSummary } from '@/types/taxonomy.types'
import PositionForm from './PositionForm'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 2,
  },
})

const PositionsAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  // Positions are nested under tracks; for admin we show all tracks and expand
  const { data: tracks, isLoading, isError } = useCareerTracks()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<IPositionSummary | null>(null)

  const handleAdd = useCallback(() => {
    setEditTarget(null)
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
          {t('taxonomy.admin.positions', 'Positions')}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size='small'
        >
          {t('taxonomy.careerTrack.addPosition', 'Add Position')}
        </Button>
      </Box>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        {t(
          'taxonomy.admin.positionsNote',
          'Select a career track detail page to manage positions inline.'
        )}
      </Typography>

      <List>
        {(tracks ?? []).map(track => (
          <ListItem key={track.id} divider>
            <ListItemText
              primary={track.title}
              secondary={track.career_path_title}
            />
          </ListItem>
        ))}
      </List>

      <PositionForm
        open={formOpen}
        onClose={handleClose}
        existing={editTarget}
      />
    </Box>
  )
})

PositionsAdminPanel.displayName = 'PositionsAdminPanel'

export default PositionsAdminPanel
