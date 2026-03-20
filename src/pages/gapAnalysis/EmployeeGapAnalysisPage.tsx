import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import type { ISkillGap } from '@/models/GapAnalysis'
import { useEmployeeGapAnalysis } from '@/services/gapAnalysisQueryService'
import { useAuth } from '@/stores/authStore'
import CreateGoalFromGapModal from './components/CreateGoalFromGapModal'
import GapRadarChart from './components/GapRadarChart'
import SkillGapTable from './components/SkillGapTable'

const getStyles = () => ({
  backRow: { display: 'flex', alignItems: 'center', mb: 2 } as const,
  header: { mb: 3 } as const,
  subtitle: { color: 'text.secondary' } as const,
})

const EmployeeGapAnalysisPage: React.FC = () => {
  const { t } = useTranslation()
  const { id: employeeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const styles = useMemo(() => getStyles(), [])
  const { hasAnyRole } = useAuth()

  const { data, isLoading, isError, error, refetch } = useEmployeeGapAnalysis(
    employeeId ?? ''
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedGap, setSelectedGap] = useState<ISkillGap | null>(null)

  // Only People Managers may create goals for employees; Directors and Admins are read-only.
  const canCreateGoal =
    hasAnyRole(['People Manager']) && !hasAnyRole(['Director', 'Administrator'])

  const handleCreateGoal = useCallback((skillGap: ISkillGap) => {
    setSelectedGap(skillGap)
    setModalOpen(true)
  }, [])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setSelectedGap(null)
  }, [])

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  if (!employeeId) return null

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
    if (status === 403) {
      return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
          <Alert severity='error'>
            {t(
              'gap_analysis.forbidden',
              "You do not have access to this employee's gap analysis."
            )}
          </Alert>
        </Container>
      )
    }
    if (status === 404) {
      return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
          <Alert severity='warning'>
            {t('gap_analysis.not_found', 'Employee not found.')}
          </Alert>
        </Container>
      )
    }
    if (status === 422) {
      return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
          <Alert severity='warning'>
            {t(
              'gap_analysis.no_position_assigned',
              'This employee has no position assigned.'
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
          {t('gap_analysis.load_error', 'Failed to load gap analysis.')}
        </Alert>
        <Button onClick={() => refetch()}>
          {t('errors.actions.reloadPage', 'Retry')}
        </Button>
      </Container>
    )
  }

  if (!data) return null

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      {/* Back link */}
      <Box sx={styles.backRow}>
        <IconButton
          onClick={handleBack}
          size='small'
          aria-label={t('gap_analysis.back_btn', 'Back')}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
          {t('gap_analysis.back_label', 'Back')}
        </Typography>
      </Box>

      <Box sx={styles.header}>
        <Typography variant='h4'>
          {t('gap_analysis.page_title', 'Skills Gap Analysis')}
        </Typography>
        {data.nextPosition ? (
          <Typography variant='subtitle1' sx={styles.subtitle}>
            {t(
              'gap_analysis.position_subtitle',
              'Current: {{current}} → Next: {{next}}',
              {
                current: data.currentPosition.title,
                next: data.nextPosition.title,
              }
            )}
          </Typography>
        ) : (
          <Typography variant='subtitle1' sx={styles.subtitle}>
            {data.currentPosition.title}
          </Typography>
        )}
        <Typography variant='caption' sx={styles.subtitle}>
          {data.currentPosition.careerTrack.title}
        </Typography>
      </Box>

      {!data.nextPosition ? (
        <Alert severity='info'>
          {t(
            'gap_analysis.at_highest_level',
            'This employee is at the highest level in their career track.'
          )}
        </Alert>
      ) : (
        <>
          <GapRadarChart skillGaps={data.skillGaps} />
          <SkillGapTable
            skillGaps={data.skillGaps}
            canCreateGoal={canCreateGoal}
            onCreateGoal={handleCreateGoal}
          />
        </>
      )}

      <CreateGoalFromGapModal
        open={modalOpen}
        skillGap={selectedGap}
        targetEmployeeId={employeeId}
        onClose={handleModalClose}
      />
    </Container>
  )
}

export default EmployeeGapAnalysisPage
