import {
  Alert,
  Box,
  Button,
  Container,
  Skeleton,
  Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import AssessmentSkillsRadarChart from '@/components/skillAssessment/AssessmentSkillsRadarChart'
import AssessmentSkillCategorySection from '@/components/skillAssessment/AssessmentSkillCategorySection'
import { useEmployeeSkillAssessment } from '@/services/skillAssessmentQueryService'

const EmployeeAssessmentPage: React.FC = () => {
  const { t } = useTranslation()
  const { employeeId } = useParams<{ employeeId: string }>()
  const { data, isLoading, isError, error, refetch } =
    useEmployeeSkillAssessment(employeeId ?? '')

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
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
              'pages.employeeAssessment.forbidden',
              "You do not have access to this employee's assessment."
            )}
          </Alert>
        </Container>
      )
    }
    if (status === 404) {
      return (
        <Container maxWidth='lg' sx={{ py: 3 }}>
          <Alert severity='warning'>
            {t('pages.employeeAssessment.notFound', 'Employee not found.')}
          </Alert>
        </Container>
      )
    }
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Typography color='error'>
          {t(
            'pages.employeeAssessment.loadError',
            'Failed to load assessment.'
          )}
        </Typography>
        <Button onClick={() => refetch()} sx={{ mt: 1 }}>
          {t('errors.actions.reloadPage', 'Reload Page')}
        </Button>
      </Container>
    )
  }

  const hasSkills = (data?.skill_categories.length ?? 0) > 0

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      {/* Read-only banner */}
      <Alert severity='info' sx={{ mb: 2 }}>
        {t(
          'pages.employeeAssessment.readOnlyBanner',
          'Viewing assessment for:'
        )}{' '}
        {data?.employee.display_name}
      </Alert>

      <Typography variant='h5' gutterBottom>
        {t('pages.employeeAssessment.title', 'Skill Assessment')}
      </Typography>

      {data?.position && (
        <Box sx={{ mb: 2 }}>
          <Typography variant='subtitle1'>{data.position.title}</Typography>
          {data.position.career_track && (
            <Typography variant='body2' color='text.secondary'>
              {data.position.career_track.title}
              {data.position.career_path && (
                <> &bull; {data.position.career_path.title}</>
              )}
            </Typography>
          )}
        </Box>
      )}

      {!hasSkills ? (
        <Typography color='text.secondary'>
          {t(
            'pages.skillAssessment.emptyState',
            'No skills required for this position.'
          )}
        </Typography>
      ) : (
        <>
          <AssessmentSkillsRadarChart
            skillCategories={data?.skill_categories ?? []}
            nextPositionNull={data?.next_position == null}
          />

          {data?.skill_categories.map(category => (
            <AssessmentSkillCategorySection
              key={category.id}
              category={category}
              readOnly
              showTitle
            />
          ))}
        </>
      )}
    </Container>
  )
}

export default EmployeeAssessmentPage
