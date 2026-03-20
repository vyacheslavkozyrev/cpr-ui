import {
  Alert,
  Box,
  Button,
  Container,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ISkillGap } from '@/models/GapAnalysis'
import { EUserRole } from '@/models'
import { useMyGapAnalysis } from '@/services/gapAnalysisQueryService'
import { useAuth } from '@/stores/authStore'
import CreateGoalFromGapModal from './components/CreateGoalFromGapModal'
import GapRadarChart from './components/GapRadarChart'
import SkillGapTable from './components/SkillGapTable'

const getStyles = () => ({
  header: { mb: 3 } as const,
  subtitle: { color: 'text.secondary' } as const,
})

const GapAnalysisPage: React.FC = () => {
  const { t } = useTranslation()
  const styles = useMemo(() => getStyles(), [])
  const { hasAnyRole } = useAuth()

  const { data, isLoading, isError, error, refetch } = useMyGapAnalysis()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGap, setSelectedGap] = useState<ISkillGap | null>(null)

  // Employees and People Managers viewing own gap can create goals.
  // Directors / Administrators see read-only. For own-profile page, always allow Employee self.
  const canCreateGoal = !hasAnyRole([EUserRole.DIRECTOR, EUserRole.ADMINISTRATOR])

  const handleCreateGoal = useCallback((skillGap: ISkillGap) => {
    setSelectedGap(skillGap)
    setModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedGap(null)
  }, [])

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Skeleton variant='rectangular' height={40} sx={{ mb: 2 }} />
        <Skeleton
          variant='circular'
          width={350}
          height={350}
          sx={{ mx: 'auto', mb: 3 }}
        />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={48} sx={{ mb: 1 }} />
        ))}
      </Container>
    )
  }

  const status = (error as { status?: number } | null)?.status

  if (isError) {
    if (status === 422) {
      // No position assigned or at highest level — distinguished by API detail.
      // The API returns 422 for no-position only; at-highest-level is a 200 with empty skill_gaps
      // and null next_position. Show the no-position state here.
      return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
          <Alert severity='warning'>
            {t(
              'gap_analysis.no_position_assigned',
              'No position assigned. Contact your administrator.'
            )}
          </Alert>
        </Container>
      )
    }
    if (status === 401) {
      return null
    }
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {t('gap_analysis.error_loading', 'Failed to load gap analysis.')}
        </Alert>
        <Button onClick={() => refetch()}>
          {t('errors.actions.reloadPage', 'Retry')}
        </Button>
      </Container>
    )
  }

  if (!data) return null

  // At highest level — next position is null
  if (!data.nextPosition) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Box sx={styles.header}>
          <Typography variant='h4'>
            {t('gap_analysis.page_title', 'Skills Gap Analysis')}
          </Typography>
          <Typography variant='subtitle1' sx={styles.subtitle}>
            {data.currentPosition.title} —{' '}
            {data.currentPosition.careerTrack.title}
          </Typography>
        </Box>
        <Alert severity='info'>
          {t(
            'gap_analysis.at_highest_level',
            'You are at the highest level in your career track. No gap to analyse.'
          )}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Box sx={styles.header}>
        <Typography variant='h4'>
          {t('gap_analysis.page_title', 'Skills Gap Analysis')}
        </Typography>
        <Typography variant='subtitle1' sx={styles.subtitle}>
          {t(
            'gap_analysis.position_progress',
            'Current: {{current}} → Next: {{next}}',
            {
              current: data.currentPosition.title,
              next: data.nextPosition.title,
            }
          )}
        </Typography>
        <Typography variant='caption' sx={styles.subtitle}>
          {data.currentPosition.careerTrack.title}
        </Typography>
      </Box>

      <GapRadarChart skillGaps={data.skillGaps} />

      <SkillGapTable
        skillGaps={data.skillGaps}
        canCreateGoal={canCreateGoal}
        onCreateGoal={handleCreateGoal}
      />

      <CreateGoalFromGapModal
        open={modalOpen}
        skillGap={selectedGap}
        onClose={handleModalClose}
      />
    </Container>
  )
}

export default GapAnalysisPage
