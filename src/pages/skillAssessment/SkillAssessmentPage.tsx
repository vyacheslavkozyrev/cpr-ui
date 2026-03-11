import {
  Box,
  Button,
  Container,
  Skeleton,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import AssessmentSkillsRadarChart from '@/components/skillAssessment/AssessmentSkillsRadarChart'
import AssessmentSkillCategorySection from '@/components/skillAssessment/AssessmentSkillCategorySection'
import { useMySkillAssessment } from '@/services/skillAssessmentQueryService'

const getStyles = () => ({
  tabs: { mb: 3, borderBottom: 1, borderColor: 'divider' },
})

const SkillAssessmentPage: React.FC = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch } = useMySkillAssessment()
  const [selectedTab, setSelectedTab] = useState(0)
  const styles = useMemo(() => getStyles(), [])

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue)
    },
    []
  )

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

  const categories = data?.skill_categories ?? []
  const hasSkills = categories.length > 0
  const selectedCategory = categories[selectedTab] ?? categories[0]

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
          {/* Radar chart for the selected category */}
          <AssessmentSkillsRadarChart
            skillCategories={selectedCategory ? [selectedCategory] : categories}
            nextPositionNull={data?.next_position == null}
          />

          {/* Category tabs */}
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={styles.tabs}
            variant='scrollable'
            scrollButtons='auto'
          >
            {categories.map((cat, idx) => (
              <Tab key={cat.id} label={cat.title} value={idx} />
            ))}
          </Tabs>

          {/* Skills table for selected category */}
          {selectedCategory && (
            <AssessmentSkillCategorySection category={selectedCategory} />
          )}
        </>
      )}
    </Container>
  )
}

export default SkillAssessmentPage
