import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Link as MuiLink,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RoleGuard } from '@/components/auth'
import CareerTrackCard from '@/components/taxonomy/CareerTrackCard'
import CareerPathForm from '@/components/taxonomy/admin/CareerPathForm'
import CareerTrackForm from '@/components/taxonomy/admin/CareerTrackForm'
import { EUserRole } from '@/models'
import { useCareerPath } from '@/hooks/useTaxonomy'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    mb: 3,
  },
  actions: {
    display: 'flex',
    gap: 1,
    flexShrink: 0,
    ml: 2,
  },
})

const CareerPathDetailPage: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { pathId } = useParams<{ pathId: string }>()
  const navigate = useNavigate()

  const {
    data: careerPath,
    isLoading,
    isError,
    refetch,
  } = useCareerPath(pathId ?? '')

  const [editFormOpen, setEditFormOpen] = useState(false)
  const [addTrackOpen, setAddTrackOpen] = useState(false)

  const handleTrackClick = useCallback(
    (trackId: string) => {
      navigate(`/career-framework/${pathId}/tracks/${trackId}`)
    },
    [navigate, pathId]
  )

  const handleRefetch = useCallback(() => refetch(), [refetch])
  const handleEditOpen = useCallback(() => setEditFormOpen(true), [])
  const handleEditClose = useCallback(() => setEditFormOpen(false), [])
  const handleAddTrackOpen = useCallback(() => setAddTrackOpen(true), [])
  const handleAddTrackClose = useCallback(() => setAddTrackOpen(false), [])

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !careerPath) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={handleRefetch}>
              {t('common.retry', 'Retry')}
            </Button>
          }
        >
          {t(
            'taxonomy.errors.loadFailed',
            'Failed to load data. Please try again.'
          )}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component={Link}
          to='/career-framework'
          underline='hover'
          color='inherit'
        >
          {t('taxonomy.careerFramework.title', 'Career Framework')}
        </MuiLink>
        <Typography color='text.primary'>{careerPath.title}</Typography>
      </Breadcrumbs>

      <Box sx={styles.header}>
        <Box>
          <Typography variant='h5' component='h1'>
            {careerPath.title}
          </Typography>
          {careerPath.description && (
            <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
              {careerPath.description}
            </Typography>
          )}
        </Box>
        <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]} fallback={null}>
          <Box sx={styles.actions}>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
              onClick={handleEditOpen}
              size='small'
            >
              {t('taxonomy.careerPath.edit', 'Edit Career Path')}
            </Button>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleAddTrackOpen}
              size='small'
            >
              {t('taxonomy.careerPath.addTrack', 'Add Career Track')}
            </Button>
          </Box>
        </RoleGuard>
      </Box>

      <Typography variant='h6' sx={{ mb: 2 }}>
        {t('taxonomy.careerPath.tracks', 'Career Tracks')}
      </Typography>

      {careerPath.tracks.length === 0 && (
        <Typography color='text.secondary'>
          {t('taxonomy.careerPath.noTracks', 'No career tracks available.')}
        </Typography>
      )}

      {careerPath.tracks.map(track => (
        <CareerTrackCard
          key={track.id}
          careerTrack={{
            id: track.id,
            title: track.title,
            description: track.description,
            career_path_id: careerPath.id,
            career_path_title: careerPath.title,
          }}
          onClick={() => handleTrackClick(track.id)}
        />
      ))}

      <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]} fallback={null}>
        <CareerPathForm
          open={editFormOpen}
          onClose={handleEditClose}
          existing={careerPath}
        />
        <CareerTrackForm open={addTrackOpen} onClose={handleAddTrackClose} />
      </RoleGuard>
    </Container>
  )
})

CareerPathDetailPage.displayName = 'CareerPathDetailPage'

export default CareerPathDetailPage
