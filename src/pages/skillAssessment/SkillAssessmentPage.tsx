import { Box, Button, Container, Skeleton, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import AssessmentRadarChart from '../../components/skillAssessment/AssessmentRadarChart'
import AssessmentSkillCategorySection from '../../components/skillAssessment/AssessmentSkillCategorySection'
import { useMySkillAssessment } from '../../services/skillAssessmentQueryService'
import type { ISkillLevelBrief } from '../../types/skillAssessment.types'

const SkillAssessmentPage: React.FC = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useMySkillAssessment()

  const availableLevels = useMemo<ISkillLevelBrief[]>(() => {
    if (!data) return []
    const levelMap = new Map<string, ISkillLevelBrief>()
    for (const cat of data.skill_categories) {
      for (const skill of cat.skills) {
        const addLevel = (l: ISkillLevelBrief | null | undefined) => {
          if (l) levelMap.set(l.id, l)
        }
        addLevel(skill.required_level)
        addLevel(skill.next_position_required_level)
        if (skill.assessed)
          addLevel({
            id: skill.assessed.skill_level_id,
            title: skill.assessed.skill_level_title,
            value: skill.assessed.skill_level_value,
          })
        if (skill.target)
          addLevel({
            id: skill.target.skill_level_id,
            title: skill.target.skill_level_title,
            value: skill.target.skill_level_value,
          })
      }
    }
    return Array.from(levelMap.values()).sort((a, b) => a.value - b.value)
  }, [data])

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height={48} sx={{ mb: 1 }} />
        ))}
      </Container>
    )
  }

  if (isError) {
    return (
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Typography color='error'>
          {t(
            'pages.skillAssessment.loadError',
            'Failed to load skill assessment.'
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
      {/* Header */}
      <Typography variant='h5' gutterBottom>
        {t('pages.skillAssessment.title', 'Skill Self-Assessment')}
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
            'No skills required for your current position.'
          )}
        </Typography>
      ) : (
        <>
          <AssessmentRadarChart
            skillCategories={data?.skill_categories ?? []}
            nextPositionNull={data?.next_position == null}
          />

          {data?.skill_categories.map(category => (
            <AssessmentSkillCategorySection
              key={category.id}
              category={category}
              availableLevels={availableLevels}
            />
          ))}
        </>
      )}
    </Container>
  )
}

export default SkillAssessmentPage
