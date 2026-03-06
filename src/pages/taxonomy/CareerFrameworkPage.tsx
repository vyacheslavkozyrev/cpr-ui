import AddIcon from '@mui/icons-material/Add'
import { Alert, Box, Button, Container, Grid, Typography } from '@mui/material'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { RoleGuard } from '@/components/auth'
import CareerPathCard from '@/components/taxonomy/CareerPathCard'
import { UserRole } from '@/models'
import { useCareerPaths } from '@/services/taxonomyQueryService'

const getStyles = () => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 3,
  },
  emptyState: {
    py: 6,
    textAlign: 'center' as const,
    color: 'text.secondary',
  },
})

const CareerFrameworkPage: React.FC = React.memo(() => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const navigate = useNavigate()
  const { data: careerPaths, isLoading, isError, refetch } = useCareerPaths()

  const handlePathClick = useCallback(
    (pathId: string) => {
      navigate(`/career-framework/${pathId}`)
    },
    [navigate]
  )

  const handleRefetch = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Box sx={styles.header}>
        <Typography variant='h5' component='h1'>
          {t('taxonomy.careerFramework.title', 'Career Framework')}
        </Typography>
        <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]} fallback={null}>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => navigate('/settings/career-framework')}
            size='small'
          >
            {t('taxonomy.careerFramework.addCareerPath', 'Add Career Path')}
          </Button>
        </RoleGuard>
      </Box>

      {isError && (
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
      )}

      {isLoading && (
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6 }}>
              <CareerPathCard
                careerPath={{ id: '', title: '', description: null }}
                onClick={() => undefined}
                loading
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!isLoading && !isError && (careerPaths ?? []).length === 0 && (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('taxonomy.careerFramework.emptyState', 'No career paths found.')}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && (careerPaths ?? []).length > 0 && (
        <Grid container spacing={2}>
          {(careerPaths ?? []).map(path => (
            <Grid key={path.id} size={{ xs: 12, sm: 6 }}>
              <CareerPathCard
                careerPath={path}
                onClick={() => handlePathClick(path.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
})

CareerFrameworkPage.displayName = 'CareerFrameworkPage'

export default CareerFrameworkPage
