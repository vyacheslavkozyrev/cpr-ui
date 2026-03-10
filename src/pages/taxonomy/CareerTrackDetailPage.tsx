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
import ProgressionLadder from '@/components/taxonomy/ProgressionLadder'
import CareerTrackForm from '@/components/taxonomy/admin/CareerTrackForm'
import PositionForm from '@/components/taxonomy/admin/PositionForm'
import { EUserRole } from '@/models'
import { useCareerPath, useCareerTrack } from '@/hooks/useTaxonomy'

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

const CareerTrackDetailPage: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { pathId, trackId } = useParams<{ pathId: string; trackId: string }>()
  const navigate = useNavigate()

  const { data: careerPath } = useCareerPath(pathId ?? '')
  const {
    data: careerTrack,
    isLoading,
    isError,
    refetch,
  } = useCareerTrack(trackId ?? '')

  const [editFormOpen, setEditFormOpen] = useState(false)
  const [addPositionOpen, setAddPositionOpen] = useState(false)

  const handlePositionClick = useCallback(
    (positionId: string) => {
      navigate(
        `/career-framework/${pathId}/tracks/${trackId}/positions/${positionId}`
      )
    },
    [navigate, pathId, trackId]
  )

  const handleRefetch = useCallback(() => refetch(), [refetch])
  const handleEditOpen = useCallback(() => setEditFormOpen(true), [])
  const handleEditClose = useCallback(() => setEditFormOpen(false), [])
  const handleAddPositionOpen = useCallback(() => setAddPositionOpen(true), [])
  const handleAddPositionClose = useCallback(
    () => setAddPositionOpen(false),
    []
  )

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !careerTrack) {
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
        <MuiLink
          component={Link}
          to={`/career-framework/${pathId}`}
          underline='hover'
          color='inherit'
        >
          {careerPath?.title ?? pathId}
        </MuiLink>
        <Typography color='text.primary'>{careerTrack.title}</Typography>
      </Breadcrumbs>

      <Box sx={styles.header}>
        <Box>
          <Typography variant='h5' component='h1'>
            {careerTrack.title}
          </Typography>
          {careerTrack.description && (
            <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
              {careerTrack.description}
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
              {t('taxonomy.careerTrack.edit', 'Edit Track')}
            </Button>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleAddPositionOpen}
              size='small'
            >
              {t('taxonomy.careerTrack.addPosition', 'Add Position')}
            </Button>
          </Box>
        </RoleGuard>
      </Box>

      <Typography variant='h6' sx={{ mb: 2 }}>
        {t('taxonomy.careerTrack.positions', 'Positions')}
      </Typography>

      <ProgressionLadder
        positions={careerTrack.positions}
        onPositionClick={handlePositionClick}
      />

      <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]} fallback={null}>
        <CareerTrackForm
          open={editFormOpen}
          onClose={handleEditClose}
          existing={{
            id: careerTrack.id,
            title: careerTrack.title,
            description: careerTrack.description,
            career_path_id: careerTrack.career_path_id,
            career_path_title: careerTrack.career_path_title,
          }}
        />
        <PositionForm open={addPositionOpen} onClose={handleAddPositionClose} />
      </RoleGuard>
    </Container>
  )
})

CareerTrackDetailPage.displayName = 'CareerTrackDetailPage'

export default CareerTrackDetailPage
