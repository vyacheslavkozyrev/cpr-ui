import { Container, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import TeamSkillOverviewTable from '../../components/skillAssessment/TeamSkillOverviewTable'
import { useTeamSkillSummary } from '../../services/skillAssessmentQueryService'

const TeamSkillOverviewPage: React.FC = () => {
  const { t } = useTranslation()
  const { data, isLoading } = useTeamSkillSummary()

  return (
    <Container maxWidth='lg' sx={{ py: 3 }}>
      <Typography variant='h5' gutterBottom>
        {t('pages.teamSkillOverview.title', 'Team Skill Overview')}
      </Typography>

      <TeamSkillOverviewTable members={data?.team ?? []} loading={isLoading} />
    </Container>
  )
}

export default TeamSkillOverviewPage
