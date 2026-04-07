import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import AggregatedResultsView from '../../components/ReviewCycles/AggregatedResultsView'
import CycleStatusBadge from '../../components/ReviewCycles/CycleStatusBadge'
import DetailedResultsView from '../../components/ReviewCycles/DetailedResultsView'
import NomineePanel from '../../components/ReviewCycles/NomineePanel'
import ReviewResponseForm from '../../components/ReviewCycles/ReviewResponseForm'
import {
  useReviewCycle,
  useReviewCycleResults,
  useReviewNominees,
} from '../../hooks/useReviewCycles'
import { useAuth } from '../../stores/authStore'
import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IAggregatedResults,
  type IDetailedResults,
} from '../../types/reviewCycle.types'

const ReviewCycleDetailPage: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const actorEmployeeId = user?.id ?? ''
  const actorRole = user?.roles[0] ?? ''

  const {
    data: cycle,
    isLoading: cycleLoading,
    error: cycleError,
  } = useReviewCycle(id ?? '')
  const { data: nominees = [], isLoading: nomineesLoading } = useReviewNominees(
    id ?? ''
  )
  const { data: results } = useReviewCycleResults(id ?? '', {
    enabled: cycle?.status === EReviewCycleStatus.CLOSED,
  })

  if (!id) return <Alert severity='error'>Invalid cycle ID</Alert>

  if (cycleLoading || nomineesLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={48} sx={{ mb: 1 }} />
        ))}
      </Container>
    )
  }

  if (cycleError) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Alert severity='error'>{t('pages.reviewCycleDetail.notFound')}</Alert>
      </Container>
    )
  }

  if (!cycle) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Alert severity='warning'>
          {t('pages.reviewCycleDetail.notFound')}
        </Alert>
      </Container>
    )
  }

  const actorNominee =
    nominees.find(n => n.reviewer_employee_id === actorEmployeeId) ?? null
  const isInvitedReviewer =
    actorNominee?.status === EReviewNomineeStatus.INVITED &&
    cycle.status === EReviewCycleStatus.IN_PROGRESS

  const showResults = cycle.status === EReviewCycleStatus.CLOSED

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      {/* Cycle header */}
      <Box display='flex' alignItems='center' gap={2} mb={1}>
        <Typography variant='h5'>{cycle.title}</Typography>
        <CycleStatusBadge status={cycle.status} />
      </Box>
      <Typography color='text.secondary' mb={2}>
        {t('pages.reviewCycleDetail.subject')}: {cycle.subject_display_name}
      </Typography>
      <Box display='flex' gap={1} mb={3}>
        {cycle.opened_at && (
          <Chip
            label={`${t('pages.reviewCycleDetail.opened')}: ${new Date(cycle.opened_at).toLocaleDateString()}`}
            size='small'
          />
        )}
        {cycle.started_at && (
          <Chip
            label={`${t('pages.reviewCycleDetail.started')}: ${new Date(cycle.started_at).toLocaleDateString()}`}
            size='small'
          />
        )}
        {cycle.closed_at && (
          <Chip
            label={`${t('pages.reviewCycleDetail.closed')}: ${new Date(cycle.closed_at).toLocaleDateString()}`}
            size='small'
          />
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Nominee panel */}
      <NomineePanel
        cycle={cycle}
        nominees={nominees}
        actorRole={actorRole}
        actorEmployeeId={actorEmployeeId}
      />

      {/* Review response form */}
      {isInvitedReviewer && (
        <>
          <Divider sx={{ my: 3 }} />
          <ReviewResponseForm cycle={cycle} nominee={actorNominee} />
        </>
      )}

      {/* Results */}
      {showResults && results && (
        <>
          <Divider sx={{ my: 3 }} />
          {(results as IDetailedResults).view === 'detailed' ? (
            <DetailedResultsView results={results as IDetailedResults} />
          ) : (
            <AggregatedResultsView results={results as IAggregatedResults} />
          )}
        </>
      )}
    </Container>
  )
}

export default ReviewCycleDetailPage
